import mongoose from 'mongoose';
import { MeditationSessionService } from '../services/meditation-session.service';
import { MeditationSession } from '../models/meditation-session.model';
import { User } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { SessionAnalytics } from '../models/session-analytics.model';
import type { MoodType } from '../models/session-analytics.model';

let mongoServer: any;

describe('MeditationSessionService', () => {
  let meditationSessionService: MeditationSessionService;
  let userId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    meditationSessionService = new MeditationSessionService();
    userId = new mongoose.Types.ObjectId();
    meditationId = new mongoose.Types.ObjectId();
  });

  describe('startSession', () => {
    it('should create a new session', async () => {
      const result = await meditationSessionService.startSession(userId.toString(), {
        meditationId: meditationId.toString(),
        completed: false,
        duration: 0,
        durationCompleted: 0,
        moodBefore: 'neutral' as MoodType
      });
      expect(result.status).toBe('active');
      expect(result.sessionId).toBeDefined();

      const session = await MeditationSession.findById(result.sessionId);
      expect(session).toBeDefined();
      expect(session?.status).toBe('active');
      expect(session?.userId.toString()).toBe(userId.toString());
      expect(session?.meditationId.toString()).toBe(meditationId.toString());
      expect(session?.startTime).toBeDefined();
      expect(session?.interruptions).toBe(0);
      expect(session?.completed).toBe(false);
    });
  });

  describe('completeSession', () => {
    it('should complete an existing session', async () => {
      const { sessionId } = await meditationSessionService.startSession(userId.toString(), {
        meditationId: meditationId.toString(),
        completed: false,
        duration: 0,
        durationCompleted: 0,
        moodBefore: 'anxious' as MoodType
      });
      
      const completedSession = await meditationSessionService.completeSession(sessionId, {
        duration: 15,
        durationCompleted: 15,
        moodBefore: 'anxious' as MoodType,
        moodAfter: 'peaceful' as MoodType,
        interruptions: 0,
        notes: 'Great session',
        completed: true
      });

      expect(completedSession.status).toBe('completed');
      expect(completedSession.endTime).toBeDefined();
      expect(completedSession.duration).toBe(15);
      expect(completedSession.durationCompleted).toBe(15);
      expect(completedSession.moodBefore).toBe('anxious');
      expect(completedSession.moodAfter).toBe('peaceful');
      expect(completedSession.interruptions).toBe(0);
      expect(completedSession.notes).toBe('Great session');
      expect(completedSession.completed).toBe(true);
    });

    it('should throw error for invalid session id', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      await expect(meditationSessionService.completeSession(invalidId.toString(), {
        duration: 15,
        durationCompleted: 15,
        moodAfter: 'peaceful' as MoodType,
        interruptions: 0,
        completed: true
      })).rejects.toThrow('Session not found');
    });
  });

  describe('getActiveSession', () => {
    it('should return active session for user', async () => {
      await meditationSessionService.startSession(userId.toString(), {
        meditationId: meditationId.toString(),
        completed: false,
        duration: 0,
        durationCompleted: 0,
        moodBefore: 'neutral' as MoodType
      });
      
      const activeSession = await meditationSessionService.getActiveSession(userId.toString());
      expect(activeSession).toBeDefined();
      expect(activeSession?.status).toBe('active');
      expect(activeSession?.userId.toString()).toBe(userId.toString());
    });

    it('should return null if no active session exists', async () => {
      const activeSession = await meditationSessionService.getActiveSession(userId.toString());
      expect(activeSession).toBeNull();
    });
  });

  describe('recordInterruption', () => {
    it('should increment interruption count', async () => {
      const { sessionId } = await meditationSessionService.startSession(userId.toString(), {
        meditationId: meditationId.toString(),
        completed: false,
        duration: 0,
        durationCompleted: 0,
        moodBefore: 'neutral' as MoodType
      });
      
      await meditationSessionService.recordInterruption(sessionId);
      
      const session = await MeditationSession.findById(sessionId);
      expect(session?.interruptions).toBe(1);
      
      const analytics = await SessionAnalytics.findOne({ sessionId: new mongoose.Types.ObjectId(sessionId) });
      expect(analytics?.interruptions).toBe(1);
    });
  });
}); 