import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | undefined;

// Increase timeout for the entire test suite
jest.setTimeout(120000);

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
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