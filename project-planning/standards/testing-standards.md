# Testing Standards and Practices

[← Back to Main README](../README.md)

## Related Documentation
- [Coding Standards](coding-standards.md) - Implementation quality for both practices
- [Architecture Plan](architecture-plan.md) - Testing infrastructure for integrated features
- [Work Flow](work-flow.md) - Development and testing process
- [Learning Analytics](learning-analytics-plan.md) - Wellness metrics validation
- [Test Documentation Template](testing/test-documentation-template.md) - Template for documenting skipped tests

## Overview
This document outlines the testing standards and practices for the MCP Stress Management and Mindfulness Practices Platform. It serves as a guide for ensuring both stress management and mindfulness features are thoroughly tested and work seamlessly together.

## Test Environment Setup

### Configuration
- Use Jest as the primary testing framework with TypeScript support
- MongoDB Memory Server for database testing
- Test timeout set to 120 seconds globally (configurable per test)
- Clear mocks, reset mocks, and restore mocks after each test
- Use `ts-jest` for TypeScript compilation
- Tests are located in `src/__tests__` directory
- Test files follow the naming pattern: `*.test.ts` for unit tests and `*.integration.test.ts` for integration tests

### Environment Variables
- Set `NODE_ENV=test` for test environment
- Use separate test secrets (e.g., `JWT_SECRET='test-secret'`)
- Never use production credentials in tests
- Configure environment variables in `setup.ts`

## Test Categories and Patterns

