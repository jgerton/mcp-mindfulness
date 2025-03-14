import { z } from 'zod';
import { MoodType } from '../models/session-analytics.model';

const moodEnum = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'] as const;

export const createMeditationSessionSchema = z.object({
  meditationId: z.string(),
  duration: z.number().min(0),
  durationCompleted: z.number().min(0).optional(),
  completed: z.boolean(),
  notes: z.string().optional(),
  moodBefore: z.enum(moodEnum).optional(),
  moodAfter: z.enum(moodEnum).optional()
});

export const updateMeditationSessionSchema = z.object({
  duration: z.number().min(0).optional(),
  durationCompleted: z.number().min(0).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
  moodBefore: z.enum(moodEnum).optional(),
  moodAfter: z.enum(moodEnum).optional()
});

export const completeMeditationSessionSchema = z.object({
  duration: z.number().min(0),
  durationCompleted: z.number().min(0),
  completed: z.boolean(),
  moodAfter: z.enum(moodEnum),
  notes: z.string().optional()
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
  moodBefore: z.enum(moodEnum).optional(),
  moodAfter: z.enum(moodEnum).optional(),
  sortBy: z.enum(['startTime', 'duration', 'moodImprovement']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export type CreateMeditationSessionInput = z.infer<typeof createMeditationSessionSchema>;
export type UpdateMeditationSessionInput = z.infer<typeof updateMeditationSessionSchema>;
export type CompleteMeditationSessionInput = z.infer<typeof completeMeditationSessionSchema>;
export type GetMeditationSessionsQuery = z.infer<typeof getMeditationSessionsSchema>;