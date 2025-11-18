import mongoose from 'mongoose';
import { Progress, IProgress } from '../../models/progress.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { ProgressTestFactory } from '../factories/progress.factory';

describe('Progress Model', () => {
  let progressFactory: ProgressTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
    progressFactory = new ProgressTestFactory();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create a valid progress record', async () => {
      const progress = progressFactory.create();
      const savedProgress = await Progress.create(progress);
      expect(savedProgress._id).toBeDefined();
      expect(savedProgress.userId).toBe(progress.userId);
      expect(savedProgress.meditationId).toBe(progress.meditationId);
      expect(savedProgress.duration).toBe(progress.duration);
    });

    it('should require userId', async () => {
      const progress = progressFactory.create({ userId: undefined });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should require meditationId', async () => {
      const progress = progressFactory.create({ meditationId: undefined });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should require duration', async () => {
      const progress = progressFactory.create({ duration: undefined });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should require startTime', async () => {
      const progress = progressFactory.create({ startTime: undefined });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should require endTime', async () => {
      const progress = progressFactory.create({ endTime: undefined });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should validate mood enum values', async () => {
      const progress = progressFactory.create({ mood: 'invalid' as any });
      await expect(Progress.create(progress)).rejects.toThrow();
    });

    it('should validate minimum duration', async () => {
      const progress = progressFactory.create({ duration: -1 });
      await expect(Progress.create(progress)).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate session length in minutes', async () => {
      const progress = await Progress.create(progressFactory.withDuration(30));
      expect(progress.sessionLength).toBe(30);
    });

    it('should handle zero duration sessions', async () => {
      const progress = await Progress.create(progressFactory.withDuration(0));
      expect(progress.sessionLength).toBe(0);
    });
  });

  describe('Static Methods', () => {
    describe('getTotalMeditationTime', () => {
      it('should calculate total meditation time', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        await Progress.create([
          progressFactory.withDuration(15).create({ userId }),
          progressFactory.withDuration(30).create({ userId }),
          progressFactory.withDuration(45).create({ userId })
        ]);

        const totalTime = await Progress.getTotalMeditationTime(userId);
        expect(totalTime).toBe(90);
      });

      it('should return 0 for user with no sessions', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const totalTime = await Progress.getTotalMeditationTime(userId);
        expect(totalTime).toBe(0);
      });

      it('should only count completed sessions', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        await Progress.create([
          progressFactory.create({ userId, duration: 15, completed: true }),
          progressFactory.create({ userId, duration: 30, completed: false }),
          progressFactory.create({ userId, duration: 45, completed: true })
        ]);

        const totalTime = await Progress.getTotalMeditationTime(userId);
        expect(totalTime).toBe(60);
      });
    });

    describe('getCurrentStreak', () => {
      it('should calculate current streak correctly', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        await Progress.create([
          progressFactory.forStreak(userId, 0), // today
          progressFactory.forStreak(userId, 1), // yesterday
          progressFactory.forStreak(userId, 2)  // 2 days ago
        ]);

        const streak = await Progress.getCurrentStreak(userId);
        expect(streak).toBe(3);
      });

      it('should break streak on missed day', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        await Progress.create([
          progressFactory.forStreak(userId, 0), // today
          progressFactory.forStreak(userId, 2)  // 2 days ago (missing yesterday)
        ]);

        const streak = await Progress.getCurrentStreak(userId);
        expect(streak).toBe(1);
      });

      it('should handle multiple sessions per day in streak', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const today = new Date();
        await Progress.create([
          progressFactory.create({ userId, startTime: today, duration: 15 }),
          progressFactory.create({ userId, startTime: today, duration: 15 }),
          progressFactory.forStreak(userId, 1), // yesterday
        ]);

        const streak = await Progress.getCurrentStreak(userId);
        expect(streak).toBe(2);
      });
    });
  });

  describe('Indexes', () => {
    it('should have compound index on userId and createdAt', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (index: any) => index.key.userId === 1 && index.key.createdAt === -1
      );
      expect(hasIndex).toBe(true);
    });

    it('should have index on meditationId', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (index: any) => index.key.meditationId === 1
      );
      expect(hasIndex).toBe(true);
    });

    it('should have index on startTime', async () => {
      const indexes = await Progress.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (index: any) => index.key.startTime === 1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should trim notes field', async () => {
      const progress = await Progress.create(progressFactory.withNotes('  Test notes  '));
      expect(progress.notes).toBe('Test notes');
    });

    it('should handle empty notes', async () => {
      const progress = await Progress.create(progressFactory.withNotes(''));
      expect(progress.notes).toBe('');
    });

    it('should update timestamps on modification', async () => {
      const progress = await Progress.create(progressFactory.create());
      const originalUpdatedAt = progress.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      progress.notes = 'Updated notes';
      await progress.save();

      expect(progress.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Mood Tracking', () => {
    it('should track mood changes', async () => {
      const progress = await Progress.create(progressFactory.withMood('neutral'));
      expect(progress.mood).toBe('neutral');

      progress.mood = 'positive';
      await progress.save();
      expect(progress.mood).toBe('positive');
    });

    it('should allow mood to be undefined', async () => {
      const progress = await Progress.create(progressFactory.create({ mood: undefined }));
      expect(progress.mood).toBeUndefined();
    });

    it('should validate mood values', async () => {
      const validMoods = ['very-negative', 'negative', 'neutral', 'positive', 'very-positive'];
      for (const mood of validMoods) {
        const progress = await Progress.create(progressFactory.withMood(mood as any));
        expect(progress.mood).toBe(mood);
      }
    });
  });
}); 