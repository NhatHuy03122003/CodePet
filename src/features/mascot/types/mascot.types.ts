// TODO: Implement mascot types

/**
 * Mascot feature type definitions
 */

export interface Mascot {
  id: string;
  userId: string;
  name: string;
  stage: number;
  experience: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MascotStage {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  imageUrl: string;
  unlocked: boolean;
}

export interface Comment {
  id: string;
  mascotId: string;
  commitId: string | null;
  type: CommentType;
  content: string;
  tone: string;
  createdAt: Date;
}

export type CommentType =
  | "COMMIT_COMMENT"
  | "STREAK_ACHIEVEMENT"
  | "LEVEL_UP"
  | "MILESTONE"
  | "DAILY_GREETING";

export type XPSource =
  | "commit"
  | "pr_opened"
  | "pr_merged"
  | "code_review"
  | "issue_opened"
  | "issue_closed"
  | "streak_bonus";

export interface CommentContext {
  type: CommentType;
  commitId?: string;
  repository?: string;
  message?: string;
  streak?: number;
  level?: number;
}

/**
 * Sources the ByteFox comment engine reacts to.
 */
export type CommentSource =
  | "commit"
  | "pull_request"
  | "level"
  | "streak"
  | "achievement";

/**
 * Snapshot of the user's GitHub and mascot state used to pick and render a
 * ByteFox comment. Shared by the rule-based engine today and the future
 * OpenAI-backed generator.
 */
export interface ByteFoxCommentContext {
  commits: number;
  pullRequests: number;
  issues: number;
  level: number;
  streak: number;
  achievementsUnlocked: number;
  /** Achievement codes unlocked by the most recent sync. */
  newlyUnlockedAchievements: string[];
  /** Level before the current sync, when known (enables level-up detection). */
  previousLevel?: number;
}

/**
 * A generated comment before it is persisted.
 */
export interface ByteFoxCommentDraft {
  type: CommentType;
  content: string;
  tone: string;
}

/**
 * A persisted comment shaped for API responses and the dashboard.
 */
export interface ByteFoxCommentView {
  id: string;
  type: CommentType;
  content: string;
  tone: string;
  createdAt: string;
}

/**
 * ByteFox personality identifier (Sprint 7). A personality is the "character"
 * the mascot grows into as its level rises.
 */
export type PersonalityId = "BABY" | "CODER" | "HACKER" | "MASTER";

/** Voice/tone ByteFox uses when speaking under a given personality. */
export type PersonalityTone = "playful" | "motivational" | "bold" | "wise";

/**
 * A ByteFox personality and the mascot level range it applies to.
 */
export interface Personality {
  id: PersonalityId;
  title: string;
  description: string;
  tone: PersonalityTone;
  /** Lowest mascot level that maps to this personality. */
  minLevel: number;
  /** Highest mascot level that maps to this personality (null = uncapped). */
  maxLevel: number | null;
}

export interface GrowthHistory {
  date: Date;
  level: number;
  experience: number;
  source: XPSource;
}

/**
 * GitHub activity counts used to derive total XP.
 */
export interface XPCounts {
  commits: number;
  pullRequests: number;
  issues: number;
}

/**
 * Mascot growth snapshot consumed by the dashboard.
 */
export interface MascotProgress {
  id: string;
  name: string;
  experience: number;
  level: number;
  stage: number;
  stageName: string;
  /** Character ByteFox has grown into at the current level (Sprint 7). */
  personality: Personality;
  currentLevelXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  progress: number;
}
