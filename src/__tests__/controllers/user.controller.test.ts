import { Request, Response, NextFunction } from 'express';
import { Model, Document, Types } from 'mongoose';
import { UserController } from '../../controllers/user.controller';
import { IUser } from '../../models/user.model';
import { HttpError } from '../../errors/http-error';
import { ErrorCodes } from '../../utils/error-codes';
import * as authUtils from '../../utils/auth';
import { mockRequest, mockResponse } from '../test-utils/express-mock';
import { mockUser, MockUserDocument } from '../factories/user.factory';
import { UserService } from '../../services/user.service';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedPassword')
}));

// Mock auth utils
const mockComparePasswords = jest.spyOn(authUtils, 'comparePasswords').mockImplementation(() => Promise.resolve(true));
const mockHashPassword = jest.spyOn(authUtils, 'hashPassword').mockImplementation(() => Promise.resolve('hashedPassword'));
const mockIsValidEmail = jest.spyOn(authUtils, 'isValidEmail').mockImplementation(() => true);

interface RequestUser {
  _id: string;
  username: string;
}

interface MockRequest extends Partial<Request> {
  user?: RequestUser;
  body: any;
  params?: any;
}

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

describe('UserController', () => {
  let userController: UserController;
  let mockUserModel: any;
  let mockDoc: any;
  let req: MockRequest;
  let res: MockResponse;
  let next: NextFunction;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockDoc = mockUser();
    mockUserModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn()
    };
    userController = new UserController(mockUserModel);
    req = {
      user: { 
        _id: mockDoc._id,
        username: mockDoc.username
      },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    mockComparePasswords.mockReset().mockResolvedValue(true);
    mockHashPassword.mockReset().mockResolvedValue('hashedPassword');
    mockIsValidEmail.mockReset().mockReturnValue(true);
    next = jest.fn();
    userService = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<UserService>;
  });

  describe('Core CRUD Operations', () => {
    describe('create', () => {
      describe('Success Cases', () => {
        it('should create a new user successfully', async () => {
          const userData = {
            username: 'Leta4',
            email: 'test@example.com',
            password: 'Password123!'
          };

          const mockDoc = mockUser({
            ...userData,
            password: 'hashedPassword'
          });

          mockUserModel.create.mockResolvedValue([mockDoc]);
          (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
          req.body = userData;

          await userController.create(req as Request, res as Response);

          expect(mockUserModel.create).toHaveBeenCalledWith([
            expect.objectContaining({
              username: userData.username,
              email: userData.email,
              password: expect.any(String)
            })
          ]);
          expect(res.status).toHaveBeenCalledWith(201);
          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            email: userData.email,
            username: userData.username
          }));
        });
      });

      describe('Error Cases', () => {
        it('should handle duplicate email', async () => {
          const mockDoc = mockUser({ username: 'existinguser' });
          req.body = { 
            email: mockDoc.email, 
            password: 'password123', 
            username: mockDoc.username 
          };
          mockUserModel.findOne.mockResolvedValue(mockDoc);

          await expect(userController.create(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.create(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 409,
              code: ErrorCodes.DUPLICATE_ERROR
            });
        });

        it('should validate required fields', async () => {
          req.body = { username: 'testuser' };

          await expect(userController.create(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.create(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 400,
              message: 'Email and password are required'
            });
        });

        it('should validate password length', async () => {
          req.body = { email: 'test@example.com', password: '123' };

          await expect(userController.create(req as Request, res as Response)).rejects.toThrow(HttpError);
          await expect(userController.create(req as Request, res as Response)).rejects.toMatchObject({
            statusCode: 400,
            message: 'Password must be at least 8 characters'
          });
        });
      });

      describe('Edge Cases', () => {
        it('should handle database errors during user creation', async () => {
          req.body = { email: 'test@example.com', password: 'password123', username: 'testuser' };
          mockUserModel.findOne.mockResolvedValue(null);
          mockUserModel.create.mockRejectedValue(new Error('Database error'));

          await expect(userController.create(req as Request, res as Response)).rejects.toThrow();
        });

        it('should handle password hashing errors', async () => {
          req.body = { email: 'test@example.com', password: 'password123', username: 'testuser' };
          mockUserModel.findOne.mockResolvedValue(null);
          (authUtils.hashPassword as jest.Mock).mockRejectedValue(new Error('Hashing error'));

          await expect(userController.create(req as Request, res as Response)).rejects.toThrow();
        });

        it('should handle empty request body', async () => {
          req.body = {};

          await expect(userController.create(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.create(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 400,
              message: 'Email and password are required'
            });
        });

        it('should handle invalid email format', async () => {
          req.body = {
            email: 'invalid-email',
            password: 'Password123!',
            username: 'testuser'
          };

          await expect(userController.create(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.create(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 400,
              code: ErrorCodes.VALIDATION_ERROR
            });
        });
      });
    });

    describe('getProfile', () => {
      describe('Success Cases', () => {
        it('should return user profile successfully', async () => {
          mockUserModel.findById.mockResolvedValue(mockDoc);
          
          await userController.getProfile(req as Request, res as Response);
          
          expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            username: mockDoc.username,
            email: mockDoc.email
          }));
        });
      });

      describe('Error Cases', () => {
        it('should handle unauthorized access', async () => {
          req.user = undefined;

          await expect(userController.getProfile(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.getProfile(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 401,
              message: 'Unauthorized'
            });
        });
      });

      describe('Edge Cases', () => {
        it('should handle non-existent user', async () => {
          const user = mockUser();
          req.user = { _id: user._id.toString(), username: user.username };
          mockUserModel.findById.mockResolvedValue(null);

          await expect(userController.getProfile(req as Request, res as Response))
            .rejects.toThrow(HttpError);
          await expect(userController.getProfile(req as Request, res as Response))
            .rejects.toMatchObject({
              statusCode: 404,
              message: 'User not found'
            });
        });
      });
    });
  });

  describe('Authentication Operations', () => {
    describe('login', () => {
      describe('Success Cases', () => {
        it('should login user successfully', async () => {
          const loginData = {
            email: 'test@example.com',
            password: 'password123'
          };
          req.body = loginData;
          const mockDocWithMethods = {
            ...mockDoc,
            password: 'hashedPassword',
            toObject: jest.fn().mockReturnValue({
              ...mockDoc,
              password: 'hashedPassword'
            })
          };
          mockUserModel.findOne.mockResolvedValue(mockDocWithMethods);
          (authUtils.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

          await userController.login(req as Request, res as Response);

          expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginData.email });
          expect(authUtils.comparePasswords).toHaveBeenCalledWith(loginData.password, mockDocWithMethods.password);
          expect(res.status).toHaveBeenCalledWith(200);
          const { password: _, ...expectedResponse } = mockDocWithMethods.toObject();
          expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });
      });

      describe('Error Cases', () => {
        it('should handle invalid credentials', async () => {
          const loginData = {
            email: 'test@example.com',
            password: 'wrongpassword'
          };
          req.body = loginData;
          const mockDocWithMethods = {
            ...mockDoc,
            password: 'hashedPassword',
            toObject: jest.fn().mockReturnValue({
              ...mockDoc,
              password: 'hashedPassword'
            })
          };
          mockUserModel.findOne.mockResolvedValue(mockDocWithMethods);
          (authUtils.comparePasswords as jest.Mock).mockResolvedValueOnce(false);

          await expect(userController.login(req as Request, res as Response))
            .rejects.toThrow(HttpError);
        });
      });

      describe('Edge Cases', () => {
        it('should handle password comparison errors', async () => {
          const loginData = {
            email: mockDoc.email,
            password: 'password123'
          };
          req.body = loginData;
          mockUserModel.findOne.mockResolvedValue(mockDoc);
          (authUtils.comparePasswords as jest.Mock).mockRejectedValueOnce(new Error('Comparison error'));

          await expect(userController.login(req as Request, res as Response))
            .rejects.toThrow();
        });
      });
    });

    describe('updatePassword', () => {
      describe('Success Cases', () => {
        it('should update password successfully', async () => {
          const passwordData = {
            currentPassword: 'oldpass123',
            newPassword: 'newpass123'
          };
          req.body = passwordData;
          req.params = { id: mockDoc._id };
          const mockDocWithMethods = {
            ...mockDoc,
            password: 'hashedPassword',
            save: jest.fn().mockResolvedValue(undefined)
          };
          mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
          mockComparePasswords.mockResolvedValueOnce(true);
          mockHashPassword.mockResolvedValueOnce('newHashedPassword');

          await userController.updatePassword(req as Request, res as Response);

          expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
          expect(mockComparePasswords).toHaveBeenCalledWith(passwordData.currentPassword, 'hashedPassword');
          expect(mockHashPassword).toHaveBeenCalledWith(passwordData.newPassword);
          expect(mockDocWithMethods.save).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            message: 'Password updated successfully'
          });
        });
      });

      describe('Error Cases', () => {
        it('should handle incorrect current password', async () => {
          const passwordData = {
            currentPassword: 'wrongpass',
            newPassword: 'newpass123'
          };
          req.body = passwordData;
          req.params = { id: mockDoc._id };
          const mockDocWithMethods = {
            ...mockDoc,
            password: 'hashedPassword',
            save: jest.fn().mockResolvedValue(undefined)
          };
          mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
          mockComparePasswords.mockResolvedValueOnce(false);

          await expect(userController.updatePassword(req as Request, res as Response))
            .rejects.toThrow(HttpError);
        });
      });

      describe('Edge Cases', () => {
        it('should handle password hashing errors during update', async () => {
          const passwordData = {
            currentPassword: 'oldpass123',
            newPassword: 'newpass123'
          };
          req.body = passwordData;
          req.params = { id: mockDoc._id };
          const mockDocWithMethods = {
            ...mockDoc,
            password: 'hashedPassword',
            save: jest.fn().mockResolvedValue(undefined)
          };
          mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
          mockComparePasswords.mockResolvedValueOnce(true);
          mockHashPassword.mockRejectedValueOnce(new Error('Hashing error'));

          await expect(userController.updatePassword(req as Request, res as Response))
            .rejects.toThrow();
        });
      });
    });
  });

  describe('Profile Management', () => {
    describe('updateProfile', () => {
      describe('Success Cases', () => {
        it('should update profile successfully', async () => {
          const updateData = {
            username: 'newusername',
            email: 'newemail@test.com'
          };
          req.body = updateData;
          const updatedDoc = {
            ...mockDoc,
            ...updateData,
            password: 'hashedPassword',
            toObject: jest.fn().mockReturnValue({
              ...mockDoc,
              ...updateData,
              password: 'hashedPassword'
            })
          };
          mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedDoc);

          await userController.updateProfile(req as Request, res as Response);

          expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockDoc._id,
            { $set: updateData },
            { new: true }
          );
          expect(res.status).toHaveBeenCalledWith(200);
          const { password: _, ...expectedResponse } = updatedDoc.toObject();
          expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });
      });

      describe('Edge Cases', () => {
        it('should handle database errors during update', async () => {
          const validUpdateData = {
            username: 'newusername',
            email: 'newemail@test.com'
          };
          req.body = validUpdateData;
          mockUserModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

          await expect(userController.updateProfile(req as Request, res as Response))
            .rejects.toThrow();
        });
      });
    });
  });

  describe('User Statistics', () => {
    describe('getStats', () => {
      describe('Success Cases', () => {
        it('should return user stats', async () => {
          mockUserModel.findById.mockResolvedValue(mockDoc);
          
          await userController.getStats(req as Request, res as Response);
          
          expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            totalSessions: expect.any(Number),
            totalMinutes: expect.any(Number),
            averageSessionLength: expect.any(Number),
            streakDays: expect.any(Number),
            lastSessionDate: null
          }));
        });
      });

      describe('Error Cases', () => {
        it('should handle unauthorized access', async () => {
          req.user = undefined;

          await expect(userController.getStats(req as Request, res as Response))
            .rejects.toThrow(HttpError);
        });
      });

      describe('Edge Cases', () => {
        it('should handle non-existent user for stats', async () => {
          mockUserModel.findById.mockResolvedValue(null);

          await expect(userController.getStats(req as Request, res as Response))
            .rejects.toThrow(HttpError);
        });
      });
    });
  });

  describe('Query Building', () => {
    describe('buildFilterQuery', () => {
      it('should build filter with email regex', () => {
        const query = { email: 'test' };
        const filter = userController['buildFilterQuery'](query);
        expect(filter.email).toBeInstanceOf(RegExp);
      });

      it('should build filter with role', () => {
        const query = { role: 'user' };
        const filter = userController['buildFilterQuery'](query);
        expect(filter.role).toBe('user');
      });

      it('should build filter with active status', () => {
        const query = { active: 'true' };
        const filter = userController['buildFilterQuery'](query);
        expect(filter.active).toBe(true);
      });
    });
  });

  describe('Validation', () => {
    describe('isValidEmail', () => {
      it('should validate correct email format', () => {
        const email = 'test@example.com';
        const result = userController['isValidEmail'](email);
        expect(result).toBe(true);
      });

      it('should invalidate incorrect email format', () => {
        const email = 'invalid-email';
        const result = userController['isValidEmail'](email);
        expect(result).toBe(false);
      });
    });
  });
});