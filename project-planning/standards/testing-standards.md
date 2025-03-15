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

Based on lessons learned from Sprint One, we've established the following standards for API error responses:

### Error Response Format
- All API error responses should follow a consistent format with an `error` property containing the error message
- Never mix `message` and `error` properties in responses
- Example:
```typescript
// Correct format
return res.status(404).json({ error: 'User not found' });

// Incorrect format - don't use this
return res.status(404).json({ message: 'User not found' });
```

### Error Status Code Standardization
- Use appropriate HTTP status codes for different error scenarios:
  - `400` Bad Request: For validation errors or malformed requests
  - `401` Unauthorized: For authentication errors (missing or invalid token)
  - `403` Forbidden: For authorization errors (insufficient permissions)
  - `404` Not Found: When requested resource doesn't exist
  - `409` Conflict: When request conflicts with current state
  - `500` Internal Server Error: For unexpected server errors

### Error Testing
- Test both the error message and status code in error scenarios
- Verify that the response contains the `error` property
- Example:
```typescript
it('should return 404 when user not found', async () => {
  const response = await request(app)
    .get('/api/users/nonexistentid')
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toBe('User not found');
});
```

## Authentication & Authorization Testing

### Authentication Token Structure
- All test tokens should include both `_id` and `username` properties to match production requirements
- Use consistent token structure across all tests
- Example:
```typescript
const token = jwt.sign(
  { _id: userId, username: 'testuser' },
  process.env.JWT_SECRET
);
```

### Authentication Testing
- Test both successful authentication and failure cases
- Verify token validation and expiration
- Test missing, invalid, and expired tokens
- Example:
```typescript
it('should reject request with invalid token', async () => {
  const response = await request(app)
    .get('/api/protected-route')
    .set('Authorization', 'Bearer invalid-token');
  
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('error');
});
```

### Authorization Checks
- All resource access should include ownership verification tests
- Test that users cannot access resources they don't own
- Example:
```typescript
it('should prevent access to another user\'s data', async () => {
  // Create two users
  const user1 = await createTestUser();
  const user2 = await createTestUser();
  
  // Create resource owned by user1
  const resource = await createTestResource(user1.userId);
  
  // Attempt to access with user2's token
  const response = await request(app)
    .get(`/api/resources/${resource._id}`)
    .set('Authorization', `Bearer ${user2.token}`);
  
  expect(response.status).toBe(403);
  expect(response.body).toHaveProperty('error');
});
```

## MongoDB Testing Best Practices

### Connection Management
- Enhance connection management using the in-memory MongoDB server
- Properly handle connection errors and cleanup
- Use consistent connection patterns across tests
- Example:
```typescript
// In setup.ts
beforeAll(async () => {
  await dbHelper.connect();
});

afterEach(async () => {
  await dbHelper.clearDatabase();
});

afterAll(async () => {
  await dbHelper.closeDatabase();
});
```

### ObjectId Validation
- Validate MongoDB ObjectIds before using them in queries
- Use proper ObjectId comparison (string comparison may fail)
- Handle invalid ObjectId format gracefully
- Example:
```typescript
// Validation helper
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// In controller
if (!isValidObjectId(req.params.id)) {
  return res.status(400).json({ error: 'Invalid ID format' });
}

// In tests
it('should return 400 for invalid ObjectId format', async () => {
  const response = await request(app)
    .get('/api/resources/invalid-id')
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Invalid ID format');
});
```

## Test Lifecycle Management

### Skipped Tests
- Document all skipped tests with standardized comments explaining:
  - Why the test is skipped
  - What functionality it's testing
  - What needs to be implemented before it can be unskipped
- Example:
```typescript
// SKIPPED: Feature not yet implemented
// Description: Tests the achievement awarding functionality
// Requirements: Achievement service needs to implement checkAndAwardAchievements
// Related Issue: #123 - Implement achievement system
// Target Date: End of Sprint Three
it.skip('should award achievement when meditation session is completed', async () => {
  // Test implementation
});
```

### Test Review Process
- Conduct quarterly reviews of all skipped tests
- Document decisions to keep tests skipped or implement them
- Update test documentation with current status
- Create tracking issues for tests that should be unskipped in upcoming sprints

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
  expect(response.body.error).toBe('Invalid token');
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
  expect(response.body.error).toBe('Access denied');
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

---

*[← Back to Main README](../README.md)* 