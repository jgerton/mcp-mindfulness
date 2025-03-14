// Import test setup first
import './helpers/test-setup';

import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { MeditationSession } from '../models/meditation-session.model';
import { SessionAnalytics } from '../models/session-analytics.model';
import { generateToken } from '../utils/jwt.utils';
import { connectDB, disconnectDB } from './helpers/db.helper';
import config from '../config';

describe('Session Analytics Integration', () => {
  let userId: string;
  let meditationId: string;
  let token: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();

    // Create test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id.toString();
    console.log('Test environment:', process.env.NODE_ENV);
    console.log('JWT secret:', process.env.JWT_SECRET);
    console.log('User ID:', userId);
    console.log('Username:', user.username);
    token = generateToken(user._id.toString(), user.username);
    console.log('Generated token:', token);

    // Create test meditation
    const meditation = await Meditation.create({
      title: 'Test Meditation',
      description: 'Test Description',
      audioUrl: 'test.mp3',
      duration: 10,
      type: 'guided',
      difficulty: 'beginner',
      category: 'mindfulness',
      tags: ['test']
    });
    meditationId = meditation._id.toString();
  });

  describe('Meditation Session Flow', () => {
    it('should complete meditation session flow', async () => {
      // Create a meditation session
      const response = await request(app)
        .post('/api/meditation-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          meditationId,
          duration: 10,
          completed: false,
          moodBefore: 'anxious'
        });

      expect(response.status).toBe(201);
      const sessionId = response.body.sessionId;

      // Complete the session
      const endResponse = await request(app)
        .post(`/api/meditation-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          duration: 10,
          durationCompleted: 10,
          completed: true,
          moodAfter: 'peaceful',
          notes: 'Test session completed'
        });

      expect(endResponse.status).toBe(200);
      expect(endResponse.body.status).toBe('completed');

      // Get session history
      const historyResponse = await request(app)
        .get('/api/analytics/history')
        .set('Authorization', `Bearer ${token}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.sessions).toHaveLength(1);
    });

    it('should handle invalid session ID', async () => {
      const invalidId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/meditation-sessions/${invalidId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          duration: 10,
          durationCompleted: 10,
          completed: true,
          moodAfter: 'peaceful',
          notes: 'Test session completed'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Session not found');
    });

    it('should prevent concurrent session creation', async () => {
      // Create first session
      await request(app)
        .post('/api/meditation-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          meditationId,
          duration: 10,
          completed: false,
          moodBefore: 'anxious'
        });

      // Attempt to create second session
      const response = await request(app)
        .post('/api/meditation-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          meditationId,
          duration: 10,
          completed: false,
          moodBefore: 'anxious'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Active session already exists');
    });
  });

  describe('Analytics Endpoints', () => {
    it('should retrieve session history with pagination', async () => {
      // Create and complete a session
      const session = await MeditationSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed',
        interruptions: 0,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      await SessionAnalytics.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        sessionId: session._id,
        startTime: session.startTime,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        interruptions: 0,
        maintainedStreak: false,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      const response = await request(app)
        .get('/api/analytics/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
    });

    it('should retrieve user statistics', async () => {
      // Create and complete a session
      const session = await MeditationSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed',
        interruptions: 0,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      await SessionAnalytics.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        sessionId: session._id,
        startTime: session.startTime,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        interruptions: 0,
        maintainedStreak: false,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      const response = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalSessions).toBe(1);
    });

    it('should retrieve mood improvement stats', async () => {
      // Create and complete a session
      const session = await MeditationSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed',
        interruptions: 0,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      await SessionAnalytics.create({
        userId: new mongoose.Types.ObjectId(userId),
        meditationId: new mongoose.Types.ObjectId(meditationId),
        sessionId: session._id,
        startTime: session.startTime,
        duration: 10,
        durationCompleted: 10,
        completed: true,
        interruptions: 0,
        maintainedStreak: false,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      const response = await request(app)
        .get('/api/analytics/mood-stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalSessions).toBe(1);
      expect(response.body.totalImproved).toBe(1);
      expect(response.body.improvementRate).toBe(100);
    });

    it('should handle invalid authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/history')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });
});