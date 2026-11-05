// TODO: Implement global types

/**
 * Global type definitions
 */

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  githubId: string | null;
  githubUsername: string | null;
  githubToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string;
  userId: string;
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  date: Date;
  count: number;
  metadata: unknown;
}

export type ActivityType =
  | 'COMMIT'
  | 'PR_OPENED'
  | 'PR_MERGED'
  | 'PR_REVIEWED'
  | 'ISSUE_OPENED'
  | 'ISSUE_CLOSED'
  | 'CODE_REVIEW';

export interface Commit {
  id: string;
  repositoryId: string;
  githubSha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  committedAt: Date;
  addedLines: number;
  deletedLines: number;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
  };
}
