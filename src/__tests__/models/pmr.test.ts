import mongoose from 'mongoose';
import { MuscleGroup, PMRSession } from '../../models/pmr.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factories
interface MuscleGroupInput {
  name?: string;
  description?: string;
  order?: number;
  durationSeconds?: number;
}

interface PMRSessionInput {
  userId?: string;
  startTime?: Date;
  endTime?: Date;
  completedGroups?: string[];
  stressLevelBefore?: number;
  stressLevelAfter?: number;
  duration?: number;
}

const createTestMuscleGroup = (overrides: MuscleGroupInput = {}): MuscleGroupInput => ({
  name: 'Shoulders',
  description: 'Focus on tensing and relaxing your shoulder muscles',
  order: 1,
  durationSeconds: 60,
  ...overrides
});

const createTestPMRSession = (overrides: PMRSessionInput = {}): PMRSessionInput => ({
  userId: new mongoose.Types.ObjectId().toString(),
  startTime: new Date(),
  completedGroups: [],
  duration: 300,
  ...overrides
});

describe('PMR Models', () => {
  let testMuscleGroup: MuscleGroupInput;
  let testPMRSession: PMRSessionInput;
  let userId: string;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId().toString();
    testMuscleGroup = {
      name: 'Shoulders',
      description: 'Focus on tensing and relaxing your shoulder muscles',
      order: 1,
      durationSeconds: 60
    };

    testPMRSession = {
      userId,
      startTime: new Date(),
      completedGroups: [],
      duration: 300
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
    it('should create muscle group successfully', async () => {
      const muscleGroup = await MuscleGroup.create(testMuscleGroup);
      expect(muscleGroup.name).toBe('Shoulders');
      expect(muscleGroup.description).toBe('Focus on tensing and relaxing your shoulder muscles');
      expect(muscleGroup.order).toBe(1);
      expect(muscleGroup.durationSeconds).toBe(60);
    });

    it('should create PMR session successfully', async () => {
      const session = await PMRSession.create(testPMRSession);
      expect(session.userId).toBe(userId);
      expect(session.duration).toBe(300);
      expect(session.completedGroups).toEqual([]);
    });

    it('should track completed muscle groups correctly', async () => {
      const muscleGroup = await MuscleGroup.create(testMuscleGroup);
      const session = await PMRSession.create(testPMRSession);
      session.completedGroups.push(muscleGroup.name);
      await session.save();
      expect(session.completedGroups).toContain(muscleGroup.name);
    });
  });

  describe('Error Cases', () => {
    it('should reject muscle group with missing required fields', async () => {
      const muscleGroup = new MuscleGroup({});
      const validationError = await muscleGroup.validateSync();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.order).toBeDefined();
      expect(validationError?.errors.durationSeconds).toBeDefined();
    });

    it('should reject PMR session with missing required fields', async () => {
      const session = new PMRSession({});
      const validationError = await session.validateSync();
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
    });

    it('should reject invalid stress level values', async () => {
      const session = new PMRSession({
        ...testPMRSession,
        stressLevelBefore: 11,
        stressLevelAfter: -1
      });
      const validationError = await session.validateSync();
      expect(validationError?.errors.stressLevelBefore).toBeDefined();
      expect(validationError?.errors.stressLevelAfter).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values for numeric fields', async () => {
      const muscleGroup = await MuscleGroup.create({
        ...testMuscleGroup,
        order: 0,
        durationSeconds: 1
      });
      expect(muscleGroup.order).toBe(0);
      expect(muscleGroup.durationSeconds).toBe(1);

      const session = await PMRSession.create({
        ...testPMRSession,
        stressLevelBefore: 10,
        stressLevelAfter: 0
      });
      expect(session.stressLevelBefore).toBe(10);
      expect(session.stressLevelAfter).toBe(0);
    });

    it('should handle string trimming and empty arrays', async () => {
      const muscleGroup = await MuscleGroup.create({
        ...testMuscleGroup,
        name: '  Shoulders  ',
        description: '  Test description  '
      });
      expect(muscleGroup.name).toBe('Shoulders');
      expect(muscleGroup.description).toBe('Test description');

      const session = await PMRSession.create({
        ...testPMRSession,
        completedGroups: []
      });
      expect(session.completedGroups).toHaveLength(0);
    });

    it('should handle session completion edge cases', async () => {
      const session = await PMRSession.create({
        ...testPMRSession,
        startTime: new Date(),
        endTime: undefined,
        stressLevelBefore: 5
      });
      
      const now = new Date();
      session.endTime = now;
      session.stressLevelAfter = session.stressLevelBefore;
      await session.save();
      
      expect(session.endTime).toEqual(now);
      expect(session.stressLevelAfter).toBe(session.stressLevelBefore);
    });
  });
}); 