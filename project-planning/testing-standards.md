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

### API Error Response Standards
- All API error responses must follow a consistent format with an `error` property containing the error message
- Error responses should include appropriate HTTP status codes:
  - 400: Bad Request (validation errors, malformed requests)
  - 401: Unauthorized (authentication errors)
  - 403: Forbidden (authorization errors)
  - 404: Not Found (resource not found)
  - 409: Conflict (resource already exists, state conflicts)
  - 500: Internal Server Error (unexpected errors)
- Test both the status code and error message format
- Example:
```typescript
it('should return 404 with proper error format when resource not found', async () => {
  const response = await request(app)
    .get('/api/resource/nonexistent-id')
    .set('Authorization', `Bearer ${validToken}`);
  
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toBe('Resource not found');
});
```

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

### TypeScript Testing Best Practices

#### Handling Type Errors in Tests

When working with Mongoose documents and TypeScript, you'll often encounter type errors related to property access. Here are best practices to avoid common issues:

1. **Properly Type Error Variables**:
   ```typescript
   // INCORRECT: Untyped error variable
   let error;
   try {
     await model.save();
   } catch (err) {
     error = err;
   }
   
   // CORRECT: Explicitly type the error variable
   let error: any;
   try {
     await model.save();
   } catch (err) {
     error = err;
   }
   ```

2. **Interface Extensions for Mongoose Documents**:
   ```typescript
   // Define interface extensions for documents with custom properties
   interface IAchievementDocument extends mongoose.Document, IAchievement {
     progress: number;
     target: number;
     completed: boolean;
     completedAt: Date;
   }
   
   // Use the extended interface in tests
   const achievement = await Achievement.findById(id) as IAchievementDocument;
   expect(achievement.progress).toBe(expectedProgress);
   ```

3. **Type Assertions for Mongoose Methods**:
   ```typescript
   // INCORRECT: Direct property access without type assertion
   const result = await Model.findById(id);
   expect(result.customProperty).toBe(expectedValue);
   
   // CORRECT: Use type assertion
   const result = await Model.findById(id) as IModelDocument;
   expect(result.customProperty).toBe(expectedValue);
   ```

4. **Consistent Interface Definitions**:
   - Ensure interfaces in models match their implementations
   - Keep property names consistent across the codebase
   - Document virtual properties in interfaces

5. **Type Guards for Null Checks**:
   ```typescript
   // INCORRECT: No null check
   const result = await Model.findById(nonExistentId);
   expect(result.property).toBe(value); // May cause null reference error
   
   // CORRECT: Use type guard
   const result = await Model.findById(nonExistentId);
   expect(result).not.toBeNull();
   if (result) {
     expect(result.property).toBe(value);
   }
   ```

#### Common TypeScript Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Property 'X' does not exist on type 'Document<unknown, {}, IModel>'` | Missing property in interface | Add the property to the interface definition |
| `Subsequent property declarations must have the same type` | Conflicting type definitions | Ensure consistent types across declarations |
| `Type 'X' is not assignable to type 'Y'` | Type mismatch | Use proper type assertions or update interface |
| `Object is possibly null or undefined` | Missing null check | Add null check or use optional chaining |
| `Cannot invoke an object which is possibly undefined` | Calling method on possibly undefined object | Add null check before method call |

#### Test Utility Functions for Type Handling

Create utility functions in your test helpers to handle common type operations:

```typescript
// src/__tests__/utils/test-utils.ts

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
```

### Type-First Development Approach

To address the frequent issues with TypeScript errors and parameter mismatches in our TDD process, we now follow a Type-First Development approach. This means defining and verifying shared interfaces and types before writing tests or implementation.

#### Key Principles

1. **Define Interfaces First**: Create interfaces for controllers, services, and models before writing any tests or implementation
2. **Share Types Between Tests and Implementation**: Use the same type definitions in both test and implementation code
3. **Use Explicit Parameter Types**: Define explicit types for all parameters in controller and service methods
4. **Create Type Guards**: Implement runtime type validation for parameters
5. **Use Test Data Factories**: Create type-safe factories for test data that match model interfaces

#### Required Steps in TDD Process

1. **Interface Definition Phase** (before writing tests):
   - Define controller, service, and model interfaces
   - Create request/response type definitions
   - Define parameter type guards
   - Create test data factories

2. **Test Implementation Phase**:
   - Import and use shared interfaces
   - Validate parameter types match expectations
   - Use test data factories for consistent data creation
   - Verify model schema matches interface definitions

3. **Implementation Phase**:
   - Implement controllers and services using shared interfaces
   - Use interface implementations for type checking
   - Leverage type guards for runtime validation

#### Example Type-First Code

```typescript
// Interface definition (shared by tests and implementation)
export interface IAchievementController {
  getAllAchievements(req: Request & {query?: {category?: string}}, res: Response): Promise<void>;
  getAchievementById(req: Request & {params: {id: string}}, res: Response): Promise<void>;
}

// Tests using shared interface
const controller: IAchievementController = new AchievementController();
// Type-checking will ensure controller implements the interface

// Implementation using shared interface
export class AchievementController implements IAchievementController {
  async getAllAchievements(req: Request & {query?: {category?: string}}, res: Response): Promise<void> {
    // Implementation
  }
}
```

See the [Type-First Development Guide](./guides/type-first-development-guide.md) and [API Test Patterns Guide](./guides/api-test-patterns-guide.md) for detailed implementation instructions.

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