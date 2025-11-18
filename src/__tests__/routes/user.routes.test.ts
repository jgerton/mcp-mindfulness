import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { UserController } from '../../controllers/user.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/user.controller');

describe('User Routes', () => {
  let app: Express;
  let authToken: string;

  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    friendIds: ['friend1', 'friend2'],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockStats = {
    totalMeditations: 50,
    totalMeditationTime: 1500,
    streakDays: 7,
    achievements: 10
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      (UserController.prototype.getProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockUser);
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 404 for non-existent user', async () => {
      (UserController.prototype.getProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found'
          }
        });
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should handle server errors', async () => {
      (UserController.prototype.getProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    });
  });

  describe('PUT /api/users/profile', () => {
    const updateData = {
      username: 'newusername',
      email: 'new.email@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    it('should update user profile successfully', async () => {
      (UserController.prototype.updateProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockUser,
          ...updateData,
          updatedAt: new Date().toISOString()
        });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updateData));
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        username: '' // Empty username
      };

      (UserController.prototype.updateProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid update data'
          }
        });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should return 404 for non-existent user', async () => {
      (UserController.prototype.updateProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found'
          }
        });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should handle server errors', async () => {
      (UserController.prototype.updateProfile as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user stats successfully', async () => {
      (UserController.prototype.getStats as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockStats);
      });

      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/users/stats');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 404 for non-existent user', async () => {
      (UserController.prototype.getStats as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'User not found'
          }
        });
      });

      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should handle server errors', async () => {
      (UserController.prototype.getStats as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    });
  });
}); 