import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { PMRController } from '../../controllers/pmr.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/pmr.controller');

describe('PMR Routes', () => {
  let app: Express;
  let authToken: string;

  const mockMuscleGroups = [
    { id: 'group1', name: 'Arms', order: 1 },
    { id: 'group2', name: 'Legs', order: 2 },
    { id: 'group3', name: 'Shoulders', order: 3 }
  ];

  const mockSession = {
    id: 'session123',
    userId: 'user123',
    startTime: new Date().toISOString(),
    stressLevelBefore: 7,
    completedGroups: ['group1', 'group2'],
    stressLevelAfter: 4,
    status: 'completed'
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /muscle-groups', () => {
    it('should get muscle groups successfully', async () => {
      (PMRController.getMuscleGroups as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockMuscleGroups);
      });

      const response = await request(app)
        .get('/api/pmr/muscle-groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMuscleGroups);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/pmr/muscle-groups');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('POST /session', () => {
    const validBody = { stressLevelBefore: 7 };

    it('should start session successfully', async () => {
      (PMRController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ ...mockSession, stressLevelBefore: req.body.stressLevelBefore });
      });

      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...mockSession,
        stressLevelBefore: validBody.stressLevelBefore
      });
    });

    it('should validate stress level range', async () => {
      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stressLevelBefore: 11 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should handle server error gracefully', async () => {
      (PMRController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept request without stress level', async () => {
      (PMRController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ ...mockSession, stressLevelBefore: undefined });
      });

      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.stressLevelBefore).toBeUndefined();
    });
  });

  describe('PUT /session/:sessionId/complete', () => {
    const validBody = {
      completedGroups: ['group1', 'group2'],
      stressLevelAfter: 4
    };

    it('should complete session successfully', async () => {
      (PMRController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ ...mockSession, ...req.body });
      });

      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ...mockSession,
        ...validBody
      });
    });

    it('should validate completed groups array', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completedGroups: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should validate stress level after range', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBody, stressLevelAfter: 11 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should handle non-existent session', async () => {
      (PMRController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Session not found' });
      });

      const response = await request(app)
        .put('/api/pmr/session/nonexistent/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Session not found');
    });

    it('should handle unauthorized session access', async () => {
      (PMRController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(403).json({ error: 'Unauthorized access to session' });
      });

      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized access to session');
    });
  });

  describe('PUT /session/:sessionId/progress', () => {
    const validBody = { completedGroup: 'group1' };

    it('should update progress successfully', async () => {
      (PMRController.updateProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          completedGroups: [...mockSession.completedGroups, req.body.completedGroup]
        });
      });

      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body.completedGroups).toContain(validBody.completedGroup);
    });

    it('should validate completed group', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completedGroup: null });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should handle invalid muscle group', async () => {
      (PMRController.updateProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid muscle group' });
      });

      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completedGroup: 'invalid_group' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid muscle group');
    });

    it('should handle already completed session', async () => {
      (PMRController.updateProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Session already completed' });
      });

      const response = await request(app)
        .put(`/api/pmr/session/${mockSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBody);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Session already completed');
    });
  });

  describe('GET /sessions', () => {
    it('should get user sessions successfully', async () => {
      const mockSessions = [mockSession];
      (PMRController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSessions);
      });

      const response = await request(app)
        .get('/api/pmr/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSessions);
    });

    it('should return empty array when no sessions exist', async () => {
      (PMRController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app)
        .get('/api/pmr/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle pagination limit', async () => {
      const mockSessions = [mockSession];
      (PMRController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSessions.slice(0, parseInt(req.query.limit as string)));
      });

      const response = await request(app)
        .get('/api/pmr/sessions?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should handle server error gracefully', async () => {
      (PMRController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Failed to get user PMR sessions' });
      });

      const response = await request(app)
        .get('/api/pmr/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user PMR sessions');
    });
  });

  describe('GET /effectiveness', () => {
    const mockEffectiveness = {
      averageStressReduction: 3,
      totalSessions: 10,
      completionRate: 0.8,
      mostEffectiveGroups: ['Arms', 'Legs'],
      trendData: [
        { date: '2024-01-01', stressReduction: 2 },
        { date: '2024-01-02', stressReduction: 4 }
      ]
    };

    it('should get effectiveness data successfully', async () => {
      (PMRController.getEffectiveness as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockEffectiveness);
      });

      const response = await request(app)
        .get('/api/pmr/effectiveness')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEffectiveness);
    });

    it('should handle no data case', async () => {
      (PMRController.getEffectiveness as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          averageStressReduction: 0,
          totalSessions: 0,
          completionRate: 0,
          mostEffectiveGroups: [],
          trendData: []
        });
      });

      const response = await request(app)
        .get('/api/pmr/effectiveness')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalSessions).toBe(0);
    });

    it('should handle invalid date range', async () => {
      (PMRController.getEffectiveness as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid date range' });
      });

      const response = await request(app)
        .get('/api/pmr/effectiveness?startDate=invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid date range');
    });

    it('should handle server error gracefully', async () => {
      (PMRController.getEffectiveness as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Failed to calculate effectiveness' });
      });

      const response = await request(app)
        .get('/api/pmr/effectiveness')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to calculate effectiveness');
    });
  });
}); 