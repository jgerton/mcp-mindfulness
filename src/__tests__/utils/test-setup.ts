import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MockAuthUtils } from './mock-types';

export async function setupTestDB(): Promise<void> {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB(): Promise<void> {
  await mongoose.disconnect();
  await mongoose.connection.close();
}

export function createMockAuthUtils(): MockAuthUtils {
  return {
    comparePasswords: jest.fn().mockResolvedValue(true),
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    generateToken: jest.fn().mockReturnValue('mock-token'),
    verifyToken: jest.fn().mockReturnValue({ id: 'mock-user-id' })
  };
}

export function mockModule(path: string, mocks: Record<string, jest.Mock>): void {
  jest.mock(path, () => mocks);
}

export function clearMocks(): void {
  jest.clearAllMocks();
  jest.resetModules();
} 