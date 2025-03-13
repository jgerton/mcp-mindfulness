import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

export class ChatController {
  static async getSessionMessages(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { before, limit } = req.query;

      const messages = await ChatService.getSessionMessages(sessionId, {
        before: before ? new Date(before as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json(messages);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { content } = req.body;
      const userId = req.user?._id;

      if (!userId || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const message = await ChatService.addMessage(
        sessionId,
        userId.toString(),
        content
      );

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getActiveParticipants(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await ChatService.getSessionParticipants(sessionId);
      res.json(session.participants.filter(p => p.status === 'joined'));
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
} 