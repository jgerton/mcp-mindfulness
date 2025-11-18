import mongoose from 'mongoose';
import { UserPoints, IUserPoints } from '../../models/user-points.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface UserPointsInput extends Partial<IUserPoints> {
  userId?: mongoose.Types.ObjectId;
  total?: number;
}

const createTestUserPoints = (overrides: UserPointsInput = {}): UserPointsInput => ({
  userId: new mongoose.Types.ObjectId(),
  total: 0,
  achievements: [],
  streaks: [],
  recent: [],
  ...overrides
});

describe('UserPoints Model', () => {
  let testUserPoints: UserPointsInput;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    testUserPoints = createTestUserPoints();
    jest.spyOn(UserPoints.prototype, 'save').mockImplementation(function(this: any) {
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
    it('should create and save user points successfully', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      expect(userPoints.userId).toBeDefined();
      expect(userPoints.total).toBe(0);
      expect(userPoints.achievements).toEqual([]);
      expect(userPoints.streaks).toEqual([]);
      expect(userPoints.recent).toEqual([]);
    });

    it('should add points correctly', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      const pointsToAdd = 100;
      await userPoints.addPoints(pointsToAdd, 'meditation', 'Completed meditation session');
      expect(userPoints.total).toBe(pointsToAdd);
    });

    it('should track achievements successfully', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      const achievement = {
        id: 'meditation_master',
        name: 'Meditation Master',
        description: 'Complete 10 meditation sessions',
        points: 500,
        earnedAt: new Date()
      };
      userPoints.achievements.push(achievement);
      await userPoints.save();
      expect(userPoints.achievements).toHaveLength(1);
    });
  });

  describe('Error Cases', () => {
    it('should fail when required fields are missing', async () => {
      expect(() => new UserPoints({})).toThrow();
    });

    it('should reject duplicate userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      await UserPoints.create({ ...testUserPoints, userId });
      await expect(UserPoints.create({ ...testUserPoints, userId })).rejects.toThrow();
    });

    it('should fail when adding invalid points', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      expect(() => userPoints.addPoints(NaN, 'test', 'Invalid points')).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero points correctly', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      await userPoints.addPoints(0, 'test', 'Zero points');
      expect(userPoints.total).toBe(0);
    });

    it('should handle negative points', async () => {
      const userPoints = await UserPoints.create({ ...testUserPoints, total: 100 });
      await userPoints.addPoints(-50, 'penalty', 'Point deduction');
      expect(userPoints.total).toBe(50);
    });

    it('should handle maximum recent points history', async () => {
      const userPoints = await UserPoints.create(testUserPoints);
      const maxEntries = 10;
      for (let i = 0; i < maxEntries + 5; i++) {
        await userPoints.addPoints(10, 'test', `Entry ${i}`);
      }
      expect(userPoints.recent).toHaveLength(maxEntries);
    });
  });

  describe('Schema Validation', () => {
    it('should initialize with default values', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      
      expect(userPoints.total).toBe(0);
      expect(userPoints.achievements).toEqual([]);
      expect(userPoints.streaks).toEqual([]);
      expect(userPoints.recent).toEqual([]);
    });
  });

  describe('Points Management', () => {
    it('should maintain recent points history limit', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      const maxRecentEntries = 10; // Assuming this is the limit

      // Add more entries than the limit
      for (let i = 0; i < maxRecentEntries + 5; i++) {
        await userPoints.addPoints(10, 'test', `Entry ${i}`);
      }

      expect(userPoints.recent).toHaveLength(maxRecentEntries);
      expect(userPoints.recent[0].description).toBe(`Entry ${maxRecentEntries + 4}`);
    });
  });

  describe('Achievement Tracking', () => {
    it('should prevent duplicate achievements', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      const achievementId = 'meditation_master';
      const achievement = {
        id: achievementId,
        name: 'Meditation Master',
        description: 'Complete 10 meditation sessions',
        points: 500,
        earnedAt: new Date()
      };

      userPoints.achievements.push(achievement);
      await userPoints.save();

      // Attempt to add the same achievement again
      userPoints.achievements.push({ ...achievement, points: 1000 });
      const validationError = await userPoints.validateSync();
      
      expect(validationError?.errors['achievements']).toBeDefined();
    });
  });

  describe('Streak Management', () => {
    it('should track streaks correctly', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      const streak = {
        type: 'meditation',
        count: 5,
        startDate: new Date(),
        lastUpdateDate: new Date()
      };

      userPoints.streaks.push(streak);
      await userPoints.save();

      expect(userPoints.streaks).toHaveLength(1);
      expect(userPoints.streaks[0]).toMatchObject(streak);
    });

    it('should update existing streak', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      const initialStreak = {
        type: 'meditation',
        count: 5,
        startDate: new Date(),
        lastUpdateDate: new Date()
      };

      userPoints.streaks.push(initialStreak);
      await userPoints.save();

      // Update the streak
      const updatedStreak = {
        ...initialStreak,
        count: 6,
        lastUpdateDate: new Date()
      };
      userPoints.streaks[0] = updatedStreak;
      await userPoints.save();

      expect(userPoints.streaks[0].count).toBe(6);
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate level based on total points', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      
      // Test different point thresholds
      const testCases = [
        { points: 0, expectedLevel: 1 },
        { points: 1000, expectedLevel: 2 },
        { points: 5000, expectedLevel: 3 },
        { points: 10000, expectedLevel: 4 }
      ];

      for (const { points, expectedLevel } of testCases) {
        userPoints.total = points;
        await userPoints.save();
        expect(userPoints.level).toBe(expectedLevel);
      }
    });

    it('should calculate points to next level', async () => {
      const userPoints = await UserPoints.create(createTestUserPoints());
      
      userPoints.total = 500; // Level 1
      await userPoints.save();
      expect(userPoints.pointsToNextLevel).toBe(500); // 1000 - 500

      userPoints.total = 1500; // Level 2
      await userPoints.save();
      expect(userPoints.pointsToNextLevel).toBe(3500); // 5000 - 1500
    });
  });

  describe('Indexes', () => {
    it('should have an index on userId', async () => {
      const indexes = await UserPoints.collection.getIndexes();
      const hasUserIdIndex = Object.values(indexes).some(
        index => index.key.userId !== undefined
      );
      expect(hasUserIdIndex).toBe(true);
    });
  });
}); 