### 1. Unit Tests (`*.test.ts`)
- Test individual stress management and mindfulness functions
- Validate isolated feature behaviors
- Ensure accurate metric calculations
- Example structure from our codebase:
```typescript
describe('Wellness Feature', () => {
  describe('Stress Management', () => {
    it('should calculate stress reduction accurately', async () => {
      // Test implementation
    });
  });
  
  describe('Mindfulness Practice', () => {
    it('should track meditation progress correctly', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests (`*.integration.test.ts`)
- Test combined stress and mindfulness workflows
- Validate feature interactions
- Ensure seamless practice transitions
- Example from our codebase:
```typescript
describe('Combined Practice Flow', () => {
  it('should track both stress and mindfulness progress', async () => {
    // Implementation
  });
  
  it('should maintain separate yet linked metrics', async () => {
    // Implementation
  });
});
```

### 3. Model Tests
- Validate schema definitions
- Test model validations and constraints
- Verify required fields
- Test edge cases for field values
- Example pattern from our model tests:
```typescript
describe('Model Tests', () => {
  it('should create & save successfully with valid data', async () => {
    const validData = {
      // Valid test data
    };
    const saved = await new Model(validData).save();
    expect(saved._id).toBeDefined();
  });

  it('should fail with invalid data', async () => {
    const invalidData = {
      // Invalid test data
    };
    await expect(new Model(invalidData).save()).rejects.toThrow();
  });
});
```

### 4. Service Tests
- Test business logic implementation
- Verify service method behaviors
- Test error handling
- Ensure proper data transformation
- Example from our services:
```typescript
describe('ServiceName', () => {
  let service: Service;
  let mockDependency: jest.Mock;

  beforeEach(() => {
    mockDependency = jest.fn();
    service = new Service(mockDependency);
  });

  describe('methodName', () => {
    it('should process data correctly', async () => {
      // Test implementation
    });
  });
});
```

### 5. WebSocket Tests
- Test real-time communication
- Verify event handling
- Test connection management
- Handle timeouts and disconnections
- Example pattern:
```typescript
describe('WebSocket Feature', () => {
  let clientSocket: any;

  beforeEach(async () => {
    // Setup socket connection
    clientSocket = createTestSocket(authToken);
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  it('should handle events', (done) => {
    const timeout = setTimeout(() => done(new Error('Timeout')), 5000);
    
    clientSocket.on('event_name', (data) => {
      clearTimeout(timeout);
      expect(data).toMatchExpectation();
      done();
    });
  });
});
```

## Testing Practices

### Database Handling
- Clear database before each test using `mongoose.connection.dropDatabase()`
- Use unique identifiers for test data (e.g., `new mongoose.Types.ObjectId()`)
- Properly close connections after tests
- Handle connection errors gracefully
- Use helper functions for common database operations

### MongoDB Connection Management for Tests

Based on our experience resolving timeout issues in the achievement API endpoint tests, we've established the following best practices for MongoDB connection management in tests:

#### Direct Controller Testing vs. Route Testing

- **Prefer direct controller testing** when testing controller logic
  - More reliable and faster than testing through Express routes
  - Eliminates network overhead and potential supertest connection issues
  - Allows more precise control over test conditions
  - Example:
  ```typescript
  // Direct controller test
  it('should get user achievements', async () => {
    const controller = new AchievementController();
    const req = { user: { _id: userId } } as unknown as Request;
    const res = createMockResponse();
    
    await controller.getUserAchievements(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
  ```

#### Connection Lifecycle Management

- **Explicitly connect and disconnect** for each test suite
  - Use `connectToTestDB()` in `beforeAll`
  - Use `closeTestDB()` in `afterAll`
  - Add small delays between operations to prevent race conditions
  - Example:
  ```typescript
  beforeAll(async () => {
    await connectToTestDB();
    // Setup other test resources
  });

  afterAll(async () => {
    // Clean up test resources
    await clearTestData();
    
    // Add small delay to prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await closeTestDB();
  });
  ```

#### Connection Debugging

- **Add connection state logging** for troubleshooting
  - Track MongoDB connection state
  - Monitor open connection count
  - Use consistent logging patterns
  - Example:
  ```typescript
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
  ```

#### Mock Response Pattern

- **Use a consistent mock response factory** for controller tests
  - Create chainable mock responses
  - Include status, json, and send methods
  - Example:
  ```typescript
  const createMockResponse = () => {
    const res: Partial<Response> = {
      status: jest.fn(() => res as any),
      json: jest.fn(),
      send: jest.fn(),
    };
    return res as Response;
  };
  ```

#### Advanced Connection Troubleshooting

- **Diagnose connection leaks**
  - Look for tests that create connections but don't close them
  - Check for missing `await` on async cleanup functions
  - Identify controller functions that don't properly handle errors
  - Example cleanup logic with verification:
  ```typescript
  afterAll(async () => {
    // Verify no open handles before disconnection
    const handles = process._getActiveHandles();
    console.log(`Active handles before disconnect: ${handles.length}`);
    
    // Close database connection
    await closeTestDB();
    
    // Verify cleanup was successful
    const handlesAfter = process._getActiveHandles();
    console.log(`Active handles after disconnect: ${handlesAfter.length}`);
  });
  ```

#### Testing Express Controllers Directly

- **Mock the Express Request and Response objects**
  - Avoid the overhead of network requests
  - Eliminate potential socket/connection leaks
  - Test controller logic in isolation
  - Example mocking approach:
  ```typescript
  // Create mock request
  const createMockRequest = (userId: string, params = {}, body = {}) => {
    return {
      user: { _id: userId },
      params,
      body,
      query: {}
    } as unknown as Request;
  };
  
  // Mock controller test
  it('should update user preferences', async () => {
    const controller = new UserController();
    const req = createMockRequest(testUserId, {}, { 
      theme: 'dark',
      notifications: true 
    });
    const res = createMockResponse();
    
    await controller.updatePreferences(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    
    // Verify database was updated
    const user = await User.findById(testUserId);
    expect(user.preferences.theme).toBe('dark');
    expect(user.preferences.notifications).toBe(true);
  });
  ```

#### Middleware Mocking Best Practices

- **Mock authentication middleware** to avoid token generation/validation overhead
  - Simulate authenticated requests without JWT complexity
  - Bypass authorization checks for testing core logic
  - Example:
  ```typescript
  jest.mock('../../middleware/auth.middleware', () => {
    return {
      authenticateToken: jest.fn((req, res, next) => {
        console.log('Mock auth middleware called');
        req.user = { _id: testUserId, username: 'testuser' };
        next();
      }),
      validateRequest: jest.fn((req, res, next) => {
        console.log('Mock validation middleware called');
        next();
      })
    };
  });
  ```

#### Performance Optimization Tips

- **Use shorter timeouts** for faster feedback
  - Default to 5-10 seconds instead of 30+ seconds
  - Helps identify slow tests more quickly
  - Example:
  ```typescript
  // Set at top of test file
  jest.setTimeout(5000);
  
  // For specific longer tests
  it('should handle a complex operation', async () => {
    // Test logic
  }, 10000);
  ```

- **Use test helper modules** for standard operations
  - Create reusable test data generators
  - Implement standard database operations
  - Example test helper:
  ```typescript
  // src/__tests__/helpers/achievement-test.helpers.ts
  export const createTestAchievement = async (userId, options = {}) => {
    const defaultOptions = {
      title: 'Test Achievement',
      description: 'Achievement for testing',
      category: 'test',
      dateEarned: new Date(),
      // other defaults
    };
    
    const achievementData = { ...defaultOptions, ...options, userId };
    const achievement = new Achievement(achievementData);
    await achievement.save();
    return achievement;
  };
  ```

#### Template For New Test Files

We've created a standardized template for new test files that implements these best practices. See the [MongoDB Test Template](../guides/mongodb-test-template.md) for a complete example that you can copy and adapt for your tests.

### Test Data Management
- Use factory functions from `test-utils.ts` for creating test data
- Create unique test data per test
- Clean up test data in `afterEach` hooks
- Use meaningful test data that represents real scenarios
- Example helpers:
```typescript
export const createTestUser = () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const authToken = jwt.sign({ id: userId }, config.jwtSecret);
  return { userId, authToken };
};

export const createTestSession = async (userId: string, options = {}) => {
  // Session creation logic
};
```

### Assertions
- Use explicit assertions with meaningful messages
- Test both positive and negative cases
- Verify error conditions and messages
- Check edge cases and boundary conditions
- Common patterns:
```typescript
expect(result).toBeDefined();
expect(result.status).toBe('expected_status');
expect(async () => {
  await functionThatThrows()
}).rejects.toThrow('Expected error message');
```

### Error Handling
- Test error scenarios explicitly
- Verify error messages and codes
- Test validation errors
- Handle async errors properly
- Example:
```typescript
it('should handle errors', async () => {
  await expect(
    service.method(invalidInput)
  ).rejects.toThrow('Specific error message');
});
```

## API Error Response Standards

Based on lessons learned from our test fixes, we've established the following standards for API error responses:

### Error Response Format
- All API error responses must use an `error` property for the error message
- Never mix `message` and `error` properties in responses
- Example of correct format:
```json
{
  "error": "Resource not found"
}
```

### HTTP Status Codes
- Use consistent HTTP status codes across all endpoints:
  - 200: Successful operation
  - 201: Resource created successfully
  - 400: Bad request (validation errors, invalid input)
  - 401: Unauthorized (missing or invalid authentication)
  - 403: Forbidden (authenticated but not authorized)
  - 404: Not found (resource doesn't exist)
  - 409: Conflict (e.g., duplicate entry)
  - 500: Server error

### Error Handling Implementation
- Always use try/catch blocks in async controller methods
- Validate input data before database operations
- Check for resource existence before operations
- Verify resource ownership for protected operations
- Example implementation:
```typescript
try {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  
  // Check resource existence
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({ error: "Resource not found" });
  }
  
  // Verify ownership
  if (resource.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Not authorized to access this resource" });
  }
  
  // Proceed with operation
  // ...
} catch (error) {
  console.error("Operation failed:", error);
  return res.status(500).json({ error: "Server error" });
}
```

## Authentication & Authorization Testing

### Authentication Token Structure
- All test tokens must include both `_id` and `username` properties
- Use consistent token structure across all tests
- Example of correct token structure:
```typescript
const token = jwt.sign(
  { _id: user._id.toString(), username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Authentication Test Cases
- Test successful authentication with valid token
- Test rejection with missing token
- Test rejection with invalid token format
- Test rejection with expired token
- Example test structure:
```typescript
describe('Authentication', () => {
  it('should allow access with valid token', async () => {
    // Test implementation
  });
  
  it('should reject access with missing token', async () => {
    // Test implementation
  });
  
  it('should reject access with invalid token', async () => {
    // Test implementation
  });
  
  it('should reject access with expired token', async () => {
    // Test implementation
  });
});
```

### Authorization Test Cases
- Test that owner can access their resources
- Test that owner can modify their resources
- Test that non-owner cannot access protected resources
- Test that non-owner cannot modify protected resources
- Example test structure:
```typescript
describe('Authorization', () => {
  it('should allow owner to access their resource', async () => {
    // Test implementation
  });
  
  it('should allow owner to modify their resource', async () => {
    // Test implementation
  });
  
  it('should prevent non-owner from accessing resource', async () => {
    // Test implementation
  });
  
  it('should prevent non-owner from modifying resource', async () => {
    // Test implementation
  });
});
```

## MongoDB Testing Best Practices

### ObjectId Validation
- Always validate ObjectId format before database operations
- Include tests for invalid ObjectId format
- Example validation:
```typescript
if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid ID format" });
}
```

### Connection Management
- Use MongoDB Memory Server for tests
- Set up connection before all tests
- Close connection after all tests
- Clear collections between tests
- Example setup:
```typescript
beforeAll(async () => {
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Resource.deleteMany({});
});
```

### Database Error Handling
- Test database operation failures
- Mock database errors when necessary
- Include error handling in all database operations
- Example test:
```typescript
it('should handle database errors gracefully', async () => {
  jest.spyOn(Resource, 'findById').mockImplementationOnce(() => {
    throw new Error('Database error');
  });
  
  const response = await request(app)
    .get('/api/resources/123')
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(500);
  expect(response.body).toHaveProperty('error');
});
```

## Test Lifecycle Management

### Skipped Tests
- All skipped tests must have clear documentation explaining why they're skipped
- Use the standardized test documentation template
- Include information about what needs to be implemented before unskipping
- Example:
```typescript
// SKIPPED: This test is for the achievement system which is planned for Sprint Three
it.skip('should award achievement for completing 10 sessions', async () => {
  // Test implementation
});
```

### Test Review Process
- Review skipped tests at the end of each sprint
- Create tracking issues for tests that remain skipped
- Document the reason for continued skipping
- Schedule regular reviews of skipped tests

### Test Implementation Roadmap
- Prioritize test implementation based on feature roadmap
- Document dependencies between tests and features
- Update test status in implementation status document

## Best Practices

### 1. Test Organization
- Group related tests using nested `describe` blocks
- Use descriptive test names that explain the scenario
- Maintain test file structure parallel to source
- Keep tests focused and concise

### 2. Async Testing
- Always await async operations
- Use proper timeout values (default: 120s, adjust per test)
- Clean up resources in `afterEach` hooks
- Handle promises properly
- Example:
```typescript
jest.setTimeout(120000); // Global timeout
it('should handle async operation', async () => {
  // Async test implementation
}, 10000); // Per-test timeout
```

### 3. Test Helpers and Utilities
- Use helper functions from `test-utils.ts`
- Create reusable setup and teardown functions
- Share common test data creation logic
- Document helper functions

### 4. Continuous Integration
- Run tests on every pull request
- Maintain test stability
- Address test failures promptly
- Monitor test performance

### 5. Documentation
- Document complex test scenarios
- Maintain up-to-date test documentation
- Include examples for new test patterns
- Update documentation when adding new testing patterns 

## Additional Resources

### Internal References
- See [Frontend Interface Plan](frontend-interface-plan.md) for UI component testing guidelines
- Check [Learning Path Management](learning-path-management-plan.md) for testing user progression features
- Review [Document Grounding](document-grounding-plan.md) for content validation testing requirements

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [MongoDB Memory Server Guide](https://github.com/nodkz/mongodb-memory-server)

## Test Reliability & Common Pitfalls

### Database Connection Management

To prevent the common `MongooseError: Can't call openUri() on an active connection with different connection strings` error:

```typescript
// INCORRECT: Multiple direct connections
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

// CORRECT: Use a shared connection helper
import { dbHelper } from '../helpers/db';

beforeAll(async () => {
  await dbHelper.connect();
});

afterAll(async () => {
  await dbHelper.disconnect();
});

beforeEach(async () => {
  await dbHelper.clearDatabase();
});
```

### Authentication & Authorization Testing

#### Authentication Testing
- Test tokens must include all required properties (`_id` and `username` at minimum)
- Always test both successful authentication and failure cases
- Use consistent token generation in tests
- Example:
```typescript
// Token generation helper
const generateToken = (user = { _id: 'test-id', username: 'test-user' }) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Authentication success test
it('should authenticate with valid token', async () => {
  const token = generateToken();
  const response = await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(200);
});

// Authentication failure test
it('should reject invalid token', async () => {
  const response = await request(app)
    .get('/api/protected-route')
    .set('Authorization', 'Bearer invalid-token');
  
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('error');
});
```

#### Authorization Testing
- All resource access must include ownership verification tests
- Test that users cannot access resources they don't own
- Example:
```typescript
it('should prevent access to another user\'s resource', async () => {
  // Create resource owned by user1
  const user1 = { _id: 'user1-id', username: 'user1' };
  const resource = await Resource.create({ 
    name: 'Test Resource',
    userId: user1._id
  });
  
  // Attempt access with user2's token
  const user2 = { _id: 'user2-id', username: 'user2' };
  const token = generateToken(user2);
  
  const response = await request(app)
    .get(`/api/resources/${resource._id}`)
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(403);
  expect(response.body).toHaveProperty('error');
});
```

### Test Lifecycle Management

#### Handling Skipped Tests
- Use the standardized [Test Documentation Template](testing/test-documentation-template.md) for all skipped tests
- Document the reason for skipping, functionality being tested, and implementation requirements
- Review skipped tests quarterly to determine if they can be unskipped
- Example of a properly documented skipped test:
```typescript
/**
 * @skipped
 * @reason Feature not yet implemented
 * 
 * @description
 * Tests that a user receives the appropriate achievement after completing a milestone
 * 
 * @functionality
 * Achievement System
 * 
 * @implementation-requirements
 * - Achievement model must be implemented
 * - Achievement service must be implemented
 * - Milestone tracking must be in place
 * 
 * @target-completion
 * Sprint 3
 */
it.skip('should award achievement when milestone is reached', async () => {
  // Test implementation
});
```

#### Test Review Process
- Conduct quarterly reviews of all skipped tests
- Document decisions to keep tests skipped or implement them
- Update test documentation with current status
- Create tracking issues for tests that should be unskipped in upcoming sprints

### MongoDB Testing Best Practices

#### Connection Management
- Use MongoDB Memory Server for tests to avoid affecting production data
- Establish a single connection per test suite
- Properly close connections after tests complete
- Example:
```typescript
// src/__tests__/utils/test-db.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Connect to the in-memory database
module.exports.connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB server');
};

// Close the connection and stop the server
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  console.log('Closed in-memory MongoDB server');
};

// Clear all collections
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
```

#### ObjectId Validation
- Always validate ObjectId parameters before using them
- Use consistent type handling (string vs ObjectId)
- Compare ObjectIds as strings for equality checks
- Example:
```typescript
// Controller validation
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// In controller
if (!isValidObjectId(req.params.id)) {
  return res.status(400).json({ error: 'Invalid ID format' });
}

// In tests
it('should validate ObjectId', async () => {
  const invalidId = 'not-an-object-id';
  const response = await request(app).get(`/api/resources/${invalidId}`);
  
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Invalid ID format');
});

it('should compare ObjectIds correctly', async () => {
  const resource = await Resource.create({ name: 'Test' });
  const found = await Resource.findById(resource._id);
  
  // Convert both to strings for comparison
  expect(found._id.toString()).toBe(resource._id.toString());
});
```

## Test Coverage

- Aim for at least 80% code coverage for all modules
- Critical paths should have 100% coverage
- Track coverage using Jest coverage report
- Require high coverage for new features before merge
- Coverage reports are generated after running tests with coverage flag

## Error Handling in Tests

### Error Response Format

The platform uses a standardized structured error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "category": "ERROR_CATEGORY",
    "timestamp": "ISO timestamp",
    "requestId": "Request ID if available",
    "details": { ... },
    "userMessage": "User-friendly message"
  }
}
```

### Testing Error Scenarios

When testing error scenarios, follow these standards:

1. **Use the compatibility utilities**: 
   - Import from `src/__tests__/helpers/error-compatibility.helpers.ts`
   - Use `verifyErrorResponse` to check error response structure
   - Use `createTestErrorResponse` to create expected error responses

2. **Test both happy and error paths**:
   - Each endpoint should have tests for successful operations
   - Each endpoint should also have tests for relevant error scenarios
   - Test validation errors, authentication errors, and business logic errors

3. **Test error status codes**:
   - Verify that the appropriate HTTP status code is returned
   - Use constants from `HTTP_STATUS` when possible

4. **Test error codes and categories**:
   - Verify that the error code matches the expected error type
   - Use constants from `ErrorCodes` and `ErrorCategory` enums

### Error Test Examples

For detailed examples of testing error scenarios, refer to:
- [Error Compatibility Example](src/__tests__/examples/error-compatibility-example.test.ts)
- [Error Handling Test Migration Guide](project-planning/testing/error-handling-test-migration.md)

## Test Naming

- Use descriptive names for test suites and test cases
- Follow the pattern: `describe('[Component Name]', () => {...})`
- Name test cases with "should" format: `it('should do something', () => {...})`

### Mandatory Validation Testing Requirements

Based on our experience with the meditation controller tests, we've established these mandatory validation requirements:

#### Controller Tests Must Include:

1. **Request Body Validation**
   - Empty request body handling
   - Invalid field validation
   - Type validation for all fields
   - Required field validation
   - Example:
   ```typescript
   describe('updateResource', () => {
     it('should handle empty request body', async () => {
       // Test empty body
     });
     it('should handle invalid fields', async () => {
       // Test invalid fields
     });
   });
   ```

2. **Type Safety Validation**
   - Validate all type definitions are correct
   - Ensure mock objects match interface requirements
   - Test type coercion edge cases
   - Example:
   ```typescript
   const mockUser = {
     _id: new Types.ObjectId().toString(),
     username: 'testuser'
   };
   ```

3. **Service Method Validation**
   - Verify service method calls with correct parameters
   - Validate return types match expectations
   - Test error handling paths
   - Example:
   ```typescript
   expect(mockService.method).toHaveBeenCalledWith(
     expect.objectContaining({
       expectedField: expectedValue
     })
   );
   ```

4. **Mock Implementation Verification**
   - Verify mock implementations match real service behavior
   - Test mock return values and error cases
   - Ensure mocks are reset between tests
   - Example:
   ```typescript
   beforeEach(() => {
     jest.spyOn(Service, 'method')
       .mockImplementation(async () => expectedResult);
   });
   ```

#### Test Implementation Process

1. Write failing test first (TDD)
2. Run tests to catch type errors
3. Fix type errors
4. Run tests to catch mock/implementation issues
5. Fix mock/implementation issues
6. Verify all tests pass
7. Only then move to the next feature

#### Common Validation Patterns

1. **Request Validation**
```typescript
describe('Request Validation', () => {
  it('should validate empty request body', async () => {
    mockRequest.body = {};
    await controller.method(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('should validate invalid fields', async () => {
    mockRequest.body = { invalidField: 'value' };
    await controller.method(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
```

2. **Type Validation**
```typescript
describe('Type Validation', () => {
  it('should validate correct types', async () => {
    const validData = {
      stringField: 'string',
      numberField: 123,
      dateField: new Date()
    };
    await controller.method(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('should reject invalid types', async () => {
    const invalidData = {
      stringField: 123, // Should be string
      numberField: 'invalid', // Should be number
    };
    await controller.method(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
```

3. **Service Integration**
```typescript
describe('Service Integration', () => {
  it('should properly integrate with service', async () => {
    const serviceResult = { success: true };
    mockService.method.mockResolvedValue(serviceResult);
    await controller.method(mockRequest, mockResponse);
    expect(mockService.method).toHaveBeenCalledWith(
      expect.objectContaining(expectedParams)
    );
  });

  it('should handle service errors', async () => {
    mockService.method.mockRejectedValue(new Error('Service error'));
    await controller.method(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
```

#### Validation Checklist

Before marking tests as complete:

- [ ] Empty request body validation
- [ ] Invalid fields validation
- [ ] Type safety checks
- [ ] Service method validation
- [ ] Mock implementation verification
- [ ] Error handling paths
- [ ] Edge cases covered
- [ ] All tests passing
- [ ] No type errors
- [ ] Clean test output

---

*[← Back to Main README](../README.md)* 