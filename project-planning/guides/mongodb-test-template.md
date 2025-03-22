# MongoDB Test Template

This template provides a starting point for implementing route tests using the direct controller testing pattern that avoids timeout issues with MongoDB connections.

## Test Template for API Routes

```typescript
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Imports
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { connectToTestDB, closeTestDB } from '../utils/test-db';
import { YourController } from '../../controllers/your-controller';
import { YourModel } from '../../models/your-model';
import {
  createTestData,
  clearTestData
} from '../helpers/your-test-helpers';

// ---- Test Configuration ----

// Shorter timeout for faster feedback on failures
jest.setTimeout(5000);

// Test user data
const testUserId = new mongoose.Types.ObjectId().toString();
const testUsername = 'testuser';
let authToken: string;

// ---- Helper Functions ----

// Connection state logging helper
const logConnectionState = async (label: string) => {
  const state = mongoose.connection.readyState;
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  console.log(`[${label}] Connection state: ${stateMap[state] || state}`);
  const openConnections = mongoose.connections.length;
  console.log(`[${label}] Open connections: ${openConnections}`);
};

// Mock response factory
const createMockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn(() => res as any),
    json: jest.fn(),
    send: jest.fn(),
  };
  return res as Response;
};

// Mock middleware if needed
jest.mock('../../middleware/auth.middleware', () => {
  const authMiddleware = jest.fn((req: Request, res: Response, next: Function) => {
    console.log('Mock auth middleware called');
    req.user = { _id: testUserId, username: testUsername };
    next();
  });
  
  return {
    authenticateToken: authMiddleware,
    authenticateUser: authMiddleware
  };
});

// ---- Test Suite ----

describe('Your Controller Tests', () => {
  // ---- Setup & Teardown ----
  
  beforeAll(async () => {
    // Connect to test database
    await connectToTestDB();
    
    // Generate auth token for testing
    authToken = jwt.sign({ _id: testUserId, username: testUsername }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    
    // Verify connection state at test start
    await logConnectionState('beforeAll');
  });

  afterAll(async () => {
    // Clean up test resources
    await clearTestData();
    
    // Add small delay before disconnecting to ensure all operations are complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Disconnect from test database
    await closeTestDB();
    
    // Verify connection state after cleanup
    await logConnectionState('afterAll');
  });

  beforeEach(async () => {
    // Reset test data before each test
    await clearTestData();
    
    // Create sample test data
    await createTestData({
      // Your test data here...
    });
  });

  // ---- Test Cases ----
  
  // Database Connection Tests
  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      const state = mongoose.connection.readyState;
      expect(state).toBe(1); // 1 = connected
    });
  });
  
  // Controller Tests
  describe('Controller Methods', () => {
    // Test method success case
    it('should return data successfully', async () => {
      const controller = new YourController();
      const req = { user: { _id: testUserId } } as unknown as Request;
      const res = createMockResponse();
      
      await controller.yourMethod(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    // Test with parameters
    it('should get item by ID', async () => {
      const controller = new YourController();
      const testItem = await YourModel.findOne();
      expect(testItem).not.toBeNull();
      
      const req = {
        user: { _id: testUserId },
        params: { id: testItem?._id?.toString() }
      } as unknown as Request;
      
      const res = createMockResponse();
      
      await controller.getItemById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    // Test error handling
    it('should handle invalid ID format', async () => {
      const controller = new YourController();
      const req = {
        user: { _id: testUserId },
        params: { id: 'invalid-id' }
      } as unknown as Request;
      
      const res = createMockResponse();
      
      await controller.getItemById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID format' });
    });
    
    // Test non-existent resource
    it('should handle non-existent resource', async () => {
      const controller = new YourController();
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const req = {
        user: { _id: testUserId },
        params: { id: nonExistentId }
      } as unknown as Request;
      
      const res = createMockResponse();
      
      await controller.getItemById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resource not found' });
    });
    
    // Test resource creation
    it('should create a new resource', async () => {
      const controller = new YourController();
      const newItem = {
        name: 'Test Item',
        description: 'A test item',
        // Add other required properties
      };
      
      const req = {
        user: { _id: testUserId },
        body: newItem
      } as unknown as Request;
      
      const res = createMockResponse();
      
      await controller.createItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      
      // Verify the item was created in the database
      const createdItem = await YourModel.findOne({ name: 'Test Item' });
      expect(createdItem).not.toBeNull();
      expect(createdItem?.description).toBe('A test item');
    });
  });
});
```

## Test Helper Template

```typescript
// src/__tests__/helpers/your-test-helpers.ts

import mongoose from 'mongoose';
import { YourModel, IYourModel } from '../../models/your-model';

/**
 * Creates test data with provided options or defaults
 */
export const createTestData = async (
  options: Partial<IYourModel> = {}
): Promise<IYourModel> => {
  const defaultOptions = {
    name: 'Test Item',
    description: 'A test item for testing purposes',
    // Add default properties that match your model
  };

  const testData = { ...defaultOptions, ...options };
  const item = new YourModel(testData);
  await item.save();
  return item as IYourModel;
};

/**
 * Creates multiple test items at once
 */
export const createMultipleTestItems = async (
  count: number,
  baseOptions: Partial<IYourModel> = {}
): Promise<IYourModel[]> => {
  const items: IYourModel[] = [];
  for (let i = 0; i < count; i++) {
    const item = await createTestData({
      name: `Test Item ${i + 1}`,
      ...baseOptions
    });
    items.push(item);
  }
  return items;
};

/**
 * Clears all test data from the test database
 */
export const clearTestData = async (): Promise<void> => {
  await YourModel.deleteMany({});
  // Clear any other related collections
};

/**
 * Set up test helpers for beforeEach/afterEach hooks
 */
export const setupTests = () => {
  // Clear test data after each test
  afterEach(async () => {
    await clearTestData();
  });
}; 
```

## How to Use This Template

1. Copy the test template and replace the placeholders:
   - `YourController` → Your actual controller class
   - `YourModel` → Your model
   - `yourMethod` → The controller method you're testing
   - `createTestData`, `clearTestData` → Your helper functions

2. Customize the test cases based on your controller's functionality

3. Implement the test helper functions for your specific model

4. Run tests with appropriate flags:
   ```
   npx jest your-file.test.ts --verbose
   ```

Following this pattern will help prevent MongoDB connection timeout issues and make your tests more reliable and maintainable. 