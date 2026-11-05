// Achievement service: evaluation, persistence and unlock de-duplication

import { prisma } from "@/lib/db/prisma";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";
import { githubService } from "@/features/github/services/github.service";
import { mascotService } from "@/features/mascot/services/mascot.service";
import type {
  AchievementDefinition,
  AchievementKey,
  AchievementMetrics,
  AchievementProgress,
} from "../types/achievement.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export class AchievementService {
  /**
   * All achievement definitions.
   */
  getDefinitions(): readonly AchievementDefinition[] {
    return ACHIEVEMENTS;
  }

  /**
   * Unlock every achievement whose threshold is met by the given metrics.
   * Idempotent: already-unlocked achievements are skipped, and a database
   * unique constraint on (userId, code) guards against duplicates even under
   * concurrent calls. Returns the codes unlocked by this call only.
   */
  async evaluate(
    userId: string,
    metrics: AchievementMetrics,
  ): Promise<AchievementKey[]> {
    const existing = await prisma.userAchievement.findMany({
      where: { userId },
      select: { code: true },
    });
    const unlockedCodes = new Set(existing.map((row) => row.code));

    const newlyQualified = ACHIEVEMENTS.filter(
      (definition) =>
        !unlockedCodes.has(definition.key) &&
        this.getMetricValue(definition, metrics) >= definition.threshold,
    );

    if (newlyQualified.length === 0) return [];

    await prisma.userAchievement.createMany({
      data: newlyQualified.map((definition) => ({
        userId,
        code: definition.key,
      })),
      skipDuplicates: true,
    });

    return newlyQualified.map((definition) => definition.key);
  }

  /**
   * Full achievement list with locked/unlocked state for a user.
   */
  async getAchievements(userId: string): Promise<AchievementProgress[]> {
    const unlockedRows = await prisma.userAchievement.findMany({
      where: { userId },
    });
    const unlockedMap = new Map(
      unlockedRows.map((row) => [row.code, row.unlockedAt]),
    );

    return ACHIEVEMENTS.map((definition) => {
      const unlockedAt = unlockedMap.get(definition.key);
      return {
        ...definition,
        unlocked: Boolean(unlockedAt),
        unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
      };
    });
  }

  /**
   * Recalculate achievements from live GitHub activity, mascot level and the
   * current activity streak. Designed to run after a GitHub sync.
   */
  async recalculate(userId: string): Promise<AchievementKey[]> {
    const metrics = await this.collectMetrics(userId);
    return this.evaluate(userId, metrics);
  }

  private getMetricValue(
    definition: AchievementDefinition,
    metrics: AchievementMetrics,
  ): number {
    switch (definition.category) {
      case "commits":
        return metrics.commits;
      case "pullRequests":
        return metrics.pullRequests;
      case "streak":
        return metrics.streak;
      case "level":
        return metrics.level;
      default:
        return 0;
    }
  }

  private async collectMetrics(userId: string): Promise<AchievementMetrics> {
    const [stats, progress, streak] = await Promise.all([
      githubService.getStats(userId),
      mascotService.getProgress(userId),
      this.getCurrentStreak(userId),
    ]);

    return {
      commits: stats.commits,
      pullRequests: stats.pullRequests,
      streak,
      level: progress.level,
    };
  }

  /**
   * Current consecutive-day streak derived from stored daily activity. The
   * streak is anchored to today (or yesterday, before today's activity lands).
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    const activities = await prisma.activity.findMany({
      where: { userId },
      select: { date: true },
    });
    if (activities.length === 0) return 0;

    const activeDays = new Set(
      activities.map((activity) => toDateKey(activity.date)),
    );

    let cursor = toUtcDate(new Date());
    if (!activeDays.has(toDateKey(cursor))) {
      cursor = new Date(cursor.getTime() - DAY_MS);
      if (!activeDays.has(toDateKey(cursor))) return 0;
    }

    let streak = 0;
    while (activeDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    return streak;
  }
}

function toUtcDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toDateKey(date: Date): string {
  return toUtcDate(date).toISOString().slice(0, 10);
}

export const achievementService = new AchievementService();
