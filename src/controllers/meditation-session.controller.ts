import { Request, Response } from 'express';
import { MeditationSession } from '../models/meditation-session.model';
import { Meditation } from '../models/meditation.model';
import { CreateMeditationSessionInput, UpdateMeditationSessionInput, GetMeditationSessionsQuery, CompleteMeditationSessionInput } from '../validations/meditation-session.validation';
import mongoose from 'mongoose';
import { MeditationSessionService } from '../services/meditation-session.service';

export class MeditationSessionController {
  private meditationSessionService: MeditationSessionService;

  constructor() {
    this.meditationSessionService = new MeditationSessionService();
  }

  // Start a new meditation session
  async startSession(req: Request<{}, {}, CreateMeditationSessionInput>, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Check for active session
      const activeSession = await this.meditationSessionService.getActiveSession(userId);
      if (activeSession) {
        res.status(400).json({ message: 'Active session already exists' });
        return;
      }

      const session = await this.meditationSessionService.startSession(userId, req.body);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Complete a meditation session
  async completeSession(req: Request<{ sessionId: string }, {}, CompleteMeditationSessionInput>, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await this.meditationSessionService.completeSession(req.params.sessionId, req.body);
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      res.status(200).json(session);
    } catch (error) {
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get active session for user
  async getActiveSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await this.meditationSessionService.getActiveSession(userId);
      if (!session) {
        res.status(404).json({ message: 'No active session found' });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all meditation sessions for the current user
  async getAll(req: Request & { query: GetMeditationSessionsQuery }, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const sessions = await this.meditationSessionService.getAllSessions(userId, req.query);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single meditation session
  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await this.meditationSessionService.getSessionById(req.params.id, userId);
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update a meditation session (e.g., mark as completed, add notes)
  async update(
    req: Request<{ id: string }, {}, UpdateMeditationSessionInput>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await this.meditationSessionService.updateSession(req.params.id, userId, req.body);
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get user's meditation statistics
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const stats = await this.meditationSessionService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 