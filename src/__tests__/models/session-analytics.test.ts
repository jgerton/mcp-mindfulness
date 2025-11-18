import mongoose from 'mongoose';
import { SessionAnalytics, ISessionAnalytics, MoodType } from '../../models/session-analytics.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface SessionAnalyticsInput {
  userId?: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  meditationId?: mongoose.Types.ObjectId;
  startTime?: Date;
  endTime?: Date | null;
  duration?: number;
  durationCompleted?: number;
  completed?: boolean;
  focusScore?: number;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  interruptions?: number;
  notes?: string;
  tags?: string[];
  maintainedStreak?: boolean;
}

describe('SessionAnalytics Model', () => {
  let testAnalytics: SessionAnalyticsInput;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    testAnalytics = {
      userId: new mongoose.Types.ObjectId(),
      sessionId: new mongoose.Types.ObjectId(),
      meditationId: new mongoose.Types.ObjectId(),
      startTime: new Date(),
      endTime: null,
      duration: 15,
      durationCompleted: 15,
      completed: true,
      focusScore: 85,
      moodBefore: 'neutral',
      moodAfter: 'peaceful',
      interruptions: 0,
      notes: 'Test session',
      tags: ['focus', 'morning'],
      maintainedStreak: true
    };

    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
        return Promise.resolve(this);
      });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create and save analytics successfully', async () => {
      const analytics = await SessionAnalytics.create(testAnalytics);
      expect(analytics.userId).toEqual(testAnalytics.userId);
      expect(analytics.sessionId).toEqual(testAnalytics.sessionId);
      expect(analytics.meditationId).toEqual(testAnalytics.meditationId);
      expect(analytics.completed).toBe(true);
    });

    it('should accept valid mood values', async () => {
      const validMoods: MoodType[] = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
      for (const mood of validMoods) {
        const analytics = new SessionAnalytics({
          ...testAnalytics,
          moodBefore: mood,
          moodAfter: mood
        });
        const validationError = await analytics.validateSync();
        expect(validationError).toBeUndefined();
      }
    });

    it('should properly index for efficient querying', async () => {
      const indexes = await SessionAnalytics.collection.getIndexes();
      const hasUserStartTimeIndex = Object.values(indexes).some(
        index => index.key && index.key.userId === 1 && index.key.startTime === -1
      );
      const hasUserCompletedIndex = Object.values(indexes).some(
        index => index.key && index.key.userId === 1 && index.key.completed === 1
      );
      expect(hasUserStartTimeIndex).toBe(true);
      expect(hasUserCompletedIndex).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const analytics = new SessionAnalytics({});
      const validationError = await analytics.validateSync();
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.sessionId).toBeDefined();
      expect(validationError?.errors.meditationId).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
    });

    it('should reject invalid mood values', async () => {
      const analytics = new SessionAnalytics({
        ...testAnalytics,
        moodBefore: 'invalid',
        moodAfter: 'invalid'
      });
      const validationError = await analytics.validateSync();
      expect(validationError?.errors.moodBefore).toBeDefined();
      expect(validationError?.errors.moodAfter).toBeDefined();
    });

    it('should reject negative numeric values', async () => {
      const analytics = new SessionAnalytics({
        ...testAnalytics,
        duration: -1,
        durationCompleted: -1,
        interruptions: -1,
        focusScore: -1
      });
      const validationError = await analytics.validateSync();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.durationCompleted).toBeDefined();
      expect(validationError?.errors.interruptions).toBeDefined();
      expect(validationError?.errors.focusScore).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null endTime for in-progress sessions', async () => {
      const analytics = await SessionAnalytics.create({
        ...testAnalytics,
        endTime: null,
        completed: false
      });
      expect(analytics.endTime).toBeNull();
      expect(analytics.completed).toBe(false);
    });

    it('should handle empty arrays and trim strings', async () => {
      const analytics = await SessionAnalytics.create({
        ...testAnalytics,
        tags: [],
        notes: '  Test notes  '
      });
      expect(analytics.tags).toHaveLength(0);
      expect(analytics.notes).toBe('Test notes');
    });

    it('should handle boundary values for numeric fields', async () => {
      const analytics = await SessionAnalytics.create({
        ...testAnalytics,
        focusScore: 100,
        duration: 0,
        interruptions: 0
      });
      expect(analytics.focusScore).toBe(100);
      expect(analytics.duration).toBe(0);
      expect(analytics.interruptions).toBe(0);
    });
  });
}); 