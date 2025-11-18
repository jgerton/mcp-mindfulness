import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { SessionAnalyticsController } from '../../controllers/session-analytics.controller';

jest.mock('../../controllers/session-analytics.controller');

describe('Session Analytics Routes', () => {
  let app: Express;
  let mockToken: string;

  beforeAll(async () => {
    app = await createServer();
    mockToken = 'mock.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/sessions/summary', () => {
    it('should get session summary successfully', async () => {
      const mockSummary = {
        totalSessions: 50,
        totalDuration: 18000, // in seconds
        averageDuration: 360,
        completionRate: 92,
        sessionsByType: {
          meditation: 20,
          breathing: 15,
          pmr: 10,
          stress: 5
        },
        streakData: {
          currentStreak: 5,
          longestStreak: 10,
          lastSessionDate: new Date().toISOString()
        }
      };

      (SessionAnalyticsController.prototype.getSessionSummary as jest.Mock)
        .mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/api/analytics/sessions/summary')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSummary);
    });

    it('should handle date range filters', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-03-01'
      };

      const response = await request(app)
        .get('/api/analytics/sessions/summary')
        .query(dateRange)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(SessionAnalyticsController.prototype.getSessionSummary)
        .toHaveBeenCalledWith(expect.any(Object), dateRange);
    });
  });

  describe('GET /api/analytics/sessions/trends', () => {
    it('should get session trends successfully', async () => {
      const mockTrends = {
        daily: [
          {
            date: '2024-03-01',
            sessionCount: 3,
            totalDuration: 1800,
            types: ['meditation', 'breathing']
          },
          {
            date: '2024-03-02',
            sessionCount: 2,
            totalDuration: 1200,
            types: ['pmr', 'stress']
          }
        ],
        weekly: [
          {
            weekStart: '2024-02-26',
            sessionCount: 15,
            averageDuration: 400,
            mostPopularType: 'meditation'
          }
        ],
        monthly: [
          {
            month: '2024-02',
            sessionCount: 60,
            completionRate: 95,
            totalDuration: 24000
          }
        ]
      };

      (SessionAnalyticsController.prototype.getSessionTrends as jest.Mock)
        .mockResolvedValue(mockTrends);

      const response = await request(app)
        .get('/api/analytics/sessions/trends')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrends);
    });

    it('should handle trend type filter', async () => {
      const response = await request(app)
        .get('/api/analytics/sessions/trends')
        .query({ type: 'weekly' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(SessionAnalyticsController.prototype.getSessionTrends)
        .toHaveBeenCalledWith(expect.any(Object), { type: 'weekly' });
    });
  });

  describe('GET /api/analytics/sessions/progress', () => {
    it('should get session progress successfully', async () => {
      const mockProgress = {
        overall: {
          totalMilestones: 10,
          completedMilestones: 6,
          nextMilestone: {
            type: 'session_count',
            target: 100,
            current: 85
          }
        },
        byType: {
          meditation: {
            totalSessions: 40,
            totalDuration: 14400,
            level: 3,
            nextLevel: {
              required: 50,
              progress: 80
            }
          },
          breathing: {
            totalSessions: 30,
            totalDuration: 9000,
            level: 2,
            nextLevel: {
              required: 40,
              progress: 75
            }
          }
        }
      };

      (SessionAnalyticsController.prototype.getSessionProgress as jest.Mock)
        .mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/api/analytics/sessions/progress')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProgress);
    });
  });

  describe('GET /api/analytics/sessions/insights', () => {
    it('should get session insights successfully', async () => {
      const mockInsights = {
        recommendations: [
          {
            type: 'session_time',
            insight: 'You show better focus during morning sessions',
            data: {
              morningCompletionRate: 95,
              eveningCompletionRate: 80
            }
          },
          {
            type: 'session_type',
            insight: 'Breathing exercises have improved your stress levels',
            data: {
              stressReduction: 30,
              recommendedType: 'breathing'
            }
          }
        ],
        patterns: {
          bestTimeOfDay: 'morning',
          mostEffectiveTypes: ['breathing', 'meditation'],
          averageStressReduction: 25
        },
        goals: {
          current: {
            type: 'weekly_sessions',
            target: 5,
            progress: 3
          },
          suggested: [
            {
              type: 'session_duration',
              target: 20,
              reason: 'Based on your progress pattern'
            }
          ]
        }
      };

      (SessionAnalyticsController.prototype.getSessionInsights as jest.Mock)
        .mockResolvedValue(mockInsights);

      const response = await request(app)
        .get('/api/analytics/sessions/insights')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInsights);
    });
  });

  describe('GET /api/analytics/sessions/comparison', () => {
    it('should get session comparison successfully', async () => {
      const mockComparison = {
        userStats: {
          totalSessions: 50,
          averageDuration: 360,
          completionRate: 92
        },
        communityAverage: {
          totalSessions: 40,
          averageDuration: 300,
          completionRate: 85
        },
        percentile: {
          sessions: 75,
          duration: 80,
          consistency: 90
        },
        ranking: {
          global: 1250,
          localRegion: 120
        }
      };

      (SessionAnalyticsController.prototype.getSessionComparison as jest.Mock)
        .mockResolvedValue(mockComparison);

      const response = await request(app)
        .get('/api/analytics/sessions/comparison')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComparison);
    });

    it('should handle comparison period filter', async () => {
      const response = await request(app)
        .get('/api/analytics/sessions/comparison')
        .query({ period: 'monthly' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(SessionAnalyticsController.prototype.getSessionComparison)
        .toHaveBeenCalledWith(expect.any(Object), { period: 'monthly' });
    });
  });

  describe('POST /api/analytics/sessions/goals', () => {
    it('should set session goals successfully', async () => {
      const goalRequest = {
        type: 'weekly_sessions',
        target: 5,
        deadline: '2024-03-31'
      };

      const mockGoal = {
        id: 'goal123',
        ...goalRequest,
        status: 'active',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      (SessionAnalyticsController.prototype.setSessionGoal as jest.Mock)
        .mockResolvedValue(mockGoal);

      const response = await request(app)
        .post('/api/analytics/sessions/goals')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(goalRequest);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockGoal);
    });

    it('should return 400 for invalid goal data', async () => {
      const invalidGoal = {
        type: 'invalid_type',
        target: -1
      };

      const response = await request(app)
        .post('/api/analytics/sessions/goals')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidGoal);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/analytics/sessions/goals', () => {
    it('should get session goals successfully', async () => {
      const mockGoals = [
        {
          id: 'goal1',
          type: 'weekly_sessions',
          target: 5,
          progress: 3,
          status: 'active',
          deadline: '2024-03-31'
        },
        {
          id: 'goal2',
          type: 'session_duration',
          target: 20,
          progress: 15,
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      ];

      (SessionAnalyticsController.prototype.getSessionGoals as jest.Mock)
        .mockResolvedValue(mockGoals);

      const response = await request(app)
        .get('/api/analytics/sessions/goals')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoals);
    });

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/analytics/sessions/goals')
        .query({ status: 'active' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(SessionAnalyticsController.prototype.getSessionGoals)
        .toHaveBeenCalledWith(expect.any(Object), { status: 'active' });
    });
  });
}); 