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
   * Get a specific meditation session by ID
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

      // Check if the session belongs to the user
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
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

      const { 
        title, 
        description, 
        duration, 
        type, 
        guidedMeditationId,
        tags,
        mood,
        notes
      } = req.body;

      // Validate required fields
      if (!title || !duration || !type) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate session type
      const validTypes = ['guided', 'unguided', 'timed'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ 
          error: `Invalid session type. Must be one of: ${validTypes.join(', ')}` 
        });
        return;
      }

      // Validate guided meditation ID if type is guided
      if (type === 'guided' && !guidedMeditationId) {
        res.status(400).json({ error: 'Guided meditation ID is required for guided sessions' });
        return;
      }

      // Validate guided meditation ID format if provided
      if (guidedMeditationId && !mongoose.Types.ObjectId.isValid(guidedMeditationId)) {
        res.status(400).json({ error: 'Invalid guided meditation ID format' });
        return;
      }

      // Create new session
      const newSession = new MeditationSession({
        userId,
        title,
        description,
        duration,
        type,
        guidedMeditationId,
        tags,
        mood,
        notes,
        startTime: new Date(),
        completed: false
      });

      await newSession.save();
      res.status(201).json(newSession);
    } catch (error) {
      console.error('Error creating meditation session:', error);
      res.status(500).json({ error: 'Failed to create meditation session' });
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

      // Find the session
      const session = await MeditationSession.findById(id);
      
      if (!session) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the session belongs to the user
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
        return;
      }

      // Don't allow updating completed sessions
      if (session.completed) {
        res.status(400).json({ error: 'Cannot update a completed session' });
        return;
      }

      const { 
        title, 
        description, 
        duration, 
        tags,
        mood,
        notes
      } = req.body;

      // Update fields
      if (title) session.title = title;
      if (description !== undefined) session.description = description;
      if (duration) session.duration = duration;
      if (tags) session.tags = tags;
      if (mood) session.mood = mood;
      if (notes !== undefined) session.notes = notes;

      await session.save();
      res.status(200).json(session);
    } catch (error) {
      console.error('Error updating meditation session:', error);
      res.status(500).json({ error: 'Failed to update meditation session' });
    }
  }

  /**
   * Complete a meditation session
   * @route PUT /api/meditation-sessions/:id/complete
   */
  public async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const { mood } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid session ID format' });
        return;
      }

      // Find the session
      const session = await MeditationSession.findById(id);
      
      if (!session) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the session belongs to the user
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
        return;
      }

      // Don't allow completing already completed sessions
      if (session.completed) {
        res.status(400).json({ error: 'Session is already completed' });
        return;
      }

      // Update mood after if provided
      if (mood) {
        if (!session.mood) session.mood = {};
        session.mood.after = mood;
      }

      // Complete the session
      await session.completeSession();

      // Process achievements
      await achievementService.processMeditationCompletion(userId, session);

      res.status(200).json(session);
    } catch (error) {
      console.error('Error completing meditation session:', error);
      res.status(500).json({ error: 'Failed to complete meditation session' });
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

      // Find the session
      const session = await MeditationSession.findById(id);
      
      if (!session) {
        res.status(404).json({ error: 'Meditation session not found' });
        return;
      }

      // Check if the session belongs to the user
      if (session.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
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
   * Get meditation statistics for the current user
   * @route GET /api/meditation-sessions/stats
   */
  public async getUserStats(req: Request, res: Response): Promise<void> {
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
      const totalTimeResult = await MeditationSession.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId.toString()),
            completed: true
          } 
        },
        { 
          $group: { 
            _id: null, 
            totalTime: { $sum: '$duration' } 
          } 
        }
      ]);

      const totalTime = totalTimeResult.length > 0 ? totalTimeResult[0].totalTime : 0;

      // Get sessions by type
      const sessionsByType = await MeditationSession.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId.toString()),
            completed: true
          } 
        },
        { 
          $group: { 
            _id: '$type', 
            count: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          } 
        }
      ]);

      // Get recent streak
      const recentSessions = await MeditationSession.find({
        userId,
        completed: true
      })
        .sort({ startTime: -1 })
        .limit(30)
        .lean();

      // Calculate streak
      const streak = this.calculateStreak(recentSessions);

      res.status(200).json({
        totalSessions,
        totalTime,
        totalTimeFormatted: this.formatTime(totalTime),
        sessionsByType,
        currentStreak: streak
      });
    } catch (error) {
      console.error('Error fetching meditation statistics:', error);
      res.status(500).json({ error: 'Failed to fetch meditation statistics' });
    }
  }

  /**
   * Helper method to calculate current streak
   * @private
   */
  private calculateStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a session today
    const latestSession = sessions[0];
    const latestDate = new Date(latestSession.startTime);
    latestDate.setHours(0, 0, 0, 0);

    if (latestDate.getTime() !== today.getTime() && 
        latestDate.getTime() !== new Date(today.getTime() - 86400000).getTime()) {
      // No session today or yesterday, streak is broken
      return 0;
    }

    // Calculate streak by checking consecutive days
    for (let i = 0; i < sessions.length - 1; i++) {
      const currentDate = new Date(sessions[i].startTime);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(sessions[i + 1].startTime);
      prevDate.setHours(0, 0, 0, 0);

      // Check if dates are consecutive
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        // Break in streak
        break;
      }
    }

    return streak;
  }

  /**
   * Helper method to format time in seconds to human-readable format
   * @private
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
} 