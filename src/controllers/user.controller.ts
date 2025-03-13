import { Request, Response } from 'express';
import { User } from '../models/user.model';

export class UserController {
  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?._id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return res.status(500).json({ message: 'Error fetching user profile' });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['username', 'email', 'preferences'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {} as any);

      const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updates },
        { new: true }
      ).select('-password');

      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Error updating user profile' });
    }
  }

  // Get user stats
  static async getStats(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Here you would typically aggregate meditation sessions, achievements, etc.
      // For now, return placeholder stats
      return res.json({
        totalMeditations: 0,
        totalMinutes: 0,
        streak: 0,
        achievements: []
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      return res.status(500).json({ message: 'Error fetching user stats' });
    }
  }
} 