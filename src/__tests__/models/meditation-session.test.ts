import mongoose from 'mongoose';
import { MeditationSession, IMeditationSession } from '../../models/meditation-session.model';
import { WellnessMoodState, WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { AchievementService } from '../../services/achievement.service';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

// Type-safe test data factory
interface MeditationSessionInput {
  userId?: mongoose.Types.ObjectId;
  title?: string;
  description?: string;
  type?: 'guided' | 'unguided' | 'timed';
  guidedMeditationId?: mongoose.Types.ObjectId;
  meditationId?: mongoose.Types.ObjectId;
  duration?: number;
  startTime?: Date;
  status?: WellnessSessionStatus;
  moodBefore?: WellnessMoodState;
  moodAfter?: WellnessMoodState;
  durationCompleted?: number;
  interruptions?: number;
  completed?: boolean;
  notes?: string;
  tags?: string[];
}

const createTestSession = (overrides: MeditationSessionInput = {}): MeditationSessionInput => ({
  userId: new mongoose.Types.ObjectId(),
  title: 'Test Meditation Session',
  description: 'A test meditation session',
  type: 'guided',
  duration: 600, // 10 minutes
  startTime: new Date(),
  status: WellnessSessionStatus.Active,
  moodBefore: WellnessMoodState.Neutral,
  durationCompleted: 0,
  interruptions: 0,
  completed: false,
  tags: ['test'],
  ...overrides
});

describe('MeditationSession Model', () => {
  let testSession: MeditationSessionInput;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    testSession = {
      userId,
      title: 'Test Meditation Session',
      description: 'A test meditation session',
      type: 'guided',
      guidedMeditationId: new mongoose.Types.ObjectId(),
      duration: 600, // 10 minutes
      startTime: new Date(),
      status: WellnessSessionStatus.Active,
      moodBefore: WellnessMoodState.Neutral,
      durationCompleted: 0,
      interruptions: 0,
      completed: false,
      tags: ['test']
    };

    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
        return Promise.resolve(this);
      });

    jest.spyOn(AchievementService, 'processMeditationAchievements')
      .mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create meditation session successfully', async () => {
      const session = await MeditationSession.create(testSession);
      expect(session.userId).toEqual(testSession.userId);
      expect(session.title).toBe(testSession.title);
      expect(session.type).toBe(testSession.type);
      expect(session.duration).toBe(testSession.duration);
    });

    it('should complete session and process achievements', async () => {
      const session = await MeditationSession.create({
        ...testSession,
        durationCompleted: 540, // 90%
        moodBefore: WellnessMoodState.Anxious,
        moodAfter: WellnessMoodState.Calm
      });

      await session.completeSession();
      expect(session.status).toBe(WellnessSessionStatus.Completed);
      expect(session.completed).toBe(true);
      expect(session.endTime).toBeDefined();
      expect(AchievementService.processMeditationAchievements).toHaveBeenCalled();
    });

    it('should calculate virtual fields correctly', async () => {
      const session = new MeditationSession({
        ...testSession,
        duration: 600,
        durationCompleted: 450
      });
      expect(session.durationMinutes).toBe(10);
      expect(session.completionPercentage).toBe(75);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const session = new MeditationSession({});
      const validationError = await session.validateSync();
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.type).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
    });

    it('should reject invalid field lengths', async () => {
      const session = new MeditationSession({
        ...testSession,
        title: 'a'.repeat(101),
        description: 'a'.repeat(501),
        tags: ['a'.repeat(31)]
      });
      const validationError = await session.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors['tags.0']).toBeDefined();
    });

    it('should reject invalid meditation type', async () => {
      const session = new MeditationSession({
        ...testSession,
        type: 'invalid' as any
      });
      const validationError = await session.validateSync();
      expect(validationError?.errors.type).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum completion requirements', async () => {
      const barelyEligible = new MeditationSession({
        ...testSession,
        duration: 600,
        durationCompleted: 480, // 80% - minimum for streak eligibility
        status: WellnessSessionStatus.Completed,
        moodAfter: WellnessMoodState.Calm
      });
      expect(barelyEligible.isStreakEligible).toBe(true);

      const notEligible = new MeditationSession({
        ...testSession,
        duration: 600,
        durationCompleted: 479, // 79.8% - just below minimum
        status: WellnessSessionStatus.Completed,
        moodAfter: WellnessMoodState.Calm
      });
      expect(notEligible.isStreakEligible).toBe(false);
    });

    it('should handle session interruptions and resumption', async () => {
      const session = await MeditationSession.create(testSession);
      
      // Add interruption
      session.interruptions = (session.interruptions || 0) + 1;
      session.status = WellnessSessionStatus.Interrupted;
      await session.save();
      expect(session.interruptions).toBe(1);
      
      // Resume session
      session.status = WellnessSessionStatus.Active;
      await session.save();
      expect(session.status).toBe(WellnessSessionStatus.Active);
    });

    it('should handle default values and empty fields', async () => {
      const session = await MeditationSession.create({
        ...testSession,
        description: undefined,
        durationCompleted: undefined,
        interruptions: undefined,
        completed: undefined,
        tags: []
      });
      expect(session.description).toBeUndefined();
      expect(session.durationCompleted).toBe(0);
      expect(session.interruptions).toBe(0);
      expect(session.completed).toBe(false);
      expect(session.tags).toHaveLength(0);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const session = new MeditationSession({});
      const validationError = await session.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.type).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
    });

    it('should validate title length', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        title: 'a'.repeat(101) // Exceeds 100 char limit
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.title).toBeDefined();
    });

    it('should validate description length', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        description: 'a'.repeat(501) // Exceeds 500 char limit
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.description).toBeDefined();
    });

    it('should validate guided meditation ID requirement', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        type: 'guided',
        guidedMeditationId: undefined
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.guidedMeditationId).toBeDefined();
    });

    it('should validate tag length', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        tags: ['a'.repeat(31)] // Exceeds 30 char limit
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors['tags.0']).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set default values', async () => {
      const session = await MeditationSession.create({
        ...createTestSession(),
        durationCompleted: undefined,
        interruptions: undefined,
        completed: undefined
      });

      expect(session.durationCompleted).toBe(0);
      expect(session.interruptions).toBe(0);
      expect(session.completed).toBe(false);
      expect(session.status).toBe(WellnessSessionStatus.Active);
    });

    it('should set timestamps', async () => {
      const session = await MeditationSession.create(createTestSession());
      
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should determine streak eligibility', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        status: WellnessSessionStatus.Completed,
        duration: 600,
        durationCompleted: 540, // 90%
        moodAfter: WellnessMoodState.Calm
      });

      expect(session.isStreakEligible).toBe(true);
    });

    it('should not be streak eligible with low completion', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        status: WellnessSessionStatus.Completed,
        duration: 600,
        durationCompleted: 300, // 50%
        moodAfter: WellnessMoodState.Calm
      });

      expect(session.isStreakEligible).toBe(false);
    });
  });

  describe('Session Methods', () => {
    it('should track interruptions', async () => {
      const session = await MeditationSession.create({
        ...createTestSession(),
        interruptions: 0
      });

      session.interruptions = (session.interruptions || 0) + 1;
      await session.save();

      expect(session.interruptions).toBe(1);
    });

    it('should process achievements on completion', async () => {
      const session = await MeditationSession.create({
        ...createTestSession(),
        moodBefore: WellnessMoodState.Anxious,
        durationCompleted: 540 // 90%
      });

      await session.completeSession();

      expect(AchievementService.processMeditationAchievements).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: session.userId,
          sessionId: session._id,
          duration: session.duration,
          completionPercentage: 90,
          moodImprovement: expect.any(Number)
        })
      );
    });
  });

  describe('Indexes', () => {
    it('should have userId index', async () => {
      const indexes = await MeditationSession.collection.getIndexes();
      const hasUserIdIndex = Object.values(indexes).some(
        index => index.key && index.key.userId === 1
      );
      expect(hasUserIdIndex).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should trim string fields', async () => {
      const session = await MeditationSession.create({
        ...createTestSession(),
        title: '  Test Session  ',
        description: '  Test Description  ',
        notes: '  Test Notes  ',
        tags: ['  tag1  ', '  tag2  ']
      });

      expect(session.title).toBe('Test Session');
      expect(session.description).toBe('Test Description');
      expect(session.notes).toBe('Test Notes');
      expect(session.tags).toEqual(['tag1', 'tag2']);
    });

    it('should enforce field length limits', async () => {
      const session = new MeditationSession({
        ...createTestSession(),
        title: 'a'.repeat(101),
        description: 'a'.repeat(501),
        notes: 'a'.repeat(1001),
        tags: ['a'.repeat(31)]
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.notes).toBeDefined();
      expect(validationError?.errors['tags.0']).toBeDefined();
    });
  });

  describe('State Transitions', () => {
    it('should handle pause and resume', async () => {
      const session = await MeditationSession.create(createTestSession());
      
      await session.pause();
      expect(session.status).toBe(WellnessSessionStatus.Paused);
      
      await session.resume();
      expect(session.status).toBe(WellnessSessionStatus.Active);
    });

    it('should handle abandonment', async () => {
      const session = await MeditationSession.create(createTestSession());
      
      await session.abandon();
      expect(session.status).toBe(WellnessSessionStatus.Abandoned);
      expect(session.endTime).toBeDefined();
    });

    it('should prevent invalid state transitions', async () => {
      const session = await MeditationSession.create({
        ...createTestSession(),
        status: WellnessSessionStatus.Completed
      });

      await expect(session.pause()).rejects.toThrow();
      await expect(session.resume()).rejects.toThrow();
      await expect(session.abandon()).rejects.toThrow();
    });
  });
});