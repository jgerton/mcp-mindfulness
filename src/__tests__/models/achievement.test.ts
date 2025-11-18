import mongoose from 'mongoose';
import { Achievement, UserAchievement, IAchievement, IUserAchievement, AchievementCategory, AchievementType } from '../../models/achievement.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factories
interface AchievementInput {
  name?: string;
  description?: string;
  category?: string;
  criteria?: {
    type: string;
    value: any;
  };
  icon?: string;
  points?: number;
  type?: string;
  userId?: mongoose.Types.ObjectId;
  progress?: number;
  target?: number;
  completed?: boolean;
  completedAt?: Date;
}

interface UserAchievementInput {
  userId?: mongoose.Types.ObjectId;
  achievementId?: mongoose.Types.ObjectId;
  progress?: number;
  isCompleted?: boolean;
  dateEarned?: Date;
}

describe('Achievement Models', () => {
  let testAchievement: AchievementInput;
  let testUserAchievement: UserAchievementInput;
  let userId: mongoose.Types.ObjectId;
  let achievementId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    achievementId = new mongoose.Types.ObjectId();
    testAchievement = {
      name: 'Test Achievement',
      description: 'Test achievement description',
      category: AchievementCategory.MEDITATION,
      criteria: {
        type: AchievementType.TOTAL_SESSIONS,
        value: 10
      },
      icon: 'test-icon.svg',
      points: 100,
      type: AchievementType.BRONZE,
      progress: 0,
      target: 10,
      completed: false
    };
    testUserAchievement = {
      userId,
      achievementId,
      progress: 50,
      isCompleted: false,
      dateEarned: null
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
    it('should create achievement successfully', async () => {
      const achievement = await Achievement.create(testAchievement);
      expect(achievement.name).toBe(testAchievement.name);
      expect(achievement.description).toBe(testAchievement.description);
      expect(achievement.category).toBe(testAchievement.category);
      expect(achievement.points).toBe(testAchievement.points);
      expect(achievement.type).toBe(testAchievement.type);
    });

    it('should create user achievement successfully', async () => {
      const userAchievement = await UserAchievement.create(testUserAchievement);
      expect(userAchievement.userId).toEqual(testUserAchievement.userId);
      expect(userAchievement.achievementId).toEqual(testUserAchievement.achievementId);
      expect(userAchievement.progress).toBe(testUserAchievement.progress);
      expect(userAchievement.isCompleted).toBe(false);
    });

    it('should track achievement progress correctly', async () => {
      const userAchievement = await UserAchievement.create({
        ...testUserAchievement,
        progress: 0
      });

      userAchievement.progress = 75;
      await userAchievement.save();
      expect(userAchievement.progress).toBe(75);

      userAchievement.progress = 100;
      userAchievement.isCompleted = true;
      userAchievement.dateEarned = new Date();
      await userAchievement.save();
      expect(userAchievement.isCompleted).toBe(true);
      expect(userAchievement.dateEarned).toBeDefined();
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required achievement fields', async () => {
      const achievement = new Achievement({});
      const validationError = await achievement.validateSync();
      
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.category).toBeDefined();
      expect(validationError?.errors.criteria).toBeDefined();
      expect(validationError?.errors.icon).toBeDefined();
      expect(validationError?.errors.points).toBeDefined();
    });

    it('should reject invalid achievement values', async () => {
      const achievement = new Achievement({
        ...testAchievement,
        name: 'a'.repeat(101),
        description: 'a'.repeat(501),
        points: -1,
        category: 'invalid'
      });

      const validationError = await achievement.validateSync();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.points).toBeDefined();
      expect(validationError?.errors.category).toBeDefined();
    });

    it('should reject invalid user achievement values', async () => {
      const userAchievement = new UserAchievement({
        ...testUserAchievement,
        progress: -1
      });

      const validationError = await userAchievement.validateSync();
      expect(validationError?.errors.progress).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate user achievements', async () => {
      await UserAchievement.create(testUserAchievement);
      await expect(UserAchievement.create(testUserAchievement))
        .rejects
        .toThrow();
    });

    it('should handle progress boundary values', async () => {
      const userAchievement = await UserAchievement.create({
        ...testUserAchievement,
        progress: 0
      });

      // Test minimum value
      expect(userAchievement.progress).toBe(0);

      // Test maximum value
      userAchievement.progress = 100;
      await userAchievement.save();
      expect(userAchievement.progress).toBe(100);

      // Test invalid values
      userAchievement.progress = 101;
      const validationError = await userAchievement.validateSync();
      expect(validationError?.errors.progress).toBeDefined();
    });

    it('should handle achievement completion edge cases', async () => {
      const achievement = await Achievement.create({
        ...testAchievement,
        progress: 9,
        target: 10
      });

      // Test near completion
      expect(achievement.completed).toBe(false);

      // Test exact completion
      achievement.progress = achievement.target;
      achievement.completed = true;
      achievement.completedAt = new Date();
      await achievement.save();
      expect(achievement.completed).toBe(true);
      expect(achievement.completedAt).toBeDefined();
    });
  });
}); 