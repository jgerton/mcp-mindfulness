import mongoose from 'mongoose';
import { UserService, UserPreferences } from '../../services/user.service';
import { User } from '../../models/user.model';
import { dbHandler } from '../test-utils/db-handler';
import { UserModel } from '../../models/user.model';
import { UserPreferencesModel } from '../../models/user-preferences.model';
import { ErrorCodes } from '../../utils/error-codes';

// Mock console.error to avoid cluttering test output
jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('../../models/user.model');

/**
 * @group service
 * @group user
 */
describe('UserService', () => {
  let testUser: any;
  const testUserId = new mongoose.Types.ObjectId();

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    preferences: {
      techniques: ['breathing', 'meditation'],
      duration: 15,
      time: 'evening',
      notificationFrequency: 'daily'
    }
  };

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    testUser = await User.create({
      _id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        techniques: ['meditation', 'breathing'],
        duration: 15,
        time: 'morning',
        notificationFrequency: 'daily'
      }
    });

    jest.spyOn(UserModel, 'findById').mockResolvedValue(testUser);
    jest.spyOn(UserPreferencesModel, 'findOne').mockResolvedValue(testUser.preferences);
  });

  describe('Success Cases', () => {
    it('should get user by ID', async () => {
      const result = await UserService.getUserById(testUserId.toString());
      expect(result).toBeDefined();
      expect(result).toEqual(testUser);
    });

    it('should get user preferences', async () => {
      const preferences = await UserService.getUserPreferences(testUserId.toString());
      expect(preferences).toBeDefined();
      expect(preferences).toEqual({
        userId: testUserId.toString(),
        preferredTechniques: ['meditation', 'breathing'],
        preferredDuration: 15,
        preferredTime: 'morning',
        notificationFrequency: 'daily'
      });
    });
  });

  describe('Error Cases', () => {
    it('should throw error for invalid user ID format', () => {
      expect(() => mongoose.Types.ObjectId('invalid-id')).toThrow();
    });

    it('should reject for undefined user ID', async () => {
      await expect(UserService.getUserById(undefined)).rejects.toThrow();
    });

    it('should reject for invalid preferences update', async () => {
      await expect(UserService.updateUserPreferences('invalid-id', null)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for empty user ID', () => {
      expect(() => mongoose.Types.ObjectId('')).toThrow();
    });

    it('should handle non-existent user', async () => {
      jest.spyOn(UserModel, 'findById').mockResolvedValue(null);
      const result = await UserService.getUserById(new mongoose.Types.ObjectId().toString());
      expect(result).toBeNull();
    });

    it('should handle empty preferences update', async () => {
      jest.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(testUser);
      const result = await UserService.updateUserPreferences(testUserId.toString(), {});
      expect(result.preferences).toEqual(testUser.preferences);
    });
  });

  describe('getUserPreferences', () => {
    describe('Success Cases', () => {
      /**
       * @test-type success
       */
      it('should return user preferences when user exists', async () => {
        const preferences = await UserService.getUserPreferences(testUserId.toString());
        expect(preferences).toBeDefined();
        expect(preferences).toEqual({
          userId: testUserId.toString(),
          preferredTechniques: ['meditation', 'breathing'],
          preferredDuration: 15,
          preferredTime: 'morning',
          notificationFrequency: 'daily'
        });
      });

      it('should return user preferences', async () => {
        const mockPreferences = { theme: 'dark', notifications: true };
        jest.spyOn(UserPreferencesModel, 'findOne').mockResolvedValue(mockPreferences);
        
        const userId = new mongoose.Types.ObjectId().toString();
        const result = await UserService.getUserPreferences(userId);
        expect(result).toEqual(mockPreferences);
      });
    });

    describe('Error Cases', () => {
      /**
       * @test-type error
       */
      it('should return null for non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const preferences = await UserService.getUserPreferences(nonExistentId.toString());
        expect(preferences).toBeNull();
        expect(console.error).not.toHaveBeenCalled();
      });

      /**
       * @test-type error
       */
      it('should throw error for invalid user ID format', () => {
        expect(() => UserService.getUserPreferences('invalid-id')).toThrow();
      });
    });

    describe('Edge Cases', () => {
      /**
       * @test-type edge
       */
      it('should return default preferences for new user', async () => {
        jest.spyOn(UserPreferencesModel, 'findOne').mockResolvedValue(null);
        
        const userId = new mongoose.Types.ObjectId().toString();
        const result = await UserService.getUserPreferences(userId);
        expect(result).toEqual({ theme: 'light', notifications: true });
      });

      /**
       * @test-type edge
       */
      it('should return default values for user without preferences', async () => {
        await User.findByIdAndUpdate(testUserId, { $unset: { preferences: 1 } });
        const preferences = await UserService.getUserPreferences(testUserId.toString());
        expect(preferences).toEqual({
          userId: testUserId.toString(),
          preferredTechniques: [],
          preferredDuration: 10,
          preferredTime: 'morning',
          notificationFrequency: 'daily'
        });
      });

      /**
       * @test-type edge
       */
      it('should handle null preferences fields', async () => {
        await User.findByIdAndUpdate(testUserId, {
          preferences: {
            techniques: null,
            duration: null,
            time: null,
            notificationFrequency: null
          }
        });
        const preferences = await UserService.getUserPreferences(testUserId.toString());
        expect(preferences).toEqual({
          userId: testUserId.toString(),
          preferredTechniques: [],
          preferredDuration: 10,
          preferredTime: 'morning',
          notificationFrequency: 'daily'
        });
      });
    });
  });

  describe('updateUserPreferences', () => {
    describe('Success Cases', () => {
      /**
       * @test-type success
       */
      it('should update specific preference fields', async () => {
        const updates: Partial<UserPreferences> = {
          preferredDuration: 20,
          notificationFrequency: 'weekly'
        };

        const updatedUser = await UserService.updateUserPreferences(testUserId.toString(), updates);
        expect(updatedUser.preferences.duration).toBe(20);
        expect(updatedUser.preferences.notificationFrequency).toBe('weekly');
        // Verify other fields remain unchanged
        expect(updatedUser.preferences.techniques).toEqual(['meditation', 'breathing']);
        expect(updatedUser.preferences.time).toBe('morning');
      });

      it('should update user preferences', async () => {
        const mockPreferences = { theme: 'dark', notifications: false };
        jest.spyOn(UserPreferencesModel, 'findOneAndUpdate').mockResolvedValue(mockPreferences);
        
        const userId = new mongoose.Types.ObjectId().toString();
        const result = await UserService.updateUserPreferences(userId, mockPreferences);
        expect(result).toEqual(mockPreferences);
      });
    });

    describe('Error Cases', () => {
      /**
       * @test-type error
       */
      it('should return null for non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const updates: Partial<UserPreferences> = {
          preferredDuration: 20
        };
        const updatedUser = await UserService.updateUserPreferences(nonExistentId.toString(), updates);
        expect(updatedUser).toBeNull();
        expect(console.error).not.toHaveBeenCalled();
      });

      /**
       * @test-type error
       */
      it('should throw error for invalid user ID format', () => {
        expect(() => UserService.updateUserPreferences('invalid-id', { preferredDuration: 20 })).toThrow();
      });

      it('should throw error for invalid preferences', () => {
        expect(() => UserService.updateUserPreferences('user-id', null)).toThrow();
      });
    });

    describe('Edge Cases', () => {
      /**
       * @test-type edge
       */
      it('should handle empty update object', async () => {
        const updatedUser = await UserService.updateUserPreferences(testUserId.toString(), {});
        expect(updatedUser.preferences).toEqual(testUser.preferences);
      });

      /**
       * @test-type edge
       */
      it('should handle invalid preference values', async () => {
        const updates = {
          preferredDuration: -1, // Invalid duration
          notificationFrequency: 'invalid' as any // Invalid frequency
        };
        
        const updatedUser = await UserService.updateUserPreferences(testUserId.toString(), updates);
        expect(updatedUser.preferences.duration).toBe(-1); // Service doesn't validate values
        expect(updatedUser.preferences.notificationFrequency).toBe('invalid');
      });

      /**
       * @test-type edge
       */
      it('should handle undefined user ID', async () => {
        try {
          await UserService.updateUserPreferences(undefined as any, { preferredDuration: 20 });
          fail('Expected error to be thrown');
        } catch (error) {
          expect(error).toBeDefined();
          expect(console.error).toHaveBeenCalled();
        }
      });

      it('should create preferences if not exist', async () => {
        const mockPreferences = { theme: 'dark', notifications: false };
        jest.spyOn(UserPreferencesModel, 'findOneAndUpdate').mockResolvedValue(mockPreferences);
        
        const userId = new mongoose.Types.ObjectId().toString();
        const result = await UserService.updateUserPreferences(userId, mockPreferences);
        expect(result).toEqual(mockPreferences);
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(mockUser)
      }));

      const result = await UserService.getUserById(mockUserId);
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith(new mongoose.Types.ObjectId(mockUserId));
    });

    it('should return null for non-existent user', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(null)
      }));

      const result = await UserService.getUserById(mockUserId);
      expect(result).toBeNull();
    });

    it('should throw error for invalid user ID', async () => {
      const invalidId = 'invalid-id';
      await expect(UserService.getUserById(invalidId)).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.reject(new Error('Database error'))
      }));

      await expect(UserService.getUserById(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when user exists', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(mockUser)
      }));

      const result = await UserService.getUserPreferences(mockUserId);
      expect(result).toEqual({
        userId: mockUserId,
        preferredTechniques: mockUser.preferences.techniques,
        preferredDuration: mockUser.preferences.duration,
        preferredTime: mockUser.preferences.time,
        notificationFrequency: mockUser.preferences.notificationFrequency
      });
    });

    it('should return default preferences for user without preferences', async () => {
      const userWithoutPrefs = { ...mockUser, preferences: undefined };
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(userWithoutPrefs)
      }));

      const result = await UserService.getUserPreferences(mockUserId);
      expect(result).toEqual({
        userId: mockUserId,
        preferredTechniques: [],
        preferredDuration: 10,
        preferredTime: 'morning',
        notificationFrequency: 'daily'
      });
    });

    it('should return null for non-existent user', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(null)
      }));

      const result = await UserService.getUserPreferences(mockUserId);
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      (User.findById as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.reject(new Error('Database error'))
      }));

      await expect(UserService.getUserPreferences(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('updateUserPreferences', () => {
    const mockPreferences = {
      preferredTechniques: ['meditation', 'breathing'],
      preferredDuration: 20,
      preferredTime: 'morning',
      notificationFrequency: 'weekly'
    };

    it('should update all preferences successfully', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve({
          ...mockUser,
          preferences: {
            techniques: mockPreferences.preferredTechniques,
            duration: mockPreferences.preferredDuration,
            time: mockPreferences.preferredTime,
            notificationFrequency: mockPreferences.notificationFrequency
          }
        })
      }));

      const result = await UserService.updateUserPreferences(mockUserId, mockPreferences);
      expect(result.preferences).toEqual({
        techniques: mockPreferences.preferredTechniques,
        duration: mockPreferences.preferredDuration,
        time: mockPreferences.preferredTime,
        notificationFrequency: mockPreferences.notificationFrequency
      });
    });

    it('should update partial preferences successfully', async () => {
      const partialPrefs = {
        preferredDuration: 25,
        preferredTime: 'evening'
      };

      (User.findByIdAndUpdate as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve({
          ...mockUser,
          preferences: {
            ...mockUser.preferences,
            duration: partialPrefs.preferredDuration,
            time: partialPrefs.preferredTime
          }
        })
      }));

      const result = await UserService.updateUserPreferences(mockUserId, partialPrefs);
      expect(result.preferences.duration).toBe(partialPrefs.preferredDuration);
      expect(result.preferences.time).toBe(partialPrefs.preferredTime);
      expect(result.preferences.techniques).toEqual(mockUser.preferences.techniques);
    });

    it('should handle non-existent user', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.resolve(null)
      }));

      const result = await UserService.updateUserPreferences(mockUserId, mockPreferences);
      expect(result).toBeNull();
    });

    it('should handle invalid user ID', async () => {
      const invalidId = 'invalid-id';
      await expect(UserService.updateUserPreferences(invalidId, mockPreferences)).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockImplementation(() => ({
        lean: () => Promise.reject(new Error('Database error'))
      }));

      await expect(UserService.updateUserPreferences(mockUserId, mockPreferences)).rejects.toThrow('Database error');
    });

    it('should validate preference values', async () => {
      const invalidPrefs = {
        preferredDuration: -5, // Invalid duration
        notificationFrequency: 'invalid' // Invalid frequency
      };

      await expect(UserService.updateUserPreferences(mockUserId, invalidPrefs)).rejects.toThrow();
    });
  });
}); 