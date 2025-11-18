import mongoose from 'mongoose';
import { 
  MeditationSession, 
  IMeditationSession 
} from '../../models/meditation-session.model';
import { 
  WellnessSessionStatus, 
  WellnessMoodState 
} from '../../models/base-wellness-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { MeditationSessionTestFactory } from '../factories/meditation-session.factory';
import { AchievementService } from '../../services/achievement.service';

describe('MeditationSession Model', () => {
  let factory: MeditationSessionTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
    factory = new MeditationSessionTestFactory();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create a valid meditation session', async () => {
      const session = factory.create();
      const savedSession = await MeditationSession.create(session);
      expect(savedSession._id).toBeDefined();
      expect(savedSession.title).toBe(session.title);
      expect(savedSession.type).toBe(session.type);
    });

    it('should require title', async () => {
      const session = factory.create({ title: undefined });
      await expect(MeditationSession.create(session)).rejects.toThrow();
    });

    it('should require type', async () => {
      const session = factory.create({ type: undefined });
      await expect(MeditationSession.create(session)).rejects.toThrow();
    });

    it('should validate type enum values', async () => {
      const session = factory.create({ type: 'invalid' as any });
      await expect(MeditationSession.create(session)).rejects.toThrow();
    });

    it('should validate title length', async () => {
      const session = factory.create({ title: 'a'.repeat(101) });
      await expect(MeditationSession.create(session)).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate durationMinutes correctly', async () => {
      const session = await MeditationSession.create(factory.create({ duration: 1800 }));
      expect(session.durationMinutes).toBe(30);
    });

    it('should calculate completionPercentage correctly', async () => {
      const session = await MeditationSession.create(
        factory.withCompletionPercentage(50)
      );
      expect(session.completionPercentage).toBe(50);
    });

    it('should be eligible for streak when completed', async () => {
      const session = await MeditationSession.create(factory.completed());
      expect(session.isEligibleForStreak).toBe(true);
    });

    it('should not be eligible for streak when not completed', async () => {
      const session = await MeditationSession.create(
        factory.create({ status: WellnessSessionStatus.InProgress })
      );
      expect(session.isEligibleForStreak).toBe(false);
    });
  });

  describe('Methods', () => {
    it('should complete session and set endTime', async () => {
      const session = await MeditationSession.create(
        factory.create({ status: WellnessSessionStatus.InProgress })
      );
      await session.complete();
      expect(session.status).toBe(WellnessSessionStatus.Completed);
      expect(session.endTime).toBeDefined();
      expect(session.completed).toBe(true);
    });

    it('should process achievements for completed session', async () => {
      const session = await MeditationSession.create(factory.completed());
      const processAchievementsSpy = jest.spyOn(session, 'processAchievements');
      await session.save();
      expect(processAchievementsSpy).toHaveBeenCalled();
    });

    it('should not process achievements for incomplete session', async () => {
      const session = await MeditationSession.create(
        factory.create({ status: WellnessSessionStatus.InProgress })
      );
      const processAchievementsSpy = jest.spyOn(session, 'processAchievements');
      await session.save();
      expect(processAchievementsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Indexes', () => {
    it('should have an index on userId', async () => {
      const indexes = await MeditationSession.collection.getIndexes();
      const hasUserIdIndex = Object.values(indexes).some(
        (index: any) => index.key.userId !== undefined
      );
      expect(hasUserIdIndex).toBe(true);
    });
  });

  describe('Type-specific Behavior', () => {
    it('should create guided meditation session', async () => {
      const session = await MeditationSession.create(factory.guided());
      expect(session.type).toBe('guided');
      expect(session.guidedMeditationId).toBeDefined();
    });

    it('should create unguided meditation session', async () => {
      const session = await MeditationSession.create(factory.unguided());
      expect(session.type).toBe('unguided');
      expect(session.guidedMeditationId).toBeUndefined();
    });

    it('should create timed meditation session', async () => {
      const session = await MeditationSession.create(factory.timed());
      expect(session.type).toBe('timed');
      expect(session.guidedMeditationId).toBeUndefined();
    });
  });

  describe('Interruptions', () => {
    it('should track interruptions', async () => {
      const session = await MeditationSession.create(factory.withInterruptions(3));
      expect(session.interruptions).toBe(3);
    });
  });

  describe('Tags', () => {
    it('should store and retrieve tags', async () => {
      const tags = ['mindfulness', 'breathing', 'focus'];
      const session = await MeditationSession.create(factory.withTags(tags));
      expect(session.tags).toEqual(tags);
    });
  });
});