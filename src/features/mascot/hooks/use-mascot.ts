'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MascotProgress } from '../types/mascot.types';

interface UseMascotResult {
  isLoading: boolean;
  mascot: MascotProgress | null;
  error: Error | null;
  fetchMascot: () => Promise<void>;
  refreshMascot: () => Promise<void>;
}

export function useMascot(): UseMascotResult {
  const [isLoading, setIsLoading] = useState(true);
  const [mascot, setMascot] = useState<MascotProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchMascot = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mascot/growth', { cache: 'no-store' });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? 'Failed to load mascot growth');
      }
      setMascot(payload.data as MascotProgress);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMascot();
  }, [fetchMascot]);

  return {
    isLoading,
    mascot,
    error,
    fetchMascot,
    refreshMascot: fetchMascot,
  };
}
