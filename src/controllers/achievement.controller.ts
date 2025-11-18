import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AchievementService } from '../services/achievement.service';
import { Achievement, UserAchievement } from '../models/achievement.model';
import { BaseController } from '../core/base-controller';
import { IAchievement } from '../models/achievement.model';
import { HttpError } from '../errors/http-error';
import { FilterQuery } from 'mongoose';

/**
 * Controller for Achievement-related API endpoints
 */
export class AchievementController extends BaseController<IAchievement> {
  constructor() {
    super(Achievement);
  }

  protected async validateCreate(req: Request): Promise<void> {
    const { title, description, criteria, userId } = req.body;

    if (!title) {
      throw HttpError.badRequest('Title is required');
    }
    if (!description) {
      throw HttpError.badRequest('Description is required');
    }
    if (!criteria || !criteria.type || !criteria.target) {
      throw HttpError.badRequest('Valid criteria with type and target is required');
    }
    if (!['SESSION_COUNT', 'STREAK_DAYS', 'TOTAL_MINUTES'].includes(criteria.type)) {
      throw HttpError.badRequest('Invalid criteria type');
    }
    if (criteria.target <= 0) {
      throw HttpError.badRequest('Criteria target must be positive');
    }
    if (!userId) {
      throw HttpError.badRequest('User ID is required');
    }
  }

  protected async validateUpdate(req: Request): Promise<void> {
    const { criteria } = req.body;

    if (criteria) {
      if (!criteria.type || !criteria.target) {
        throw HttpError.badRequest('Criteria must include both type and target');
      }
      if (!['SESSION_COUNT', 'STREAK_DAYS', 'TOTAL_MINUTES'].includes(criteria.type)) {
        throw HttpError.badRequest('Invalid criteria type');
      }
      if (criteria.target <= 0) {
        throw HttpError.badRequest('Criteria target must be positive');
      }
    }
  }

  protected buildFilterQuery(req: Request): FilterQuery<IAchievement> {
    const filter: FilterQuery<IAchievement> = {};
    const { userId, isCompleted, criteriaType, search } = req.query;

    if (userId) {
      filter.userId = userId;
    }

    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
    }

    if (criteriaType) {
      filter['criteria.type'] = criteriaType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    return filter;
  }

  /**
   * Get all achievements
   * @route GET /api/achievements
   */
  public async getAllAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const achievements = await Achievement.find(filter).lean();
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
      const { name, description, category, criteria, icon, points } = req.body;

