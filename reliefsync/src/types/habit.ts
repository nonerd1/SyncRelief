import { z } from 'zod';

export const HabitLogSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date YYYY-MM-DD

  // Diet
  sugar: z.enum(['None', 'Low', 'Medium', 'High']),
  starch: z.boolean(),
  dairy: z.boolean(),
  caffeine: z.enum(['None', '1', '2', '3+']),
  hydration: z.enum(['Poor', 'OK', 'Good']),
  skippedMeals: z.boolean(),

  // Sleep
  sleepDuration: z.number().min(0).max(10), // hours
  sleepQuality: z.enum(['Poor', 'Fair', 'Good']),

  // Stress
  stress: z.number().min(0).max(10),

  // Exercise
  exercise: z.boolean(),
  exerciseIntensity: z.enum(['Low', 'Med', 'High']).optional(),

  // Environment
  barometricPressure: z.number().optional(),
  weather: z.array(z.enum(['Dry', 'Humid', 'Rain', 'Windy'])),

  // Menstruation
  menstruation: z.boolean(),
  menstruationPhase: z.enum(['Off', 'Pre', 'On', 'Post']).optional(),

  // Notes
  notes: z.string().optional(),

  timestamp: z.number(),
});

export type HabitLog = z.infer<typeof HabitLogSchema>;

// Legacy types for backward compatibility
export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['boolean', 'scale']),
  order: z.number(),
  createdAt: z.string(),
});

export type Habit = z.infer<typeof HabitSchema>;
