import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../utils/test-server';
import { StressManagementController } from '../../controllers/stress-management.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/stress-management.controller');

describe('Stress Management Routes', () => {
  let app: Express;
  let authToken: string;

  const mockAssessment = {
    level: 7,
    symptoms: ['anxiety', 'tension'],
    triggers: ['work', 'deadlines'],
    timestamp: new Date().toISOString()
  };

  const mockHistory = [
    {
      level: 7,
      timestamp: '2024-01-01T10:00:00Z',
      triggers: ['work']
    },
    {
      level: 4,
      timestamp: '2024-01-02T10:00:00Z',
      triggers: ['family']
    }
  ];

  const mockAnalytics = {
    averageLevel: 5.5,
    peakHours: ['09:00', '17:00'],
    commonTriggers: ['work', 'family'],
    improvements: 65
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /:userId/assess', () => {
    it('should assess stress level successfully', async () => {
      (StressManagementController.assessStressLevel as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ stressLevel: mockAssessment.level });
      });

      const response = await request(app)
        .post('/api/stress-management/user123/assess')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockAssessment);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stressLevel', mockAssessment.level);
    });

    it('should validate assessment data', async () => {
      const response = await request(app)
        .post('/api/stress-management/user123/assess')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ level: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /:userId/history', () => {
    it('should get stress history', async () => {
      (StressManagementController.getStressHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ history: mockHistory });
      });

      const response = await request(app)
        .get('/api/stress-management/user123/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toEqual(mockHistory);
    });

    it('should handle empty history', async () => {
      (StressManagementController.getStressHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ history: [] });
      });

      const response = await request(app)
        .get('/api/stress-management/user123/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toHaveLength(0);
    });
  });

  describe('GET /:userId/analytics', () => {
    it('should get stress analytics', async () => {
      (StressManagementController.getStressAnalytics as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockAnalytics);
      });

      const response = await request(app)
        .get('/api/stress-management/user123/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalytics);
    });

    it('should handle insufficient data', async () => {
      (StressManagementController.getStressAnalytics as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Insufficient data for analysis' });
      });

      const response = await request(app)
        .get('/api/stress-management/user123/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /:userId/record-change', () => {
    const changeData = {
      stressLevelBefore: 8,
      stressLevelAfter: 5,
      technique: 'deep-breathing'
    };

    it('should record stress level change', async () => {
      (StressManagementController.recordStressChange as jest.Mock).mockImplementation((req, res) => {
        res.sendStatus(200);
      });

      const response = await request(app)
        .post('/api/stress-management/user123/record-change')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changeData);

      expect(response.status).toBe(200);
    });

    it('should validate stress level values', async () => {
      const response = await request(app)
        .post('/api/stress-management/user123/record-change')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...changeData,
          stressLevelBefore: 11 // Invalid value
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /:userId/patterns', () => {
    const mockPatterns = {
      dailyPatterns: ['Morning anxiety', 'Evening relaxation'],
      weeklyPatterns: ['Monday stress peaks', 'Weekend recovery'],
      seasonalPatterns: ['Higher stress in winter']
    };

    it('should get stress patterns', async () => {
      (StressManagementController.getStressPatterns as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockPatterns);
      });

      const response = await request(app)
        .get('/api/stress-management/user123/patterns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPatterns);
    });

    it('should handle no patterns found', async () => {
      (StressManagementController.getStressPatterns as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'No stress patterns found' });
      });

      const response = await request(app)
        .get('/api/stress-management/user123/patterns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /:userId/peak-hours', () => {
    const mockPeakHours = {
      morning: ['09:00', '11:00'],
      afternoon: ['14:00', '16:00'],
      evening: ['19:00']
    };

    it('should get peak stress hours', async () => {
      (StressManagementController.getPeakStressHours as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockPeakHours);
      });

      const response = await request(app)
        .get('/api/stress-management/user123/peak-hours')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPeakHours);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/stress-management/user123/peak-hours');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });
}); 