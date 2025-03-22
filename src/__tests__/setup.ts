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

let mongod: MongoMemoryServer;

// Increase timeout for slow tests
jest.setTimeout(30000);

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Configure mongoose for testing
mongoose.set('strictQuery', true);

// Helper function to wait for a short time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      // Add a small delay to ensure connection is fully closed
      await delay(100);
    }

    // Configure MongoDB Memory Server
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'jest',
        port: 27017,
        ip: '127.0.0.1',
      },
      binary: {
        version: '6.0.12',
        downloadDir: './.cache/mongodb-binaries',
      },
    });

    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      maxPoolSize: 5, // Reduce pool size to prevent connection issues
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 10000,
      family: 4
    });
  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Add a small delay before closing connections
    await delay(100);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      // Add a small delay to ensure connection is fully closed
      await delay(100);
    }
    
    if (mongod) {
      await mongod.stop({ force: true });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

beforeEach(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Reconnect if connection is lost
      const uri = mongod.getUri();
      await mongoose.connect(uri, {
        maxPoolSize: 5, // Reduce pool size to prevent connection issues
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 10000,
        family: 4
      });
    }
    
    if (mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.collections();
        // Add a small delay between operations
        await delay(50);
        
        // Process collections in sequence rather than in parallel to reduce connection load
        for (const collection of collections) {
          await collection.deleteMany({});
          // Small delay between collection operations
          await delay(10);
        }
      } catch (err) {
        console.error('Error clearing collections:', err);
        // Continue execution even if clearing fails
      }
    }
  } catch (error) {
    console.error('Error during collection cleanup:', error);
    // Don't throw here to allow tests to continue
    console.warn('Continuing tests despite cleanup error');
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
  }
});

/**
 * Sets up the app for testing with a clean database connection
 * Returns the Express app instance and a function to close the server
 */
export const setupAppForTesting = async () => {
  // Setup DB connection for testing, only if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness_test');
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
    // Only close mongoose if we opened it
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  };
  
  return { app, server, closeServer };
}; 