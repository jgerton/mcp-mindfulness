# Testing Standards and Practices

[← Back to Main README](../README.md)

## Related Documentation
- [Coding Standards](coding-standards.md) - Implementation quality for both practices
- [Architecture Plan](architecture-plan.md) - Testing infrastructure for integrated features
- [Work Flow](work-flow.md) - Development and testing process
- [Learning Analytics](learning-analytics-plan.md) - Wellness metrics validation

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

---

*[← Back to Main README](../README.md)* 