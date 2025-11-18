# Achievement API Tests - Issues and Solutions

## Current Issues

The API route tests for achievement endpoints are currently experiencing the following issues:

1. **Connection Timeouts**: Tests timeout after 30 seconds without completing
2. **Socket Handles**: Open TCP socket handles remain after tests complete
3. **Database Connections**: Multiple MongoDB connections created but not properly closed
4. **Server Cleanup**: HTTP server not properly closed between tests
5. **Authentication**: Inconsistent auth token handling

## Root Causes

After analysis, we've identified these root causes:

1. **Server Lifecycle Management**: The Express server created with `app.listen()` is not properly closed between tests
2. **Connection Pooling Issues**: MongoDB creates new connections for each test but doesn't close them
3. **Request Handling**: Supertest requests aren't completing properly
4. **Middleware Mocking**: Authentication middleware is mocked but not always used effectively
5. **Test Isolation**: Tests are not properly isolated, causing state to leak between tests

## Solutions

### 1. Create Dedicated Test Server Utility

Create a test utility to properly manage server lifecycle:

```typescript
// src/__tests__/utils/test-server.ts
import { Application } from 'express';
import { Server } from 'http';
import request from 'supertest';

export class TestServer {
  private server: Server | null = null;
  
  constructor(private app: Application) {}
  
  async start(): Promise<void> {
    return new Promise(resolve => {
      this.server = this.app.listen(0, () => {
        resolve();
      });
    });
  }
  
  async stop(): Promise<void> {
    if (!this.server) return;
    
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) reject(err);
        this.server = null;
        resolve();
      });
    });
  }
  
  get httpServer(): Server | null {
    return this.server;
  }
  
  getRequest(): request.SuperTest<request.Test> {
    if (!this.server) {
      throw new Error('Server not started');
    }
    return request(this.app);
  }
}

export const createTestServer = (app: Application): TestServer => {
  return new TestServer(app);
};
```

### 2. Implement Connection Management Improvements

Enhance the test database utility to properly manage connections:

```typescript
// src/__tests__/utils/test-db.ts (additions)

// Track open connections
let openConnections: mongoose.Connection[] = [];

export const trackConnection = (conn: mongoose.Connection): void => {
  openConnections.push(conn);
};

export const closeAllConnections = async (): Promise<void> => {
  for (const conn of openConnections) {
    if (conn.readyState !== 0) {
      await conn.close();
    }
  }
  openConnections = [];
};
```

### 3. Create API Test Helper

Build a utility for API testing that combines server and DB management:

```typescript
// src/__tests__/utils/api-test-helper.ts
import { Application } from 'express';
import { createTestServer, TestServer } from './test-server';
import { setupTestDatabase, closeTestDB } from './test-db';
import request from 'supertest';

export class ApiTestHelper {
  private testServer: TestServer;
  
  constructor(app: Application) {
    this.testServer = createTestServer(app);
  }
  
  async setup(): Promise<void> {
    await setupTestDatabase();
    await this.testServer.start();
  }
  
  async teardown(): Promise<void> {
    await this.testServer.stop();
    await closeTestDB();
    // Add small delay to ensure all resources are released
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  getRequest(): request.SuperTest<request.Test> {
    return this.testServer.getRequest();
  }
}
```

### 4. Update Achievement API Tests

Modify the achievement route tests to use the new utilities:

```typescript
// src/__tests__/routes/achievement.routes.test.ts (api tests section)
import { ApiTestHelper } from '../utils/api-test-helper';
import { app } from '../../app';

describe('Achievement API Routes', () => {
  let apiHelper: ApiTestHelper;
  
  beforeAll(async () => {
    apiHelper = new ApiTestHelper(app);
    await apiHelper.setup();
  });
  
  afterAll(async () => {
    await apiHelper.teardown();
  });
  
  // Test cases using apiHelper.getRequest() instead of request(app)
});
```

### 5. Implement Test Isolation

Ensure each test properly cleans up resources after execution:

- Create data isolation helpers
- Use transaction-like patterns for database operations
- Create separate connection pools for each test suite
- Implement more aggressive cleanup in afterEach hooks

## Implementation Plan

1. Create test utilities (test-server.ts, api-test-helper.ts)
2. Update database connection management
3. Create dedicated achievement API test file separate from controller tests
4. Implement properly isolated tests with appropriate timeouts
5. Add monitoring for open handles during testing
6. Create comprehensive documentation for API testing patterns

## Expected Results

After implementing these changes:

1. API route tests should complete successfully without timeouts
2. No open handles should remain after tests complete
3. Database connections should be properly closed
4. Tests will be isolated and won't affect each other
5. CI/CD pipeline will run more reliably

## Note on Test-Driven Development

We should update our TDD process to include:

1. Proper test isolation from the beginning
2. Clear separation between unit tests and integration tests
3. Guidelines for managing test resource lifecycles
4. API testing patterns and best practices 