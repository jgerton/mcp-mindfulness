import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../utils/test-server';
import { BreathingController } from '../../controllers/breathing.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/breathing.controller');

describe('Breathing Routes', () => {
  let app: Express;
  let authToken: string;

  const mockExercise = {
    id: 'exercise123',
    name: 'Box Breathing',
    description: 'A calming breathing pattern',
    pattern: {
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4
    },
    duration: 300,
    difficulty: 'beginner',
    benefits: ['Reduces stress', 'Improves focus']
  };

  const mockSession = {
    id: 'session123',
    userId: 'user123',
    exerciseId: 'exercise123',
    startTime: new Date().toISOString(),
    duration: 300,
    completed: false,
    pattern: mockExercise.pattern
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /exercises', () => {
    it('should get all breathing exercises', async () => {
      const mockExercises = [mockExercise];
      (BreathingController.getAllExercises as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ exercises: mockExercises });
      });

      const response = await request(app)
        .get('/api/breathing/exercises')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.exercises).toEqual(mockExercises);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/breathing/exercises');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /exercises/:id', () => {
    it('should get exercise by id', async () => {
      (BreathingController.getExerciseById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockExercise);
      });

      const response = await request(app)
        .get(`/api/breathing/exercises/${mockExercise.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExercise);
    });

    it('should handle non-existent exercise', async () => {
      (BreathingController.getExerciseById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Exercise not found' });
      });

      const response = await request(app)
        .get('/api/breathing/exercises/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /sessions', () => {
    it('should start new breathing session', async () => {
      (BreathingController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockSession);
      });

      const response = await request(app)
        .post('/api/breathing/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exerciseId: mockExercise.id,
          duration: 300
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSession);
    });

    it('should validate session parameters', async () => {
      const response = await request(app)
        .post('/api/breathing/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          duration: -1 // Invalid duration
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('PUT /sessions/:id/complete', () => {
    it('should complete breathing session', async () => {
      const completedSession = {
        ...mockSession,
        completed: true,
        endTime: new Date().toISOString()
      };

      (BreathingController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(completedSession);
      });

      const response = await request(app)
        .put(`/api/breathing/sessions/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(completedSession);
    });

    it('should handle already completed session', async () => {
      (BreathingController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Session already completed' });
      });

      const response = await request(app)
        .put(`/api/breathing/sessions/${mockSession.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /sessions/history', () => {
    it('should get user session history', async () => {
      const mockHistory = [mockSession];
      (BreathingController.getSessionHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ sessions: mockHistory });
      });

      const response = await request(app)
        .get('/api/breathing/sessions/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toEqual(mockHistory);
    });

    it('should handle empty history', async () => {
      (BreathingController.getSessionHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ sessions: [] });
      });

      const response = await request(app)
        .get('/api/breathing/sessions/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(0);
    });
  });

  describe('GET /sessions/:id/progress', () => {
    it('should get session progress', async () => {
      const mockProgress = {
        sessionId: mockSession.id,
        elapsedTime: 150,
        remainingTime: 150,
        cyclesCompleted: 5
      };

      (BreathingController.getSessionProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockProgress);
      });

      const response = await request(app)
        .get(`/api/breathing/sessions/${mockSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProgress);
    });

    it('should handle invalid session id', async () => {
      (BreathingController.getSessionProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Session not found' });
      });

      const response = await request(app)
        .get('/api/breathing/sessions/invalid/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 