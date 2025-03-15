import mongoose from 'mongoose';
import { MeditationSession, IMeditationSession } from '../../models/meditation-session.model';
import { WellnessMoodState, WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { clearTestCollection, getTestObjectId } from '../helpers/db';
import { AchievementService } from '../../services/achievement.service';

// Import the global setup
import '../setup';

// Mock achievement service
jest.mock('../../services/achievement.service');

describe('MeditationSession', () => {
  beforeEach(async () => {
    await clearTestCollection('meditationsessions');
    jest.clearAllMocks();
  });

  const createBasicSession = () => ({
    userId: getTestObjectId(),
    title: "Test Meditation Session",
    type: "guided",
    guidedMeditationId: getTestObjectId(),
    duration: 900, // 15 minutes in seconds
    completed: false,
    startTime: new Date(),
    mood: {
      before: 'neutral',
      after: 'positive'
    }
  });

  describe('Schema Validation', () => {
    it('should require meditation-specific fields', async () => {
      const session = new MeditationSession({
        userId: getTestObjectId(),
        startTime: new Date(),
        duration: 600
      });

      const error: any = await session.validate().catch(e => e);
      expect(error.errors.title).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    it('should validate focus rating range', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        focusRating: 6
      });

      const error = await session.validate().catch(e => e);
      expect(error.errors.focusRating).toBeDefined();
    });

    it('should validate completed duration against planned duration', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        duration: 600,
        durationCompleted: 700
      });

      const error = await session.validate().catch(e => e);
      expect(error.errors.durationCompleted).toBeDefined();
    });

    it('should validate streak day is positive', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        streakDay: 0
      });

      const error = await session.validate().catch(e => e);
      expect(error.errors.streakDay).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate completion percentage', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        duration: 600,
        durationCompleted: 480 // 80%
      });

      expect(session.completionPercentage).toBe(80);
    });

    it('should determine streak eligibility', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        status: WellnessSessionStatus.Completed,
        duration: 600,
        durationCompleted: 540, // 90%
        focusRating: 4
      });

      expect(session.isStreakEligible).toBe(true);
    });

    it('should not be streak eligible with low completion', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        status: WellnessSessionStatus.Completed,
        duration: 600,
        durationCompleted: 300, // 50%
        focusRating: 4
      });

      expect(session.isStreakEligible).toBe(false);
    });

    it('should not be streak eligible with low focus', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        status: WellnessSessionStatus.Completed,
        duration: 600,
        durationCompleted: 540, // 90%
        focusRating: 2
      });

      expect(session.isStreakEligible).toBe(false);
    });
  });

  describe('Session Completion', () => {
    it('should mark session as completed', async () => {
      const session = new MeditationSession(createBasicSession());
      await session.save();

      // Wait to simulate session duration
      await new Promise(resolve => setTimeout(resolve, 100));

      await session.markCompleted(WellnessSessionStatus.Completed);
      await session.save();

      expect(session.completed).toBe(true);
      expect(session.mood?.after).toBe('positive');
      expect(session.endTime).toBeDefined();
    });

    it('should calculate actual duration on completion', async () => {
      const session = new MeditationSession(createBasicSession());
      await session.save();

      // Wait to simulate session duration
      await new Promise(resolve => setTimeout(resolve, 100));

      await session.markCompleted(WellnessSessionStatus.Completed);
      await session.save();

      expect(session.endTime).toBeDefined();
      if (session.endTime) {
        const actualDuration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        expect(actualDuration).toBeGreaterThan(0);
      }
    });

    it('should process achievements on completion', async () => {
      const mockProcessAchievements = jest.spyOn(AchievementService.prototype, 'processSessionAchievements');
      
      const session = new MeditationSession({
        ...createBasicSession(),
        type: 'guided'
      });
      await session.save();

      await session.markCompleted(WellnessSessionStatus.Completed);
      await session.processAchievements();

      expect(mockProcessAchievements).toHaveBeenCalled();
    });

    it('should not process achievements for incomplete sessions', async () => {
      const mockProcessAchievements = jest.spyOn(AchievementService.prototype, 'processSessionAchievements');
      
      const session = new MeditationSession(createBasicSession());
      await session.save();

      await session.processAchievements();

      expect(mockProcessAchievements).not.toHaveBeenCalled();
    });
  });

  describe('Mood Improvement', () => {
    it('should calculate mood improvement correctly', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        moodBefore: WellnessMoodState.Anxious
      });
      await session.save();

      await session.complete(WellnessMoodState.Calm);

      const achievementData = (AchievementService.processMeditationAchievements as jest.Mock).mock.calls[0][0];
      expect(achievementData.moodImprovement).toBe(2); // Anxious(2) to Calm(4) = 2 improvement
    });

    it('should handle equal moods', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        moodBefore: WellnessMoodState.Calm
      });
      await session.save();

      await session.complete(WellnessMoodState.Calm);

      const achievementData = (AchievementService.processMeditationAchievements as jest.Mock).mock.calls[0][0];
      expect(achievementData.moodImprovement).toBe(0);
    });
  });

  describe('Interruption Handling', () => {
    it('should validate interruption count', async () => {
      const session = new MeditationSession({
        ...createBasicSession(),
        interruptions: -1
      });

      const error = await session.validate().catch(e => e);
      expect(error.errors.interruptions).toBeDefined();
    });

    it('should default interruptions to 0', async () => {
      const session = new MeditationSession(createBasicSession());
      expect(session.interruptions).toBe(0);
    });
  });
}); 