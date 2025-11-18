import mongoose from 'mongoose';
import { User } from '../models/user.model';

// Define a local interface that matches what we're returning
export interface UserPreferences {
  userId: string;
  preferredTechniques?: string[];
  preferredDuration?: number;
  preferredTime?: string;
  notificationFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
}

export class UserService {
  /**
   * Get a user by ID
   * @param userId The user's ID
   * @returns User document or null if not found
   */
  static async getUserById(userId: string): Promise<any> {
    try {
      const user = await User.findById(new mongoose.Types.ObjectId(userId)).lean();
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * @param userId The user's ID
   * @returns User preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const user = await User.findById(new mongoose.Types.ObjectId(userId)).lean();
      
      if (!user) {
        return null;
      }
      
      return {
        userId,
        preferredTechniques: user.preferences?.stressManagement?.preferredCategories || [],
        preferredDuration: user.preferences?.stressManagement?.preferredDuration || 10,
        preferredTime: 'morning', // Default value as this field doesn't exist in the model
        notificationFrequency: 'daily' // Default value as this field doesn't exist in the model
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param userId The user's ID
   * @param preferences Updated preferences
   * @returns Updated user document
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<any> {
    try {
      const updateData: any = {};
      
      if (preferences.preferredTechniques) {
        updateData['preferences.techniques'] = preferences.preferredTechniques;
      }
      
      if (preferences.preferredDuration) {
        updateData['preferences.duration'] = preferences.preferredDuration;
      }
      
      if (preferences.preferredTime) {
        updateData['preferences.time'] = preferences.preferredTime;
      }
      
      if (preferences.notificationFrequency) {
        updateData['preferences.notificationFrequency'] = preferences.notificationFrequency;
      }
      
      const user = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(userId),
        { $set: updateData },
        { new: true }
      ).lean();
      
      return user;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
} 