import mongoose, { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as csvWriter from 'csv-writer';
import { User } from '../models/user.model';
import { Achievement } from '../models/achievement.model';
import { Meditation } from '../models/meditation.model';
import { StressAssessment } from '../models/stress-assessment.model';
import { convertToObjectId } from '../utils/db.utils';

export interface ExportOptions {
  format?: 'json' | 'csv';
  startDate?: Date;
  endDate?: Date;
}

export class ExportService {
  /**
   * Get all user achievements
   * @param userId The user ID
   * @param options Export options (format, date range)
   */
  static async getUserAchievements(userId: string, options?: ExportOptions) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const query: any = { userId };
      
      // Apply date filters if specified
      if (options?.startDate || options?.endDate) {
        query.createdAt = {};
        if (options?.startDate) {
          query.createdAt.$gte = options.startDate;
        }
        if (options?.endDate) {
          query.createdAt.$lte = options.endDate;
        }
      }

      const achievements = await Achievement.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // If CSV format is requested, convert to CSV
      if (options?.format === 'csv') {
        const header = [
          'Achievement Name,Description,Category,Points,Date Earned'
        ];
        
        const rows = achievements.map(achievement => {
          return [
            achievement.name,
            achievement.description,
            achievement.category,
            achievement.points,
            new Date(achievement.createdAt).toLocaleDateString()
          ].join(',');
        });
        
        return [header, ...rows].join('\n');
      }
      
      return achievements;
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      throw error;
    }
  }

  /**
   * Get all user meditation sessions
   * @param userId The user ID
   * @param options Export options (format, date range)
   */
  static async getUserMeditations(userId: string, options?: ExportOptions) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const query: any = { authorId: userId };
      
      // Apply date filters if specified
      if (options?.startDate || options?.endDate) {
        query.createdAt = {};
        if (options?.startDate) {
          query.createdAt.$gte = options.startDate;
        }
        if (options?.endDate) {
          query.createdAt.$lte = options.endDate;
        }
      }

      const meditations = await Meditation.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // If CSV format is requested, convert to CSV
      if (options?.format === 'csv') {
        const header = [
          'Date,Duration (minutes),Technique,Notes,Mood Before,Mood After'
        ];
        
        const rows = meditations.map(meditation => {
          return [
            new Date(meditation.createdAt).toLocaleDateString(),
            meditation.duration,
            `${meditation.title} (${meditation.category})`,
            meditation.description || 'N/A',
            'N/A', // Mood before - not stored in our current model
            'N/A'  // Mood after - not stored in our current model
          ].join(',');
        });
        
        return [header, ...rows].join('\n');
      }
      
      return meditations;
    } catch (error) {
      console.error('Error in getUserMeditations:', error);
      throw error;
    }
  }

  /**
   * Get all user stress assessments
   * @param userId The user ID
   * @param options Export options (format, date range)
   */
  static async getUserStressAssessments(userId: string, options?: ExportOptions) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const query: any = { userId };
      
      // Apply date filters if specified
      if (options?.startDate || options?.endDate) {
        query.date = {};
        if (options?.startDate) {
          query.date.$gte = options.startDate;
        }
        if (options?.endDate) {
          query.date.$lte = options.endDate;
        }
      }

      const assessments = await StressAssessment.find(query)
        .sort({ date: -1 })
        .lean();

      // If CSV format is requested, convert to CSV
      if (options?.format === 'csv') {
        const header = [
          'Date,Stress Level (1-10),Stress Factors,Physical Symptoms,Emotional State,Notes'
        ];
        
        const rows = assessments.map(assessment => {
          return [
            new Date(assessment.date).toLocaleDateString(),
            assessment.stressLevel,
            (assessment.triggers || []).join(', '),
            (assessment.physicalSymptoms || []).join(', '),
            (assessment.emotionalSymptoms || []).join(', '),
            assessment.notes || 'N/A'
          ].join(',');
        });
        
        return [header, ...rows].join('\n');
      }
      
      return assessments;
    } catch (error) {
      console.error('Error in getUserStressAssessments:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user data including profile, meditations, achievements, and stress assessments
   * @param userId The user ID
   * @param options Export options (format)
   */
  static async getUserData(userId: string, options?: ExportOptions) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      // Get user profile
      const user = await User.findById(userId)
        .select('-password')
        .lean();

      if (!user) {
        throw new Error('User not found');
      }

      // Get user data from all collections
      const [achievements, meditations, stressAssessments] = await Promise.all([
        this.getUserAchievements(userId),
        this.getUserMeditations(userId),
        this.getUserStressAssessments(userId)
      ]);

      const userData = {
        profile: user,
        achievements,
        meditations,
        stressAssessments
      };

      // If CSV format is requested, create a combined CSV
      if (options?.format === 'csv') {
        const sections = [
          '# USER PROFILE',
          `Username: ${user.username}`,
          `Email: ${user.email}`,
          `Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}`,
          `Account Active: ${user.isActive ? 'Yes' : 'No'}`,
          '\n# ACHIEVEMENTS',
          await this.getUserAchievements(userId, { format: 'csv' }),
          '\n# MEDITATION SESSIONS',
          await this.getUserMeditations(userId, { format: 'csv' }),
          '\n# STRESS ASSESSMENTS',
          await this.getUserStressAssessments(userId, { format: 'csv' })
        ];
        
        return sections.join('\n');
      }
      
      return userData;
    } catch (error) {
      console.error('Error in getUserData:', error);
      throw error;
    }
  }
} 