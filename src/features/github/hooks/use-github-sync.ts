'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GitHubStats, SyncResult } from '../types/github.types';

export function useGithubSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/sync', { cache: 'no-store' });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? 'Failed to load GitHub stats');
      }
      setStats(payload.data as GitHubStats);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncRepositories = useCallback(
    async (force = false): Promise<SyncResult | null> => {
      setIsSyncing(true);
      setError(null);
      try {
        const response = await fetch('/api/github/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force }),
        });
        const payload = await response.json();
        if (!payload.success) {
          throw new Error(payload.error?.message ?? 'GitHub sync failed');
        }

        await fetchStats();
        return payload.data as SyncResult;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [fetchStats]
  );

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    isSyncing,
    isLoading,
    error,
    stats,
    syncRepositories,
    refreshStats: fetchStats,
  };
}
