import mongoose from 'mongoose';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factories
interface BreathingPatternInput {
  name?: string;
  inhale?: number;
  hold?: number;
  exhale?: number;
  postExhaleHold?: number;
  cycles?: number;
}

interface BreathingSessionInput {
  userId?: string;
  patternName?: string;
  startTime?: Date;
  endTime?: Date;
  completedCycles?: number;
  targetCycles?: number;
  stressLevelBefore?: number;
  stressLevelAfter?: number;
}

describe('Breathing Models', () => {
  let testPattern: BreathingPatternInput;
  let testSession: BreathingSessionInput;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    testPattern = {
      name: '4-7-8',
      inhale: 4,
      hold: 7,
      exhale: 8,
      cycles: 4
    };
    testSession = {
      userId: userId.toString(),
      patternName: '4-7-8',
      startTime: new Date(),
      targetCycles: 4,
      completedCycles: 0
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
    it('should create breathing pattern successfully', async () => {
      const pattern = await BreathingPattern.create(testPattern);
      expect(pattern.name).toBe(testPattern.name);
      expect(pattern.inhale).toBe(testPattern.inhale);
      expect(pattern.hold).toBe(testPattern.hold);
      expect(pattern.exhale).toBe(testPattern.exhale);
      expect(pattern.cycles).toBe(testPattern.cycles);
    });

    it('should create breathing session successfully', async () => {
      const session = await BreathingSession.create(testSession);
      expect(session.userId).toBe(testSession.userId);
      expect(session.patternName).toBe(testSession.patternName);
      expect(session.targetCycles).toBe(testSession.targetCycles);
      expect(session.completedCycles).toBe(0);
    });

    it('should complete breathing session successfully', async () => {
      const session = await BreathingSession.create(testSession);
      session.completedCycles = session.targetCycles;
      session.endTime = new Date();
      session.stressLevelAfter = 3;
      await session.save();

      expect(session.completedCycles).toBe(session.targetCycles);
      expect(session.endTime).toBeDefined();
      expect(session.stressLevelAfter).toBe(3);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required pattern fields', async () => {
      const pattern = new BreathingPattern({});
      const validationError = await pattern.validateSync();
      
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.inhale).toBeDefined();
      expect(validationError?.errors.exhale).toBeDefined();
      expect(validationError?.errors.cycles).toBeDefined();
    });

    it('should reject missing required session fields', async () => {
      const session = new BreathingSession({});
      const validationError = await session.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.patternName).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
      expect(validationError?.errors.targetCycles).toBeDefined();
    });

    it('should reject invalid stress level values', async () => {
      const session = new BreathingSession({
        ...testSession,
        stressLevelBefore: -1,
        stressLevelAfter: 11
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.stressLevelBefore).toBeDefined();
      expect(validationError?.errors.stressLevelAfter).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate pattern names', async () => {
      await BreathingPattern.create(testPattern);
      await expect(BreathingPattern.create(testPattern))
        .rejects
        .toThrow(/duplicate key error/);
    });

    it('should handle optional breathing pattern fields', async () => {
      const pattern = await BreathingPattern.create({
        ...testPattern,
        hold: undefined,
        postExhaleHold: undefined
      });

      expect(pattern.hold).toBeUndefined();
      expect(pattern.postExhaleHold).toBeUndefined();
      expect(pattern.inhale).toBeDefined();
      expect(pattern.exhale).toBeDefined();
    });

    it('should handle session completion edge cases', async () => {
      const session = await BreathingSession.create({
        ...testSession,
        targetCycles: 10
      });

      // Test partial completion
      session.completedCycles = 5;
      await session.save();
      expect(session.completedCycles).toBe(5);

      // Test over-completion
      session.completedCycles = 11;
      const validationError = await session.validateSync();
      expect(validationError?.errors.completedCycles).toBeDefined();
    });
  });
}); 