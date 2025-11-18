# TypeScript Test Patterns Guide

## Overview

This guide establishes patterns for writing type-safe tests in TypeScript, ensuring consistency and reliability across our test suite.

## Core Principles

1. **Type Safety First**
   - All test utilities must be properly typed
   - No use of `any` unless absolutely necessary
   - Mock objects must match their real counterparts' types
   - Type assertions should be minimized

2. **Mock Type Patterns**

```typescript
// ❌ Incorrect: Using partial types without proper interface matching
const mockResponse = {
  status: jest.fn(),
  json: jest.fn()
};

// ✅ Correct: Implementing the full interface
interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
  _getJSON: () => any;
  _getStatus: () => number;
}
```

3. **Test Utility Type Patterns**

```typescript
// Generic test utility with proper type constraints
export function createTestUtility<T extends Document>(
  model: Model<T>
): TestUtility<T> {
  // Implementation
}

// Type-safe mock factory
export function createMockModel<T extends Document>(): jest.Mocked<Model<T>> {
  // Implementation
}
```

## Mock Implementation Patterns

### 1. Express Request/Response Mocking

```typescript
import { Request, Response } from 'express';

// Define complete interface matching Express types
export interface MockExpressResponse extends Partial<Response> {
  status: jest.Mock<MockExpressResponse>;
  json: jest.Mock<MockExpressResponse>;
  send: jest.Mock<MockExpressResponse>;
  // Include all methods you plan to use in tests
}

export function createMockResponse(): MockExpressResponse {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    // Implement all methods
  };
  return res as MockExpressResponse;
}
```

### 2. Mongoose Model Mocking

```typescript
import { Model, Document } from 'mongoose';

export function createMockModel<T extends Document>(): jest.Mocked<Model<T>> {
  const mock: jest.Mocked<Partial<Model<T>>> = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    // Include all model methods you need
  };
  return mock as jest.Mocked<Model<T>>;
}
```

## Test Case Type Patterns

### 1. Type-Safe Test Data

```typescript
interface TestCase<T> {
  input: T;
  expected: Partial<T>;
  description: string;
}

const testCases: TestCase<User>[] = [
  {
    input: { name: 'Test User', email: 'test@example.com' },
    expected: { id: expect.any(String) },
    description: 'should create user with valid input'
  }
];
```

### 2. Controller Test Pattern

```typescript
describe('Controller Tests', () => {
  // Type-safe setup
  let controller: TestController<TestModel>;
  let mockModel: jest.Mocked<Model<TestModel>>;
  let mockRequest: Partial<Request>;
  let mockResponse: MockExpressResponse;

  beforeEach(() => {
    mockModel = createMockModel<TestModel>();
    controller = new TestController(mockModel);
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  // Type-safe test cases
  it('should handle request', async () => {
    await controller.method(
      mockRequest as Request,
      mockResponse as unknown as Response
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

## Best Practices

1. **Type Assertions**
   - Use type assertions sparingly
   - Document why each type assertion is necessary
   - Prefer interface implementation over type assertion

2. **Mock Implementations**
   - Implement complete interfaces for mocks
   - Use jest.Mock type for mock functions
   - Maintain type safety in mock return values

3. **Test Utilities**
   - Create reusable, type-safe test utilities
   - Use generics for flexible, type-safe functions
   - Document type constraints and requirements

4. **Error Cases**
   - Include type checking in error case tests
   - Verify error types are correctly handled
   - Test type guard functions thoroughly

## Implementation Examples

### 1. Type-Safe Controller Test

```typescript
import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

interface TestDocument extends Document {
  name: string;
  value: number;
}

describe('Controller Test', () => {
  let mockModel: jest.Mocked<Model<TestDocument>>;
  let mockRequest: Partial<Request>;
  let mockResponse: MockExpressResponse;

  beforeEach(() => {
    mockModel = createMockModel<TestDocument>();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  it('should handle request', async () => {
    const testData: TestDocument = {
      name: 'Test',
      value: 123,
      _id: 'test-id'
    } as TestDocument;

    mockModel.findById.mockResolvedValue(testData);

    await controller.getById(
      mockRequest as Request,
      mockResponse as unknown as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(testData);
  });
});
```

## Migration Strategy

When updating existing tests to follow these patterns:

1. Start with mock implementations
2. Update test utilities
3. Refactor test cases
4. Add type safety gradually
5. Document type decisions

## Related Documentation

- [Testing Standards](../standards/testing-standards.md)
- [Type-First Development Guide](./type-first-development-guide.md)
- [Test Composition Pattern Guide](./test-composition-pattern-guide.md)

## Pre-Test Implementation Checklist

### 1. Dependency Analysis
```typescript
interface DependencyMap {
  imports: {
    path: string;
    module: string;
    usage: string[];
  }[];
  types: {
    name: string;
    source: string;
    properties: string[];
  }[];
  mocks: {
    target: string;
    requirements: string[];
    type: 'class' | 'function' | 'object';
  }[];
}
```

Example for Controller Test:
```typescript
const controllerDependencies: DependencyMap = {
  imports: [
    {
      path: '../utils/auth',
      module: 'comparePasswords',
      usage: ['login', 'updatePassword']
    }
  ],
  types: [
    {
      name: 'IUser',
      source: '../models/user.model',
      properties: ['_id', 'email', 'password']
    }
  ],
  mocks: [
    {
      target: '../utils/auth',
      requirements: ['comparePasswords', 'hashPassword'],
      type: 'function'
    }
  ]
};
```

### 2. Mock Factory Requirements
Before implementing tests:
- Create base mock factory for common types (Request, Response)
- Implement model-specific factories
- Define mock behavior expectations
- Document mock factory usage

### 3. Test Setup Verification
Checklist before writing tests:
- [ ] All required mock factories exist and are typed
- [ ] Base test utilities are implemented
- [ ] Error handling patterns are consistent
- [ ] Mock implementations match real interfaces
- [ ] Type definitions are complete
- [ ] Import paths are verified
- [ ] Authentication/Authorization mocks ready

### 4. Test Implementation Order
1. Create mock factories
2. Implement test utilities
3. Define test cases with types
4. Write test setup
5. Implement individual tests
6. Verify error scenarios
7. Run and verify

### 5. Common Pitfalls Prevention
- Incorrect import paths
- Async mock implementations
- Type mismatches
- Missing mock factory implementations
- Inconsistent error handling
- Incomplete interface implementations
- Missing type definitions
