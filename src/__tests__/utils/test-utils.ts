import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../../config';

/**
 * Type-safe error handler for testing validation errors
 */
export async function expectValidationError<T>(
  action: () => Promise<T>,
  expectedErrorFields: string[]
): Promise<void> {
  let error: any;
  try {
    await action();
    fail('Expected validation error but none was thrown');
  } catch (err) {
    error = err;
  }
  
  expect(error).toBeDefined();
  expect(error.name).toBe('ValidationError');
  
  for (const field of expectedErrorFields) {
    expect(error.errors[field]).toBeDefined();
  }
}

/**
 * Type-safe document finder with proper typing
 */
export async function findDocumentById<T extends mongoose.Document>(
  model: mongoose.Model<T>,
  id: mongoose.Types.ObjectId | string
): Promise<T> {
  const document = await model.findById(id);
  if (!document) {
    throw new Error(`Document not found with id: ${id}`);
  }
  return document;
}

/**
 * Create a test user with authentication token
 */
export function createTestUser(overrides: Partial<{ _id: string; username: string }> = {}) {
  const userId = overrides._id || new mongoose.Types.ObjectId().toString();
  const username = overrides.username || 'testuser';
  
  const user = {
    _id: userId,
    username
  };
  
  const authToken = jwt.sign(user, config.jwtSecret || 'test-secret', { expiresIn: '1h' });
  
  return {
    user,
    userId,
    authToken
  };
}

/**
 * Type-safe method to create a test document
 */
export async function createTestDocument<T extends mongoose.Document>(
  model: mongoose.Model<T>,
  data: any
): Promise<T> {
  const document = new model(data);
  await document.save();
  return document;
}

/**
 * Type-safe method to clean up test documents
 */
export async function cleanupTestDocuments<T extends mongoose.Document>(
  model: mongoose.Model<T>,
  filter: any
): Promise<void> {
  await model.deleteMany(filter);
}

/**
 * Type-safe method to compare ObjectIds
 */
export function compareObjectIds(id1: mongoose.Types.ObjectId | string, id2: mongoose.Types.ObjectId | string): boolean {
  return id1.toString() === id2.toString();
} 