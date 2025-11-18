import { Meditation } from '../models/meditation.model';
import { MeditationSession } from '../models/meditation-session.model';
import mongoose from 'mongoose';
import { WellnessSessionStatus } from '../models/base-wellness-session.model';

export class MeditationService {
  static async getAllMeditations() {
    return Meditation.find({ isActive: true });
  }

  static async getMeditationById(id: string) {
    return Meditation.findById(id);
  }

  static async createMeditation(meditationData: any) {
    const meditation = new Meditation(meditationData);
    return meditation.save();
  }

  static async updateMeditation(id: string, updateData: any) {
    return Meditation.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteMeditation(id: string) {
    return Meditation.findByIdAndDelete(id);
  }

  /**
   * Get meditation sessions for a user within a specified date range
   * @param userId The user's ID
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   * @returns Array of meditation sessions
   */
  static async getUserMeditations(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = startDate;
        if (endDate) query.startTime.$lte = endDate;
      }
      
      const meditations = await MeditationSession.find(query)
        .sort({ startTime: -1 })
        .lean();
        
      return meditations;
    } catch (error) {
      console.error('Error fetching user meditation sessions:', error);
      throw error;
    }
  }
  
  /**
   * Get meditation statistics for a user
   * @param userId The user's ID
   * @returns Meditation statistics
   */
  static async getMeditationStats(userId: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sessions = await MeditationSession.find({
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: thirtyDaysAgo },
        status: WellnessSessionStatus.Completed
      }).lean();
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalMinutes: 0,
          averageDuration: 0,
          longestSession: 0,
          mostCommonTechnique: null,
          streak: 0
        };
      }
      
      // Calculate total minutes
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      
      // Calculate average duration
      const averageDuration = parseFloat((totalMinutes / sessions.length).toFixed(1));
      
      // Find longest session
      const longestSession = Math.max(...sessions.map(session => session.duration || 0));
      
      // Find most common technique
      const techniqueCounts: Record<string, number> = {};
      sessions.forEach(session => {
        const technique = session.type || 'unspecified';
        techniqueCounts[technique] = (techniqueCounts[technique] || 0) + 1;
      });
      
      let mostCommonTechnique = null;
      let maxCount = 0;
      
      Object.entries(techniqueCounts).forEach(([technique, count]) => {
        if (count > maxCount) {
          mostCommonTechnique = technique;
          maxCount = count;
        }
      });
      
      // Calculate streak
      const streak = await this.calculateStreak(userId);
      
      return {
        totalSessions: sessions.length,
        totalMinutes,
        averageDuration,
        longestSession,
        mostCommonTechnique,
        streak
      };
    } catch (error) {
      console.error('Error calculating meditation stats:', error);
      throw error;
    }
  }
  
  /**
   * Calculate current meditation streak for a user
   * @param userId The user's ID
   * @returns Current streak count
   */
  static async calculateStreak(userId: string): Promise<number> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get recent sessions
      const recentSessions = await MeditationSession.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: WellnessSessionStatus.Completed,
        startTime: { $lte: now }
      })
      .sort({ startTime: -1 })
      .lean();
      
      if (recentSessions.length === 0) {
        return 0;
      }
      
      // Group sessions by day
      const sessionsByDay = new Map<string, boolean>();
      
      recentSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dateKey = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate()
        ).toISOString().split('T')[0];
        sessionsByDay.set(dateKey, true);
      });
      
      // Check if there's a session today
      const todayStr = today.toISOString().split('T')[0];
      const hasTodaySession = sessionsByDay.has(todayStr);
      
      // Count streak
      let streak = hasTodaySession ? 1 : 0;
      let currentDate = new Date(today);
      
      if (!hasTodaySession) {
        // If no session today, check if there was one yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toISOString().split('T')[0];
        if (sessionsByDay.has(yesterdayStr)) {
          streak = 1;
        } else {
          return 0;
        }
      }
      
      // Check previous days
      while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (sessionsByDay.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating meditation streak:', error);
      throw error;
    }
  }
} 