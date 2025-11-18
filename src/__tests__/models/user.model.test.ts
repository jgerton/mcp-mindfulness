import mongoose from 'mongoose';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { User } from '../../models/user.model';
import bcrypt from 'bcryptjs';
import { UserTestFactory } from '../factories/user.factory';

describe('User Model Test Suite', () => {
  let userFactory: UserTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    userFactory = new UserTestFactory();
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create a valid user', async () => {
      const testData = userFactory.create();
      const user = await User.create(testData);
      
      expect(user._id).toBeDefined();
      expect(user.email).toBe(testData.email);
      expect(user.isActive).toBe(true);
    });

    it('should create user without optional fields', async () => {
      const testData = userFactory.withoutOptionalFields();
      const user = await User.create(testData);
      
      expect(user._id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.name).toBeUndefined();
      expect(user.preferences).toBeUndefined();
    });

    it('should handle custom preferences', async () => {
      const preferences = {
        stressManagement: {
          preferredCategories: ['pmr', 'breathing'],
          preferredDuration: 20,
          difficultyLevel: 'advanced'
        }
      };
      const user = await User.create(userFactory.withPreferences(preferences));
      expect(user.preferences.stressManagement).toEqual(preferences.stressManagement);
    });
  });

  describe('Error Cases', () => {
    it('should fail validation when required fields are missing', async () => {
      const user = new User({});
      const validationError = await user.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.email).toBeDefined();
      expect(validationError?.errors.password).toBeDefined();
    });

    it('should fail validation with invalid email format', async () => {
      const user = new User(userFactory.withInvalidEmail());
      const validationError = await user.validateSync();
      expect(validationError?.errors.email).toBeDefined();
    });

    it('should fail validation with invalid password', async () => {
      const user = new User(userFactory.withInvalidPassword());
      const validationError = await user.validateSync();
      expect(validationError?.errors.password).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const testData = userFactory.create();
      await User.create(testData);
      await expect(User.create(testData)).rejects.toThrow(mongoose.Error.MongoServerError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty optional fields', async () => {
      const user = await User.create(userFactory.withoutOptionalFields());
      expect(user.name).toBeUndefined();
      expect(user.preferences).toBeUndefined();
    });

    it('should handle maximum length email', async () => {
      const longEmail = 'a'.repeat(240) + '@example.com'; // Most email servers limit to 254 chars
      const user = await User.create(userFactory.create({ email: longEmail }));
      expect(user.email).toBe(longEmail);
    });

    it('should handle concurrent saves', async () => {
      const users = userFactory.batch(5).map(data => new User(data));
      await expect(Promise.all(users.map(u => u.save()))).resolves.toBeDefined();
    });

    it('should handle special characters in password', async () => {
      const specialPasswords = [
        'Pass!@#$%^&*()',
        'Pass~`-_=+[{]}\\|;:\'",<.>/?',
        'Pass™®©€£¥¢₹'
      ];

      for (const password of specialPasswords) {
        const user = await User.create(userFactory.withCustomPassword(password));
        expect(await user.comparePassword(password)).toBe(true);
      }
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'TestPassword123!';
      const user = await User.create(userFactory.withCustomPassword(password));

      expect(user.password).not.toBe(password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      const user = await User.create(userFactory.create());
      
      hashSpy.mockClear();
      user.email = 'new@example.com';
      await user.save();
      
      expect(hashSpy).not.toHaveBeenCalled();
      hashSpy.mockRestore();
    });

    it('should verify password correctly', async () => {
      const password = 'TestPassword123!';
      const user = await User.create(userFactory.withCustomPassword(password));
      expect(await user.comparePassword(password)).toBe(true);
      expect(await user.comparePassword('wrongpassword')).toBe(false);
    });
  });

  describe('Data Integrity', () => {
    it('should convert email to lowercase', async () => {
      const mixedCaseEmail = 'Test.User@Example.COM';
      const user = await User.create(userFactory.create({ email: mixedCaseEmail }));
      expect(user.email).toBe(mixedCaseEmail.toLowerCase());
    });

    it('should set default preferences', async () => {
      const user = await User.create(userFactory.create());
      expect(user.preferences).toEqual({
        stressManagement: {
          preferredCategories: ['breathing', 'meditation'],
          preferredDuration: 10,
          difficultyLevel: 'beginner'
        }
      });
    });

    it('should set isActive to true by default', async () => {
      const user = await User.create(userFactory.create());
      expect(user.isActive).toBe(true);
    });

    it('should handle inactive users', async () => {
      const user = await User.create(userFactory.inactive());
      expect(user.isActive).toBe(false);
    });

    it('should update timestamps on modification', async () => {
      const user = await User.create(userFactory.create());
      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      user.email = 'updated@example.com';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
}); 