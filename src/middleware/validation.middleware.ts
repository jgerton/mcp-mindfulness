import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StressLevel, TechniqueType } from '../models/stress.model';

interface ValidateSchema {
  params?: AnyZodObject;
  query?: AnyZodObject;
  body?: AnyZodObject;
}

export const validateRequest = (schema: ValidateSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Check for specific error types to provide better error messages
        const errorMessage = error.errors.map(e => {
          if (e.path.includes('stressLevelBefore')) {
            return `Invalid stress level: ${e.message}`;
          } else if (e.path.includes('completedGroups')) {
            return `Invalid completed groups: ${e.message}`;
          } else {
            return e.message;
          }
        }).join(', ');

        res.status(400).json({
          error: errorMessage
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateAssessment = (req: Request, res: Response, next: NextFunction): void => {
  const { physicalSymptoms, emotionalSymptoms, behavioralSymptoms, cognitiveSymptoms } = req.body;

  // Validate required fields
  if (!physicalSymptoms || !emotionalSymptoms || !behavioralSymptoms || !cognitiveSymptoms) {
    res.status(400).json({ error: 'All symptom fields are required' });
    return;
  }

  // Validate score ranges (0-10)
  const symptoms = [physicalSymptoms, emotionalSymptoms, behavioralSymptoms, cognitiveSymptoms];
  if (!symptoms.every(score => score >= 0 && score <= 10)) {
    res.status(400).json({ error: 'Symptom scores must be between 0 and 10' });
    return;
  }

  next();
};

export const validatePreferences = (req: Request, res: Response, next: NextFunction): void => {
  const { preferredTechniques, preferredDuration, timePreferences } = req.body;

  // Validate preferred techniques
  if (preferredTechniques) {
    const validTechniques = [
      '4-7-8', 'BOX_BREATHING', 'ALTERNATE_NOSTRIL',
      'GUIDED', 'MINDFULNESS', 'BODY_SCAN',
      'PROGRESSIVE_RELAXATION', 'STRETCHING', 'WALKING',
      'GROUNDING', 'VISUALIZATION', 'QUICK_BREATH'
    ];

    if (!Array.isArray(preferredTechniques) || 
        !preferredTechniques.every(tech => validTechniques.includes(tech))) {
      res.status(400).json({ error: 'Invalid preferred techniques' });
      return;
    }
  }

  // Validate preferred duration
  if (preferredDuration !== undefined && (
    typeof preferredDuration !== 'number' || 
    preferredDuration < 1 || 
    preferredDuration > 60
  )) {
    res.status(400).json({ error: 'Preferred duration must be between 1 and 60 minutes' });
    return;
  }

  // Validate time preferences
  if (timePreferences) {
    const { reminderFrequency } = timePreferences;
    if (reminderFrequency && !['DAILY', 'WEEKLY', 'ON_HIGH_STRESS'].includes(reminderFrequency)) {
      res.status(400).json({ error: 'Invalid reminder frequency' });
      return;
    }
  }

  next();
}; 