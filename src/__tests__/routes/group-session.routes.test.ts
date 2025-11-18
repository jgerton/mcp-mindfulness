import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { GroupSessionController } from '../../controllers/group-session.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/group-session.controller');

describe('Group Session Routes', () => {
  let app: Express;
  let authToken: string;

  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockSession = {
    _id: 'session123',
    title: 'Group Meditation',
    description: 'Join us for a calming session',
    type: 'meditation',
    startTime: new Date().toISOString(),
    duration: 1800,
    maxParticipants: 10,
    host: mockUser._id,
    participants: [mockUser._id],
    status: 'scheduled'
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
      title: 'Group Meditation',
      description: 'Join us for a calming session',
      type: 'meditation',
      startTime: new Date().toISOString(),
      duration: 1800,
      maxParticipants: 10
    };

    it('should create group session successfully', async () => {
      (GroupSessionController.createSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockSession);
      });

      const response = await request(app)
        .post('/api/group-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSessionData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSession);
    });

    it('should return 400 for invalid session data', async () => {
      const invalidData = {
        title: '',
        duration: -1
      };

      const response = await request(app)
        .post('/api/group-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/group-sessions')
        .send(createSessionData);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /', () => {
    it('should get upcoming sessions successfully', async () => {
      const mockSessions = [mockSession];
      (GroupSessionController.getUpcomingSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSessions);
      });

      const response = await request(app)
        .get('/api/group-sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSessions);
    });

    it('should handle query parameters', async () => {
      const query = {
        type: 'meditation',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const response = await request(app)
        .get('/api/group-sessions')
        .query(query)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(GroupSessionController.getUpcomingSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          query
        }),
        expect.any(Object)
      );
    });
  });

  describe('GET /user', () => {
    it('should get user sessions successfully', async () => {
      const mockSessions = [mockSession];
      (GroupSessionController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSessions);
      });

      const response = await request(app)
        .get('/api/group-sessions/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSessions);
    });

    it('should handle empty user sessions', async () => {
      (GroupSessionController.getUserSessions as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app)
        .get('/api/group-sessions/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /:sessionId/join', () => {
    it('should join session successfully', async () => {
      (GroupSessionController.joinSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          participants: [...mockSession.participants, 'newUser123']
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.participants).toContain('newUser123');
    });

    it('should return 404 for non-existent session', async () => {
      (GroupSessionController.joinSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Session not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/group-sessions/nonexistent/join')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('should return 400 for full session', async () => {
      (GroupSessionController.joinSession as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Session is full'
          }
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('POST /:sessionId/leave', () => {
    it('should leave session successfully', async () => {
      (GroupSessionController.leaveSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          participants: mockSession.participants.filter(p => p !== 'newUser123')
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.participants).not.toContain('newUser123');
    });

    it('should return 404 for non-existent session', async () => {
      (GroupSessionController.leaveSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Session not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/group-sessions/nonexistent/leave')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('POST /:sessionId/start', () => {
    it('should start session successfully', async () => {
      (GroupSessionController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          status: 'in_progress',
          startedAt: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
      expect(response.body.startedAt).toBeDefined();
    });

    it('should return 403 for non-host user', async () => {
      (GroupSessionController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(403).json({
          error: {
            code: ErrorCodes.AUTHORIZATION_ERROR,
            message: 'Only host can start the session'
          }
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('POST /:sessionId/complete', () => {
    const completionData = {
      rating: 5,
      feedback: 'Great session!'
    };

    it('should complete session successfully', async () => {
      (GroupSessionController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          status: 'completed',
          completedAt: new Date().toISOString(),
          rating: completionData.rating,
          feedback: completionData.feedback
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.completedAt).toBeDefined();
      expect(response.body.rating).toBe(completionData.rating);
    });

    it('should return 400 for invalid completion data', async () => {
      const invalidData = {
        rating: 6,
        feedback: ''
      };

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('POST /:sessionId/cancel', () => {
    it('should cancel session successfully', async () => {
      (GroupSessionController.cancelSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          ...mockSession,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('cancelled');
      expect(response.body.cancelledAt).toBeDefined();
    });

    it('should return 403 for non-host user', async () => {
      (GroupSessionController.cancelSession as jest.Mock).mockImplementation((req, res) => {
        res.status(403).json({
          error: {
            code: ErrorCodes.AUTHORIZATION_ERROR,
            message: 'Only host can cancel the session'
          }
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });

    it('should return 400 for already started session', async () => {
      (GroupSessionController.cancelSession as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Cannot cancel an in-progress session'
          }
        });
      });

      const response = await request(app)
        .post(`/api/group-sessions/${mockSession._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });
}); 