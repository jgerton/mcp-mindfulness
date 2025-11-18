import mongoose from 'mongoose';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { dbHandler } from '../test-utils/db-handler';
import { ErrorCodes } from '../../utils/error-codes';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../models/user.model');
jest.mock('../../utils/auth');
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123'
  };

  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('register', () => {
    const validRegistrationData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should register a new user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('valid.jwt.token');

      const result = await AuthService.register(validRegistrationData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(User.findOne).toHaveBeenCalledWith({ email: validRegistrationData.email });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: validRegistrationData.username,
        email: validRegistrationData.email,
        password: 'hashedPassword123'
      }));
    });

    it('should throw error for existing email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(AuthService.register(validRegistrationData))
        .rejects.toThrow('Email already registered');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const invalidData = {
        ...validRegistrationData,
        email: 'invalid-email'
      };

      await expect(AuthService.register(invalidData))
        .rejects.toThrow('Invalid email format');
    });

    it('should throw error for weak password', async () => {
      const weakPasswordData = {
        ...validRegistrationData,
        password: 'weak'
      };

      await expect(AuthService.register(weakPasswordData))
        .rejects.toThrow('Password must be at least 8 characters');
    });

    it('should handle database errors gracefully', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(AuthService.register(validRegistrationData))
        .rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should login user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('valid.jwt.token');

      const result = await AuthService.login(validCredentials);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(User.findOne).toHaveBeenCalledWith({ email: validCredentials.email });
      expect(authUtils.comparePasswords).toHaveBeenCalledWith(
        validCredentials.password,
        mockUser.password
      );
    });

    it('should throw error for non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(validCredentials))
        .rejects.toThrow('Invalid credentials');
      expect(authUtils.comparePasswords).not.toHaveBeenCalled();
    });

    it('should throw error for incorrect password', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login(validCredentials))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for missing credentials', async () => {
      const invalidCredentials = { email: 'test@example.com' };

      await expect(AuthService.login(invalidCredentials as any))
        .rejects.toThrow('Email and password are required');
    });

    it('should handle database errors gracefully', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(AuthService.login(validCredentials))
        .rejects.toThrow('Database error');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const token = 'valid.jwt.token';
      const decodedToken = { userId: mockUserId, username: 'testuser' };
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(decodedToken);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.validateToken(token);

      expect(result).toBeTruthy();
      expect(result.userId).toBe(mockUserId);
      expect(result.username).toBe('testuser');
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token';
      
      (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(AuthService.validateToken(invalidToken))
        .rejects.toThrow('Invalid token');
    });

    it('should throw error when user not found', async () => {
      const token = 'valid.jwt.token';
      const decodedToken = { userId: mockUserId, username: 'testuser' };
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(decodedToken);
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.validateToken(token))
        .rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const oldToken = 'old.jwt.token';
      const newToken = 'new.jwt.token';
      const decodedToken = { userId: mockUserId, username: 'testuser' };
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(decodedToken);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(newToken);

      const result = await AuthService.refreshToken(oldToken);

      expect(result).toBe(newToken);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockUserId, 'testuser');
    });

    it('should throw error for expired token', async () => {
      const expiredToken = 'expired.jwt.token';
      
      (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(AuthService.refreshToken(expiredToken))
        .rejects.toThrow('Token expired');
    });
  });
}); 