      // Validate required fields
      if (!name || !description || !category || !criteria || !icon || points === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate category
      const validCategories = ['time', 'duration', 'streak', 'milestone', 'special'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ 
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        });
        return;
      }

      // Validate points
      if (typeof points !== 'number' || points < 0) {
        res.status(400).json({ error: 'Points must be a non-negative number' });
        return;
      }

      const newAchievement = new Achievement({
        name,
        description,
        category,
        criteria,
        icon,
        points
      });

      await newAchievement.save();
      res.status(201).json(newAchievement);
    } catch (error) {
      console.error('Error creating achievement:', error);
      res.status(500).json({ error: 'Failed to create achievement' });
    }
  }

  /**
   * Update an achievement
   * @route PUT /api/achievements/:id
   */
  public async updateAchievement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, category, criteria, icon, points } = req.body;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid achievement ID format' });
        return;
      }

      // Find the achievement
      const achievement = await Achievement.findById(id);
      
      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      // Validate category if provided
      if (category) {
        const validCategories = ['time', 'duration', 'streak', 'milestone', 'special'];
        if (!validCategories.includes(category)) {
          res.status(400).json({ 
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
          });
          return;
        }
      }

      // Validate points if provided
      if (points !== undefined && (typeof points !== 'number' || points < 0)) {
        res.status(400).json({ error: 'Points must be a non-negative number' });
        return;
      }

      // Update fields
      if (name) achievement.name = name;
      if (description) achievement.description = description;
      if (category) achievement.category = category;
      if (criteria) achievement.criteria = criteria;
      if (icon) achievement.icon = icon;
      if (points !== undefined) achievement.points = points;

      await achievement.save();
      res.status(200).json(achievement);
    } catch (error) {
      console.error('Error updating achievement:', error);
      res.status(500).json({ error: 'Failed to update achievement' });
    }
  }

  /**
   * Delete an achievement
   * @route DELETE /api/achievements/:id
   */
  public async deleteAchievement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid achievement ID format' });
        return;
      }

      // Check if achievement exists
      const achievement = await Achievement.findById(id);
      
      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }

      // Check if achievement is used by any users
      const userAchievementCount = await UserAchievement.countDocuments({ achievementId: id });
      
      if (userAchievementCount > 0) {
        res.status(400).json({ 
          error: 'Cannot delete achievement that is assigned to users',
          userCount: userAchievementCount
        });
        return;
      }

      // Delete the achievement
      await Achievement.findByIdAndDelete(id);
      res.status(200).json({ message: 'Achievement deleted successfully' });
    } catch (error) {
      console.error('Error deleting achievement:', error);
      res.status(500).json({ error: 'Failed to delete achievement' });
    }
  }

  /**
   * Get all achievements for the current user
   * @route GET /api/achievements/user
   */
  public async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const userAchievements = await UserAchievement.find({ userId })
        .populate('achievementId')
        .lean();

      res.status(200).json(userAchievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
  }

  /**
   * Get completed achievements for the current user
   * @route GET /api/achievements/user/completed
   */
  public async getCompletedAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const completedAchievements = await UserAchievement.find({ 
        userId, 
        isCompleted: true 
      })
        .populate('achievementId')
        .lean();

      res.status(200).json(completedAchievements);
    } catch (error) {
      console.error('Error fetching completed achievements:', error);
      res.status(500).json({ error: 'Failed to fetch completed achievements' });
    }
  }

  /**
   * Get total points for the current user
   * @route GET /api/achievements/user/points
   */
  public async getUserPoints(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      const totalPoints = await AchievementService.getUserPoints(userId.toString());
      
      res.status(200).json({ 
        points: totalPoints 
      });
    } catch (error) {
      console.error('Error fetching user points:', error);
      res.status(500).json({ error: 'Failed to fetch user points' });
    }
  }

  /**
   * Process user activity for achievements
   * @route POST /api/achievements/process
   */
  public async processActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { activityType, activityData } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }

      if (!activityType) {
        res.status(400).json({ error: 'Activity type is required' });
        return;
      }

      // Use the static method for processing meditation achievements
      const result = await AchievementService.processMeditationAchievements({
        userId: userId,
        ...activityData
      });

      res.status(200).json({ 
        success: true,
        message: 'Activity processed successfully',
        result
      });
    } catch (error) {
      console.error('Error processing user activity:', error);
      res.status(500).json({ error: 'Failed to process user activity' });
    }
  }

  // Custom methods specific to Achievement
  async getByUser(req: Request): Promise<IAchievement[]> {
    const { userId } = req.params;
    if (!userId) {
      throw HttpError.badRequest('User ID is required');
    }

    const achievements = await this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    return achievements;
  }

  async updateProgress(req: Request): Promise<IAchievement> {
    const { achievementId, progress } = req.body;
    const achievement = await Achievement.findById(achievementId);

    if (!achievement) {
      throw new HttpError(404, 'Achievement not found');
    }

    achievement.progress = progress;
    if (achievement.target !== undefined && progress >= achievement.target && !achievement.completed) {
      achievement.completed = true;
      achievement.completedAt = new Date();
    }

    const updatedAchievement = await achievement.save();
    return updatedAchievement;
  }

  async getInProgress(req: Request): Promise<IAchievement[]> {
    const { userId } = req.params;
    if (!userId) {
      throw HttpError.badRequest('User ID is required');
    }

    const achievements = await this.model
      .find({
        userId,
        isCompleted: false,
        'criteria.progress': { $gt: 0 }
      })
      .sort({ 'criteria.progress': -1 })
      .exec();

    return achievements;
  }

  async getRecentlyCompleted(req: Request): Promise<IAchievement[]> {
    const { userId } = req.params;
    const { limit = 5 } = req.query;

    if (!userId) {
      throw HttpError.badRequest('User ID is required');
    }

    const achievements = await this.model
      .find({
        userId,
        isCompleted: true
      })
      .sort({ completedAt: -1 })
      .limit(Number(limit))
      .exec();

    return achievements;
  }
} 