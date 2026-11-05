// Achievement definitions: categories, thresholds and display metadata

import { AchievementCode } from "@prisma/client";

export type AchievementCategory =
  | "commits"
  | "pullRequests"
  | "streak"
  | "level";

/** Canonical achievement identifier, sourced from the Prisma `AchievementCode` enum. */
export type AchievementKey = AchievementCode;

export interface AchievementDefinition {
  key: AchievementKey;
  category: AchievementCategory;
  title: string;
  description: string;
  /** Metric value required to unlock the achievement. */
  threshold: number;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  // Commits
  {
    key: AchievementCode.FIRST_COMMIT,
    category: "commits",
    title: "First Commit",
    description: "Made your first commit",
    threshold: 1,
  },
  {
    key: AchievementCode.COMMITS_100,
    category: "commits",
    title: "100 Commits",
    description: "Reached 100 commits",
    threshold: 100,
  },
  {
    key: AchievementCode.COMMITS_500,
    category: "commits",
    title: "500 Commits",
    description: "Reached 500 commits",
    threshold: 500,
  },
  {
    key: AchievementCode.COMMITS_1000,
    category: "commits",
    title: "1,000 Commits",
    description: "Reached 1,000 commits",
    threshold: 1000,
  },

  // Pull Requests
  {
    key: AchievementCode.FIRST_PR,
    category: "pullRequests",
    title: "First Pull Request",
    description: "Opened your first pull request",
    threshold: 1,
  },
  {
    key: AchievementCode.PRS_10,
    category: "pullRequests",
    title: "10 Pull Requests",
    description: "Opened 10 pull requests",
    threshold: 10,
  },
  {
    key: AchievementCode.PRS_50,
    category: "pullRequests",
    title: "50 Pull Requests",
    description: "Opened 50 pull requests",
    threshold: 50,
  },
  {
    key: AchievementCode.PRS_100,
    category: "pullRequests",
    title: "100 Pull Requests",
    description: "Opened 100 pull requests",
    threshold: 100,
  },

  // Streak
  {
    key: AchievementCode.STREAK_7,
    category: "streak",
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    threshold: 7,
  },
  {
    key: AchievementCode.STREAK_30,
    category: "streak",
    title: "Month Master",
    description: "Maintained a 30-day streak",
    threshold: 30,
  },
  {
    key: AchievementCode.STREAK_100,
    category: "streak",
    title: "Century Streak",
    description: "Maintained a 100-day streak",
    threshold: 100,
  },
  {
    key: AchievementCode.STREAK_365,
    category: "streak",
    title: "Year of Code",
    description: "Maintained a 365-day streak",
    threshold: 365,
  },

  // Level
  {
    key: AchievementCode.LEVEL_5,
    category: "level",
    title: "Level 5",
    description: "Reached level 5",
    threshold: 5,
  },
  {
    key: AchievementCode.LEVEL_10,
    category: "level",
    title: "Level 10",
    description: "Reached level 10",
    threshold: 10,
  },
  {
    key: AchievementCode.LEVEL_25,
    category: "level",
    title: "Level 25",
    description: "Reached level 25",
    threshold: 25,
  },
  {
    key: AchievementCode.LEVEL_50,
    category: "level",
    title: "Level 50",
    description: "Reached level 50",
    threshold: 50,
  },
] as const;
