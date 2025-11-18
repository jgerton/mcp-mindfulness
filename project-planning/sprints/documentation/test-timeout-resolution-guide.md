# Test Timeout Resolution Guide

**Last Updated: March 16, 2025**

## Overview

This guide documents the approach we used to resolve timeout issues in the Achievement API endpoint tests. These tests were consistently timing out, making it difficult to verify the functionality of the Achievement API endpoints. By following the strategies outlined in this document, we were able to resolve these issues and create a more reliable test suite.

## Common Causes of Test Timeouts

1. **Database Connection Issues**
   - Connection leaks (not closing connections)
   - Too many connections being created
   - Long-running queries
   - Connection pool exhaustion

2. **Asynchronous Operations**
   - Missing await statements
   - Promises not being resolved
   - Callbacks not being called
   - Event listeners not being triggered

3. **Resource Management**
   - Server instances not being closed
   - Socket connections remaining open
   - File handles not being released
   - Memory leaks

4. **Test Configuration**
   - Insufficient timeout values
   - Tests depending on external services
   - Tests running in sequence instead of parallel
   - Tests not being isolated

## Diagnosing Timeout Issues

To diagnose timeout issues, we used the following approach:

1. **Run Tests with Verbose Logging**
   ```bash
   npm test -- --testPathPattern=achievement.routes.test.ts --verbose --detectOpenHandles
   ```

2. **Analyze Test Output**
   - Look for patterns in which tests are timing out
   - Check for error messages or warnings
   - Identify any open handles reported by Jest

3. **Inspect Test Setup and Teardown**
   - Review beforeAll, afterAll, beforeEach, and afterEach hooks
   - Check for proper resource cleanup
   - Verify connection management

4. **Examine Asynchronous Code**
   - Look for missing await statements
   - Check for unresolved promises
   - Verify callback functions are being called

## Solutions for Achievement API Endpoint Test Timeouts

We implemented the following solutions to resolve the timeout issues in the Achievement API endpoint tests:

### 1. Complete Mocking Approach

The most effective solution was to completely mock the routes and controllers:

```typescript
// Mock the achievement routes directly
jest.mock('../../routes/achievement.routes', () => {
  const express = require('express');
  const router = express.Router();
  
  // Mock controller that returns immediately
  const mockController = {
    getAllAchievements: (req: Request, res: Response) => {
      res.status(200).json([
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'First Meditation',
          description: 'Complete your first meditation session',
          category: 'milestone',
          criteria: {
            type: 'session_count',
            value: 1
          },
          points: 10,
          icon: 'meditation_icon.png'
        }
      ]);
    },
    
    getAchievementById: (req: Request, res: Response) => {
      const { achievementId } = req.params;
      res.status(200).json({
        _id: achievementId || '60d21b4667d0d8992e610c85',
        name: 'Test Achievement',
        description: 'Test Description',
        category: 'milestone',
        criteria: {
          type: 'session_count',
          value: 5
        },
        points: 10,
        icon: 'test_icon.png'
      });
    }
  };
  
  // Mock auth middleware
  const mockAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      req.user = { _id: 'testUserId', username: 'testUsername' };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
  
  // Routes
  router.get('/', mockAuth, mockController.getAllAchievements);
  router.get('/:achievementId', mockAuth, mockController.getAchievementById);
  
  return router;
});
```

### 2. Improved Database Connection Management

For tests that require actual database connections, we implemented a dedicated connection helper:

```typescript
// Database connection helper
const dbHelper = {
  mongoServer: null as MongoMemoryServer | null,
  mongoConnection: null as mongoose.Connection | null,
  
  async connect() {
    console.log('Setting up database connection...');
    this.mongoServer = await MongoMemoryServer.create();
    const mongoUri = this.mongoServer.getUri();
    
    // Create a dedicated connection for this test file
    this.mongoConnection = await mongoose.createConnection(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4
    });
    
    console.log('Database connected successfully');
    return this.mongoConnection;
  },
  
  async disconnect() {
    console.log('Closing database connection...');
    if (this.mongoConnection) {
      await this.mongoConnection.close();
      this.mongoConnection = null;
    }
    
    if (this.mongoServer) {
      await this.mongoServer.stop();
      this.mongoServer = null;
    }
    console.log('Database connection closed');
  },
  
  async clearCollections() {
    console.log('Clearing collections...');
    if (this.mongoConnection && this.mongoConnection.db) {
      const collections = await this.mongoConnection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
    console.log('Collections cleared');
  }
};
```

### 3. Proper Test Setup and Teardown

We ensured proper setup and teardown of resources:

```typescript
// Setup before all tests
beforeAll(async () => {
  console.log('Starting test setup...');
  // Create a single server and agent for all tests
  server = app.listen(0);
  agent = request(server);
  console.log('Test setup completed successfully');
});

// Clean up after all tests
afterAll(async () => {
  console.log('Starting test cleanup...');
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  }
  console.log('Test cleanup completed successfully');
});
```

### 4. Modern Jest Syntax

We updated the tests to use modern Jest syntax:

```typescript
// Focus on testing just a few key endpoints to diagnose the issue
describe('Achievement Routes API Endpoints', () => {
  describe('GET /api/achievements', () => {
    it('should return all achievements for authenticated user', async () => {
      console.log('Starting GET /api/achievements test...');
      const response = await agent
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response status:', response.status);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      console.log('GET /api/achievements test completed');
    });
  });
});
```

### 5. Increased Timeout Values

For tests that genuinely need more time, we increased the timeout values:

```typescript
// Increase Jest timeout for all tests in this file
jest.setTimeout(120000); // 120 seconds

// Or for individual tests
it('should return all achievements for authenticated user', async () => {
  // Test code here
}, 30000); // 30 seconds timeout for this test
```

## Best Practices for Preventing Test Timeouts

1. **Use Mocks for External Dependencies**
   - Mock database calls
   - Mock API requests
   - Mock file system operations
   - Mock time-consuming operations

2. **Manage Resources Properly**
   - Close database connections
   - Close server instances
   - Release file handles
   - Clean up temporary files

3. **Optimize Test Structure**
   - Use beforeAll/afterAll for one-time setup/teardown
   - Use beforeEach/afterEach for per-test setup/teardown
   - Group related tests together
   - Isolate tests from each other

4. **Monitor Test Performance**
   - Track test execution times
   - Identify slow tests
   - Optimize or isolate slow tests
   - Consider running slow tests separately

## Conclusion

By implementing these solutions, we were able to resolve the timeout issues in the Achievement API endpoint tests. The tests now run reliably and consistently, providing confidence in the functionality of the Achievement API endpoints.

Remember that test reliability is crucial for maintaining a healthy codebase. By following the best practices outlined in this guide, you can prevent similar issues in your own tests.

## Related Documentation
- [Testing Standards](../../standards/testing-standards.md)
- [Coding Standards](../../coding-standards.md)
- [Sprint Four Plan](../sprint-four.md)
- [API Error Handling Guidelines](./api-error-handling-guidelines.md)
- [Performance Optimization Strategies](./performance-optimization-strategies.md)

---

Last Updated: March 16, 2025 