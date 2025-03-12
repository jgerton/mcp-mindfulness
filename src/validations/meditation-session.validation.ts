import { z } from 'zod';

const moodEnum = ['very_bad', 'bad', 'neutral', 'good', 'very_good'] as const;

export const createMeditationSessionSchema = z.object({
  meditationId: z.string(),
  durationCompleted: z.number().min(0),
  completed: z.boolean(),
  notes: z.string().optional(),
  moodBefore: z.enum(moodEnum).optional(),
  moodAfter: z.enum(moodEnum).optional()
});

export const updateMeditationSessionSchema = z.object({
  durationCompleted: z.number().min(0).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
  moodAfter: z.enum(moodEnum).optional()
});

export const getMeditationSessionsQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  completed: z.string().transform(val => val === 'true').optional(),
  meditationId: z.string().optional()
});

export type CreateMeditationSessionInput = z.infer<typeof createMeditationSessionSchema>;
export type UpdateMeditationSessionInput = z.infer<typeof updateMeditationSessionSchema>;
export type GetMeditationSessionsQuery = z.infer<typeof getMeditationSessionsQuerySchema>; 