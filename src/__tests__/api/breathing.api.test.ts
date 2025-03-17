import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../app';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { BreathingService } from '../../services/breathing.service';

let mongoServer: MongoMemoryServer;
let authToken: string;
const testUserId = 'test-user-id';
const testUsername = 'test-user';

describe('Breathing API Endpoints', () => {
  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Create auth token for testing
    authToken = jwt.sign({ _id: testUserId, username: testUsername }, config.jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await BreathingPattern.deleteMany({});
    await BreathingSession.deleteMany({});
    
    // Initialize default breathing patterns
    await BreathingService.initializeDefaultPatterns();
  });

  describe('GET /api/breathing/patterns/:name', () => {
    beforeEach(async () => {
      await request(app)
        .get('/api/breathing/patterns/4-7-8')
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should return a specific breathing pattern', async () => {
      const response = await request(app)
        .get('/api/breathing/patterns/4-7-8')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', '4-7-8');
      expect(response.body).toHaveProperty('inhale', 4);
      expect(response.body).toHaveProperty('hold', 7);
      expect(response.body).toHaveProperty('exhale', 8);
    });

    it('should return 404 for non-existent pattern', async () => {
      const response = await request(app)
        .get('/api/breathing/patterns/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/breathing/patterns/4-7-8');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/breathing/session', () => {
    it('should create a new breathing session', async () => {
      const response = await request(app)
        .post('/api/breathing/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patternName: '4-7-8',
          stressLevelBefore: 7
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('patternName', '4-7-8');
      expect(response.body).toHaveProperty('stressLevelBefore', 7);
      expect(response.body).toHaveProperty('completedCycles', 0);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/breathing/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patternName: '4-7-8',
          stressLevelBefore: 11 // Invalid stress level
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/breathing/session/:sessionId/complete', () => {
    let sessionId: string;

    beforeEach(async () => {
      const sessionResponse = await request(app)
        .post('/api/breathing/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patternName: '4-7-8',
          stressLevelBefore: 7
        });

      sessionId = sessionResponse.body._id;
    });

    it('should complete a breathing session', async () => {
      const response = await request(app)
        .put(`/api/breathing/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedCycles: 4,
          stressLevelAfter: 3
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('completedCycles', 4);
      expect(response.body).toHaveProperty('stressLevelAfter', 3);
      expect(response.body).toHaveProperty('endTime');
    });

    it('should validate completion data', async () => {
      const response = await request(app)
        .put(`/api/breathing/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedCycles: -1, // Invalid cycles
          stressLevelAfter: 3
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/breathing/sessions', () => {
    beforeEach(async () => {
      // Create multiple sessions
      await Promise.all([
        request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ patternName: '4-7-8' }),
        request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ patternName: 'BOX_BREATHING' }),
        request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ patternName: 'QUICK_BREATH' })
      ]);
    });

    it('should return user sessions with default limit', async () => {
      const response = await request(app)
        .get('/api/breathing/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/breathing/sessions?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/breathing/effectiveness', () => {
    beforeEach(async () => {
      // Create and complete sessions
      const session1 = await request(app)
        .post('/api/breathing/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patternName: '4-7-8',
          stressLevelBefore: 8
        });

      await request(app)
        .put(`/api/breathing/session/${session1.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedCycles: 4,
          stressLevelAfter: 4
        });

      const session2 = await request(app)
        .post('/api/breathing/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patternName: 'BOX_BREATHING',
          stressLevelBefore: 7
        });

      await request(app)
        .put(`/api/breathing/session/${session2.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedCycles: 4,
          stressLevelAfter: 3
        });
    });

    it('should return effectiveness metrics', async () => {
      const response = await request(app)
        .get('/api/breathing/effectiveness')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('averageStressReduction');
      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('mostEffectivePattern');
    });

    it('should handle users with no sessions', async () => {
      const newToken = jwt.sign({ _id: 'new-user', username: 'new-test-user' }, config.jwtSecret, { expiresIn: '1h' });
      const response = await request(app)
        .get('/api/breathing/effectiveness')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        averageStressReduction: 0,
        totalSessions: 0,
        mostEffectivePattern: ''
      });
    });
  });

  describe('Error Scenarios', () => {
    describe('Session Creation Errors', () => {
      it('should handle invalid pattern name', async () => {
        const response = await request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patternName: 'invalid-pattern',
            stressLevelBefore: 7
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/invalid pattern/i);
      });

      it('should handle missing required fields', async () => {
        const response = await request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Session Completion Errors', () => {
      it('should handle invalid session ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/api/breathing/session/${invalidId}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedCycles: 4,
            stressLevelAfter: 3
          });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
      });

      it('should prevent completing already completed session', async () => {
        const session = await request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patternName: '4-7-8',
            stressLevelBefore: 7
          });

        await request(app)
          .put(`/api/breathing/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedCycles: 4,
            stressLevelAfter: 3
          });

        const secondComplete = await request(app)
          .put(`/api/breathing/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedCycles: 5,
            stressLevelAfter: 2
          });

        expect(secondComplete.status).toBe(400);
        expect(secondComplete.body).toHaveProperty('error');
        expect(secondComplete.body.error).toMatch(/already completed/i);
      });
    });

    describe('Authorization Errors', () => {
      it('should prevent accessing another user\'s session', async () => {
        const session = await request(app)
          .post('/api/breathing/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            patternName: '4-7-8',
            stressLevelBefore: 7
          });

        const otherUserToken = jwt.sign({ _id: 'other-user', username: 'other-test-user' }, config.jwtSecret, { expiresIn: '1h' });
        const response = await request(app)
          .put(`/api/breathing/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send({
            completedCycles: 4,
            stressLevelAfter: 3
          });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/unauthorized/i);
      });

      it('should handle expired tokens', async () => {
        const expiredToken = jwt.sign({ _id: testUserId, username: testUsername }, config.jwtSecret, { expiresIn: '0s' });
        const response = await request(app)
          .get('/api/breathing/sessions')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/invalid token/i);
      });
    });

    describe('Query Parameter Errors', () => {
      it('should handle invalid limit parameter', async () => {
        const response = await request(app)
          .get('/api/breathing/sessions?limit=invalid')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should handle out of range limit parameter', async () => {
        const response = await request(app)
          .get('/api/breathing/sessions?limit=1001')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/limit/i);
      });
    });
  });
}); 