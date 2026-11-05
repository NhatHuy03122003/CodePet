// Growth & XP engine constants

export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 100, 365] as const;

/**
 * XP awarded per GitHub activity (Sprint 3 rules).
 * Commit = 10 XP, Pull Request = 50 XP, Issue = 20 XP.
 */
export const XP_REWARDS = {
  commit: 10,
  pullRequest: 50,
  issue: 20,
} as const;

/**
 * Base used by the level formula:
 *   level = floor(sqrt(totalXP / XP_LEVEL_BASE)) + 1
 */
export const XP_LEVEL_BASE = 100;
