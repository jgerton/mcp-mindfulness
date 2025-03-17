import { Request, Response } from 'express';
import { PMRService } from '../services/pmr.service';

export class PMRController {
  static async getMuscleGroups(req: Request, res: Response): Promise<void> {
    try {
      await PMRService.initializeDefaultMuscleGroups();
      const muscleGroups = await PMRService.getMuscleGroups();
      res.json(muscleGroups);
    } catch (error) {
      console.error('Error getting muscle groups:', error);
      res.status(500).json({ error: 'Failed to get muscle groups' });
    }
  }

  static async startSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { stressLevelBefore } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate stressLevelBefore is provided
      if (stressLevelBefore === undefined) {
        res.status(400).json({ error: 'Stress level is required' });
        return;
      }

      const session = await PMRService.startSession(userId, stressLevelBefore);
      res.json(session);
    } catch (error) {
      console.error('Error starting PMR session:', error);
      res.status(500).json({ error: 'Failed to start PMR session' });
    }
  }

  static async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { completedGroups, stressLevelAfter } = req.body;
      const userId = req.user?._id;

      // Check if session belongs to user
      const session = await PMRService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized access to session' });
        return;
      }

      const updatedSession = await PMRService.completeSession(
        sessionId,
        completedGroups,
        stressLevelAfter
      );

      res.json(updatedSession);
    } catch (error) {
      console.error('Error completing PMR session:', error);
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({ error: 'Session not found' });
      } else if (error instanceof Error && error.message.includes('already completed')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to complete PMR session' });
      }
    }
  }

  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { completedGroup } = req.body;
      const userId = req.user?._id;

      // Check if session belongs to user
      const session = await PMRService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (session.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized access to session' });
        return;
      }

      const updatedSession = await PMRService.updateMuscleGroupProgress(
        sessionId,
        completedGroup
      );

      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating PMR progress:', error);
      if (error instanceof Error && error.message === 'Session not found') {
        res.status(404).json({ error: 'Session not found' });
      } else if (error instanceof Error && error.message.includes('Invalid muscle group')) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('already completed')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update PMR progress' });
      }
    }
  }

  static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sessions = await PMRService.getUserSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error('Error getting user PMR sessions:', error);
      res.status(500).json({ error: 'Failed to get user PMR sessions' });
    }
  }

  static async getEffectiveness(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const effectiveness = await PMRService.getEffectiveness(userId);
      res.json(effectiveness);
    } catch (error) {
      console.error('Error getting PMR effectiveness:', error);
      res.status(500).json({ error: 'Failed to get PMR effectiveness' });
    }
  }
} 