import mongoose from 'mongoose';
import { SessionAnalyticsService } from '../services/session-analytics.service';
import { SessionAnalytics } from '../models/session-analytics.model';
import { User } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { MeditationSession, IMeditationSession } from '../models/meditation-session.model';
import { MoodType } from '../models/session-analytics.model';

describe('SessionAnalyticsService', () => {
  let userId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;
  let sessionId1: string;
  let sessionId2: string;
  let service: SessionAnalyticsService;

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    service = new SessionAnalyticsService();
    
    // Create test user and meditation
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;

    const meditation = await Meditation.create({
      title: 'Test Meditation',
      description: 'Test Description',
      audioUrl: 'test.mp3',
      duration: 10,
      difficulty: 'beginner',
      category: 'mindfulness',
      type: 'guided'
    });
    meditationId = meditation._id;

    // Create test sessions with analytics
    const session1 = await MeditationSession.create({
      userId,
      meditationId,
      startTime: new Date('2024-03-12T10:00:00'),
      endTime: new Date('2024-03-12T10:10:00'),
      duration: 10,
      durationCompleted: 10,
      status: 'completed',
      interruptions: 0,
      completed: true
    }) as unknown as IMeditationSession & { _id: mongoose.Types.ObjectId };
    sessionId1 = session1._id.toString();

    const session2 = await MeditationSession.create({
      userId,
      meditationId,
      startTime: new Date('2024-03-12T11:00:00'),
      endTime: new Date('2024-03-12T11:10:00'),
      duration: 10,
      durationCompleted: 8,
      status: 'completed',
      interruptions: 1,
      completed: true
    }) as unknown as IMeditationSession & { _id: mongoose.Types.ObjectId };
    sessionId2 = session2._id.toString();

    // Create session analytics records
    await SessionAnalytics.create({
      userId,
      sessionId: session1._id,
      meditationId,
      startTime: new Date('2024-03-12T10:00:00'),
      endTime: new Date('2024-03-12T10:10:00'),
      duration: 10,
      durationCompleted: 10,
      completed: true,
      focusScore: 95,
      moodBefore: 'stressed' as MoodType,
      moodAfter: 'calm' as MoodType,
      interruptions: 0,
      maintainedStreak: true
    });

    await SessionAnalytics.create({
      userId,
      sessionId: session2._id,
      meditationId,
      startTime: new Date('2024-03-12T11:00:00'),
      endTime: new Date('2024-03-12T11:10:00'),
      duration: 12,
      durationCompleted: 12,
      completed: true,
      focusScore: 85,
      moodBefore: 'anxious' as MoodType,
      moodAfter: 'peaceful' as MoodType,
      interruptions: 1,
      maintainedStreak: true
    });
  });

  describe('getUserSessionHistory', () => {
    it('should return paginated session history', async () => {
      const result = await service.getUserSessionHistory(userId.toString(), { page: 1, limit: 10 });
      
      expect(result.sessions).toBeDefined();
      expect(result.sessions.length).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.totalSessions).toBe(2);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const stats = await service.getUserStats(userId.toString());
      
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMinutes).toBe(22); // 10 + 12 minutes completed
      expect(stats.averageFocusScore).toBe(90); // (95 + 85) / 2
      expect(stats.totalInterruptions).toBe(1);
    });
  });

  describe('getMoodImprovementStats', () => {
    it('should calculate mood improvement statistics', async () => {
      const startTime = new Date('2024-03-12T00:00:00');
      const stats = await service.getMoodImprovementStats(userId.toString(), startTime);
      
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalImproved).toBe(2);
      expect(stats.improvementRate).toBe(100);
    });
  });
}); 