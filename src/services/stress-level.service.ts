import { StressLog } from '../models/stress-log.model';
import mongoose from 'mongoose';

/**
 * Service class for handling stress level data
 */
export class StressLevelService {
  /**
   * Get stress levels for a user within a specified date range
   * @param userId The user's ID
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   * @returns Array of stress level entries
   */
  static async getUserStressLevels(
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<any[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = startDate;
        if (endDate) query.date.$lte = endDate;
      }
      
      const stressLevels = await StressLog.find(query)
        .sort({ date: -1 })
        .lean();
        
      return stressLevels;
    } catch (error) {
      console.error('Error fetching user stress levels:', error);
      throw error;
    }
  }
  
  /**
   * Get average stress level for a user over a time period
   * @param userId The user's ID
   * @param days Number of days to calculate average from
   * @returns Average stress level
   */
  static async getAverageStressLevel(userId: string, days: number = 30): Promise<number> {
    try {
      if (days < 0) {
        throw new Error('Days parameter must be non-negative');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const result = await StressLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            averageLevel: { $avg: '$level' }
          }
        }
      ]);
      
      return result.length > 0 ? parseFloat(result[0].averageLevel.toFixed(1)) : 0;
    } catch (error) {
      console.error('Error calculating average stress level:', error);
      throw error;
    }
  }
  
  /**
   * Create a new stress level log
   * @param userId The user's ID
   * @param data Stress log data
   * @returns Created stress log
   */
  static async createStressLog(userId: string, data: any): Promise<any> {
    try {
      const stressLog = await StressLog.create({
        userId: new mongoose.Types.ObjectId(userId),
        date: data.date || new Date(),
        level: data.level,
        triggers: data.triggers || [],
        symptoms: data.symptoms || [],
        notes: data.notes
      });
      
      return stressLog;
    } catch (error) {
      console.error('Error creating stress log:', error);
      throw error;
    }
  }
  
  /**
   * Get stress level trends for a user
   * @param userId The user's ID
   * @param days Number of days to analyze
   * @returns Trend analysis
   */
  static async getStressTrends(userId: string, days: number = 30): Promise<any> {
    try {
      if (days < 0) {
        throw new Error('Days parameter must be non-negative');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const stressLogs = await StressLog.find({
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }).sort({ date: 1 }).lean();
      
      if (stressLogs.length === 0) {
        return {
          average: 0,
          trend: 'STABLE',
          highestLevel: 0,
          lowestLevel: 0,
          commonTriggers: []
        };
      }
      
      // Calculate average
      const sum = stressLogs.reduce((acc, log) => acc + log.level, 0);
      const average = parseFloat((sum / stressLogs.length).toFixed(1));
      
      // Calculate trend (IMPROVING, WORSENING, STABLE)
      let trend = 'STABLE';
      if (stressLogs.length >= 3) {
        const firstHalf = stressLogs.slice(0, Math.floor(stressLogs.length / 2));
        const secondHalf = stressLogs.slice(Math.floor(stressLogs.length / 2));
        
        const firstAvg = firstHalf.reduce((acc, log) => acc + log.level, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((acc, log) => acc + log.level, 0) / secondHalf.length;
        
        if (secondAvg < firstAvg - 0.5) trend = 'IMPROVING';
        if (secondAvg > firstAvg + 0.5) trend = 'WORSENING';
      }
      
      // Find highest and lowest levels
      const highestLevel = Math.max(...stressLogs.map(log => log.level));
      const lowestLevel = Math.min(...stressLogs.map(log => log.level));
      
      // Find common triggers
      const triggerCounts: Record<string, number> = {};
      stressLogs.forEach(log => {
        (log.triggers || []).forEach((trigger: string) => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      });
      
      const commonTriggers = Object.entries(triggerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([trigger]) => trigger);
      
      return {
        average,
        trend,
        highestLevel,
        lowestLevel,
        commonTriggers
      };
    } catch (error) {
      console.error('Error analyzing stress trends:', error);
      throw error;
    }
  }
} 