import { CacheManager } from './cache-manager.service';
import { UserPoints } from '../models/user-points.model';
import mongoose from 'mongoose';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
export type LeaderboardCategory = 'total' | 'meditation' | 'streak' | 'social';

export interface LeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  points: number;
  rank: number;
}

export class LeaderboardService {
  private static getCacheKey(
    period: LeaderboardPeriod = 'all-time',
    category: LeaderboardCategory = 'total',
    limit: number = 10
  ): string {
    return `leaderboard:${period}:${category}:${limit}`;
  }

  private static getUserRankCacheKey(
    userId: mongoose.Types.ObjectId,
    period: LeaderboardPeriod = 'all-time',
    category: LeaderboardCategory = 'total'
  ): string {
    return `rank:${userId}:${period}:${category}`;
  }

  static async getLeaderboard(
    period: LeaderboardPeriod = 'all-time',
    category: LeaderboardCategory = 'total',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:${period}:${category}:${limit}`;
    
    // Try to get from cache first
    const cached = await CacheManager.get<LeaderboardEntry[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Build aggregation pipeline
    const dateFilter = this.getDateFilter(period);
    const pointsField = this.getPointsField(category);
    
    const pipeline = [
      // Match documents within the time period
      ...(dateFilter ? [{ $match: dateFilter }] : []),
      
      // Group by user
      {
        $group: {
          _id: '$userId',
          points: this.getPointsAggregation(category, period)
        }
      },
      
      // Sort by points descending
      { $sort: { points: -1 } as any },
      
      // Limit results
      { $limit: limit },
      
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      
      // Project final fields
      {
        $project: {
          userId: '$_id',
          username: { $arrayElemAt: ['$user.username', 0] },
          points: 1,
          _id: 0
        }
      }
    ];
    
    const results = await UserPoints.aggregate(pipeline);
    
    // Add rank
    const leaderboard = results.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    // Cache results
    await CacheManager.set(cacheKey, leaderboard, 300); // 5 minutes
    
    return leaderboard;
  }
  
  static async getUserRank(
    userId: string | mongoose.Types.ObjectId,
    period: LeaderboardPeriod = 'all-time',
    category: LeaderboardCategory = 'total'
  ): Promise<{ rank: number; total: number; totalUsers: number }> {
    const userIdStr = userId.toString();
    const cacheKey = `leaderboard:rank:${userIdStr}:${period}:${category}`;
    const cached = await CacheManager.get<{ rank: number; total: number; totalUsers: number }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const pointsField = this.getPointsField(category);
    const dateFilter = this.getDateFilter(period);
    
    // Get the user's points
    const userPoints = await UserPoints.findOne({ userId });
    if (!userPoints) {
      return { rank: 0, total: 0, totalUsers: 0 };
    }
    
    // Get the total number of users with points
    const totalUsers = await UserPoints.countDocuments({
      [pointsField]: { $gt: 0 },
      ...dateFilter
    });
    
    // Get the user's rank
    const rank = await UserPoints.countDocuments({
      [pointsField]: { $gt: userPoints.get(pointsField) || 0 },
      ...dateFilter
    }) + 1;
    
    const result = { 
      rank, 
      total: userPoints.get(pointsField) || 0,
      totalUsers
    };
    
    await CacheManager.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  }
  
  static async getTopAchievers(limit: number = 3): Promise<LeaderboardEntry[]> {
    const cacheKey = `topAchievers:${limit}`;
    
    // Try to get from cache first
    const cached = await CacheManager.get<LeaderboardEntry[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Get leaderboard with achievements category
    return this.getLeaderboard('all-time', 'total', limit);
  }
  
  static async getWeeklyProgress(userId: mongoose.Types.ObjectId): Promise<{
    currentWeek: number;
    previousWeek: number;
    change: number;
    percentChange: number;
  }> {
    const cacheKey = `weeklyProgress:${userId}`;
    
    // Try to get from cache first
    const cached = await CacheManager.get<{
      currentWeek: number;
      previousWeek: number;
      change: number;
      percentChange: number;
    }>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Calculate date ranges
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 7);
    
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    // Get user points
    const userPoints = await UserPoints.findOne({ userId });
    
    // Calculate points for current week
    const currentWeekPoints = userPoints?.history
      .filter(entry => entry.date >= currentWeekStart)
      .reduce((sum, entry) => sum + entry.points, 0) || 0;
    
    // Calculate points for previous week
    const previousWeekPoints = userPoints?.history
      .filter(entry => entry.date >= previousWeekStart && entry.date < currentWeekStart)
      .reduce((sum, entry) => sum + entry.points, 0) || 0;
    
    // Calculate change
    const change = currentWeekPoints - previousWeekPoints;
    const percentChange = previousWeekPoints > 0 
      ? (change / previousWeekPoints) * 100 
      : (currentWeekPoints > 0 ? 100 : 0);
    
    const result = {
      currentWeek: currentWeekPoints,
      previousWeek: previousWeekPoints,
      change,
      percentChange
    };
    
    // Cache results
    await CacheManager.set(cacheKey, result, 3600); // 1 hour
    
    return result;
  }
  
  static async invalidateUserCache(userId: mongoose.Types.ObjectId): Promise<void> {
    // Delete all cache keys related to this user
    await CacheManager.del(`userRank:${userId}:all-time:total`);
    await CacheManager.del(`userRank:${userId}:weekly:total`);
    await CacheManager.del(`userRank:${userId}:monthly:total`);
    await CacheManager.del(`weeklyProgress:${userId}`);
    
    // Also invalidate leaderboard caches
    await CacheManager.del('leaderboard:all-time:total:10');
    await CacheManager.del('leaderboard:weekly:total:10');
    await CacheManager.del('leaderboard:monthly:total:10');
    await CacheManager.del('topAchievers:3');
  }
  
  // Helper methods
  private static getDateFilter(period: LeaderboardPeriod): Record<string, any> | null {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { 'history.date': { $gte: today } };
        
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return { 'history.date': { $gte: weekStart } };
        
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { 'history.date': { $gte: monthStart } };
        
      case 'all-time':
      default:
        return null;
    }
  }
  
  private static getPointsField(category: LeaderboardCategory): string {
    switch (category) {
      case 'meditation':
        return 'meditationPoints';
      case 'streak':
        return 'streakPoints';
      case 'social':
        return 'socialPoints';
      case 'total':
      default:
        return 'totalPoints';
    }
  }
  
  private static getPointsAggregation(category: LeaderboardCategory, period: LeaderboardPeriod): any {
    if (period === 'all-time') {
      // For all-time, use the accumulated field
      const field = this.getPointsField(category);
      return { $sum: `$${field}` };
    } else {
      // For time-limited periods, sum from history
      const dateFilter = this.getDateFilter(period);
      const sourceFilter = category === 'total' 
        ? {} 
        : { 'history.source': category === 'meditation' ? 'achievement' : category };
      
      return {
        $sum: {
          $cond: [
            { $and: [
              dateFilter ? { $gte: ['$history.date', dateFilter['history.date'].$gte] } : true,
              Object.keys(sourceFilter).length > 0 
                ? { $eq: ['$history.source', sourceFilter['history.source']] } 
                : true
            ]},
            '$history.points',
            0
          ]
        }
      };
    }
  }

  // Start the cache cleanup when the service initializes
  static async initialize(): Promise<void> {
    // Initialize cache and other resources
  }

  static async shutdown(): Promise<void> {
    // Cleanup resources
  }
} 