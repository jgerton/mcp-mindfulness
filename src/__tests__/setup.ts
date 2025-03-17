// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

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