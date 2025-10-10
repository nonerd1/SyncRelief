import { z } from 'zod';

export const HeadacheLocationSchema = z.enum([
  'Frontal',
  'Temporal',
  'Occipital',
  'Diffuse',
  'One-sided',
]);

export const HeadacheQualitySchema = z.enum(['Throbbing', 'Pressure', 'Sharp', 'Dull', 'Aura']);

export const TriggerSchema = z.enum([
  'Sugar',
  'Caffeine',
  'Starch',
  'Dairy',
  'Skipped meal',
  'Stress',
  'Sleep loss',
  'Barometric',
  'Dehydration',
  'Hormonal',
  'Screen time',
  'Other',
]);

export const HeadacheEpisodeSchema = z.object({
  id: z.string(),
  startTime: z.string(), // ISO datetime
  durationMin: z.number().min(0), // 0-1440 (24 hours)
  intensity: z.number().min(0).max(10),
  location: z.array(HeadacheLocationSchema),
  quality: z.array(HeadacheQualitySchema),
  triggers: z.array(TriggerSchema),
  usedDevice: z.boolean(),

  // Device fields (if usedDevice = true)
  deviceMode: z.string().optional(),
  deviceDuration: z.number().optional(), // minutes
  deviceTemp: z.number().optional(), // celsius
  devicePressure: z.number().optional(), // 0-10
  devicePattern: z.string().optional(),
  deviceEffectiveness: z.number().optional(), // 1-10 rating
  deviceNotes: z.string().optional(),

  // Additional fields
  barometricPressure: z.number().optional(),
  habitLogAttached: z.boolean().optional(),
  notes: z.string().optional(),
  timestamp: z.number(),
});

export type HeadacheLocation = z.infer<typeof HeadacheLocationSchema>;
export type HeadacheQuality = z.infer<typeof HeadacheQualitySchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type HeadacheEpisode = z.infer<typeof HeadacheEpisodeSchema>;

// Legacy episode type for backward compatibility
export const EpisodeSchema = z.object({
  id: z.string(),
  date: z.string(),
  timestamp: z.number(),
  severity: z.number().min(1).max(10),
  duration: z.number(),
  location: z.enum(['left', 'right', 'both', 'front', 'back']),
  triggers: z.array(z.string()),
  notes: z.string().optional(),
  barometricPressure: z.number().optional(),
  deviceEffectiveness: z
    .object({
      rating: z.number().min(1).max(10),
      notes: z.string().optional(),
      sessionDuration: z.number(),
      mode: z.string(),
    })
    .optional(),
});

export type Episode = z.infer<typeof EpisodeSchema>;
