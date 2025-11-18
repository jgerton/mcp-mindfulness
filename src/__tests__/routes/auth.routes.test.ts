import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { User } from '../../models/user.model';
import { AuthController } from '../../controllers/auth.controller';
import { generateToken } from '../../utils/jwt';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../models/user.model');
jest.mock('../../utils/jwt');
jest.mock('../../controllers/auth.controller');

describe('Auth Routes', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should register a new user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'user123',
        ...validUser
      });
      (generateToken as jest.Mock).mockReturnValue('valid.jwt.token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(User.findOne).toHaveBeenCalledWith({ email: validUser.email });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining(validUser));
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for existing email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: validUser.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.DUPLICATE_ERROR);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    const mockUser = {
      _id: 'user123',
      email: credentials.email,
      password: '$2b$10$hashedpassword',
      comparePassword: jest.fn()
    };

    it('should login user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('valid.jwt.token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(credentials.password);
    });

    it('should return 401 for invalid credentials', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 401 for non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const mockToken = 'mock.jwt.token';
      (generateToken as jest.Mock).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com'
    };

    it('should refresh token successfully', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('new.jwt.token');

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', 'Bearer valid.old.token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'new.jwt.token');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 401 for non-existent user', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', 'Bearer valid.old.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset successfully', async () => {
      const email = 'test@example.com';
      (AuthController.forgotPassword as jest.Mock).mockResolvedValue({
        message: 'Password reset email sent'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password reset email sent');
    });

    it('should return 404 for non-existent email', async () => {
      const email = 'nonexistent@example.com';
      (AuthController.forgotPassword as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'User not found'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const resetData = {
      token: 'reset.token.123',
      password: 'NewPassword123!'
    };

    it('should reset password successfully', async () => {
      (AuthController.resetPassword as jest.Mock).mockResolvedValue({
        message: 'Password reset successful'
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password reset successful');
    });

    it('should return 400 for invalid reset token', async () => {
      (AuthController.resetPassword as jest.Mock).mockRejectedValue({
        status: 400,
        message: 'Invalid or expired reset token'
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
    });

    it('should return 400 for invalid password format', async () => {
      const invalidData = {
        token: resetData.token,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 