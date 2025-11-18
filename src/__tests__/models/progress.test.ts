import mongoose from 'mongoose';
import { Progress, IProgress } from '../../models/progress.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface ProgressInput {
  userId?: string | mongoose.Types.ObjectId;
  meditationId?: string | mongoose.Types.ObjectId;
  duration?: number;
  completed?: boolean;
  mood?: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
  notes?: string;
  startTime?: Date;
  endTime?: Date;
}

const createTestProgress = (overrides: ProgressInput = {}): ProgressInput => ({
  userId: new mongoose.Types.ObjectId(),
  meditationId: new mongoose.Types.ObjectId(),
  duration: 15,
  completed: true,
  mood: 'neutral',
  notes: 'Test session',
  startTime: new Date(),
  endTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes later
  ...overrides
});

describe('Progress Model', () => {
  let testProgress: ProgressInput;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    const startTime = new Date();
    testProgress = {
      userId,
      meditationId: new mongoose.Types.ObjectId(),
      duration: 15,
      completed: true,
      mood: 'neutral',
      notes: 'Test session',
      startTime,
      endTime: new Date(startTime.getTime() + 15 * 60 * 1000)
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
    it('should create and save progress successfully', async () => {
      const progress = await Progress.create(testProgress);
      expect(progress.userId).toEqual(testProgress.userId);
      expect(progress.meditationId).toEqual(testProgress.meditationId);
      expect(progress.duration).toBe(testProgress.duration);
      expect(progress.completed).toBe(true);
    });

    it('should calculate total meditation time correctly', async () => {
      await Progress.create([
        { ...testProgress, duration: 15 },
        { ...testProgress, duration: 30 },
        { ...testProgress, duration: 45 }
      ]);
      const totalTime = await Progress.getTotalMeditationTime(userId.toString());
      expect(totalTime).toBe(90);
    });

    it('should maintain meditation streak for consecutive days', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      await Progress.create([
        {
          ...testProgress,
          startTime: today,
          endTime: new Date(today.getTime() + 15 * 60 * 1000)
        },
        {
          ...testProgress,
          startTime: yesterday,
          endTime: new Date(yesterday.getTime() + 15 * 60 * 1000)
        }
      ]);

      const streak = await Progress.getCurrentStreak(userId.toString());
      expect(streak).toBe(2);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const progress = new Progress({});
      const validationError = await progress.validateSync();
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.meditationId).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
    });

    it('should reject invalid mood values', async () => {
      const progress = new Progress({
        ...testProgress,
        mood: 'invalid-mood'
      });
      const validationError = await progress.validateSync();
      expect(validationError?.errors.mood).toBeDefined();
    });

    it('should reject negative duration', async () => {
      const progress = new Progress({
        ...testProgress,
        duration: -1
      });
      const validationError = await progress.validateSync();
      expect(validationError?.errors.duration).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration meditation sessions', async () => {
      const progress = await Progress.create({
        ...testProgress,
        duration: 0
      });
      expect(progress.duration).toBe(0);
      const totalTime = await Progress.getTotalMeditationTime(userId.toString());
      expect(totalTime).toBe(0);
    });

    it('should handle streak reset after missed day', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      await Progress.create([
        {
          ...testProgress,
          startTime: today,
          endTime: new Date(today.getTime() + 15 * 60 * 1000)
        },
        {
          ...testProgress,
          startTime: threeDaysAgo,
          endTime: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000)
        }
      ]);

      const streak = await Progress.getCurrentStreak(userId.toString());
      expect(streak).toBe(1);
    });

    it('should handle empty notes and trim whitespace', async () => {
      const progress = await Progress.create({
        ...testProgress,
        notes: '  '
      });
      expect(progress.notes).toBe('');
      
      const progressWithSpaces = await Progress.create({
        ...testProgress,
        notes: '  Test notes  '
      });
      expect(progressWithSpaces.notes).toBe('Test notes');
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const progress = new Progress({});
      const validationError = await progress.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.meditationId).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.startTime).toBeDefined();
      expect(validationError?.errors.endTime).toBeDefined();
    });

    it('should validate mood enum values', async () => {
      const progress = new Progress({
        ...createTestProgress(),
        mood: 'invalid'
      });

      const validationError = await progress.validateSync();
      expect(validationError?.errors.mood).toBeDefined();
    });

    it('should validate minimum duration', async () => {
      const progress = new Progress({
        ...createTestProgress(),
        duration: -1
      });

      const validationError = await progress.validateSync();
      expect(validationError?.errors.duration).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set completed to true by default', async () => {
      const progress = await Progress.create({
        ...createTestProgress(),
        completed: undefined
      });

      expect(progress.completed).toBe(true);
    });

    it('should set timestamps', async () => {
      const progress = await Progress.create(createTestProgress());
      
      expect(progress.createdAt).toBeDefined();
      expect(progress.updatedAt).toBeDefined();
      expect(progress.createdAt).toBeInstanceOf(Date);
      expect(progress.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate session length in minutes', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later
      
      const progress = await Progress.create({
        ...createTestProgress(),
        startTime,
        endTime
      });

      expect(progress.sessionLength).toBe(30);
    });
  });

  describe('Static Methods', () => {
    it('should calculate total meditation time', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      await Progress.create([
        { ...createTestProgress(), userId, duration: 15 },
        { ...createTestProgress(), userId, duration: 30 },
        { ...createTestProgress(), userId, duration: 45 }
      ]);

      const totalTime = await Progress.getTotalMeditationTime(userId.toString());
      expect(totalTime).toBe(90);
    });

    it('should return 0 total time for user with no sessions', async () => {
      const userId = new mongoose.Types.ObjectId();
      const totalTime = await Progress.getTotalMeditationTime(userId.toString());
      expect(totalTime).toBe(0);
    });

    it('should calculate current streak', async () => {
      const userId = new mongoose.Types.ObjectId();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      await Progress.create([
        {
          ...createTestProgress(),
          userId,
          startTime: today,
          endTime: new Date(today.getTime() + 15 * 60 * 1000)
        },
        {
          ...createTestProgress(),
          userId,
          startTime: yesterday,
          endTime: new Date(yesterday.getTime() + 15 * 60 * 1000)
        },
        {
          ...createTestProgress(),
          userId,
          startTime: twoDaysAgo,
          endTime: new Date(twoDaysAgo.getTime() + 15 * 60 * 1000)
        }
      ]);

      const streak = await Progress.getCurrentStreak(userId.toString());
      expect(streak).toBe(3);
    });

    it('should break streak on missed day', async () => {
      const userId = new mongoose.Types.ObjectId();
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      await Progress.create([
        {
          ...createTestProgress(),
          userId,
          startTime: today,
          endTime: new Date(today.getTime() + 15 * 60 * 1000)
        },
        {
          ...createTestProgress(),
          userId,
          startTime: threeDaysAgo,
          endTime: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000)
        }
      ]);

      const streak = await Progress.getCurrentStreak(userId.toString());
      expect(streak).toBe(1); // Only today counts
    });
  });

  describe('Indexes', () => {
    it('should have compound index on userId and createdAt', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        index => index.key && index.key.userId === 1 && index.key.createdAt === -1
      );
      
      expect(hasIndex).toBe(true);
    });

    it('should have index on meditationId', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        index => index.key && index.key.meditationId === 1
      );
      
      expect(hasIndex).toBe(true);
    });

    it('should have index on startTime', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        index => index.key && index.key.startTime === 1
      );
      
      expect(hasIndex).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should trim notes field', async () => {
      const progress = await Progress.create({
        ...createTestProgress(),
        notes: '  Test notes  '
      });

      expect(progress.notes).toBe('Test notes');
    });

    it('should update timestamps on modification', async () => {
      const progress = await Progress.create(createTestProgress());
      const originalUpdatedAt = progress.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      progress.notes = 'Updated notes';
      await progress.save();

      expect(progress.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
}); 