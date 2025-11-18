import mongoose from 'mongoose';
import { SessionAnalyticsService } from '../../services/session-analytics.service';
import { SessionAnalytics, ISessionAnalytics } from '../../models/session-analytics.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { SessionAnalyticsTestFactory } from '../factories/session-analytics.factory';

describe('SessionAnalyticsService', () => {
  let service: SessionAnalyticsService;
  let factory: SessionAnalyticsTestFactory;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    service = new SessionAnalyticsService();
    factory = new SessionAnalyticsTestFactory();
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('createSessionAnalytics', () => {
    it('should create new analytics entry', async () => {
      const data = factory.create({ userId });
      const result = await service.createSessionAnalytics(data);

      expect(result._id).toBeDefined();
      expect(result.userId).toEqual(userId);
      expect(result.sessionId).toEqual(data.sessionId);
    });

    it('should update existing analytics entry', async () => {
      const data = factory.create({ userId });
      await service.createSessionAnalytics(data);

      const updatedData = { ...data, focusScore: 95 };
      const result = await service.createSessionAnalytics(updatedData);

      expect(result.focusScore).toBe(95);
    });

    it('should handle invalid data', async () => {
      const invalidData = { userId: 'invalid' };
      await expect(service.createSessionAnalytics(invalidData)).rejects.toThrow();
    });
  });

  describe('updateSessionAnalytics', () => {
    it('should update existing analytics', async () => {
      const data = factory.create({ userId });
      const created = await service.createSessionAnalytics(data);

      const result = await service.updateSessionAnalytics(
        created.sessionId.toString(),
        { focusScore: 85 }
      );

      expect(result?.focusScore).toBe(85);
    });

    it('should return null for non-existent session', async () => {
      const result = await service.updateSessionAnalytics(
        new mongoose.Types.ObjectId().toString(),
        { focusScore: 85 }
      );

      expect(result).toBeNull();
    });
  });

  describe('getUserSessionHistory', () => {
    it('should return paginated session history', async () => {
      // Create 15 sessions
      const sessions = Array.from({ length: 15 }, () => 
        factory.create({ userId })
      );
      await SessionAnalytics.insertMany(sessions);

      const result = await service.getUserSessionHistory(userId.toString(), {
        page: 1,
        limit: 10
      });

      expect(result.sessions).toHaveLength(10);
      expect(result.totalSessions).toBe(15);
      expect(result.totalPages).toBe(2);
    });

    it('should handle empty history', async () => {
      const result = await service.getUserSessionHistory(userId.toString(), {
        page: 1,
        limit: 10
      });

      expect(result.sessions).toHaveLength(0);
      expect(result.totalSessions).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const sessions = [
        factory.create({ 
          userId,
          durationCompleted: 600,
          focusScore: 80,
          interruptions: 2
        }),
        factory.create({
          userId,
          durationCompleted: 900,
          focusScore: 90,
          interruptions: 1
        })
      ];
      await SessionAnalytics.insertMany(sessions);

      const stats = await service.getUserStats(userId.toString());

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMinutes).toBe(1500);
      expect(stats.averageFocusScore).toBe(85);
      expect(stats.totalInterruptions).toBe(3);
    });

    it('should return zero stats for new user', async () => {
      const stats = await service.getUserStats(userId.toString());

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.averageFocusScore).toBe(0);
      expect(stats.totalInterruptions).toBe(0);
    });
  });

  describe('getMoodImprovementStats', () => {
    it('should calculate mood improvement rate correctly', async () => {
      const startTime = new Date();
      const sessions = [
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 1000),
          moodBefore: 'stressed',
          moodAfter: 'calm'
        }),
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 2000),
          moodBefore: 'anxious',
          moodAfter: 'peaceful'
        }),
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 3000),
          moodBefore: 'neutral',
          moodAfter: 'neutral'
        })
      ];
      await SessionAnalytics.insertMany(sessions);

      const stats = await service.getMoodImprovementStats(userId.toString(), startTime);

      expect(stats.totalSessions).toBe(3);
      expect(stats.totalImproved).toBe(2);
      expect(stats.improvementRate).toBe((2/3) * 100);
    });

    it('should handle sessions without mood data', async () => {
      const startTime = new Date();
      const sessions = [
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 1000)
        }),
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 2000),
          moodBefore: 'stressed'
        })
      ];
      await SessionAnalytics.insertMany(sessions);

      const stats = await service.getMoodImprovementStats(userId.toString(), startTime);

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalImproved).toBe(0);
      expect(stats.improvementRate).toBe(0);
    });

    it('should filter sessions by start time', async () => {
      const startTime = new Date();
      const sessions = [
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() - 1000), // Before start time
          moodBefore: 'stressed',
          moodAfter: 'calm'
        }),
        factory.create({
          userId,
          startTime: new Date(startTime.getTime() + 1000), // After start time
          moodBefore: 'anxious',
          moodAfter: 'peaceful'
        })
      ];
      await SessionAnalytics.insertMany(sessions);

      const stats = await service.getMoodImprovementStats(userId.toString(), startTime);

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalImproved).toBe(1);
      expect(stats.improvementRate).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should find session by filter', async () => {
      const data = factory.create({ userId });
      await service.createSessionAnalytics(data);

      const result = await service.findOne({ userId: data.userId });
      expect(result?.userId).toEqual(data.userId);
    });

    it('should return null when no match found', async () => {
      const result = await service.findOne({ userId });
      expect(result).toBeNull();
    });
  });
}); 