// TODO: Implement streaks types

/**
 * Streak tracking type definitions
 */

export interface Streak {
  id: string;
  userId: string;
  current: number;
  longest: number;
  lastActive: Date | null;
  startDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreakHistory {
  date: Date;
  active: boolean;
  streak: number;
}

export interface StreakMilestone {
  milestone: number;
  achieved: boolean;
  achievedAt: Date | null;
}
