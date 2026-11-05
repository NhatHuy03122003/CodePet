// TODO: Implement GitHub validation schemas

import { z } from 'zod';

export const syncReposSchema = z.object({
  force: z.boolean().optional().default(false),
});

export const activityQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('7d'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type SyncReposInput = z.infer<typeof syncReposSchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
