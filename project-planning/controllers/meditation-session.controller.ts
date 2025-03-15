import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MeditationSession } from '../models/meditation-session.model';
import achievementService from '../services/achievement.service';

/**
 * Controller for MeditationSession-related API endpoints
 */
export class MeditationSessionController {
  /**
   * Get all meditation sessions for the current user
   * @route GET /api/meditation-sessions
   */
  public async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const sessions = await MeditationSession.find({ userId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await MeditationSession.countDocuments({ userId });

      res.status(200).json({
        sessions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      res.status(500).json({ error: 'Failed to fetch meditation sessions' });
    }
  }

  /**
   * Get meditation session by ID
   * @route GET /api/meditation-sessions/:id
   */
  public async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      const session = await MeditationSession.findById(id).lean();

      if (!session) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the user owns this session
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to access this session' });
        return;
      }

      res.status(200).json(session);
    } catch (error) {
      console.error('Error fetching meditation session:', error);
      res.status(500).json({ error: 'Failed to fetch meditation session' });
    }
  }

  /**
   * Create a new meditation session
   * @route POST /api/meditation-sessions
   */
  public async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const sessionData = {
        ...req.body,
        userId
      };

      // Validate required fields
      if (!sessionData.title || !sessionData.duration || !sessionData.type) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Set default start time to now if not provided
      if (!sessionData.startTime) {
        sessionData.startTime = new Date();
      }

      const session = new MeditationSession(sessionData);
      await session.save();

      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating meditation session:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create meditation session' });
      }
    }
  }

  /**
   * Update a meditation session
   * @route PUT /api/meditation-sessions/:id
   */
  public async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Find the session first to check ownership
      const existingSession = await MeditationSession.findById(id);

      if (!existingSession) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the user owns this session
      if (existingSession.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to update this session' });
        return;
      }

      // Update the session
      const updateData = req.body;
      
      // Prevent updating userId
      delete updateData.userId;

      const session = await MeditationSession.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json(session);
    } catch (error) {
      console.error('Error updating meditation session:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update meditation session' });
      }
    }
  }

  /**
   * Delete a meditation session
   * @route DELETE /api/meditation-sessions/:id
   */
  public async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Find the session first to check ownership
      const existingSession = await MeditationSession.findById(id);

      if (!existingSession) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the user owns this session
      if (existingSession.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to delete this session' });
        return;
      }

      // Delete the session
      await MeditationSession.findByIdAndDelete(id);

      res.status(200).json({ message: 'Meditation session deleted successfully' });
    } catch (error) {
      console.error('Error deleting meditation session:', error);
      res.status(500).json({ error: 'Failed to delete meditation session' });
    }
  }

  /**
   * Complete a meditation session
   * @route POST /api/meditation-sessions/:id/complete
   */
  public async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const { endTime, mood } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Find the session first to check ownership
      const session = await MeditationSession.findById(id);

      if (!session) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the user owns this session
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to complete this session' });
        return;
      }

      // Check if session is already completed
      if (session.completed) {
        res.status(400).json({ error: 'Session is already completed' });
        return;
      }

      // Update mood if provided
      if (mood) {
        session.mood = {
          ...session.mood,
          after: mood
        };
      }

      // Complete the session
      await session.completeSession(endTime ? new Date(endTime) : undefined);

      // Process achievement for completed meditation
      await achievementService.processUserActivity(userId, 'meditation_completed', {
        sessionId: session._id,
        duration: session.duration,
        type: session.type
      });

      res.status(200).json(session);
    } catch (error) {
      console.error('Error completing meditation session:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to complete meditation session' });
      }
    }
  }

  /**
   * Get user meditation statistics
   * @route GET /api/meditation-sessions/stats
   */
  public async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Get total sessions
      const totalSessions = await MeditationSession.countDocuments({
        userId,
        completed: true
      });

      // Get total meditation time (in seconds)
      const sessionsWithDuration = await MeditationSession.find({
        userId,
        completed: true
      }).select('duration');

      const totalDuration = sessionsWithDuration.reduce(
        (total, session) => total + session.duration,
        0
      );

      // Get sessions in the last 7 days
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);

      const sessionsLastWeek = await MeditationSession.countDocuments({
        userId,
        completed: true,
        startTime: { $gte: lastWeekDate }
      });

      // Get longest session
      const longestSession = await MeditationSession.findOne({
        userId,
        completed: true
      })
        .sort({ duration: -1 })
        .limit(1)
        .lean();

      // Get most recent session
      const recentSession = await MeditationSession.findOne({
        userId,
        completed: true
      })
        .sort({ startTime: -1 })
        .limit(1)
        .lean();

      // Calculate average session duration
      const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      res.status(200).json({
        totalSessions,
        totalDuration,
        totalDurationMinutes: Math.round(totalDuration / 60),
        sessionsLastWeek,
        averageDuration,
        averageDurationMinutes: Math.round(averageDuration / 60),
        longestSession: longestSession ? {
          id: longestSession._id,
          title: longestSession.title,
          duration: longestSession.duration,
          durationMinutes: Math.round(longestSession.duration / 60),
          date: longestSession.startTime
        } : null,
        recentSession: recentSession ? {
          id: recentSession._id,
          title: recentSession.title,
          duration: recentSession.duration,
          durationMinutes: Math.round(recentSession.duration / 60),
          date: recentSession.startTime
        } : null
      });
    } catch (error) {
      console.error('Error fetching meditation statistics:', error);
      res.status(500).json({ error: 'Failed to fetch meditation statistics' });
    }
  }
}

export default new MeditationSessionController(); 