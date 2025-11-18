import mongoose from 'mongoose';
import { LeaderboardService, LeaderboardPeriod, LeaderboardCategory } from '../../services/leaderboard.service';
import { UserPoints } from '../../models/user-points.model';
import { User } from '../../models/user.model';
import { CacheManager } from '../../services/cache-manager.service';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { UserTestFactory } from '../factories/user.factory';

// Mock cache manager
jest.mock('../../services/cache-manager.service');

describe('LeaderboardService', () => {
  let userFactory: UserTestFactory;
  let users: any[];
  let userPoints: any[];

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    userFactory = new UserTestFactory();
    jest.clearAllMocks();

    // Create test users
    users = Array.from({ length: 5 }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      username: `user${i + 1}`
    }));
    await User.insertMany(users);

    // Create user points with different scores
    userPoints = users.map((user, i) => ({
      userId: user._id,
      totalPoints: (5 - i) * 100,
      meditationPoints: (5 - i) * 50,
      streakPoints: (5 - i) * 25,
      socialPoints: (5 - i) * 75,
      history: [
        {
          date: new Date(),
          points: (5 - i) * 10,
          type: 'meditation'
        }
      ]
    }));
    await UserPoints.insertMany(userPoints);

    // Mock cache methods
    (CacheManager.get as jest.Mock).mockResolvedValue(null);
    (CacheManager.set as jest.Mock).mockResolvedValue(true);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('getLeaderboard', () => {
    it('should return cached leaderboard if available', async () => {
      const cachedData = [{ userId: users[0]._id, username: 'user1', points: 100, rank: 1 }];
      (CacheManager.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await LeaderboardService.getLeaderboard();
      expect(result).toEqual(cachedData);
      expect(CacheManager.get).toHaveBeenCalled();
    });

    it('should return correct leaderboard for total points', async () => {
      const leaderboard = await LeaderboardService.getLeaderboard('all-time', 'total', 5);

      expect(leaderboard).toHaveLength(5);
      expect(leaderboard[0].username).toBe('user1');
      expect(leaderboard[0].points).toBe(500);
      expect(leaderboard[0].rank).toBe(1);
    });

    it('should return correct leaderboard for meditation category', async () => {
      const leaderboard = await LeaderboardService.getLeaderboard('all-time', 'meditation', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].points).toBe(250);
      expect(leaderboard[1].points).toBe(200);
      expect(leaderboard[2].points).toBe(150);
    });

    it('should respect the limit parameter', async () => {
      const leaderboard = await LeaderboardService.getLeaderboard('all-time', 'total', 2);
      expect(leaderboard).toHaveLength(2);
    });
  });

  describe('getUserRank', () => {
    it('should return cached rank if available', async () => {
      const cachedData = { rank: 1, total: 500, totalUsers: 5 };
      (CacheManager.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await LeaderboardService.getUserRank(users[0]._id);
      expect(result).toEqual(cachedData);
    });

    it('should return correct rank for top user', async () => {
      const result = await LeaderboardService.getUserRank(users[0]._id);
      
      expect(result.rank).toBe(1);
      expect(result.total).toBe(500);
      expect(result.totalUsers).toBe(5);
    });

    it('should return correct rank for middle user', async () => {
      const result = await LeaderboardService.getUserRank(users[2]._id);
      
      expect(result.rank).toBe(3);
      expect(result.total).toBe(300);
    });

    it('should handle non-existent user', async () => {
      const result = await LeaderboardService.getUserRank(new mongoose.Types.ObjectId());
      
      expect(result).toEqual({
        rank: 0,
        total: 0,
        totalUsers: 0
      });
    });
  });

  describe('getTopAchievers', () => {
    it('should return cached achievers if available', async () => {
      const cachedData = [{ userId: users[0]._id, username: 'user1', points: 500, rank: 1 }];
      (CacheManager.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await LeaderboardService.getTopAchievers();
      expect(result).toEqual(cachedData);
    });

    it('should return top 3 achievers by default', async () => {
      const achievers = await LeaderboardService.getTopAchievers();
      
      expect(achievers).toHaveLength(3);
      expect(achievers[0].points).toBeGreaterThan(achievers[1].points);
      expect(achievers[1].points).toBeGreaterThan(achievers[2].points);
    });

    it('should respect custom limit', async () => {
      const achievers = await LeaderboardService.getTopAchievers(2);
      expect(achievers).toHaveLength(2);
    });
  });

  describe('getWeeklyProgress', () => {
    beforeEach(async () => {
      // Add historical data
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      await UserPoints.findOneAndUpdate(
        { userId: users[0]._id },
        {
          $push: {
            history: [
              { date: now, points: 100, type: 'meditation' },
              { date: lastWeek, points: 50, type: 'meditation' }
            ]
          }
        }
      );
    });

    it('should return cached progress if available', async () => {
      const cachedData = {
        currentWeek: 100,
        previousWeek: 50,
        change: 50,
        percentChange: 100
      };
      (CacheManager.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await LeaderboardService.getWeeklyProgress(users[0]._id);
      expect(result).toEqual(cachedData);
    });

    it('should calculate correct weekly progress', async () => {
      const progress = await LeaderboardService.getWeeklyProgress(users[0]._id);
      
      expect(progress.currentWeek).toBe(100);
      expect(progress.previousWeek).toBe(50);
      expect(progress.change).toBe(50);
      expect(progress.percentChange).toBe(100);
    });

    it('should handle user with no history', async () => {
      const progress = await LeaderboardService.getWeeklyProgress(new mongoose.Types.ObjectId());
      
      expect(progress.currentWeek).toBe(0);
      expect(progress.previousWeek).toBe(0);
      expect(progress.change).toBe(0);
      expect(progress.percentChange).toBe(0);
    });
  });

  describe('invalidateUserCache', () => {
    it('should delete all cache entries for user', async () => {
      await LeaderboardService.invalidateUserCache(users[0]._id);
      
      expect(CacheManager.del).toHaveBeenCalledTimes(1);
      expect(CacheManager.del).toHaveBeenCalledWith(expect.stringContaining(users[0]._id.toString()));
    });
  });
}); 