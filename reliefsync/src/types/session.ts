import { z } from 'zod';

export const SessionSchema = z.object({
  userId: z.string().optional(),
  onboardingComplete: z.boolean(),
  darkMode: z.boolean(),
  lastSyncedAt: z.number().optional(),
});

export type Session = z.infer<typeof SessionSchema>;
