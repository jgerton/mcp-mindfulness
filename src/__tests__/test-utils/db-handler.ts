import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

class DbHandler {
  mongod: MongoMemoryServer | null = null;

  async connect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    this.mongod = await MongoMemoryServer.create();
    await mongoose.connect(this.mongod.getUri());
  }

  async clearDatabase(): Promise<void> {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  async closeDatabase(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (this.mongod) {
      await this.mongod.stop();
    }
  }
}

export const dbHandler = new DbHandler();

/**
 * Connect to the in-memory database.
 */
export const connectToTestDB = async (): Promise<void> => {
  try {
    await dbHandler.connect();
    logConnectionState();
    console.log(`MongoDB successfully connected to ${dbHandler.mongod?.getUri()}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

/**
 * Disconnect from the in-memory database and close the connection.
 */
export const disconnectFromTestDB = async (): Promise<void> => {
  try {
    await dbHandler.closeDatabase();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('MongoDB disconnect error:', err);
    throw err;
  }
};

/**
 * Clear all data in the database
 */
export const clearDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    console.warn('Database not connected. Cannot clear database.');
    return;
  }

  await dbHandler.clearDatabase();
  console.log('Database cleared');
};

/**
 * Log the current connection state of MongoDB
 */
export const logConnectionState = (): void => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  console.log(`MongoDB connection state: ${states[mongoose.connection.readyState]}`);
}; 