import mongoose, { Model, Document } from 'mongoose';
import { 
  IBaseWellnessSession, 
  WellnessMoodState, 
  WellnessSessionStatus,
  baseWellnessSessionSchema,
  createWellnessSessionSchema
} from '../../models/base-wellness-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { BaseWellnessSessionTestFactory } from '../factories/base-wellness-session.factory';

// Create a concrete model for testing
interface ITestSession extends IBaseWellnessSession {
  testField?: string;
}

const TestSessionSchema = createWellnessSessionSchema<ITestSession>({
  testField: String
});

const TestSession = mongoose.model<ITestSession>('TestSession', TestSessionSchema);

describe('BaseWellnessSession Model', () => {
  let sessionFactory: BaseWellnessSessionTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    sessionFactory = new BaseWellnessSessionTestFactory();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Schema Creation', () => {
    it('should create extended schema with additional fields', () => {
      const extendedSchema = createWellnessSessionSchema<ITestSession>({
        customField: { type: String, required: true }
      });
      
      expect(extendedSchema.path('customField')).toBeDefined();
      expect(extendedSchema.path('userId')).toBeDefined();
      expect(extendedSchema.path('startTime')).toBeDefined();
    });

    it('should inherit base schema validations', () => {
      const session = new TestSession({});
      const validationError = session.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should correctly indicate completed status', async () => {
      const activeSession = new TestSession(sessionFactory.create());
      expect(activeSession.isCompleted).toBe(false);

      const completedSession = new TestSession(sessionFactory.completed());
      expect(completedSession.isCompleted).toBe(true);
    });
  });

  describe('Success Cases', () => {
    it('should create wellness session successfully', async () => {
      const testData = sessionFactory.create();
      const session = await TestSession.create(testData);
      expect(session.userId).toEqual(testData.userId);
      expect(session.startTime).toEqual(testData.startTime);
      expect(session.duration).toBe(testData.duration);
      expect(session.status).toBe(WellnessSessionStatus.Active);
    });

    it('should complete session with mood', async () => {
      const session = await TestSession.create(sessionFactory.create());
      await session.complete(WellnessMoodState.Calm);

      expect(session.status).toBe(WellnessSessionStatus.Completed);
      expect(session.moodAfter).toBe(WellnessMoodState.Calm);
      expect(session.endTime).toBeDefined();
    });

    it('should track state history through transitions', async () => {
      const session = await TestSession.create(sessionFactory.create());
      
      await session.pause();
      await session.resume();
      await session.complete(WellnessMoodState.Peaceful);

      expect(session.stateHistory).toHaveLength(4); // Initial + 3 transitions
      expect(session.stateHistory[0].status).toBe(WellnessSessionStatus.Active);
      expect(session.stateHistory[1].status).toBe(WellnessSessionStatus.Paused);
      expect(session.stateHistory[2].status).toBe(WellnessSessionStatus.Active);
      expect(session.stateHistory[3].status).toBe(WellnessSessionStatus.Completed);
    });

    it('should handle mood state transitions', async () => {
      const session = await TestSession.create(sessionFactory.create({
        moodBefore: WellnessMoodState.Stressed
      }));

      await session.complete(WellnessMoodState.Peaceful);
      expect(session.moodBefore).toBe(WellnessMoodState.Stressed);
      expect(session.moodAfter).toBe(WellnessMoodState.Peaceful);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const session = new TestSession({});
      const validationError = await session.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
    });

    it('should reject invalid mood states', async () => {
      const session = new TestSession({
        ...sessionFactory.create(),
        moodBefore: 'invalid' as WellnessMoodState,
        moodAfter: 'invalid' as WellnessMoodState
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.moodBefore).toBeDefined();
      expect(validationError?.errors.moodAfter).toBeDefined();
    });

    it('should reject invalid state transitions', async () => {
      const completedSession = await TestSession.create(sessionFactory.completed());
      await expect(completedSession.pause()).rejects.toThrow();
      await expect(completedSession.resume()).rejects.toThrow();
      await expect(completedSession.abandon()).rejects.toThrow();

      const abandonedSession = await TestSession.create(sessionFactory.abandoned());
      await expect(abandonedSession.pause()).rejects.toThrow();
      await expect(abandonedSession.resume()).rejects.toThrow();
      await expect(abandonedSession.complete()).rejects.toThrow();
    });

    it('should reject invalid durations', async () => {
      const tooShort = new TestSession(sessionFactory.withDuration(0));
      const tooLong = new TestSession(sessionFactory.withDuration(7201)); // > 2 hours

      expect(await tooShort.validateSync()?.errors.duration).toBeDefined();
      expect(await tooLong.validateSync()?.errors.duration).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle endTime validation', async () => {
      const startTime = new Date();
      const invalidEndTime = new Date(startTime.getTime() - 1000); // 1 second before start
      const session = new TestSession(sessionFactory.create({
        startTime,
        endTime: invalidEndTime
      }));

      const validationError = await session.validateSync();
      expect(validationError?.errors.endTime).toBeDefined();
    });

    it('should handle duration calculations with precision', async () => {
      const startTime = new Date(Date.now() - 5000); // 5 seconds ago
      const session = await TestSession.create(sessionFactory.create({ startTime }));

      const duration = session.getActualDuration();
      expect(duration).toBeGreaterThanOrEqual(4);
      expect(duration).toBeLessThanOrEqual(6);
    });

    it('should handle unimplemented achievement processing', async () => {
      const session = await TestSession.create(sessionFactory.create());
      await expect(session.processAchievements()).rejects.toThrow('Achievement processing must be implemented');
    });

    it('should handle empty notes', async () => {
      const session = await TestSession.create(sessionFactory.create({ notes: undefined }));
      expect(session.notes).toBeUndefined();
    });

    it('should handle maximum notes length', async () => {
      const longNotes = 'a'.repeat(1001); // Over 1000 chars
      const session = new TestSession(sessionFactory.create({ notes: longNotes }));
      const validationError = await session.validateSync();
      expect(validationError?.errors.notes).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    it('should trim notes field', async () => {
      const session = await TestSession.create(sessionFactory.create({
        notes: '  Test notes  '
      }));
      expect(session.notes).toBe('Test notes');
    });

    it('should update timestamps on modification', async () => {
      const session = await TestSession.create(sessionFactory.create());
      const originalUpdatedAt = session.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      session.notes = 'Updated notes';
      await session.save();

      expect(session.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should set endTime on completion via pre-validate middleware', async () => {
      const session = await TestSession.create(sessionFactory.create());
      session.status = WellnessSessionStatus.Completed;
      await session.validate();
      
      expect(session.endTime).toBeDefined();
      expect(session.endTime).toBeInstanceOf(Date);
    });
  });
}); 