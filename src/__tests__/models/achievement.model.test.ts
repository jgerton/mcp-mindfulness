import mongoose from 'mongoose';
import { 
  Achievement, 
  UserAchievement, 
  IAchievement, 
  IUserAchievement,
  AchievementCategory,
  AchievementType
} from '../../models/achievement.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { AchievementTestFactory, UserAchievementTestFactory } from '../factories/achievement.factory';

describe('Achievement Models', () => {
  let achievementFactory: AchievementTestFactory;
  let userAchievementFactory: UserAchievementTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
    achievementFactory = new AchievementTestFactory();
    userAchievementFactory = new UserAchievementTestFactory();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Achievement Model', () => {
    describe('Schema Validation', () => {
      it('should create a valid achievement', async () => {
        const achievement = achievementFactory.create();
        const savedAchievement = await Achievement.create(achievement);
        expect(savedAchievement._id).toBeDefined();
        expect(savedAchievement.name).toBe(achievement.name);
        expect(savedAchievement.category).toBe(achievement.category);
      });

      it('should require name', async () => {
        const achievement = achievementFactory.create({ name: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should require description', async () => {
        const achievement = achievementFactory.create({ description: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should require category', async () => {
        const achievement = achievementFactory.create({ category: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should validate category enum values', async () => {
        const achievement = achievementFactory.create({ category: 'invalid' as any });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should require criteria', async () => {
        const achievement = achievementFactory.create({ criteria: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should require icon', async () => {
        const achievement = achievementFactory.create({ icon: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should require points', async () => {
        const achievement = achievementFactory.create({ points: undefined });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should validate points minimum value', async () => {
        const achievement = achievementFactory.create({ points: -1 });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should validate name length', async () => {
        const achievement = achievementFactory.create({ name: 'a'.repeat(101) });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });

      it('should validate description length', async () => {
        const achievement = achievementFactory.create({ description: 'a'.repeat(501) });
        await expect(Achievement.create(achievement)).rejects.toThrow();
      });
    });

    describe('Achievement Types', () => {
      it('should create meditation achievement', async () => {
        const achievement = await Achievement.create(achievementFactory.meditation());
        expect(achievement.category).toBe(AchievementCategory.MEDITATION);
        expect(achievement.type).toBe(AchievementType.DURATION);
      });

      it('should create streak achievement', async () => {
        const achievement = await Achievement.create(achievementFactory.streak());
        expect(achievement.category).toBe(AchievementCategory.CONSISTENCY);
        expect(achievement.type).toBe(AchievementType.STREAK);
      });
    });

    describe('Progress Tracking', () => {
      it('should track progress correctly', async () => {
        const achievement = await Achievement.create(achievementFactory.inProgress(50));
        expect(achievement.progress).toBe(50);
        expect(achievement.completed).toBe(false);
      });

      it('should mark as completed when progress reaches target', async () => {
        const achievement = await Achievement.create(achievementFactory.completed());
        expect(achievement.completed).toBe(true);
        expect(achievement.completedAt).toBeDefined();
      });
    });

    describe('Indexes', () => {
      it('should have type index', async () => {
        const indexes = await Achievement.collection.getIndexes();
        const hasTypeIndex = Object.values(indexes).some(
          (index: any) => index.key.type === 1
        );
        expect(hasTypeIndex).toBe(true);
      });

      it('should have userId index', async () => {
        const indexes = await Achievement.collection.getIndexes();
        const hasUserIdIndex = Object.values(indexes).some(
          (index: any) => index.key.userId === 1
        );
        expect(hasUserIdIndex).toBe(true);
      });
    });
  });

  describe('UserAchievement Model', () => {
    describe('Schema Validation', () => {
      it('should create a valid user achievement', async () => {
        const userAchievement = userAchievementFactory.create();
        const savedUserAchievement = await UserAchievement.create(userAchievement);
        expect(savedUserAchievement._id).toBeDefined();
        expect(savedUserAchievement.userId).toEqual(userAchievement.userId);
        expect(savedUserAchievement.achievementId).toEqual(userAchievement.achievementId);
      });

      it('should require userId', async () => {
        const userAchievement = userAchievementFactory.create({ userId: undefined });
        await expect(UserAchievement.create(userAchievement)).rejects.toThrow();
      });

      it('should require achievementId', async () => {
        const userAchievement = userAchievementFactory.create({ achievementId: undefined });
        await expect(UserAchievement.create(userAchievement)).rejects.toThrow();
      });

      it('should require progress', async () => {
        const userAchievement = userAchievementFactory.create({ progress: undefined });
        await expect(UserAchievement.create(userAchievement)).rejects.toThrow();
      });

      it('should validate progress range', async () => {
        const userAchievement = userAchievementFactory.create({ progress: 101 });
        await expect(UserAchievement.create(userAchievement)).rejects.toThrow();
      });
    });

    describe('Progress Tracking', () => {
      it('should track progress correctly', async () => {
        const userAchievement = await UserAchievement.create(userAchievementFactory.inProgress(75));
        expect(userAchievement.progress).toBe(75);
        expect(userAchievement.isCompleted).toBe(false);
      });

      it('should mark as completed with earned date', async () => {
        const userAchievement = await UserAchievement.create(userAchievementFactory.completed());
        expect(userAchievement.isCompleted).toBe(true);
        expect(userAchievement.dateEarned).toBeDefined();
      });
    });

    describe('User Association', () => {
      it('should associate with user', async () => {
        const userId = new mongoose.Types.ObjectId();
        const userAchievement = await UserAchievement.create(userAchievementFactory.forUser(userId));
        expect(userAchievement.userId).toEqual(userId);
      });

      it('should associate with achievement', async () => {
        const achievementId = new mongoose.Types.ObjectId();
        const userAchievement = await UserAchievement.create(
          userAchievementFactory.forAchievement(achievementId)
        );
        expect(userAchievement.achievementId).toEqual(achievementId);
      });
    });

    describe('Indexes', () => {
      it('should have unique compound index on userId and achievementId', async () => {
        const indexes = await UserAchievement.collection.getIndexes();
        const hasUniqueIndex = Object.values(indexes).some(
          (index: any) => 
            index.key.userId === 1 && 
            index.key.achievementId === 1 && 
            index.unique === true
        );
        expect(hasUniqueIndex).toBe(true);
      });

      it('should have index on userId and isCompleted', async () => {
        const indexes = await UserAchievement.collection.getIndexes();
        const hasCompletedIndex = Object.values(indexes).some(
          (index: any) => 
            index.key.userId === 1 && 
            index.key.isCompleted === 1
        );
        expect(hasCompletedIndex).toBe(true);
      });

      it('should prevent duplicate user achievements', async () => {
        const userId = new mongoose.Types.ObjectId();
        const achievementId = new mongoose.Types.ObjectId();
        
        await UserAchievement.create(userAchievementFactory.create({
          userId,
          achievementId
        }));

        await expect(UserAchievement.create(userAchievementFactory.create({
          userId,
          achievementId
        }))).rejects.toThrow();
      });
    });
  });
});