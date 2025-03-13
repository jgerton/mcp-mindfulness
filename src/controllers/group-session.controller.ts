import { Request, Response } from 'express';
import { GroupSessionService } from '../services/group-session.service';

export class GroupSessionController {
  static async createSession(req: Request, res: Response) {
    try {
      const hostId = req.user?._id;
      const {
        meditationId,
        title,
        scheduledTime,
        duration,
        description,
        maxParticipants,
        isPrivate,
        allowedParticipants
      } = req.body;

      if (!hostId || !meditationId || !title || !scheduledTime || !duration) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId,
        title,
        new Date(scheduledTime),
        duration,
        {
          description,
          maxParticipants,
          isPrivate,
          allowedParticipants
        }
      );

      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async joinSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?._id;

      if (!userId || !sessionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.joinSession(
        sessionId,
        userId.toString()
      );

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async startSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const hostId = req.user?._id;

      if (!hostId || !sessionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.startSession(
        sessionId,
        hostId.toString()
      );

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async completeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?._id;
      const { durationCompleted, moodBefore, moodAfter } = req.body;

      if (!userId || !sessionId || !durationCompleted) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.completeSession(
        sessionId,
        userId.toString(),
        {
          durationCompleted,
          moodBefore,
          moodAfter
        }
      );

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async leaveSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?._id;

      if (!userId || !sessionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.leaveSession(
        sessionId,
        userId.toString()
      );

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async cancelSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const hostId = req.user?._id;

      if (!hostId || !sessionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const session = await GroupSessionService.cancelSession(
        sessionId,
        hostId.toString()
      );

      res.json(session);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getUpcomingSessions(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const sessions = await GroupSessionService.getUpcomingSessions(
        userId.toString()
      );

      res.json(sessions);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const sessions = await GroupSessionService.getUserSessions(
        userId.toString()
      );

      res.json(sessions);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
} 