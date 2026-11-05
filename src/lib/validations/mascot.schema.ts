// TODO: Implement mascot validation schemas

import { z } from 'zod';

export const generateCommentSchema = z.object({
  context: z.object({
    type: z.enum(['COMMIT_COMMENT', 'STREAK_ACHIEVEMENT', 'LEVEL_UP', 'MILESTONE', 'DAILY_GREETING']),
    commitId: z.string().optional(),
    repository: z.string().optional(),
    message: z.string().optional(),
    streak: z.number().optional(),
    level: z.number().optional(),
  }),
  tone: z.enum(['friendly', 'witty', 'professional', 'motivational']),
});

export const updateMascotSettingsSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  tone: z.enum(['friendly', 'witty', 'professional', 'motivational']).optional(),
  autoComment: z.boolean().optional(),
});

export type GenerateCommentInput = z.infer<typeof generateCommentSchema>;
export type UpdateMascotSettingsInput = z.infer<typeof updateMascotSettingsSchema>;
