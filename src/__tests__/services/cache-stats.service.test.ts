import { CacheStatsService } from '../../services/cache-stats.service';
import mongoose from 'mongoose';

// Mock only the persistence methods
const originalPersistStats = CacheStatsService.persistStats;
const originalGetHistoricalStats = CacheStatsService.getHistoricalStats;

beforeAll(() => {
  // Mock the persistence methods
  CacheStatsService.persistStats = jest.fn().mockResolvedValue(undefined);
  CacheStatsService.getHistoricalStats = jest.fn().mockResolvedValue([
    {
      cacheType: 'memory',
      stats: {
        test: { hits: 1, misses: 0, sets: 0, invalidations: 0, errors: 0, avgLatency: 10, bytesStored: 0, keyCount: 0 },
        overall: { hits: 1, misses: 0, sets: 0, invalidations: 0, errors: 0, avgLatency: 10, bytesStored: 0, keyCount: 0 }
      }
    }
  ]);
});

afterAll(() => {
  // Restore original methods
  CacheStatsService.persistStats = originalPersistStats;
  CacheStatsService.getHistoricalStats = originalGetHistoricalStats;
});

describe('CacheStatsService', () => {
  beforeEach(() => {
    CacheStatsService.reset();
    jest.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should track cache hits correctly', () => {
      CacheStatsService.trackHit('memory', 'leaderboard', 10);
      CacheStatsService.trackHit('memory', 'leaderboard', 20);

      const stats = CacheStatsService.getStats();
      const leaderboardStats = stats.get('memory')!['leaderboard'];
      const overallStats = stats.get('memory')!['overall'];

      expect(leaderboardStats.hits).toBe(2);
      expect(leaderboardStats.avgLatency).toBe(15);
      expect(overallStats.hits).toBe(2);
      expect(overallStats.avgLatency).toBe(15);
    });

    it('should track cache misses correctly', () => {
      CacheStatsService.trackMiss('redis', 'achievements', 30);
      CacheStatsService.trackMiss('redis', 'achievements', 40);

      const stats = CacheStatsService.getStats();
      const achievementsStats = stats.get('redis')!['achievements'];
      const overallStats = stats.get('redis')!['overall'];

      expect(achievementsStats.misses).toBe(2);
      expect(achievementsStats.avgLatency).toBe(35);
      expect(overallStats.misses).toBe(2);
      expect(overallStats.avgLatency).toBe(35);
    });

    it('should track cache sets correctly', () => {
      CacheStatsService.trackSet('memory', 'user', 15, 1000);
      CacheStatsService.trackSet('memory', 'user', 25, 2000);

      const stats = CacheStatsService.getStats();
      const userStats = stats.get('memory')!['user'];
      const overallStats = stats.get('memory')!['overall'];

      expect(userStats.sets).toBe(2);
      expect(userStats.bytesStored).toBe(3000);
      expect(userStats.keyCount).toBe(2);
      expect(overallStats.sets).toBe(2);
      expect(overallStats.bytesStored).toBe(3000);
      expect(overallStats.keyCount).toBe(2);
    });

    it('should track cache invalidations correctly', () => {
      CacheStatsService.trackSet('redis', 'points', 10, 500);
      CacheStatsService.trackSet('redis', 'points', 15, 500);
      CacheStatsService.trackInvalidation('redis', 'points', 20);

      const stats = CacheStatsService.getStats();
      const pointsStats = stats.get('redis')!['points'];
      const overallStats = stats.get('redis')!['overall'];

      expect(pointsStats.invalidations).toBe(1);
      expect(pointsStats.keyCount).toBe(1);
      expect(overallStats.invalidations).toBe(1);
      expect(overallStats.keyCount).toBe(1);
    });

    it('should track errors correctly', () => {
      CacheStatsService.trackError('redis', 'session');
      CacheStatsService.trackError('redis', 'session');

      const stats = CacheStatsService.getStats();
      const sessionStats = stats.get('redis')!['session'];
      const overallStats = stats.get('redis')!['overall'];

      expect(sessionStats.errors).toBe(2);
      expect(overallStats.errors).toBe(2);
    });
  });

  describe('Hit Rate Calculation', () => {
    it('should calculate hit rate correctly', () => {
      CacheStatsService.trackHit('memory', 'user', 10);
      CacheStatsService.trackHit('memory', 'user', 15);
      CacheStatsService.trackMiss('memory', 'user', 20);

      const hitRate = CacheStatsService.getHitRate('memory', 'user');
      expect(hitRate).toBe(2/3);
    });

    it('should return 0 hit rate when no operations', () => {
      const hitRate = CacheStatsService.getHitRate('memory', 'empty');
      expect(hitRate).toBe(0);
    });
  });

  describe('Category Stats', () => {
    it('should return stats by category', () => {
      CacheStatsService.trackHit('redis', 'leaderboard', 10);
      CacheStatsService.trackMiss('redis', 'achievements', 20);
      CacheStatsService.trackSet('redis', 'user', 15, 1000);

      const categoryStats = CacheStatsService.getCategoryStats('redis');
      expect(categoryStats).toHaveLength(3);
      expect(categoryStats.map(s => s.category)).toContain('leaderboard');
      expect(categoryStats.map(s => s.category)).toContain('achievements');
      expect(categoryStats.map(s => s.category)).toContain('user');
    });
  });

  describe('Stats Persistence', () => {
    it.skip('should persist and retrieve historical stats', async () => {
      const startDate = new Date();
      
      CacheStatsService.trackHit('memory', 'test', 10);
      await CacheStatsService.persistStats();
      
      const endDate = new Date();
      const historicalStats = await CacheStatsService.getHistoricalStats('memory', startDate, endDate);
      
      expect(historicalStats).toHaveLength(1);
      expect(historicalStats[0].cacheType).toBe('memory');
      expect(historicalStats[0].stats.test.hits).toBe(1);
    });
  });
}); 