import mongoose from 'mongoose';
import { SessionAnalytics, ISessionAnalytics, MoodType } from '../../models/session-analytics.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { SessionAnalyticsTestFactory } from '../factories/session-analytics.factory';

describe('SessionAnalytics Model', () => {
  let factory: SessionAnalyticsTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
    factory = new SessionAnalyticsTestFactory();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create a valid session analytics record', async () => {
      const analytics = factory.create();
      const savedAnalytics = await SessionAnalytics.create(analytics);
      expect(savedAnalytics._id).toBeDefined();
      expect(savedAnalytics.userId).toEqual(analytics.userId);
      expect(savedAnalytics.sessionId).toEqual(analytics.sessionId);
      expect(savedAnalytics.meditationId).toEqual(analytics.meditationId);
    });

    it('should require userId', async () => {
      const analytics = factory.create({ userId: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require sessionId', async () => {
      const analytics = factory.create({ sessionId: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require meditationId', async () => {
      const analytics = factory.create({ meditationId: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require startTime', async () => {
      const analytics = factory.create({ startTime: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require duration', async () => {
      const analytics = factory.create({ duration: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require durationCompleted', async () => {
      const analytics = factory.create({ durationCompleted: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require completed status', async () => {
      const analytics = factory.create({ completed: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require moodBefore', async () => {
      const analytics = factory.create({ moodBefore: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should validate mood enum values', async () => {
      const validMoods: MoodType[] = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
      for (const mood of validMoods) {
        const analytics = factory.create({ moodBefore: mood, moodAfter: mood });
        const saved = await SessionAnalytics.create(analytics);
        expect(saved.moodBefore).toBe(mood);
        expect(saved.moodAfter).toBe(mood);
      }

      const invalidMood = 'happy' as MoodType;
      const analytics = factory.create({ moodBefore: invalidMood });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require interruptions count', async () => {
      const analytics = factory.create({ interruptions: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });

    it('should require maintainedStreak', async () => {
      const analytics = factory.create({ maintainedStreak: undefined });
      await expect(SessionAnalytics.create(analytics)).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    it('should have compound index on userId and startTime', async () => {
      const indexes = await SessionAnalytics.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.startTime === -1
      );
      expect(hasIndex).toBe(true);
    });

    it('should have compound index on userId and completed', async () => {
      const indexes = await SessionAnalytics.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.completed === 1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should handle endTime after startTime', async () => {
      const analytics = factory.completed();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.endTime!.getTime()).toBeGreaterThan(saved.startTime.getTime());
    });

    it('should handle duration and durationCompleted relationship', async () => {
      const analytics = factory.incomplete();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.durationCompleted).toBeLessThan(saved.duration);
      expect(saved.completed).toBe(false);
    });

    it('should handle completed sessions', async () => {
      const analytics = factory.completed();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.durationCompleted).toBe(saved.duration);
      expect(saved.completed).toBe(true);
      expect(saved.moodAfter).toBeDefined();
    });

    it('should handle mood transitions', async () => {
      const analytics = factory.withMoodImprovement();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.moodBefore).toBe('stressed');
      expect(saved.moodAfter).toBe('peaceful');
    });

    it('should handle tags', async () => {
      const tags = ['morning', 'focus', 'energy'];
      const analytics = factory.withTags(tags);
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.tags).toEqual(expect.arrayContaining(tags));
    });
  });

  describe('Analytics Features', () => {
    it('should track focus score', async () => {
      const analytics = factory.withHighFocus();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.focusScore).toBeGreaterThanOrEqual(9);
      expect(saved.focusScore).toBeLessThanOrEqual(10);
    });

    it('should track interruptions', async () => {
      const analytics = factory.create({ interruptions: 3 });
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.interruptions).toBe(3);
    });

    it('should track streak maintenance', async () => {
      const analytics = factory.completed();
      const saved = await SessionAnalytics.create(analytics);
      expect(saved.maintainedStreak).toBe(true);

      const incompleteAnalytics = factory.incomplete();
      const savedIncomplete = await SessionAnalytics.create(incompleteAnalytics);
      expect(savedIncomplete.maintainedStreak).toBe(false);
    });

    it('should handle batch analytics creation', async () => {
      const count = 5;
      const analyticsBatch = factory.batch(count);
      const savedBatch = await SessionAnalytics.create(analyticsBatch);
      expect(Array.isArray(savedBatch)).toBe(true);
      expect(savedBatch).toHaveLength(count);
    });
  });
}); 