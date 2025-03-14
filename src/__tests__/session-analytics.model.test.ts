import mongoose from 'mongoose';
import { SessionAnalytics } from '../models/session-analytics.model';
import { connectDB, disconnectDB, clearDB } from './helpers/db.helper';

describe('SessionAnalytics Model Test', () => {
  let userId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    userId = new mongoose.Types.ObjectId();
    meditationId = new mongoose.Types.ObjectId();
  });

  it('should create & save session analytics successfully', async () => {
    const validSessionAnalytics = {
      userId,
      sessionId: new mongoose.Types.ObjectId(),
      meditationId,
      startTime: new Date(),
      duration: 15,
      durationCompleted: 15,
      completed: true,
      moodBefore: 'neutral',
      moodAfter: 'calm',
      focusScore: 8,
      interruptions: 2,
      notes: 'Test session',
      maintainedStreak: true
    };

    const savedSessionAnalytics = await new SessionAnalytics(validSessionAnalytics).save();
    expect(savedSessionAnalytics._id).toBeDefined();
    expect(savedSessionAnalytics.userId.toString()).toBe(userId.toString());
    expect(savedSessionAnalytics.moodBefore).toBe('neutral');
    expect(savedSessionAnalytics.moodAfter).toBe('calm');
  });

  it('should fail to save with invalid mood values', async () => {
    const sessionAnalyticsWithInvalidMood = new SessionAnalytics({
      userId,
      meditationId,
      duration: 600,
      focusScore: 8,
      moodBefore: 'invalid_mood',
      moodAfter: 'invalid_mood',
      interruptions: 0,
      notes: 'Test session',
      completed: true,
      startTime: new Date(),
      date: new Date()
    });

    await expect(sessionAnalyticsWithInvalidMood.save()).rejects.toThrow();
  });

  it('should fail to save without required fields', async () => {
    const sessionAnalyticsWithoutRequired = new SessionAnalytics({
      userId,
      duration: 600
    });

    await expect(sessionAnalyticsWithoutRequired.save()).rejects.toThrow();
  });

  it('should enforce duration minimum value', async () => {
    const sessionAnalyticsWithShortDuration = new SessionAnalytics({
      userId,
      meditationId,
      duration: 0,
      focusScore: 8,
      moodBefore: 'neutral',
      moodAfter: 'happy',
      interruptions: 0,
      notes: 'Test session',
      completed: true,
      startTime: new Date(),
      date: new Date()
    });

    await expect(sessionAnalyticsWithShortDuration.save()).rejects.toThrow();
  });

  it('should enforce focus score range', async () => {
    const sessionAnalyticsWithInvalidScore = new SessionAnalytics({
      userId,
      meditationId,
      duration: 600,
      focusScore: 11,
      moodBefore: 'neutral',
      moodAfter: 'happy',
      interruptions: 0,
      notes: 'Test session',
      completed: true,
      startTime: new Date(),
      date: new Date()
    });

    await expect(sessionAnalyticsWithInvalidScore.save()).rejects.toThrow();
  });
}); 