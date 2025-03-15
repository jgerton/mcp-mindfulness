import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../app';
import { MuscleGroup, PMRSession } from '../../models/pmr.model';
import jwt from 'jsonwebtoken';
import config from '../../config';

let mongoServer: MongoMemoryServer;
let authToken: string;
const testUserId = 'test-user-id';
const testUsername = 'test-user';

describe('PMR API Endpoints', () => {
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
    await MuscleGroup.deleteMany({});
    await PMRSession.deleteMany({});
  });

  describe('GET /api/pmr/muscle-groups', () => {
    beforeEach(async () => {
      await request(app)
        .get('/api/pmr/muscle-groups')
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should return all muscle groups in correct order', async () => {
      const response = await request(app)
        .get('/api/pmr/muscle-groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe('hands_and_forearms');
      expect(response.body[6].name).toBe('legs');
      
      // Check that the array is sorted by order
      for (let i = 0; i < response.body.length - 1; i++) {
        expect(response.body[i].order).toBeLessThanOrEqual(response.body[i + 1].order);
      }
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/pmr/muscle-groups');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/pmr/session', () => {
    it('should create a new PMR session', async () => {
      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 7
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('stressLevelBefore', 7);
      expect(response.body).toHaveProperty('completedGroups', []);
      expect(response.body).toHaveProperty('duration', 225); // Total duration of all muscle groups
    });

    it('should validate stress level', async () => {
      const response = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 11 // Invalid stress level
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/pmr/session/:sessionId/complete', () => {
    let sessionId: string;

    beforeEach(async () => {
      const sessionResponse = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 7
        });

      sessionId = sessionResponse.body._id;
    });

    it('should complete a PMR session', async () => {
      const completedGroups = ['hands_and_forearms', 'biceps', 'shoulders'];
      const response = await request(app)
        .put(`/api/pmr/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroups,
          stressLevelAfter: 3
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('completedGroups', completedGroups);
      expect(response.body).toHaveProperty('stressLevelAfter', 3);
      expect(response.body).toHaveProperty('endTime');
    });

    it('should validate completion data', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroups: 'invalid', // Should be array
          stressLevelAfter: 3
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/pmr/session/:sessionId/progress', () => {
    let sessionId: string;

    beforeEach(async () => {
      const sessionResponse = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 7
        });

      sessionId = sessionResponse.body._id;
    });

    it('should update session progress', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${sessionId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroup: 'hands_and_forearms'
        });

      expect(response.status).toBe(200);
      expect(response.body.completedGroups).toContain('hands_and_forearms');
    });

    it('should validate muscle group name', async () => {
      const response = await request(app)
        .put(`/api/pmr/session/${sessionId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroup: 'invalid_group'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/pmr/sessions', () => {
    beforeEach(async () => {
      // Create multiple sessions
      await Promise.all([
        request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 7 }),
        request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 8 }),
        request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 6 })
      ]);
    });

    it('should return user sessions with default limit', async () => {
      const response = await request(app)
        .get('/api/pmr/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/pmr/sessions?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/pmr/effectiveness', () => {
    beforeEach(async () => {
      // Create and complete sessions
      const session1 = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 8
        });

      await request(app)
        .put(`/api/pmr/session/${session1.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroups: ['hands_and_forearms', 'biceps', 'shoulders'],
          stressLevelAfter: 4
        });

      const session2 = await request(app)
        .post('/api/pmr/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stressLevelBefore: 7
        });

      await request(app)
        .put(`/api/pmr/session/${session2.body._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedGroups: ['hands_and_forearms', 'biceps', 'shoulders', 'face', 'chest_and_back'],
          stressLevelAfter: 3
        });
    });

    it('should return effectiveness metrics', async () => {
      const response = await request(app)
        .get('/api/pmr/effectiveness')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('averageStressReduction');
      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('averageCompletionRate');
    });

    it('should handle users with no sessions', async () => {
      const newToken = jwt.sign({ _id: 'new-user', username: 'new-test-user' }, config.jwtSecret, { expiresIn: '1h' });
      const response = await request(app)
        .get('/api/pmr/effectiveness')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        averageStressReduction: 0,
        totalSessions: 0,
        averageCompletionRate: 0
      });
    });
  });

  describe('Error Scenarios', () => {
    describe('Session Creation Errors', () => {
      it('should handle missing stress level', async () => {
        const response = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });

      it('should handle invalid stress level type', async () => {
        const response = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            stressLevelBefore: "high" // Should be number
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Progress Update Errors', () => {
      let sessionId: string;

      beforeEach(async () => {
        const session = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 7 });
        sessionId = session.body._id;
      });

      it('should handle invalid muscle group name', async () => {
        const response = await request(app)
          .put(`/api/pmr/session/${sessionId}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroup: 'nonexistent_group'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/invalid muscle group/i);
      });

      it('should prevent duplicate muscle group completion', async () => {
        await request(app)
          .put(`/api/pmr/session/${sessionId}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroup: 'hands_and_forearms'
          });

        const response = await request(app)
          .put(`/api/pmr/session/${sessionId}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroup: 'hands_and_forearms'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/already completed/i);
      });
    });

    describe('Session Completion Errors', () => {
      it('should handle invalid session ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/api/pmr/session/${invalidId}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroups: ['hands_and_forearms'],
            stressLevelAfter: 3
          });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error');
      });

      it('should prevent completing already completed session', async () => {
        const session = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 7 });

        await request(app)
          .put(`/api/pmr/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroups: ['hands_and_forearms'],
            stressLevelAfter: 3
          });

        const secondComplete = await request(app)
          .put(`/api/pmr/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroups: ['biceps'],
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
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 7 });

        const otherUserToken = jwt.sign({ id: 'other-user' }, config.jwtSecret, { expiresIn: '1h' });
        const response = await request(app)
          .put(`/api/pmr/session/${session.body._id}/progress`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send({
            completedGroup: 'hands_and_forearms'
          });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/unauthorized/i);
      });

      it('should handle malformed tokens', async () => {
        const response = await request(app)
          .get('/api/pmr/sessions')
          .set('Authorization', 'Bearer invalid.token.here');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/invalid token/i);
      });
    });

    describe('Data Validation Errors', () => {
      it('should handle invalid stress level range', async () => {
        const response = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            stressLevelBefore: 15 // Out of range
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/stress level/i);
      });

      it('should handle invalid completed groups format', async () => {
        const session = await request(app)
          .post('/api/pmr/session')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ stressLevelBefore: 7 });

        const response = await request(app)
          .put(`/api/pmr/session/${session.body._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            completedGroups: 'not_an_array',
            stressLevelAfter: 3
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/completed groups/i);
      });
    });
  });
}); 