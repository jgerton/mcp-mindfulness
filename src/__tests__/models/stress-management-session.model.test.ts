import mongoose from 'mongoose';
import { 
  StressManagementSession, 
  IStressManagementSession,
  StressManagementTechnique,
  IStressManagementFeedback
} from '../../models/stress-management-session.model';
import { WellnessSessionStatus, WellnessMoodState } from '../../models/base-wellness-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { StressManagementSessionTestFactory } from '../factories/stress-management-session.factory';

describe('StressManagementSession Model', () => {
  let factory: StressManagementSessionTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
    factory = new StressManagementSessionTestFactory();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create a valid stress management session', async () => {
      const session = factory.create();
      const savedSession = await StressManagementSession.create(session);
      expect(savedSession._id).toBeDefined();
      expect(savedSession.technique).toBe(session.technique);
      expect(savedSession.stressLevelBefore).toBe(session.stressLevelBefore);
    });

    it('should require technique', async () => {
      const session = factory.create({ technique: undefined });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });

    it('should require stressLevelBefore', async () => {
      const session = factory.create({ stressLevelBefore: undefined });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });

    it('should validate technique enum values', async () => {
      const session = factory.create({ technique: 'invalid' as any });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });

    it('should validate stress level ranges', async () => {
      const session = factory.create({ 
        stressLevelBefore: 11,
        stressLevelAfter: 0
      });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });

    it('should validate triggers array length', async () => {
      const session = factory.create({
        triggers: Array(6).fill('trigger')
      });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });

    it('should validate symptoms array lengths', async () => {
      const session = factory.create({
        physicalSymptoms: Array(11).fill('symptom'),
        emotionalSymptoms: Array(11).fill('symptom')
      });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate stress reduction correctly', async () => {
      const session = await StressManagementSession.create(
        factory.withStressLevels(8, 4)
      );
      expect(session.stressReduction).toBe(4);
    });

    it('should return 0 stress reduction when levels are missing', async () => {
      const session = await StressManagementSession.create(
        factory.create({ stressLevelAfter: undefined })
      );
      expect(session.stressReduction).toBe(0);
    });

    it('should not return negative stress reduction', async () => {
      const session = await StressManagementSession.create(
        factory.withStressLevels(4, 8)
      );
      expect(session.stressReduction).toBe(0);
    });
  });

  describe('Methods', () => {
    it('should add feedback to completed session', async () => {
      const session = await StressManagementSession.create(factory.completed());
      const feedback: IStressManagementFeedback = {
        effectivenessRating: 4,
        stressReductionRating: 4,
        comments: 'Very helpful',
        improvements: ['More guided options']
      };

      await session.addFeedback(feedback);
      expect(session.feedback).toEqual(feedback);
    });

    it('should not add feedback to incomplete session', async () => {
      const session = await StressManagementSession.create(
        factory.create({ status: WellnessSessionStatus.InProgress })
      );
      const feedback: IStressManagementFeedback = {
        effectivenessRating: 4,
        stressReductionRating: 4,
        comments: 'Very helpful',
        improvements: []
      };

      await expect(session.addFeedback(feedback)).rejects.toThrow();
    });

    it('should not add feedback when feedback already exists', async () => {
      const session = await StressManagementSession.create(factory.withFeedback());
      const newFeedback: IStressManagementFeedback = {
        effectivenessRating: 5,
        stressReductionRating: 5,
        comments: 'New feedback',
        improvements: []
      };

      await expect(session.addFeedback(newFeedback)).rejects.toThrow();
    });

    it('should process achievements for completed session', async () => {
      const session = await StressManagementSession.create(factory.completed());
      const processAchievementsSpy = jest.spyOn(session, 'processAchievements');
      await session.save();
      expect(processAchievementsSpy).toHaveBeenCalled();
    });
  });

  describe('Pre-save Middleware', () => {
    it('should copy stressLevelBefore to stressLevelAfter if not set on completion', async () => {
      const session = await StressManagementSession.create(
        factory.create({
          status: WellnessSessionStatus.InProgress,
          stressLevelBefore: 7,
          stressLevelAfter: undefined
        })
      );

      session.status = WellnessSessionStatus.Completed;
      await session.save();

      expect(session.stressLevelAfter).toBe(session.stressLevelBefore);
    });
  });

  describe('Indexes', () => {
    it('should have compound indexes', async () => {
      const indexes = await StressManagementSession.collection.getIndexes();
      const hasUserStartTimeIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.startTime === -1
      );
      const hasUserTechniqueIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.technique === 1
      );
      const hasUserStatusIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.status === 1
      );

      expect(hasUserStartTimeIndex).toBe(true);
      expect(hasUserTechniqueIndex).toBe(true);
      expect(hasUserStatusIndex).toBe(true);
    });
  });

  describe('Technique-specific Behavior', () => {
    it('should create guided imagery session', async () => {
      const session = await StressManagementSession.create(
        factory.withTechnique(StressManagementTechnique.GuidedImagery)
      );
      expect(session.technique).toBe(StressManagementTechnique.GuidedImagery);
    });

    it('should create deep breathing session', async () => {
      const session = await StressManagementSession.create(
        factory.withTechnique(StressManagementTechnique.DeepBreathing)
      );
      expect(session.technique).toBe(StressManagementTechnique.DeepBreathing);
    });

    it('should create PMR session', async () => {
      const session = await StressManagementSession.create(
        factory.withTechnique(StressManagementTechnique.ProgressiveMuscleRelaxation)
      );
      expect(session.technique).toBe(StressManagementTechnique.ProgressiveMuscleRelaxation);
    });
  });

  describe('Symptoms and Triggers', () => {
    it('should store and retrieve symptoms', async () => {
      const physical = ['headache', 'tension'];
      const emotional = ['anxiety', 'irritability'];
      const session = await StressManagementSession.create(
        factory.withSymptoms(physical, emotional)
      );
      expect(session.physicalSymptoms).toEqual(physical);
      expect(session.emotionalSymptoms).toEqual(emotional);
    });

    it('should store and retrieve triggers', async () => {
      const triggers = ['work stress', 'deadlines', 'conflicts'];
      const session = await StressManagementSession.create(
        factory.withTriggers(triggers)
      );
      expect(session.triggers).toEqual(triggers);
    });
  });

  describe('Feedback Management', () => {
    it('should store and retrieve feedback', async () => {
      const session = await StressManagementSession.create(factory.withFeedback({
        effectivenessRating: 5,
        stressReductionRating: 4,
        comments: 'Very effective technique',
        improvements: ['More variety', 'Longer sessions']
      }));

      expect(session.feedback).toBeDefined();
      expect(session.feedback.effectivenessRating).toBe(5);
      expect(session.feedback.stressReductionRating).toBe(4);
      expect(session.feedback.improvements).toHaveLength(2);
    });

    it('should validate feedback ratings', async () => {
      const session = factory.withFeedback({
        effectivenessRating: 6,
        stressReductionRating: 0
      });
      await expect(StressManagementSession.create(session)).rejects.toThrow();
    });
  });
});