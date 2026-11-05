// TODO: Implement use-github-activity hook

import { useState } from 'react';

export function useGithubActivity() {
  const [isLoading, setIsLoading] = useState(false);
  const [activity, setActivity] = useState<unknown | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivity = async (period: string) => {
    // TODO: Implement activity fetching logic
    setIsLoading(true);
    try {
      throw new Error('Not implemented');
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    activity,
    error,
    fetchActivity,
  };
}
