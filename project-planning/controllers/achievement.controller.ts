import { Request, Response } from 'express';
import mongoose from 'mongoose';
import achievementService from '../services/achievement.service';
import { Achievement } from '../models/achievement.model';

/**
 * Controller for Achievement-related API endpoints
 */
export class AchievementController {
  /**
   * Get all achievements
   * @route GET /api/achievements
   */
  public async getAllAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = await Achievement.find().lean();
      res.status(200).json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  }

  /**
   * Get achievement by ID
   * @route GET /api/achievements/:id
   */
  public async getAchievementById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid achievement ID format' });
        return;
      }

      const achievement = await Achievement.findById(id).lean();

      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      res.status(200).json(achievement);
    } catch (error) {
      console.error('Error fetching achievement:', error);
      res.status(500).json({ error: 'Failed to fetch achievement' });
    }
  }

  /**
   * Create a new achievement
   * @route POST /api/achievements
   */
  public async createAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Check if user has admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
        return;
      }

      const achievementData = req.body;

      // Validate required fields
      if (!achievementData.name || !achievementData.description || !achievementData.category || 
          !achievementData.criteria || !achievementData.icon || achievementData.points === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const achievement = await achievementService.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      console.error('Error creating achievement:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create achievement' });
      }
    }
  }

  /**
   * Update an achievement
   * @route PUT /api/achievements/:id
   */
  public async updateAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Check if user has admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid achievement ID format' });
        return;
      }

      const achievement = await achievementService.updateAchievement(id, updateData);

      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      res.status(200).json(achievement);
    } catch (error) {
      console.error('Error updating achievement:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update achievement' });
      }
    }
  }

  /**
   * Delete an achievement
   * @route DELETE /api/achievements/:id
   */
  public async deleteAchievement(req: Request, res: Response): Promise<void> {
    try {
      // Check if user has admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
        return;
      }

      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid achievement ID format' });
        return;
      }

      const deleted = await achievementService.deleteAchievement(id);

      if (!deleted) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      res.status(200).json({ message: 'Achievement deleted successfully' });
    } catch (error) {
      console.error('Error deleting achievement:', error);
      res.status(500).json({ error: 'Failed to delete achievement' });
    }
  }

  /**
   * Get achievements for current user
   * @route GET /api/user/achievements
   */
  public async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const achievements = await achievementService.getUserAchievements(userId);
      res.status(200).json(achievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
  }

  /**
   * Get completed achievements for current user
   * @route GET /api/user/achievements/completed
   */
  public async getCompletedAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const achievements = await achievementService.getCompletedAchievements(userId);
      res.status(200).json(achievements);
    } catch (error) {
      console.error('Error fetching completed achievements:', error);
      res.status(500).json({ error: 'Failed to fetch completed achievements' });
    }
  }

  /**
   * Get total achievement points for current user
   * @route GET /api/user/achievements/points
   */
  public async getUserPoints(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const points = await achievementService.getUserPoints(userId);
      res.status(200).json({ points });
    } catch (error) {
      console.error('Error fetching user points:', error);
      res.status(500).json({ error: 'Failed to fetch user points' });
    }
  }

  /**
   * Process a user activity (internal API)
   * @route POST /api/user/activity
   */
  public async processUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const { activityType, activityData } = req.body;

      if (!activityType) {
        res.status(400).json({ error: 'Activity type is required' });
        return;
      }

      // Validate activity type
      const validActivityTypes = ['meditation_completed', 'stress_assessment_completed', 'login', 'streak'];
      if (!validActivityTypes.includes(activityType)) {
        res.status(400).json({ error: 'Invalid activity type' });
        return;
      }

      await achievementService.processUserActivity(userId, activityType, activityData || {});
      res.status(200).json({ message: 'Activity processed successfully' });
    } catch (error) {
      console.error('Error processing user activity:', error);
      res.status(500).json({ error: 'Failed to process user activity' });
    }
  }
}

export default new AchievementController(); 