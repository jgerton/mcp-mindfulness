import { z } from 'zod';

/**
 * Validation schema for export endpoints
 */
export const exportDataSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv']).optional().default('json'),
  dataType: z.enum(['meditation-sessions', 'stress-assessments', 'achievements', 'all']).optional()
});

export type ExportDataQuery = z.infer<typeof exportDataSchema>; 