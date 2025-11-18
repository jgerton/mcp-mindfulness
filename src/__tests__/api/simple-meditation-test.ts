// Set NODE_ENV to test to ensure the correct JWT secret is used
process.env.NODE_ENV = 'test';

import request from 'supertest';
import mongoose from 'mongoose';
import { app, closeServer } from '../../app';
import { connect, closeDatabase, clearDatabase } from '../utils/test-db';
import jwt from 'jsonwebtoken';
import config from '../../config';

// Mock the auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', username: 'test-user' };
    next();
  }),
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', username: 'test-user' };
    next();
  })
}));

describe('Simple Meditation API Test', () => {
  let authToken: string;
  
  beforeAll(async () => {
    await connect();
    
    // Create auth token for testing with a fixed ID that matches the mock
    authToken = jwt.sign(
      { _id: '507f1f77bcf86cd799439011', username: 'test-user' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  }, 30000);

  afterAll(async () => {
    await closeServer();
    await closeDatabase();
    
    // Add a small delay to ensure all connections are properly closed
    await new Promise(resolve => setTimeout(resolve, 500));
  }, 30000);

  beforeEach(async () => {
    await clearDatabase();
  });

  it('should access a simple API endpoint', async () => {
    // Test a simple GET endpoint first to verify the API is working
    const response = await request(app)
      .get('/api/meditation-sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .timeout(10000);
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessions');
  }, 15000);
}); 