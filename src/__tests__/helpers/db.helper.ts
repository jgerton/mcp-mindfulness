import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  isConnected = true;
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }
  
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  isConnected = false;
};

export const clearDB = async () => {
  if (!isConnected) {
    await connectDB();
  }
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}; 