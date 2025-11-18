import mongoose from 'mongoose';
import { 
  IStressManagementSession, 
  StressManagementTechnique,
  StressManagementSession
} from '../../models/stress-management-session.model';
import { WellnessMoodState, WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { AchievementService } from '../../services/achievement.service';

// Type-safe test data factory
interface StressSessionInput extends Partial<IStressManagementSession> {
  userId?: mongoose.Types.ObjectId;
  technique?: StressManagementTechnique;
  stressLevelBefore?: number;
  duration?: number;
}

const createTestSession = (overrides: StressSessionInput = {}): StressSessionInput => ({
  userId: new mongoose.Types.ObjectId(),
  technique: StressManagementTechnique.DeepBreathing,
  stressLevelBefore: 7,
  duration: 600, // 10 minutes
  startTime: new Date(),
  status: WellnessSessionStatus.Active,
  ...overrides
});

describe('StressManagementSession Model', () => {
  let testSession: StressSessionInput;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    testSession = createTestSession();
    jest.spyOn(StressManagementSession.prototype, 'save').mockImplementation(function(this: any) {
      return Promise.resolve(this);
    });
    jest.spyOn(AchievementService, 'processStressManagementAchievements').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create and save session successfully', async () => {
      const session = await StressManagementSession.create(testSession);
      expect(session.userId).toBeDefined();
      expect(session.technique).toBe(testSession.technique);
      expect(session.stressLevelBefore).toBe(testSession.stressLevelBefore);
      expect(session.duration).toBe(testSession.duration);
    });

    it('should complete session with feedback', async () => {
      const session = await StressManagementSession.create(testSession);
      const feedback = {
        effectivenessRating: 4,
        stressReductionRating: 4,
        comments: 'Very helpful session',
        improvements: ['More guided breathing']
      };
      await session.addFeedback(feedback);
      await session.complete(WellnessMoodState.Calm);
      expect(session.status).toBe(WellnessSessionStatus.Completed);
      expect(session.feedback).toEqual(expect.objectContaining(feedback));
    });

    it('should calculate stress reduction correctly', async () => {
      const session = await StressManagementSession.create({
        ...testSession,
        stressLevelBefore: 8,
        stressLevelAfter: 4
      });
      expect(session.stressReduction).toBe(4);
    });
  });

  describe('Error Cases', () => {
    it('should fail when required fields are missing', () => {
      expect(() => new StressManagementSession({})).toThrow();
    });

    it('should reject invalid stress level', () => {
      expect(() => new StressManagementSession({
        ...testSession,
        stressLevelBefore: 11
      })).toThrow();
    });

    it('should reject invalid technique', () => {
      expect(() => new StressManagementSession({
        ...testSession,
        technique: 'invalid' as StressManagementTechnique
      })).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum stress level', () => {
      expect(() => new StressManagementSession({
        ...testSession,
        stressLevelBefore: 1
      })).not.toThrow();
    });

    it('should handle maximum stress level', () => {
      expect(() => new StressManagementSession({
        ...testSession,
        stressLevelBefore: 10
      })).not.toThrow();
    });

    it('should handle empty arrays', async () => {
      const session = await StressManagementSession.create({
        ...testSession,
        triggers: [],
        physicalSymptoms: [],
        emotionalSymptoms: []
      });
      expect(session.triggers).toEqual([]);
      expect(session.physicalSymptoms).toEqual([]);
      expect(session.emotionalSymptoms).toEqual([]);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const session = new StressManagementSession({});
      const validationError = await session.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.technique).toBeDefined();
      expect(validationError?.errors.stressLevelBefore).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
    });

    it('should validate stress level range', async () => {
      const highSession = new StressManagementSession({
        ...createTestSession(),
        stressLevelBefore: 11 // Above max
      });
      const lowSession = new StressManagementSession({
        ...createTestSession(),
        stressLevelBefore: 0 // Below min
      });

      const highError = await highSession.validateSync();
      const lowError = await lowSession.validateSync();

      expect(highError?.errors.stressLevelBefore).toBeDefined();
      expect(lowError?.errors.stressLevelBefore).toBeDefined();
    });

    it('should validate technique enum', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        technique: 'invalid' as StressManagementTechnique
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.technique).toBeDefined();
    });

    it('should validate triggers array length', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        triggers: Array(6).fill('trigger') // Exceeds 5 max
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.triggers).toBeDefined();
    });

    it('should validate trigger description length', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        triggers: ['a'.repeat(101)] // Exceeds 100 char limit
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors['triggers.0']).toBeDefined();
    });

    it('should validate symptoms array length', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        physicalSymptoms: Array(11).fill('symptom'), // Exceeds 10 max
        emotionalSymptoms: Array(11).fill('symptom') // Exceeds 10 max
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.physicalSymptoms).toBeDefined();
      expect(validationError?.errors.emotionalSymptoms).toBeDefined();
    });

    it('should validate symptom description length', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        physicalSymptoms: ['a'.repeat(51)], // Exceeds 50 char limit
        emotionalSymptoms: ['a'.repeat(51)] // Exceeds 50 char limit
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors['physicalSymptoms.0']).toBeDefined();
      expect(validationError?.errors['emotionalSymptoms.0']).toBeDefined();
    });

    it('should validate feedback structure', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        feedback: {
          effectivenessRating: 6, // Above max
          stressReductionRating: 0, // Below min
          comments: 'a'.repeat(501), // Exceeds 500 char limit
          improvements: Array(6).fill('improvement') // Exceeds 5 max
        }
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors['feedback.effectivenessRating']).toBeDefined();
      expect(validationError?.errors['feedback.stressReductionRating']).toBeDefined();
      expect(validationError?.errors['feedback.comments']).toBeDefined();
      expect(validationError?.errors['feedback.improvements']).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should handle missing stress level after', async () => {
      const session = new StressManagementSession({
        ...createTestSession(),
        stressLevelBefore: 8,
        stressLevelAfter: undefined
      });

      expect(session.stressReduction).toBe(0);
    });
  });

  describe('Session Methods', () => {
    it('should process achievements on completion', async () => {
      const session = await StressManagementSession.create({
        ...createTestSession(),
        stressLevelBefore: 8,
        stressLevelAfter: 3
      });

      await session.complete(WellnessMoodState.Calm);

      expect(AchievementService.processStressManagementAchievements).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: session.userId,
          sessionId: session._id,
          technique: session.technique,
          stressReduction: 5,
          duration: session.duration
        })
      );
    });
  });

  describe('Indexes', () => {
    it('should have compound index on userId and startTime', async () => {
      const indexes = await StressManagementSession.collection.getIndexes();
      const hasCompoundIndex = Object.values(indexes).some(
        index => index.key && index.key.userId === 1 && index.key.startTime === -1
      );
      expect(hasCompoundIndex).toBe(true);
    });
  });
}); 