import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SessionService } from '../services/session.service';
import { AuthError } from '../errors/auth.error';
import { ValidationError } from '../errors/validation.error';
import { NotFoundError } from '../errors/not-found.error';

/**
 * Example Controller with proper error handling
 * 
 * This controller demonstrates best practices for:
 * - ObjectId validation
 * - Error handling with appropriate status codes
 * - Consistent error response format
 * - Authorization checks
 * - Try/catch blocks for async operations
 */
export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  /**
   * Get a session by ID
   * 
   * @param req Express request object
   * @param res Express response object
   */
  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Get session
      const session = await this.sessionService.getSessionById(id);

      // Check if session exists
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Authorization check
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Return session
      res.status(200).json(session);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Create a new session
   * 
   * @param req Express request object
   * @param res Express response object
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const { duration, type, stressLevelBefore } = req.body;

      // Validate required fields
      if (!duration || !type) {
        res.status(400).json({ error: 'Duration and type are required' });
        return;
      }

      // Validate stress level if provided
      if (stressLevelBefore !== undefined && (stressLevelBefore < 1 || stressLevelBefore > 10)) {
        res.status(400).json({ error: 'Stress level must be between 1 and 10' });
        return;
      }

      // Create session
      const session = await this.sessionService.createSession({
        userId,
        duration,
        type,
        stressLevelBefore,
        startTime: new Date()
      });

      // Return created session
      res.status(201).json(session);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Complete a session
   * 
   * @param req Express request object
   * @param res Express response object
   */
  async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { stressLevelAfter } = req.body;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Validate stress level
      if (stressLevelAfter === undefined || stressLevelAfter < 1 || stressLevelAfter > 10) {
        res.status(400).json({ error: 'Stress level after must be between 1 and 10' });
        return;
      }

      // Get session
      const session = await this.sessionService.getSessionById(id);

      // Check if session exists
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Authorization check
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Check if session is already completed
      if (session.completed) {
        res.status(400).json({ error: 'Session already completed' });
        return;
      }

      // Complete session
      const completedSession = await this.sessionService.completeSession(id, {
        endTime: new Date(),
        stressLevelAfter,
        completed: true
      });

      // Return completed session
      res.status(200).json(completedSession);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors with appropriate status codes
   * 
   * @param error Error object
   * @param res Express response object
   */
  private handleError(error: any, res: Response): void {
    console.error('Controller error:', error);

    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ error: 'Invalid ID format' });
    } else if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 