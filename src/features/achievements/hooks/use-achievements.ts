'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AchievementProgress } from '../types/achievement.types';

interface UseAchievementsResult {
  isLoading: boolean;
  achievements: AchievementProgress[];
  error: Error | null;
  fetchAchievements: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
}

export function useAchievements(): UseAchievementsResult {
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchAchievements = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/achievements', { cache: 'no-store' });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(
          payload.error?.message ?? 'Failed to load achievements',
        );
      }
      setAchievements(payload.data as AchievementProgress[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAchievements();
  }, [fetchAchievements]);

  return {
    isLoading,
    achievements,
    error,
    fetchAchievements,
    refreshAchievements: fetchAchievements,
  };
}
