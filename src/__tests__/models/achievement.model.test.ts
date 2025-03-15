import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Achievement, UserAchievement, IAchievement, IUserAchievement } from '../../models/achievement.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Achievement.deleteMany({});
  await UserAchievement.deleteMany({});
});

describe('Achievement Model', () => {
  const validAchievementData = {
    name: 'Meditation Master',
    description: 'Complete 10 meditation sessions',
    category: 'milestone',
    criteria: {
      type: 'sessionCount',
      value: 10
    },
    icon: 'meditation-icon.png',
    points: 100
  };

  describe('Schema Validation', () => {
    it('should create a valid achievement', async () => {
      const achievement = new Achievement(validAchievementData);
      const savedAchievement = await achievement.save();
      
      expect(savedAchievement._id).toBeDefined();
      expect(savedAchievement.name).toBe(validAchievementData.name);
      expect(savedAchievement.description).toBe(validAchievementData.description);
      expect(savedAchievement.category).toBe(validAchievementData.category);
      expect(savedAchievement.criteria.type).toBe(validAchievementData.criteria.type);
      expect(savedAchievement.criteria.value).toBe(validAchievementData.criteria.value);
      expect(savedAchievement.icon).toBe(validAchievementData.icon);
      expect(savedAchievement.points).toBe(validAchievementData.points);
      expect(savedAchievement.createdAt).toBeDefined();
      expect(savedAchievement.updatedAt).toBeDefined();
    });

    it('should fail validation when required fields are missing', async () => {
      const achievement = new Achievement({});
      
      let error: any;
      try {
        await achievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.description).toBeDefined();
      expect(error.errors.category).toBeDefined();
      expect(error.errors['criteria.type']).toBeDefined();
      expect(error.errors['criteria.value']).toBeDefined();
      expect(error.errors.icon).toBeDefined();
      expect(error.errors.points).toBeDefined();
    });

    it('should fail validation when category is invalid', async () => {
      const achievement = new Achievement({
        ...validAchievementData,
        category: 'invalid-category'
      });
      
      let error: any;
      try {
        await achievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
      expect(error.errors.category.message).toContain('Achievement category must be one of');
    });

    it('should fail validation when points are negative', async () => {
      const achievement = new Achievement({
        ...validAchievementData,
        points: -10
      });
      
      let error: any;
      try {
        await achievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.points).toBeDefined();
      expect(error.errors.points.message).toBe('Achievement points cannot be negative');
    });

    it('should fail validation when name exceeds maximum length', async () => {
      const achievement = new Achievement({
        ...validAchievementData,
        name: 'A'.repeat(101)
      });
      
      let error: any;
      try {
        await achievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toBe('Achievement name cannot be more than 100 characters');
    });

    it('should fail validation when description exceeds maximum length', async () => {
      const achievement = new Achievement({
        ...validAchievementData,
        description: 'A'.repeat(501)
      });
      
      let error: any;
      try {
        await achievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.description).toBeDefined();
      expect(error.errors.description.message).toBe('Achievement description cannot be more than 500 characters');
    });
  });
});

describe('UserAchievement Model', () => {
  let testAchievement: IAchievement;
  const userId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    testAchievement = await new Achievement({
      name: 'Meditation Master',
      description: 'Complete 10 meditation sessions',
      category: 'milestone',
      criteria: {
        type: 'sessionCount',
        value: 10
      },
      icon: 'meditation-icon.png',
      points: 100
    }).save();
  });

  const validUserAchievementData = () => ({
    userId,
    achievementId: testAchievement._id,
    progress: 50,
    isCompleted: false
  });

  describe('Schema Validation', () => {
    it('should create a valid user achievement', async () => {
      const data = validUserAchievementData();
      const userAchievement = new UserAchievement(data);
      const savedUserAchievement = await userAchievement.save();
      
      expect(savedUserAchievement._id).toBeDefined();
      expect(savedUserAchievement.userId.toString()).toBe(data.userId.toString());
      expect(savedUserAchievement.achievementId.toString()).toBe(data.achievementId.toString());
      expect(savedUserAchievement.progress).toBe(data.progress);
      expect(savedUserAchievement.isCompleted).toBe(data.isCompleted);
      expect(savedUserAchievement.dateEarned).toBeNull();
      expect(savedUserAchievement.createdAt).toBeDefined();
      expect(savedUserAchievement.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const userAchievement = new UserAchievement({
        userId,
        achievementId: testAchievement._id,
        progress: 50
      });
      const savedUserAchievement = await userAchievement.save();
      
      expect(savedUserAchievement.isCompleted).toBe(false);
      expect(savedUserAchievement.dateEarned).toBeNull();
    });

    it('should fail validation when required fields are missing', async () => {
      const userAchievement = new UserAchievement({});
      
      let error: any;
      try {
        await userAchievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.achievementId).toBeDefined();
      expect(error.errors.progress).toBeDefined();
    });

    it('should fail validation when progress is negative', async () => {
      const userAchievement = new UserAchievement({
        ...validUserAchievementData(),
        progress: -10
      });
      
      let error: any;
      try {
        await userAchievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.progress).toBeDefined();
      expect(error.errors.progress.message).toBe('Achievement progress cannot be negative');
    });

    it('should fail validation when progress exceeds 100', async () => {
      const userAchievement = new UserAchievement({
        ...validUserAchievementData(),
        progress: 110
      });
      
      let error: any;
      try {
        await userAchievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.progress).toBeDefined();
      expect(error.errors.progress.message).toBe('Achievement progress cannot exceed 100');
    });

    it('should enforce unique constraint on userId and achievementId', async () => {
      // Create first user achievement
      await new UserAchievement(validUserAchievementData()).save();
      
      // Try to create another with the same userId and achievementId
      const duplicateUserAchievement = new UserAchievement(validUserAchievementData());
      
      let error: any;
      try {
        await duplicateUserAchievement.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    });

    it('should update dateEarned when isCompleted is set to true', async () => {
      const userAchievement = await new UserAchievement({
        ...validUserAchievementData(),
        isCompleted: true,
        dateEarned: new Date()
      }).save();
      
      expect(userAchievement.isCompleted).toBe(true);
      expect(userAchievement.dateEarned).toBeDefined();
      expect(userAchievement.dateEarned).not.toBeNull();
    });
  });
}); 