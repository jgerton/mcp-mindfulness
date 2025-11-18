import mongoose from 'mongoose';
import { UserPreferences } from '../../models/stress.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface UserPreferencesInput {
  userId?: string;
  preferredTechniques?: string[];
  preferredDuration?: number;
  triggers?: string[];
  avoidedTechniques?: string[];
  timePreferences?: {
    preferredTime?: string[];
    reminderFrequency?: 'DAILY' | 'WEEKLY' | 'ON_HIGH_STRESS';
  };
}

const createTestPreferences = (overrides: UserPreferencesInput = {}): UserPreferencesInput => ({
  userId: new mongoose.Types.ObjectId().toString(),
  preferredTechniques: ['4-7-8', 'GUIDED', 'MINDFULNESS'],
  preferredDuration: 15,
  triggers: ['work', 'social'],
  avoidedTechniques: [],
  timePreferences: {
    preferredTime: ['morning', 'evening'],
    reminderFrequency: 'DAILY'
  },
  ...overrides
});

describe('UserPreferences Model', () => {
  beforeAll(async () => {
    await connectToTestDB();
    jest.spyOn(mongoose.Model.prototype, 'save').mockImplementation(function(this: any) {
      return Promise.resolve(this);
    });
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
    jest.restoreAllMocks();
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const preferences = new UserPreferences({});
      const validationError = await preferences.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
    });

    it('should enforce unique userId', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      await UserPreferences.create({ ...createTestPreferences(), userId });
      
      await expect(UserPreferences.create({ ...createTestPreferences(), userId }))
        .rejects.toThrow();
    });

    it('should validate preferredTechniques enum values', async () => {
      const invalidTechnique = 'INVALID_TECHNIQUE';
      const preferences = new UserPreferences({
        ...createTestPreferences(),
        preferredTechniques: [invalidTechnique]
      });

      const validationError = await preferences.validateSync();
      expect(validationError?.errors['preferredTechniques.0']).toBeDefined();
    });

    it('should accept valid technique values', async () => {
      const validTechniques = [
        '4-7-8', 'BOX_BREATHING', 'ALTERNATE_NOSTRIL',
        'GUIDED', 'MINDFULNESS', 'BODY_SCAN',
        'PROGRESSIVE_RELAXATION', 'STRETCHING', 'WALKING',
        'GROUNDING', 'VISUALIZATION', 'QUICK_BREATH'
      ];

      for (const technique of validTechniques) {
        const preferences = new UserPreferences({
          ...createTestPreferences(),
          preferredTechniques: [technique]
        });
        const validationError = await preferences.validateSync();
        expect(validationError?.errors['preferredTechniques.0']).toBeUndefined();
      }
    });

    it('should validate reminderFrequency enum values', async () => {
      const invalidFrequency = 'INVALID_FREQUENCY';
      const preferences = new UserPreferences({
        ...createTestPreferences(),
        timePreferences: {
          preferredTime: ['morning'],
          reminderFrequency: invalidFrequency as any
        }
      });

      const validationError = await preferences.validateSync();
      expect(validationError?.errors['timePreferences.reminderFrequency']).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should allow empty arrays for optional fields', async () => {
      const preferences = await UserPreferences.create({
        userId: new mongoose.Types.ObjectId().toString()
      });

      expect(preferences.preferredTechniques).toEqual([]);
      expect(preferences.triggers).toEqual([]);
      expect(preferences.avoidedTechniques).toEqual([]);
    });

    it('should allow undefined for optional fields', async () => {
      const preferences = await UserPreferences.create({
        userId: new mongoose.Types.ObjectId().toString()
      });

      expect(preferences.preferredDuration).toBeUndefined();
      expect(preferences.timePreferences).toBeUndefined();
    });
  });

  describe('Success Cases', () => {
    it('should create and save preferences successfully', async () => {
      const preferences = await UserPreferences.create(createTestPreferences());
      expect(preferences._id).toBeDefined();
      expect(preferences.userId).toBeDefined();
    });

    it('should update all fields correctly', async () => {
      const preferences = await UserPreferences.create(createTestPreferences());
      
      const updates = {
        preferredTechniques: ['BODY_SCAN', 'WALKING'],
        preferredDuration: 30,
        triggers: ['deadlines', 'meetings'],
        avoidedTechniques: ['GUIDED'],
        timePreferences: {
          preferredTime: ['afternoon'],
          reminderFrequency: 'WEEKLY' as const
        }
      };

      Object.assign(preferences, updates);
      await preferences.save();

      expect(preferences.preferredTechniques).toEqual(updates.preferredTechniques);
      expect(preferences.preferredDuration).toBe(updates.preferredDuration);
      expect(preferences.triggers).toEqual(updates.triggers);
      expect(preferences.avoidedTechniques).toEqual(updates.avoidedTechniques);
      expect(preferences.timePreferences).toEqual(updates.timePreferences);
    });
  });

  describe('Error Cases', () => {
    it('should fail validation when required fields are missing', async () => {
      const preferences = new UserPreferences({});
      await expect(preferences.validate()).rejects.toThrow();
    });

    it('should enforce unique userId', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      await UserPreferences.create({ ...createTestPreferences(), userId });
      
      await expect(UserPreferences.create({ ...createTestPreferences(), userId }))
        .rejects.toThrow();
    });

    it('should fail with invalid technique values', async () => {
      const invalidTechnique = 'INVALID_TECHNIQUE';
      const preferences = new UserPreferences({
        ...createTestPreferences(),
        preferredTechniques: [invalidTechnique]
      });

      await expect(preferences.validate()).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays for optional fields', async () => {
      const preferences = await UserPreferences.create({
        userId: new mongoose.Types.ObjectId().toString()
      });

      expect(preferences.preferredTechniques).toEqual([]);
      expect(preferences.triggers).toEqual([]);
      expect(preferences.avoidedTechniques).toEqual([]);
    });

    it('should handle undefined for optional fields', async () => {
      const preferences = await UserPreferences.create({
        userId: new mongoose.Types.ObjectId().toString()
      });

      expect(preferences.preferredDuration).toBeUndefined();
      expect(preferences.timePreferences).toBeUndefined();
    });

    it('should handle array updates', async () => {
      const preferences = await UserPreferences.create(createTestPreferences());
      
      // Add new items
      preferences.triggers?.push('meetings');
      await preferences.save();
      expect(preferences.triggers).toContain('meetings');

      // Remove items
      preferences.triggers = preferences.triggers?.filter(t => t !== 'work');
      await preferences.save();
      expect(preferences.triggers).not.toContain('work');
    });
  });

  describe('Indexes', () => {
    it('should have an index on userId', async () => {
      const indexes = await UserPreferences.collection.getIndexes();
      const hasUserIdIndex = Object.values(indexes).some(
        index => index.key.userId !== undefined
      );
      expect(hasUserIdIndex).toBe(true);
    });
  });
}); 