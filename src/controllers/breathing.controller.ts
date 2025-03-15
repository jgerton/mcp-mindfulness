import { Request, Response } from 'express';
import { BreathingService } from '../services/breathing.service';
import mongoose from 'mongoose';

export class BreathingController {
  static async getPatterns(req: Request, res: Response): Promise<void> {
    try {
      await BreathingService.initializeDefaultPatterns();
      const pattern = await BreathingService.getPattern(req.params.name);
      
      if (!pattern) {
        res.status(404).json({ error: 'Breathing pattern not found' });
        return;
      }
      
      res.json(pattern);
    } catch (error) {
      console.error('Error getting breathing pattern:', error);
      res.status(500).json({ error: 'Failed to get breathing pattern' });
    }
  }

  static async startSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { patternName, stressLevelBefore } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!patternName) {
        res.status(400).json({ error: 'Pattern name is required' });
        return;
      }

      if (stressLevelBefore !== undefined && (stressLevelBefore < 0 || stressLevelBefore > 10 || !Number.isInteger(stressLevelBefore))) {
        res.status(400).json({ error: 'Stress level must be an integer between 0 and 10' });
        return;
      }

      // Check if pattern exists before creating session
      const pattern = await BreathingService.getPattern(patternName);
      if (!pattern) {
        res.status(400).json({ error: 'Invalid pattern' });
        return;
      }

      const session = await BreathingService.startSession(
        userId,
        patternName,
        stressLevelBefore
      );
      res.json(session);
    } catch (error) {
      console.error('Error starting breathing session:', error);
      res.status(500).json({ error: 'Failed to start breathing session' });
    }
  }

  static async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?._id;
      const { completedCycles, stressLevelAfter } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        res.status(404).json({ error: 'Invalid session ID' });
        return;
      }

      if (completedCycles !== undefined && (completedCycles < 0 || !Number.isInteger(completedCycles))) {
        res.status(400).json({ error: 'Completed cycles must be a non-negative integer' });
        return;
      }

      if (stressLevelAfter !== undefined && (stressLevelAfter < 0 || stressLevelAfter > 10 || !Number.isInteger(stressLevelAfter))) {
        res.status(400).json({ error: 'Stress level must be an integer between 0 and 10' });
        return;
      }

      // Check if session belongs to user
      const session = await BreathingService.getUserSessionById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Unauthorized access to this session' });
        return;
      }

      if (session.endTime) {
        res.status(400).json({ error: 'Session already completed' });
        return;
      }

      const updatedSession = await BreathingService.completeSession(
        sessionId,
        completedCycles,
        stressLevelAfter
      );

      res.json(updatedSession);
    } catch (error) {
      console.error('Error completing breathing session:', error);
      res.status(500).json({ error: 'Failed to complete breathing session' });
    }
  }

  static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate limit parameter
      if (isNaN(limitParam)) {
        res.status(400).json({ error: 'Limit must be a number' });
        return;
      }

      if (limitParam < 1 || limitParam > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }

      const sessions = await BreathingService.getUserSessions(userId, limitParam);
      res.json(sessions);
    } catch (error) {
      console.error('Error getting user breathing sessions:', error);
      res.status(500).json({ error: 'Failed to get user breathing sessions' });
    }
  }

  static async getEffectiveness(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const effectiveness = await BreathingService.getEffectiveness(userId);
      res.json(effectiveness);
    } catch (error) {
      console.error('Error getting breathing effectiveness:', error);
      res.status(500).json({ error: 'Failed to get breathing effectiveness' });
    }
  }
} 