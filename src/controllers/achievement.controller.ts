import { Request, Response } from 'express';
import { Achievement } from '../models/achievement.model';
import mongoose from 'mongoose';

export class AchievementController {
  // Get user's achievements
  static async getUserAchievements(req: Request, res: Response) {
    try {
      const achievements = await Achievement.find({ userId: req.user?._id });
      return res.json(achievements);
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return res.status(500).json({ message: 'Error fetching achievements' });
    }
  }

  // Get achievement details
  static async getAchievementDetails(req: Request<{ achievementId: string }>, res: Response) {
    try {
      const { achievementId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(achievementId)) {
        return res.status(400).json({ message: 'Invalid achievement ID' });
      }

      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found' });
      }

      // Check if the achievement belongs to the user
      if (achievement.userId.toString() !== req.user?._id?.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this achievement' });
      }

      return res.json(achievement);
    } catch (error) {
      console.error('Error getting achievement details:', error);
      return res.status(500).json({ message: 'Error fetching achievement details' });
    }
  }
} 