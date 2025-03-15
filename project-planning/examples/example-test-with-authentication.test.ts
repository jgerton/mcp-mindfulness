import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { Session } from '../models/session.model';
import { User } from '../models/user.model';
import { clearTestCollection } from '../__tests__/helpers/db';

/**
 * Example test file with proper authentication testing
 * 
 * This test file demonstrates best practices for:
 * - Token generation with proper structure
 * - Authentication success and failure tests
 * - Authorization tests for resource ownership
 * - Consistent error response format validation
 * - Proper test setup and teardown
 */
describe('Session API', () => {
  let testUser1: any;
  let testUser2: any;
  let testSession: any;
  let validToken1: string;
  let validToken2: string;
  let invalidToken: string;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI as string);
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test collections
    await clearTestCollection('users');
    await clearTestCollection('sessions');

    // Create test users
    testUser1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123'
    });

    testUser2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123'
    });

    // Create test session
    testSession = await Session.create({
      userId: testUser1._id,
      duration: 10,
      type: 'breathing',
      stressLevelBefore: 7,
      startTime: new Date(),
      completed: false
    });

    // Generate tokens with proper structure
    validToken1 = jwt.sign(
      { _id: testUser1._id, username: testUser1.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    validToken2 = jwt.sign(
      { _id: testUser2._id, username: testUser2.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    invalidToken = 'invalid.token.string';
  });

  describe('GET /api/sessions/:id', () => {
    it('should return 200 and session data with valid token and ownership', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${validToken1}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testSession._id.toString());
      expect(response.body.userId).toBe(testUser1._id.toString());
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it('should return 401 with no token', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession._id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 403 when accessing another user\'s session', async () => {
      const response = await request(app)
        .get(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${validToken2}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 for non-existent session', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${validToken1}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Session not found');
    });

    it('should return 400 for invalid session ID format', async () => {
      const response = await request(app)
        .get('/api/sessions/invalid-id')
        .set('Authorization', `Bearer ${validToken1}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid session ID format');
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session with valid token and data', async () => {
      const sessionData = {
        duration: 15,
        type: 'pmr',
        stressLevelBefore: 8
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${validToken1}`)
        .send(sessionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.userId).toBe(testUser1._id.toString());
      expect(response.body.duration).toBe(sessionData.duration);
      expect(response.body.type).toBe(sessionData.type);
      expect(response.body.stressLevelBefore).toBe(sessionData.stressLevelBefore);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${validToken1}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const sessionData = {
        duration: 15,
        type: 'pmr',
        stressLevelBefore: 8
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(sessionData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('PATCH /api/sessions/:id/complete', () => {
    it('should complete a session with valid token and ownership', async () => {
      const completionData = {
        stressLevelAfter: 3
      };

      const response = await request(app)
        .patch(`/api/sessions/${testSession._id}/complete`)
        .set('Authorization', `Bearer ${validToken1}`)
        .send(completionData);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testSession._id.toString());
      expect(response.body.completed).toBe(true);
      expect(response.body.stressLevelAfter).toBe(completionData.stressLevelAfter);
      expect(response.body).toHaveProperty('endTime');
    });

    it('should return 403 when completing another user\'s session', async () => {
      const completionData = {
        stressLevelAfter: 3
      };

      const response = await request(app)
        .patch(`/api/sessions/${testSession._id}/complete`)
        .set('Authorization', `Bearer ${validToken2}`)
        .send(completionData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 400 when completing an already completed session', async () => {
      // First complete the session
      await Session.findByIdAndUpdate(testSession._id, {
        completed: true,
        endTime: new Date(),
        stressLevelAfter: 4
      });

      const completionData = {
        stressLevelAfter: 3
      };

      const response = await request(app)
        .patch(`/api/sessions/${testSession._id}/complete`)
        .set('Authorization', `Bearer ${validToken1}`)
        .send(completionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Session already completed');
    });
  });
}); 