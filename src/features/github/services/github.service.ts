import { prisma } from '@/lib/db/prisma';
import type { ActivityType } from '@prisma/client';
import type {
  GitHubRepository,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue,
  GitHubStats,
  SyncResult,
} from '../types/github.types';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const PER_PAGE = 100;

/**
 * Normalize any date value to a UTC date-only value so it can be safely
 * upserted into a `@db.Date` column.
 */
function toDateOnly(value: string | Date): Date {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export class GitHubService {
  /**
   * Authenticated GitHub REST API request
   */
  private async request<T>(path: string, token: string): Promise<T> {
    const response = await fetch(`${GITHUB_API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'CodePet',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed (${response.status}) for ${path}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Fetch repositories the authenticated user has access to
   */
  async fetchRepositories(token: string): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(
      `/user/repos?per_page=${PER_PAGE}&sort=updated&affiliation=owner,collaborator,organization_member`,
      token
    );
  }

  /**
   * Fetch commits for a repository
   */
  async fetchCommits(token: string, owner: string, repo: string): Promise<GitHubCommit[]> {
    return this.request<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits?per_page=${PER_PAGE}`,
      token
    );
  }

  /**
   * Fetch pull requests for a repository
   */
  async fetchPullRequests(token: string, owner: string, repo: string): Promise<GitHubPullRequest[]> {
    return this.request<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?state=all&per_page=${PER_PAGE}&sort=updated&direction=desc`,
      token
    );
  }

  /**
   * Fetch issues for a repository (the endpoint also returns pull requests)
   */
  async fetchIssues(token: string, owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.request<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?state=all&per_page=${PER_PAGE}&sort=updated&direction=desc`,
      token
    );
  }

  /**
   * Full GitHub activity sync for a user: repositories, commits, pull requests
   * and issues are fetched from GitHub and persisted to the database.
   */
  async syncUserActivity(userId: string): Promise<SyncResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubToken: true },
    });

    const token = user?.githubToken;
    if (!token) {
      throw new Error('GitHub access token not found. Please sign in with GitHub again.');
    }

    const repositories = await this.fetchRepositories(token);

    const activityTotals = new Map<string, { type: ActivityType; date: Date; count: number }>();

    const addActivity = (type: ActivityType, isoDate: string | null) => {
      if (!isoDate) return;
      const date = toDateOnly(isoDate);
      const key = `${type}:${date.toISOString()}`;
      const existing = activityTotals.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        activityTotals.set(key, { type, date, count: 1 });
      }
    };

    let commitCount = 0;
    let pullRequestCount = 0;
    let issueCount = 0;

    for (const repository of repositories) {
      const [owner, name] = repository.full_name.split('/');

      const savedRepository = await prisma.repository.upsert({
        where: { userId_githubId: { userId, githubId: repository.id } },
        update: {
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          language: repository.language,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          isPrivate: repository.private,
          lastSyncedAt: new Date(),
        },
        create: {
          userId,
          githubId: repository.id,
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          language: repository.language,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          isPrivate: repository.private,
          lastSyncedAt: new Date(),
        },
      });

      const commits = await this.fetchCommits(token, owner, name);
      for (const commit of commits) {
        const authorName = commit.commit.author?.name ?? 'Unknown';
        const authorEmail = commit.commit.author?.email ?? '';
        const committedAt = commit.commit.author?.date
          ? new Date(commit.commit.author.date)
          : new Date();

        await prisma.commit.upsert({
          where: { githubSha: commit.sha },
          update: { message: commit.commit.message, authorName, authorEmail, committedAt },
          create: {
            repositoryId: savedRepository.id,
            githubSha: commit.sha,
            message: commit.commit.message,
            authorName,
            authorEmail,
            committedAt,
          },
        });

        commitCount += 1;
        addActivity('COMMIT', commit.commit.author?.date ?? null);
      }

      const pullRequests = await this.fetchPullRequests(token, owner, name);
      for (const pullRequest of pullRequests) {
        pullRequestCount += 1;
        addActivity('PR_OPENED', pullRequest.created_at);
        addActivity('PR_MERGED', pullRequest.merged_at);
      }

      const issues = await this.fetchIssues(token, owner, name);
      for (const issue of issues) {
        // The issues endpoint includes pull requests; skip those.
        if (issue.pull_request) continue;

        issueCount += 1;
        addActivity('ISSUE_OPENED', issue.created_at);
        addActivity('ISSUE_CLOSED', issue.closed_at);
      }
    }

    for (const activity of activityTotals.values()) {
      await prisma.activity.upsert({
        where: { userId_type_date: { userId, type: activity.type, date: activity.date } },
        update: { count: activity.count },
        create: { userId, type: activity.type, date: activity.date, count: activity.count },
      });
    }

    return {
      repositories: repositories.length,
      commits: commitCount,
      pullRequests: pullRequestCount,
      issues: issueCount,
    };
  }

  /**
   * Aggregate stored GitHub stats for a user
   */
  async getStats(userId: string): Promise<GitHubStats> {
    const [repositories, commits, pullRequests, issues, latestRepository] = await Promise.all([
      prisma.repository.count({ where: { userId } }),
      prisma.commit.count({ where: { repository: { is: { userId } } } }),
      prisma.activity.aggregate({ where: { userId, type: 'PR_OPENED' }, _sum: { count: true } }),
      prisma.activity.aggregate({ where: { userId, type: 'ISSUE_OPENED' }, _sum: { count: true } }),
      prisma.repository.findFirst({
        where: { userId, lastSyncedAt: { not: null } },
        orderBy: { lastSyncedAt: 'desc' },
        select: { lastSyncedAt: true },
      }),
    ]);

    return {
      repositories,
      commits,
      pullRequests: pullRequests._sum.count ?? 0,
      issues: issues._sum.count ?? 0,
      lastSyncedAt: latestRepository?.lastSyncedAt?.toISOString() ?? null,
    };
  }
}

export const githubService = new GitHubService();
