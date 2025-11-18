// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import meditationRoutes from '../routes/meditation.routes';
import userRoutes from '../routes/user.routes';
import achievementRoutes from '../routes/achievement.routes';
import groupSessionRoutes from '../routes/group-session.routes';
import friendRoutes from '../routes/friend.routes';
import chatRoutes from '../routes/chat.routes';
import sessionAnalyticsRoutes from '../routes/session-analytics.routes';
import meditationSessionRoutes from '../routes/meditation-session.routes';
import cacheStatsRoutes from '../routes/cache-stats.routes';
import stressManagementRoutes from '../routes/stress-management.routes';
import breathingRoutes from '../routes/breathing.routes';
import pmrRoutes from '../routes/pmr.routes';
import stressRoutes from '../routes/stress.routes';
import exportRoutes from '../routes/export.routes';
import stressTechniqueRoutes from '../routes/stress-technique.routes';
import { setupSwagger } from '../config/swagger';

// Increase timeout for slow tests
jest.setTimeout(60000); // Increase timeout to 60 seconds

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Configure mongoose for testing
mongoose.set('strictQuery', true);

// Helper function to wait for a short time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mongod: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear database between tests
beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

// Verify database connection
describe('Test Setup', () => {
  it('should connect to the in-memory database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});

// Add custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSortedBy(sortKey: string): R;
      toBeValidId(): R;
    }
  }
}

expect.extend({
  toBeSortedBy(received, sortKey) {
    const pass = Array.isArray(received) && 
      received.every((item, index) => 
        index === 0 || 
        String(received[index-1][sortKey]) <= String(item[sortKey])
      );
    
    if (pass) {
      return {
        message: () => `expected array not to be sorted by ${sortKey}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected array to be sorted by ${sortKey}`,
        pass: false
      };
    }
  },
  toBeValidId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      message: () => `expected ${received} to be a valid MongoDB ObjectId`,
      pass
    };
  }
});

/**
 * Sets up the app for testing with a clean database connection
 * Returns the Express app instance and a function to close the server
 */
export const setupAppForTesting = async () => {
  // Ensure we have a database connection
  if (mongoose.connection.readyState !== 1) {
    const testMongod = await MongoMemoryServer.create();
    await mongoose.connect(testMongod.getUri());
  }
  
  // Create a test app instance
  const app = express();
  app.use(express.json());
  
  // Setup basic middleware
  app.use(express.urlencoded({ extended: true }));
  
  // Setup Swagger
  setupSwagger(app);
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/meditations', meditationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/group-sessions', groupSessionRoutes);
  app.use('/api/friends', friendRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/analytics', sessionAnalyticsRoutes);
  app.use('/api/meditation-sessions', meditationSessionRoutes);
  app.use('/api/cache-stats', cacheStatsRoutes);
  app.use('/api/stress-management', stressManagementRoutes);
  app.use('/api/breathing', breathingRoutes);
  app.use('/api/pmr', pmrRoutes);
  app.use('/api/stress', stressRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/stress-techniques', stressTechniqueRoutes);
  
  // Return both the app and a function to close connections
  const server = app.listen(0); // Random available port
  
  const closeServer = async () => {
    server.close();
    // Don't close mongoose here - it's managed globally in the test setup
  };
  
  return { app, server, closeServer };
}; 