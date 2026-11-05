import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE_MY_ACCOUNT'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
