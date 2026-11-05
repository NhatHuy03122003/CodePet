'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ByteFoxCommentView, CommentType } from '../types/mascot.types';

interface UseMascotCommentsResult {
  isLoading: boolean;
  comments: ByteFoxCommentView[];
  latestComment: ByteFoxCommentView | null;
  error: Error | null;
  fetchComments: (limit?: number) => Promise<void>;
  refreshComments: () => Promise<void>;
  generateComment: (
    context: { type: CommentType },
    tone: string,
  ) => Promise<ByteFoxCommentView | null>;
}

export function useMascotComments(): UseMascotCommentsResult {
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<ByteFoxCommentView[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async (limit = 10) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mascot/comments?limit=${limit}`, {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? 'Failed to load comments');
      }
      setComments((payload.data?.comments ?? []) as ByteFoxCommentView[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateComment = useCallback(
    async (context: { type: CommentType }, tone: string) => {
      try {
        const response = await fetch('/api/mascot/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context, tone }),
        });
        const payload = await response.json();
        if (!payload.success) {
          throw new Error(
            payload.error?.message ?? 'Failed to generate comment',
          );
        }
        await fetchComments();
        return payload.data as ByteFoxCommentView;
      } catch (err) {
        setError(err as Error);
        return null;
      }
    },
    [fetchComments],
  );

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  return {
    isLoading,
    comments,
    latestComment: comments[0] ?? null,
    error,
    fetchComments,
    refreshComments: () => fetchComments(),
    generateComment,
  };
}
