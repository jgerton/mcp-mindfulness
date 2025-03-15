import mongoose from 'mongoose';
import { getTestDbName } from './test-env';

export const connectTestDb = async () => {
  const dbName = getTestDbName();
  const uri = process.env.MONGODB_URI?.replace(/\/[^/]+$/, `/${dbName}`) || 
    `mongodb://localhost:27017/${dbName}`;
    
  await mongoose.connect(uri);
};

export const closeTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      await db.dropDatabase();
    }
    await mongoose.connection.close();
  }
};

export const clearTestCollection = async (collectionName: string) => {
  if (mongoose.connection.readyState !== 0) {
    try {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection(collectionName).deleteMany({});
      }
    } catch (error) {
      // Collection might not exist, ignore error
    }
  }
};

export const getTestObjectId = () => new mongoose.Types.ObjectId();

/**
 * Helper to wait for database operations to complete
 * Useful for testing async operations
 */
export const waitForDb = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
}; 