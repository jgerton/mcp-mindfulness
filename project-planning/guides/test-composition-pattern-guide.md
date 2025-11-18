# Test Composition Pattern Guide

## Overview

This guide outlines our approach to composing test utilities and patterns in a modular, reusable way. By following these patterns, we ensure consistent test implementation and reduce duplication across our test suite.

## Core Test Utilities

### 1. Database Testing Utilities

```typescript
// src/__tests__/utils/db.ts
export const dbTestUtils = {
  connect: async () => {
    // Connection logic with proper error handling
  },
  
  disconnect: async () => {
    // Cleanup and disconnect logic
  },
  
  clearDatabase: async () => {
    // Database cleanup between tests
  },
  
  createTestData: async <T>(model: Model<T>, data: Partial<T>[]) => {
    // Standardized test data creation
  }
};
```

### 2. Request Testing Utilities

```typescript
// src/__tests__/utils/request.ts
export const requestTestUtils = {
  createTestApp: async () => {
    // Create isolated Express app for testing
  },
  
  createAuthenticatedRequest: (app: Express, user: IUser) => {
    // Create supertest instance with auth
  },
  
  createAuthToken: (user: IUser) => {
    // Generate test auth tokens
  }
};
```

### 3. Mock Factories

```typescript
// src/__tests__/utils/mocks.ts
export const mockFactories = {
  createUserMock: (overrides?: Partial<IUser>) => {
    // Create consistent user test data
  },
  
  createAchievementMock: (overrides?: Partial<IAchievement>) => {
    // Create consistent achievement test data
  }
};
```

## Composition Pattern

### 1. Test Utility Composition

```typescript
// src/__tests__/utils/index.ts
export const testUtils = {
  db: dbTestUtils,
  request: requestTestUtils,
  mocks: mockFactories
};
```

### 2. Usage in Tests

```typescript
describe('Achievement API', () => {
  const { db, request, mocks } = testUtils;
  let app: Express;
  
  beforeAll(async () => {
    await db.connect();
    app = await request.createTestApp();
  });
  
  beforeEach(async () => {
    await db.clearDatabase();
  });
  
  afterAll(async () => {
    await db.disconnect();
  });
  
  it('should create achievement', async () => {
    const mockUser = mocks.createUserMock();
    const mockAchievement = mocks.createAchievementMock();
    const req = request.createAuthenticatedRequest(app, mockUser);
    
    const response = await req
      .post('/api/achievements')
      .send(mockAchievement);
      
    expect(response.status).toBe(201);
  });
});
```

## Best Practices

### 1. Test Setup

- Use composition to access test utilities
- Keep setup code DRY through shared utilities
- Maintain test isolation
- Clean up resources properly

### 2. Mock Data

- Use mock factories for consistent test data
- Override only necessary properties
- Maintain type safety in mocks
- Document mock data patterns

### 3. Request Testing

- Create isolated app instances
- Handle authentication consistently
- Clean up connections properly
- Use typed request utilities

### 4. Database Testing

- Use shared connection management
- Clean database between tests
- Handle errors consistently
- Maintain data isolation

## Implementation Guidelines

### 1. Creating New Test Utilities

1. Identify common testing patterns
2. Create focused utility functions
3. Add to appropriate utility object
4. Document usage patterns
5. Update composition exports

### 2. Using Test Utilities

1. Import composed utilities
2. Destructure needed components
3. Set up test environment
4. Use utilities consistently
5. Clean up resources

### 3. Maintaining Test Utilities

1. Keep utilities focused
2. Update documentation
3. Maintain backward compatibility
4. Add new utilities as needed

## Migration Strategy

When migrating existing tests to use composition:

1. Identify common patterns
2. Create shared utilities
3. Update test setup
4. Verify test behavior
5. Document changes

## Related Documentation

- [Design Patterns Guide](./design-patterns-guide.md)
- [Testing Standards](../standards/testing-standards.md)
- [MongoDB Connection Guide](./mongodb-connection-guide.md) 