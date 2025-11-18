import mongoose from 'mongoose';
import { Achievement, UserAchievement, IAchievement, IUserAchievement } from '../../models/achievement.model';

// Valid achievement categories to prevent schema validation errors
export type AchievementCategory = 'meditation' | 'streak' | 'social' | 'milestone' | 'challenge' | 'wellness';

/**
 * Creates a test achievement with provided options or defaults
 */
export const createTestAchievement = async (
  options: Partial<IAchievement> = {}
): Promise<IAchievement> => {
  const defaultOptions = {
    name: 'Test Achievement',
    description: 'A test achievement for testing purposes',
    category: 'milestone' as AchievementCategory, // Valid category from the enum
    criteria: {
      type: 'session_count',
      value: 5
    },
    icon: 'test_icon.png',
    points: 10
  };

  try {
    const achievementData = { ...defaultOptions, ...options };
    
    // Validate category to prevent schema validation errors
    if (!['meditation', 'streak', 'social', 'milestone', 'challenge', 'wellness'].includes(achievementData.category as string)) {
      console.warn(`Warning: Invalid category '${achievementData.category}'. Defaulting to 'milestone'.`);
      achievementData.category = 'milestone';
    }
    
    const achievement = new Achievement(achievementData);
    await achievement.save();
    return achievement as IAchievement;
  } catch (error) {
    console.error('Error creating test achievement:', error);
    throw error;
  }
};

/**
 * Creates a test user achievement record with provided options or defaults
 */
export const createTestUserAchievement = async (
  userId: string,
  achievementId?: string,
  options: Partial<IUserAchievement> = {}
): Promise<IUserAchievement> => {
  try {
    // If no achievementId is provided, create a test achievement
    if (!achievementId) {
      const achievement = await createTestAchievement();
      achievementId = (achievement as any)._id.toString();
    }

    const defaultOptions = {
      progress: 50,
      isCompleted: false
    };

    const userAchievementData = {
      userId: new mongoose.Types.ObjectId(userId),
      achievementId: new mongoose.Types.ObjectId(achievementId),
      ...defaultOptions,
      ...options
    };

    const userAchievement = new UserAchievement(userAchievementData);
    await userAchievement.save();
    return userAchievement as IUserAchievement;
  } catch (error) {
    console.error('Error creating test user achievement:', error);
    throw error;
  }
};

/**
 * Creates multiple test achievements at once
 */
export const createTestAchievements = async (
  count: number,
  baseOptions: Partial<IAchievement> = {}
): Promise<IAchievement[]> => {
  const achievements: IAchievement[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const achievement = await createTestAchievement({
        name: `Test Achievement ${i + 1}`,
        ...baseOptions
      });
      achievements.push(achievement);
      
      // Add small delay to prevent overwhelming the database
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    return achievements;
  } catch (error) {
    console.error('Error creating multiple test achievements:', error);
    throw error;
  }
};

/**
 * Creates multiple user achievements for a single user
 */
export const createTestUserAchievements = async (
  userId: string,
  count: number,
  baseOptions: Partial<IUserAchievement> = {}
): Promise<IUserAchievement[]> => {
  try {
    // First create the achievements
    const achievements = await createTestAchievements(count);
    
    // Then create user achievements for each
    const userAchievements: IUserAchievement[] = [];
    for (let i = 0; i < achievements.length; i++) {
      const userAchievement = await createTestUserAchievement(
        userId,
        (achievements[i] as any)._id.toString(),
        { ...baseOptions }
      );
      userAchievements.push(userAchievement);
      
      // Add small delay to prevent overwhelming the database
      if (i < achievements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return userAchievements;
  } catch (error) {
    console.error('Error creating multiple user achievements:', error);
    throw error;
  }
};

/**
 * Clears all achievement-related data from the test database
 */
export const clearAchievementData = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Achievement.deleteMany({});
      await UserAchievement.deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing achievement data:', error);
  }
};

/**
 * Set up achievement test helpers for beforeEach/afterEach hooks
 */
export const setupAchievementTests = () => {
  // Clear achievement data after each test
  afterEach(async () => {
    await clearAchievementData();
  });
}; 