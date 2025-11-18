import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { MeditationSessionController } from '../../controllers/meditation-session.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/meditation-session.controller');

describe('Meditation Session Routes', () => {
  let app: Express;
  let authToken: string;

  const mockSession = {
    _id: 'session123',
    userId: 'user123',
    duration: 600,
    type: 'guided',
    guidedMeditationId: 'meditation123',
    status: 'completed',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    notes: 'Great session',
    rating: 5
  };

  const mockStats = {
    totalSessions: 50,
    totalMinutes: 1500,
    averageRating: 4.5,
    completionRate: 95,
    preferredDuration: 600,
    preferredTime: '08:00'
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    const createSessionData = {
      duration: 600,
      type: 'guided',
      guidedMeditationId: 'meditation123'
    };

    it('should create meditation session successfully', async () => {
      (MeditationSessionController.prototype.createSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({
          ...mockSession,
          ...createSessionData,
          status: 'created'
        });
      });

      const response = await request(app)
        .post('/api/meditation-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSessionData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(createSessionData));
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/meditation-sessions')
        .send(createSessionData);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should return 400 for invalid session data', async () => {
      const invalidData = {
        duration: -1,
        type: 'invalid'
      };

      const response = await request(app)
        .post('/api/meditation-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /', () => {
    it('should get user sessions successfully', async () => {
      const mockSessions = [mockSession];
      (MeditationSessionController.prototype.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSessions);
      });

      const response = await request(app)
        .get('/api/meditation-sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSessions);
    });

    it('should handle query parameters', async () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'completed',
        type: 'guided'
      };

      const response = await request(app)
        .get('/api/meditation-sessions')
        .query(query)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(MeditationSessionController.prototype.getUserSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          query
        }),
        expect.any(Object)
      );
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/meditation-sessions');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /:id', () => {
    it('should get session by ID successfully', async () => {
      (MeditationSessionController.prototype.getSessionById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSession);
      });

      const response = await request(app)
        .get(`/api/meditation-sessions/${mockSession._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSession);
    });

    it('should return 404 for non-existent session', async () => {
      (MeditationSessionController.prototype.getSessionById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Session not found'
          }
        });
      });

      const response = await request(app)
        .get('/api/meditation-sessions/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('PATCH /:id', () => {
    const updateData = {
      duration: 900,
      notes: 'Updated notes'
    };

    it('should update session successfully', async () => {
      (MeditationSessionController.prototype.updateSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          ...updateData
        });
      });

      const response = await request(app)
        .patch(`/api/meditation-sessions/${mockSession._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updateData));
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        duration: -1
      };

      const response = await request(app)
        .patch(`/api/meditation-sessions/${mockSession._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /stats', () => {
    it('should get user stats successfully', async () => {
      (MeditationSessionController.prototype.getUserStats as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockStats);
      });

      const response = await request(app)
        .get('/api/meditation-sessions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });
  });

  describe('POST /start', () => {
    const startSessionData = {
      type: 'guided',
      guidedMeditationId: 'meditation123'
    };

    it('should start session successfully', async () => {
      (MeditationSessionController.prototype.createSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({
          ...mockSession,
          ...startSessionData,
          status: 'in_progress',
          startTime: new Date().toISOString(),
          endTime: null
        });
      });

      const response = await request(app)
        .post('/api/meditation-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startSessionData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('in_progress');
    });
  });

  describe('POST /:sessionId/complete', () => {
    const completeSessionData = {
      rating: 5,
      notes: 'Excellent session',
      mood: 'relaxed',
      challenges: ['minor distractions']
    };

    it('should complete session successfully', async () => {
      (MeditationSessionController.prototype.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          ...completeSessionData,
          status: 'completed',
          endTime: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post(`/api/meditation-sessions/${mockSession._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeSessionData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body).toEqual(expect.objectContaining(completeSessionData));
    });

    it('should return 400 for invalid completion data', async () => {
      const invalidData = {
        rating: 6, // Invalid: should be 1-5
        notes: ''
      };

      const response = await request(app)
        .post(`/api/meditation-sessions/${mockSession._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should return 404 for non-existent session', async () => {
      (MeditationSessionController.prototype.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Session not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/meditation-sessions/nonexistent/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeSessionData);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });
}); 