import { z } from 'zod';

export const createMeditationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  type: z.enum(['guided', 'timer', 'ambient']),
  audioUrl: z.string().url().optional(),
  category: z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

export const updateMeditationSchema = createMeditationSchema.partial();

export const getMeditationsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  category: z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  type: z.enum(['guided', 'timer', 'ambient']).optional(),
  search: z.string().optional()
});

export type CreateMeditationInput = z.infer<typeof createMeditationSchema>;
export type UpdateMeditationInput = z.infer<typeof updateMeditationSchema>;
export type GetMeditationsQuery = z.infer<typeof getMeditationsQuerySchema>; 