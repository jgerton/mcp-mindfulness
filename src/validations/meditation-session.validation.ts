import { z } from 'zod';
import { MoodType } from '../models/meditation-session.model';

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

export const getMeditationSessionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  completed: z.boolean().optional(),
  meditationId: z.string().optional(),
  type: z.enum(['guided', 'timer', 'ambient']).optional(),
  category: z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']).optional(),
  minDuration: z.number().int().positive().optional(),
  maxDuration: z.number().int().positive().optional(),
  moodBefore: z.enum(['very_bad', 'bad', 'neutral', 'good', 'very_good'] as [MoodType, ...MoodType[]]).optional(),
  moodAfter: z.enum(['very_bad', 'bad', 'neutral', 'good', 'very_good'] as [MoodType, ...MoodType[]]).optional(),
  sortBy: z.enum(['startTime', 'duration', 'moodImprovement']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export type CreateMeditationSessionInput = z.infer<typeof createMeditationSessionSchema>;
export type UpdateMeditationSessionInput = z.infer<typeof updateMeditationSessionSchema>;
export type GetMeditationSessionsQuery = z.infer<typeof getMeditationSessionsSchema>; 