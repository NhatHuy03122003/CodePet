/**
 * GitHub integration type definitions
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  // Present when the item returned by the issues endpoint is actually a pull request
  pull_request?: unknown;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: unknown;
}

export interface ActivitySummary {
  commits: number;
  pullRequestsOpened: number;
  pullRequestsMerged: number;
  reviews: number;
  issuesOpened: number;
  issuesClosed: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SyncResult {
  repositories: number;
  commits: number;
  pullRequests: number;
  issues: number;
}

export interface GitHubStats {
  repositories: number;
  commits: number;
  pullRequests: number;
  issues: number;
  lastSyncedAt: string | null;
}
