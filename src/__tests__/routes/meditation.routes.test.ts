import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { MeditationController } from '../../controllers/meditation.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/meditation.controller');

describe('Meditation Routes', () => {
  let app: Express;
  let authToken: string;

  const mockMeditation = {
    _id: 'meditation123',
    title: 'Mindful Breathing',
    description: 'A guided meditation focusing on breath awareness',
    duration: 10,
    type: 'guided',
    category: 'mindfulness',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/audio.mp3',
    tags: ['breathing', 'mindfulness', 'beginner']
  };

  const mockSession = {
    _id: 'session123',
    userId: 'user123',
    meditationId: 'meditation123',
    startTime: new Date().toISOString(),
    endTime: null,
    completed: false,
    interruptions: []
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all meditations successfully', async () => {
      (MeditationController.getAllMeditations as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json([mockMeditation]);
      });

      const response = await request(app)
        .get('/api/meditations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(mockMeditation);
    });

    it('should filter meditations by category', async () => {
      const response = await request(app)
        .get('/api/meditations')
        .query({ category: 'mindfulness' });

      expect(response.status).toBe(200);
      expect(MeditationController.getAllMeditations).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { category: 'mindfulness' }
        }),
        expect.any(Object)
      );
    });

    it('should filter meditations by type', async () => {
      const response = await request(app)
        .get('/api/meditations')
        .query({ type: 'guided' });

      expect(response.status).toBe(200);
      expect(MeditationController.getAllMeditations).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { type: 'guided' }
        }),
        expect.any(Object)
      );
    });

    it('should filter meditations by difficulty', async () => {
      const response = await request(app)
        .get('/api/meditations')
        .query({ difficulty: 'beginner' });

      expect(response.status).toBe(200);
      expect(MeditationController.getAllMeditations).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { difficulty: 'beginner' }
        }),
        expect.any(Object)
      );
    });

    it('should filter meditations by duration', async () => {
      const response = await request(app)
        .get('/api/meditations')
        .query({ duration: 10 });

      expect(response.status).toBe(200);
      expect(MeditationController.getAllMeditations).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { duration: '10' }
        }),
        expect.any(Object)
      );
    });
  });

  describe('GET /:id', () => {
    it('should get meditation by id successfully', async () => {
      (MeditationController.getMeditationById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockMeditation);
      });

      const response = await request(app)
        .get(`/api/meditations/${mockMeditation._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMeditation);
    });

    it('should return 404 for non-existent meditation', async () => {
      (MeditationController.getMeditationById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Meditation not found'
          }
        });
      });

      const response = await request(app)
        .get('/api/meditations/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    const validMeditation = {
      title: 'New Meditation',
      description: 'A new guided meditation',
      duration: 15,
      type: 'guided',
      category: 'mindfulness',
      difficulty: 'beginner',
      audioUrl: 'https://example.com/new-audio.mp3',
      tags: ['new', 'meditation']
    };

    it('should create meditation successfully', async () => {
      (MeditationController.createMeditation as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ ...validMeditation, _id: 'newMeditation123' });
      });

      const response = await request(app)
        .post('/api/meditations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validMeditation);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(validMeditation));
    });

    it('should validate required fields', async () => {
      const invalidMeditation = {
        title: 'Invalid Meditation'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/meditations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMeditation);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/meditations')
        .send(validMeditation);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('PUT /:id', () => {
    const updateData = {
      title: 'Updated Meditation',
      description: 'Updated description',
      duration: 20
    };

    it('should update meditation successfully', async () => {
      (MeditationController.updateMeditation as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ ...mockMeditation, ...updateData });
      });

      const response = await request(app)
        .put(`/api/meditations/${mockMeditation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updateData));
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        duration: -1 // Invalid duration
      };

      const response = await request(app)
        .put(`/api/meditations/${mockMeditation._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete meditation successfully', async () => {
      (MeditationController.deleteMeditation as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ message: 'Meditation deleted successfully' });
      });

      const response = await request(app)
        .delete(`/api/meditations/${mockMeditation._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent meditation', async () => {
      (MeditationController.deleteMeditation as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Meditation not found'
          }
        });
      });

      const response = await request(app)
        .delete('/api/meditations/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('POST /:id/start', () => {
    it('should start meditation session successfully', async () => {
      (MeditationController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSession);
      });

      const response = await request(app)
        .post(`/api/meditations/${mockMeditation._id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSession);
    });

    it('should return 404 for non-existent meditation', async () => {
      (MeditationController.startSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Meditation not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/meditations/nonexistent/start')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('POST /:id/complete', () => {
    const completionData = {
      mood: 'calm',
      notes: 'Felt very peaceful'
    };

    it('should complete meditation session successfully', async () => {
      const completedSession = {
        ...mockSession,
        completed: true,
        endTime: new Date().toISOString(),
        mood: completionData.mood,
        notes: completionData.notes
      };

      (MeditationController.completeSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(completedSession);
      });

      const response = await request(app)
        .post(`/api/meditations/${mockMeditation._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(completedSession);
    });

    it('should validate completion data', async () => {
      const invalidData = {
        mood: 'invalid-mood' // Invalid mood
      };

      const response = await request(app)
        .post(`/api/meditations/${mockMeditation._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /session/active', () => {
    it('should get active session successfully', async () => {
      (MeditationController.getActiveSession as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockSession);
      });

      const response = await request(app)
        .get('/api/meditations/session/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSession);
    });

    it('should return 404 when no active session exists', async () => {
      (MeditationController.getActiveSession as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'No active session found'
          }
        });
      });

      const response = await request(app)
        .get('/api/meditations/session/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('POST /session/:id/interrupt', () => {
    const interruptionData = {
      reason: 'Phone call'
    };

    it('should record interruption successfully', async () => {
      const updatedSession = {
        ...mockSession,
        interruptions: [
          {
            time: new Date().toISOString(),
            reason: interruptionData.reason
          }
        ]
      };

      (MeditationController.recordInterruption as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(updatedSession);
      });

      const response = await request(app)
        .post(`/api/meditations/session/${mockSession._id}/interrupt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(interruptionData);

      expect(response.status).toBe(200);
      expect(response.body.interruptions).toHaveLength(1);
      expect(response.body.interruptions[0].reason).toBe(interruptionData.reason);
    });

    it('should validate interruption data', async () => {
      const response = await request(app)
        .post(`/api/meditations/session/${mockSession._id}/interrupt`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should return 404 for non-existent session', async () => {
      (MeditationController.recordInterruption as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Session not found'
          }
        });
      });

      const response = await request(app)
        .post('/api/meditations/session/nonexistent/interrupt')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interruptionData);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });
}); 