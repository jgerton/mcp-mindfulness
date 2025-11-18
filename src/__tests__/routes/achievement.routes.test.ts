import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import config from '../../config';
import { Request, Response } from 'express';
import { setupTestDatabase, closeTestDB, clearDatabase } from '../utils/test-db';
import { app, httpServer, closeServer } from '../../app';
import { AchievementController } from '../../controllers/achievement.controller';
import { Achievement, UserAchievement } from '../../models/achievement.model';
import { Types } from 'mongoose';
import { connectDB, closeDatabase, clearDatabase as testDBClear } from '../utils/test-db';
import { createAchievementApiTestHelper } from '../helpers/api-test.helpers';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { ErrorCodes } from '../../utils/error-codes';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

jest.mock('../../controllers/achievement.controller');

describe('Achievement Routes', () => {
  let app: Express;
  let authToken: string;

  const mockAchievement = {
    _id: 'achievement123',
    name: 'Meditation Master',
    description: 'Complete 100 meditation sessions',
    category: 'milestone',
    criteria: {
      type: 'sessions_completed',
      value: 100
    },
    icon: 'meditation_master.png',
    points: 500,
    progress: 75,
    target: 100,
    completed: false,
    completedAt: null
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (AchievementController.prototype.getUserAchievements as jest.Mock) = jest.fn();
    (AchievementController.prototype.getAchievementById as jest.Mock) = jest.fn();
  });

  describe('GET /', () => {
    it('should get user achievements successfully', async () => {
      (AchievementController.prototype.getUserAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([mockAchievement]);
      });

      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(mockAchievement);
    });

    it('should handle empty achievements list', async () => {
      (AchievementController.prototype.getUserAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/achievements');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should handle server errors', async () => {
      (AchievementController.prototype.getUserAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({
          error: {
            code: ErrorCodes.SERVER_ERROR,
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(ErrorCodes.SERVER_ERROR);
    });
  });

  describe('GET /:id', () => {
    it('should get achievement by id successfully', async () => {
      (AchievementController.prototype.getAchievementById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockAchievement);
      });

      const response = await request(app)
        .get(`/api/achievements/${mockAchievement._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAchievement);
    });

    it('should return 404 for non-existent achievement', async () => {
      (AchievementController.prototype.getAchievementById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Achievement not found'
          }
        });
      });

      const response = await request(app)
        .get('/api/achievements/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should validate achievement ID format', async () => {
      (AchievementController.prototype.getAchievementById as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid achievement ID format'
          }
        });
      });

      const response = await request(app)
        .get('/api/achievements/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/achievements/${mockAchievement._id}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should handle server errors', async () => {
      (AchievementController.prototype.getAchievementById as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({
          error: {
            code: ErrorCodes.SERVER_ERROR,
            message: 'Internal server error'
          }
        });
      });

      const response = await request(app)
        .get(`/api/achievements/${mockAchievement._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(ErrorCodes.SERVER_ERROR);
    });
  });

  describe('GET /api/achievements', () => {
    it('should get user achievements successfully', async () => {
      const mockAchievements = [
        {
          id: 'ach1',
          title: 'Meditation Master',
          description: 'Complete 10 meditation sessions',
          type: 'meditation',
          progress: 8,
          target: 10,
          status: 'in_progress',
          rewards: {
            points: 100,
            badge: 'meditation_master_bronze'
          }
        },
        {
          id: 'ach2',
          title: 'Stress Buster',
          description: 'Complete 5 stress management sessions',
          type: 'stress_management',
          progress: 5,
          target: 5,
          status: 'completed',
          completedAt: new Date().toISOString(),
          rewards: {
            points: 50,
            badge: 'stress_buster_silver'
          }
        }
      ];

      (AchievementController.prototype.getUserAchievements as jest.Mock)
        .mockResolvedValue(mockAchievements);

      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAchievements);
    });

    it('should handle achievement type filter', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .query({ type: 'meditation' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(AchievementController.prototype.getUserAchievements)
        .toHaveBeenCalledWith(expect.any(Object), { type: 'meditation' });
    });

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .query({ status: 'completed' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(AchievementController.prototype.getUserAchievements)
        .toHaveBeenCalledWith(expect.any(Object), { status: 'completed' });
    });
  });

  describe('GET /api/achievements/progress', () => {
    it('should get achievement progress successfully', async () => {
      const mockProgress = {
        totalAchievements: 10,
        completedAchievements: 5,
        inProgressAchievements: 3,
        lockedAchievements: 2,
        recentProgress: [
          {
            achievementId: 'ach1',
            title: 'Meditation Master',
            progressDelta: 2,
            timestamp: new Date().toISOString()
          }
        ]
      };

      (AchievementController.prototype.getAchievementProgress as jest.Mock)
        .mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/api/achievements/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProgress);
    });
  });

  describe('GET /api/achievements/leaderboard', () => {
    it('should get achievement leaderboard successfully', async () => {
      const mockLeaderboard = [
        {
          userId: 'user1',
          username: 'JohnDoe',
          totalAchievements: 15,
          points: 1500,
          rank: 1
        },
        {
          userId: 'user2',
          username: 'JaneSmith',
          totalAchievements: 12,
          points: 1200,
          rank: 2
        }
      ];

      (AchievementController.prototype.getLeaderboard as jest.Mock)
        .mockResolvedValue(mockLeaderboard);

      const response = await request(app)
        .get('/api/achievements/leaderboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLeaderboard);
    });

    it('should handle time period filter', async () => {
      const response = await request(app)
        .get('/api/achievements/leaderboard')
        .query({ period: 'weekly' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(AchievementController.prototype.getLeaderboard)
        .toHaveBeenCalledWith(expect.any(Object), { period: 'weekly' });
    });
  });

  describe('GET /api/achievements/badges', () => {
    it('should get user badges successfully', async () => {
      const mockBadges = [
        {
          id: 'badge1',
          name: 'Meditation Master Bronze',
          image: 'meditation_master_bronze.png',
          achievementId: 'ach1',
          unlockedAt: new Date().toISOString()
        },
        {
          id: 'badge2',
          name: 'Stress Buster Silver',
          image: 'stress_buster_silver.png',
          achievementId: 'ach2',
          unlockedAt: new Date().toISOString()
        }
      ];

      (AchievementController.prototype.getUserBadges as jest.Mock)
        .mockResolvedValue(mockBadges);

      const response = await request(app)
        .get('/api/achievements/badges')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBadges);
    });
  });

  describe('POST /api/achievements/:id/claim-reward', () => {
    it('should claim achievement reward successfully', async () => {
      const mockRewardClaim = {
        achievementId: 'ach1',
        rewards: {
          points: 100,
          badge: 'meditation_master_bronze'
        },
        claimedAt: new Date().toISOString()
      };

      (AchievementController.prototype.claimAchievementReward as jest.Mock)
        .mockResolvedValue(mockRewardClaim);

      const response = await request(app)
        .post('/api/achievements/ach1/claim-reward')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRewardClaim);
    });

    it('should return 400 for uncompleted achievement', async () => {
      (AchievementController.prototype.claimAchievementReward as jest.Mock)
        .mockRejectedValue({ status: 400, message: 'Achievement not completed' });

      const response = await request(app)
        .post('/api/achievements/ach1/claim-reward')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Achievement not completed');
    });

    it('should return 400 for already claimed reward', async () => {
      (AchievementController.prototype.claimAchievementReward as jest.Mock)
        .mockRejectedValue({ status: 400, message: 'Reward already claimed' });

      const response = await request(app)
        .post('/api/achievements/ach1/claim-reward')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Reward already claimed');
    });
  });
});