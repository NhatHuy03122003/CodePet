// Mascot service: XP persistence, level and stage progression

import { prisma } from "@/lib/db/prisma";
import { MASCOT_STAGES } from "@/lib/constants/mascot";
import { growthCalculator } from "./growth-calculator";
import { bytefoxCommentService } from "./comment.service";
import { personalityService } from "./personality.service";
import type {
  Mascot,
  MascotProgress,
  ByteFoxCommentContext,
  ByteFoxCommentView,
  CommentContext,
  GrowthHistory,
  XPCounts,
} from "../types/mascot.types";

export class MascotService {
  /**
   * Get or create mascot for user
   */
  async getOrCreateMascot(userId: string): Promise<Mascot> {
    // Atomic upsert guarantees a single mascot per user even under concurrent
    // calls (e.g. GitHub sync + growth route), avoiding P2002 races.
    return prisma.mascot.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /**
   * Calculate level from experience: floor(sqrt(experience / 100)) + 1
   */
  calculateLevel(experience: number): number {
    return growthCalculator.calculateLevel(experience);
  }

  /**
   * Determine mascot stage from level
   */
  determineStage(level: number): number {
    let stage: number = MASCOT_STAGES[0].id;
    for (const entry of MASCOT_STAGES) {
      if (level >= entry.minLevel) stage = entry.id;
    }
    return stage;
  }

  /**
   * Build the dashboard growth snapshot from a mascot record.
   */
  toProgress(mascot: Mascot): MascotProgress {
    const level = this.calculateLevel(mascot.experience);
    const progress = growthCalculator.getLevelProgress(mascot.experience);
    const stage = MASCOT_STAGES.find(
      (entry) => entry.id === this.determineStage(level),
    );

    return {
      id: mascot.id,
      name: mascot.name,
      experience: mascot.experience,
      level,
      stage: stage?.id ?? mascot.stage,
      stageName: stage?.name ?? "Baby Byte",
      personality: personalityService.getPersonality(level),
      currentLevelXP: progress.currentLevelXP,
      nextLevelXP: progress.nextLevelXP,
      xpToNextLevel: progress.xpToNextLevel,
      progress: progress.progress,
    };
  }

  /**
   * Get the current growth snapshot for a user.
   */
  async getProgress(userId: string): Promise<MascotProgress> {
    const mascot = await this.getOrCreateMascot(userId);
    return this.toProgress(mascot);
  }

  /**
   * Add experience points and persist the recalculated level and stage.
   */
  async addExperience(userId: string, xp: number): Promise<Mascot> {
    const mascot = await this.getOrCreateMascot(userId);
    return this.persistExperience(userId, mascot.experience + xp, mascot.level);
  }

  /**
   * Recalculate total XP, level and stage from GitHub activity counts and
   * persist them on the Mascot record. Idempotent: re-running with the same
   * counts produces the same values.
   */
  async recalculateProgress(userId: string, counts: XPCounts): Promise<Mascot> {
    const mascot = await this.getOrCreateMascot(userId);
    const experience = growthCalculator.calculateTotalXP(counts);
    return this.persistExperience(userId, experience, mascot.level);
  }

  /**
   * Check for level up against the stored level.
   */
  async checkLevelUp(
    userId: string,
  ): Promise<{ levelUp: boolean; newLevel: number }> {
    const mascot = await this.getOrCreateMascot(userId);
    const newLevel = this.calculateLevel(mascot.experience);
    return { levelUp: newLevel > mascot.level, newLevel };
  }

  private async persistExperience(
    userId: string,
    experience: number,
    previousLevel: number,
  ): Promise<Mascot> {
    const safeExperience = Math.max(0, Math.floor(experience));
    const level = this.calculateLevel(safeExperience);
    const stage = this.determineStage(level);

    const mascot = await prisma.mascot.update({
      where: { userId },
      data: { experience: safeExperience, level, stage },
    });

    // Single choke point for XP changes: detect a personality transition
    // (Baby -> Coder -> Hacker -> Master) and record an evolution event.
    await bytefoxCommentService.recordPersonalityEvolution(
      userId,
      previousLevel,
      level,
    );

    return mascot;
  }

  /**
   * Trigger comment generation. Delegates to the ByteFox comment engine,
   * letting the caller pass through level/streak hints already at hand.
   */
  async triggerComment(
    userId: string,
    context?: CommentContext,
  ): Promise<ByteFoxCommentView> {
    const overrides: Partial<ByteFoxCommentContext> = {};
    if (context?.level !== undefined) overrides.level = context.level;
    if (context?.streak !== undefined) overrides.streak = context.streak;

    return bytefoxCommentService.generateAndStore(userId, overrides);
  }

  /**
   * Get mascot growth history
   */
  async getGrowthHistory(userId: string): Promise<GrowthHistory[]> {
    // TODO: Implement growth history retrieval
    throw new Error("Not implemented");
  }
}

export const mascotService = new MascotService();
