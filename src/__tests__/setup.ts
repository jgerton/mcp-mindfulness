// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// Increase timeout for the entire test suite
jest.setTimeout(120000);

beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Configure MongoDB Memory Server with more robust settings
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
      maxPoolSize: 10,
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
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
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
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 10000,
        family: 4
      });
    }
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      await Promise.all(collections.map(collection => collection.deleteMany({})));
    }
  } catch (error) {
    console.error('Error during collection cleanup:', error);
    throw error;
  }
});

// Dummy test to avoid empty test suite warning
describe('Test Setup', () => {
  it('should connect to the in-memory database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
}); 