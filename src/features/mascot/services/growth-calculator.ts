// XP engine: total XP, level and progress calculations

import { XP_LEVEL_BASE, XP_REWARDS } from "@/lib/constants/growth";
import { MASCOT_STAGES } from "@/lib/constants/mascot";
import type { XPCounts } from "../types/mascot.types";

export interface LevelProgress {
  level: number;
  totalXP: number;
  /** Total XP at which the current level started. */
  currentLevelXP: number;
  /** Total XP required to reach the next level. */
  nextLevelXP: number;
  /** Remaining XP needed to reach the next level. */
  xpToNextLevel: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** Total XP span of the current level. */
  xpForLevel: number;
  /** Progress inside the current level (0-100). */
  progress: number;
}

export class GrowthCalculator {
  /**
   * Calculate total XP from GitHub activity counts.
   * Commit = 10 XP, Pull Request = 50 XP, Issue = 20 XP.
   */
  calculateTotalXP(counts: XPCounts): number {
    return (
      counts.commits * XP_REWARDS.commit +
      counts.pullRequests * XP_REWARDS.pullRequest +
      counts.issues * XP_REWARDS.issue
    );
  }

  /**
   * Calculate XP for a single activity type
   */
  calculateXP(activityType: string): number {
    switch (activityType) {
      case "commit":
        return XP_REWARDS.commit;
      case "pr_opened":
      case "pr_merged":
        return XP_REWARDS.pullRequest;
      case "issue_opened":
      case "issue_closed":
        return XP_REWARDS.issue;
      case "code_review":
        return 30;
      default:
        return 0;
    }
  }

  /**
   * Calculate level from total XP: floor(sqrt(totalXP / 100)) + 1
   */
  calculateLevel(totalXP: number): number {
    if (totalXP <= 0) return 1;
    return Math.floor(Math.sqrt(totalXP / XP_LEVEL_BASE)) + 1;
  }

  /**
   * Total XP required to reach a given level.
   */
  getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return XP_LEVEL_BASE * Math.pow(level - 1, 2);
  }

  /**
   * Total XP required to reach the next level from the given XP.
   */
  getNextLevelThreshold(totalXP: number): number {
    return this.getXPForLevel(this.calculateLevel(totalXP) + 1);
  }

  /**
   * Full level progress breakdown for a given total XP.
   */
  getLevelProgress(totalXP: number): LevelProgress {
    const safeXP = Math.max(0, Math.floor(totalXP));
    const level = this.calculateLevel(safeXP);
    const currentLevelXP = this.getXPForLevel(level);
    const nextLevelXP = this.getXPForLevel(level + 1);
    const xpForLevel = nextLevelXP - currentLevelXP;
    const xpIntoLevel = safeXP - currentLevelXP;
    const xpToNextLevel = Math.max(0, nextLevelXP - safeXP);
    const progress =
      xpForLevel > 0
        ? Math.min(100, Math.max(0, (xpIntoLevel / xpForLevel) * 100))
        : 100;

    return {
      level,
      totalXP: safeXP,
      currentLevelXP,
      nextLevelXP,
      xpToNextLevel,
      xpIntoLevel,
      xpForLevel,
      progress,
    };
  }

  /**
   * Total XP required to reach the given mascot stage.
   */
  getXPForStage(stage: number): number {
    const mascotStage = MASCOT_STAGES.find((entry) => entry.id === stage);
    return mascotStage ? this.getXPForLevel(mascotStage.minLevel) : 0;
  }
}

export const growthCalculator = new GrowthCalculator();
