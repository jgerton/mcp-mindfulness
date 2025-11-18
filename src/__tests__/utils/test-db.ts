import mongoose, { ConnectOptions } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Connection options for MongoDB test database
 */
const mongooseOptions: ConnectOptions = {
  retryWrites: true,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  family: 4 // Use IPv4
};

/**
 * In-memory MongoDB server instance for testing
 */
let mongoServer: MongoMemoryServer;

// Connection states
const STATES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3
};

/**
 * Connect to the in-memory database before tests
 */
export const connectDB = async (): Promise<void> => {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === STATES.connected) {
      console.log('MongoDB is already connected, reusing connection');
      return;
    }

    // Create a new instance of MongoMemoryServer
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the database
    await mongoose.connect(mongoUri, mongooseOptions);
    
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

/**
 * Drop database, close the connection and stop the server
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    // Check if we're already disconnected
    if (mongoose.connection.readyState === STATES.disconnected) {
      console.log('MongoDB is already disconnected');
      return;
    }

    // Drop the database and close the connection
    if (mongoose.connection.readyState !== STATES.disconnected) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    // Stop the MongoMemoryServer
    if (mongoServer) {
      await mongoServer.stop();
    }

    // Small delay to ensure resources are released
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    // We'll swallow the error here to prevent test failures due to cleanup issues
  }
};

/**
 * Clear all collections in the database
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== STATES.connected) {
      console.log('Cannot clear database: MongoDB is not connected');
      return;
    }

    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('All collections cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

/**
 * Ensure MongoDB is connected
 */
export const ensureConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState !== STATES.connected) {
    await connectDB();
  }
};

/**
 * Get current MongoDB connection state
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const getConnectionState = (): number => {
  return mongoose.connection.readyState;
};

/**
 * Count active MongoDB connections
 */
export const countConnections = (): number => {
  return mongoose.connections.length;
};

/**
 * Check for connection leaks
 */
export const checkConnectionLeaks = (): boolean => {
  return countConnections() > 1; // We should only have one connection
};

/**
 * Log current connection state
 */
export const logConnectionState = (): void => {
  console.log({
    readyState: getConnectionState(),
    connectionsCount: countConnections(),
    hasLeaks: checkConnectionLeaks()
  });
}; 