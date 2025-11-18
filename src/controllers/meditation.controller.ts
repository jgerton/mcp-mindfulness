import { Request, Response } from 'express';
import { Meditation } from '../models/meditation.model';
import { CreateMeditationInput, UpdateMeditationInput, GetMeditationsQuery } from '../validations/meditation.validation';
import mongoose from 'mongoose';
import { MeditationSessionService } from '../services/meditation-session.service';
import { SessionAnalyticsService } from '../services/session-analytics.service';
import { MoodType } from '../models/session-analytics.model';
import { MeditationService } from '../services/meditation.service';

export class MeditationController {
  private static sessionService = new MeditationSessionService();
  private static meditationService = new MeditationService();
  private static sessionAnalyticsService = new SessionAnalyticsService();

  constructor() {
    MeditationController.sessionService = new MeditationSessionService();
  }

  // Create a new meditation
  static async createMeditation(req: Request, res: Response) {
    try {
      const meditation = await MeditationService.createMeditation(req.body);
      res.status(201).json(meditation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Get all meditations with filtering and pagination
  static async getAllMeditations(req: Request, res: Response) {
    try {
      const meditations = await MeditationService.getAllMeditations();
      res.json(meditations);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Get a single meditation by ID
  static async getMeditationById(req: Request<{ id: string }>, res: Response) {
    try {
      const meditation = await MeditationService.getMeditationById(req.params.id);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }
      res.json(meditation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Get active session
  static async getActiveSession(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const activeSession = await MeditationController.sessionService.getActiveSession(userId);
      res.json(activeSession);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Start a meditation session
  static async startSession(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const meditationId = req.params.id;
      const session = await MeditationController.sessionService.startSession(userId, {
        meditationId,
        completed: false,
        duration: 0,
        durationCompleted: 0
      });
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Record interruption
  static async recordInterruption(req: Request<{ id: string }>, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await MeditationController.sessionService.recordInterruption(sessionId);
      res.json(session);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Complete a meditation session
  static async completeSession(req: Request<{ id: string }>, res: Response) {
    try {
      const sessionId = req.params.id;
      const completedSession = await MeditationController.sessionService.completeSession(sessionId, req.body);
      res.json(completedSession);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Update a meditation
  static async updateMeditation(req: Request<{ id: string }>, res: Response) {
    try {
      // Check for empty request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
      }

      // Check for invalid fields
      const allowedFields = ['title', 'description', 'duration', 'type', 'audioUrl', 'category', 'difficulty', 'tags', 'isActive'];
      const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
      if (invalidFields.length > 0) {
        return res.status(400).json({ message: 'Invalid update fields' });
      }

      const meditation = await MeditationService.updateMeditation(req.params.id, req.body);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }
      res.json(meditation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  // Delete a meditation (soft delete by setting isActive to false)
  static async deleteMeditation(req: Request<{ id: string }>, res: Response) {
    try {
      const result = await MeditationService.deleteMeditation(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Meditation not found' });
      }
      res.json({ message: 'Meditation deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }

  private static validateMeditationData(meditation: CreateMeditationInput) {
    const validationResults = {
      titleLength: meditation.title.length >= 3 && meditation.title.length <= 100,
      descriptionLength: meditation.description.length >= 10 && meditation.description.length <= 1000,
      durationValid: meditation.duration > 0 && meditation.duration <= 120,
      typeValid: ['guided', 'unguided', 'music'].includes(meditation.type),
      categoryValid: ['mindfulness', 'breathing', 'body_scan', 'loving_kindness', 'transcendental', 'zen', 'vipassana', 'yoga'].includes(meditation.category),
      difficultyValid: ['beginner', 'intermediate', 'advanced'].includes(meditation.difficulty),
      tagsValid: Array.isArray(meditation.tags) && meditation.tags.every(tag => typeof tag === 'string'),
      authorIdValid: meditation.authorId ? mongoose.Types.ObjectId.isValid(meditation.authorId) : true
    };
    return validationResults;
  }
} 