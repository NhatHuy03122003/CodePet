// Achievement feature type definitions

import type { AchievementCode } from "@prisma/client";
import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementKey,
} from "@/lib/constants/achievements";

export type { AchievementCategory, AchievementDefinition, AchievementKey };

/**
 * Persisted unlock record (mirrors the UserAchievement Prisma model).
 */
export interface UserAchievement {
  id: string;
  userId: string;
  code: AchievementCode;
  unlockedAt: Date;
  createdAt: Date;
}

/**
 * Live activity metrics used to evaluate achievement thresholds.
 */
export interface AchievementMetrics {
  commits: number;
  pullRequests: number;
  streak: number;
  level: number;
}

/**
 * Achievement definition combined with the current unlock state, consumed by
 * the dashboard.
 */
export interface AchievementProgress extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
}
