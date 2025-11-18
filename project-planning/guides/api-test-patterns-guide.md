# API Test Patterns Guide

## Overview

This guide documents our standardized approach to API testing in our Node.js/Express application, focusing on patterns that improve reliability, maintainability, and isolation of tests. These patterns were developed while solving the Achievement API endpoint test timeout issues and should be applied to all API tests going forward.

## Type-First Development

> **Critical:** Before writing tests, define and verify shared interfaces and types. See the [Type-First Development Guide](./type-first-development-guide.md) for detailed guidance.

The most common test failures in our TDD process stem from type mismatches between tests and implementation. Always:

1. Define shared interfaces for controllers, services, and models
2. Extract request/response types into dedicated interface files
3. Create proper parameter typing for all controller methods
4. Share these types between tests and implementation

```typescript
// src/interfaces/controllers/achievement-controller.interface.ts
export interface IAchievementController {
  getAllAchievements(req: Request & {query?: {category?: string}}, res: Response): Promise<void>;
  getAchievementById(req: Request & {params: {id: string}}, res: Response): Promise<void>;
  createAchievement(req: Request & {body: CreateAchievementDto}, res: Response): Promise<void>;
}

// Both tests and implementation import this interface
import { IAchievementController } from '../../interfaces/controllers/achievement-controller.interface';
```

## Core Testing Pattern

### Creating Isolated Express Apps for Testing

Rather than using the main application instance, create a dedicated Express app for each test file:

```typescript
// Set the environment to 'test'
process.env.NODE_ENV = 'test';

// Import required modules
import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';

// Import controller and models
import { AchievementController } from '../../controllers/achievement.controller';
import { Achievement, IAchievement } from '../../models/achievement.model';
// Import shared interfaces
import { IAchievementController } from '../../interfaces/controllers/achievement-controller.interface';

// Create a dedicated test Express app
const app = express();

// Mock authentication middleware
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Type safe user object matching auth middleware expectations
  req.user = { _id: 'testUserId', username: 'testuser', role: 'user' };
  next();
};

// Initialize controller instance with proper typing
const achievementController: IAchievementController = new AchievementController();

// Setup routes for testing - with proper method binding
app.get('/api/achievements', mockAuthMiddleware, achievementController.getAllAchievements.bind(achievementController));
app.get('/api/achievements/:id', mockAuthMiddleware, achievementController.getAchievementById.bind(achievementController));
app.post('/api/achievements', mockAuthMiddleware, achievementController.createAchievement.bind(achievementController));

// Create supertest agent
const agent = supertest(app);
```

### Key Elements of This Pattern

1. **Dedicated Express App**: Creating a separate Express instance isolates the test environment from the main application.

2. **Environment Setting**: Always set `NODE_ENV` to 'test' at the top of test files.

3. **Type-Safe Authentication**: Implement a mock authentication middleware that adds a properly typed test user to requests.

4. **Interface-Based Controller**: Use shared interfaces to ensure controller implementation matches test expectations.

5. **Minimal Route Setup**: Register only the routes needed for the specific tests, avoiding unnecessary dependencies.

6. **Supertest Agent**: Create a single supertest agent for all tests in the file.

## Parameter Validation

### Contract Validation Before Implementation

Validate route parameters against controller expectations before implementation:

```typescript
// Define expected request parameters
interface GetAchievementParams {
  id: string;
}

interface FilterAchievementsQuery {
  category?: string;
  startDate?: string;
  endDate?: string;
}

describe('Parameter validation', () => {
  it('validates route parameters match controller expectations', () => {
    // Get the function signature 
    const getByIdMethod = achievementController.getAchievementById;
    
    // Get type information (requires reflect-metadata)
    const paramTypes = Reflect.getMetadata('design:paramtypes', achievementController, 'getAchievementById');
    
    // Verify parameter types match expectations
    expect(paramTypes[0]).toEqual(Request); // First param should be Request
  });
});
```

### Controller Parameter Extraction Testing

Test that controllers correctly extract and validate parameters:

```typescript
it('correctly extracts and validates the id parameter', async () => {
  // Invalid ID format
  let response = await agent.get('/api/achievements/invalid-id');
  expect(response.status).toBe(400);
  expect(response.body.error).toContain('Invalid ID format');
  
  // Valid ID but non-existent
  response = await agent.get('/api/achievements/60d21b4667d0d8992e610c86');
  expect(response.status).toBe(404);
});
```

## Test Data Factories

### Type-Safe Test Data Creation

Use factories to create consistent, type-safe test data:

```typescript
// src/__tests__/factories/achievement.factory.ts
import { IAchievement } from '../../models/achievement.model';
import mongoose from 'mongoose';

type AchievementInput = Partial<IAchievement>;

export function createTestAchievement(overrides: AchievementInput = {}): Omit<IAchievement, '_id'> {
  return {
    name: 'Test Achievement',
    description: 'Test description',
    category: 'milestone', // Using correct enum value
    userId: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

// Usage in tests:
const testData = createTestAchievement({ category: 'time' });
```

### Database Seeding with Type Validation

```typescript
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://localhost:27017/testdb');
  
  // Create type-safe test data
  testAchievements = await Promise.all([
    Achievement.create(createTestAchievement({ category: 'milestone' })),
    Achievement.create(createTestAchievement({ category: 'time' }))
  ]);
  
  // Validate that created documents match expected interface
  testAchievements.forEach(achievement => {
    // Verify required fields exist
    expect(achievement).toHaveProperty('_id');
    expect(achievement).toHaveProperty('category');
    expect(['milestone', 'time', 'streak', 'special']).toContain(achievement.category);
  });
});
```

## Database Setup and Teardown

### Connect to Test Database

Properly manage database connections for test isolation:

```typescript
// Database setup and teardown
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Setup test data
  await setupTestData();
});

afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Close database connection
  await mongoose.connection.close();
});
```

### Important Database Management Practices

1. **Test Database**: Always use a separate database for testing.

2. **Data Isolation**: Setup and clean test data for each test file.

3. **Connection Cleanup**: Properly close connections in the `afterAll` hook.

4. **Delay After Operations**: Add small delays after database operations to prevent race conditions.

## Controller Method Binding

### Proper Method Binding for Class-Based Controllers

When using class-based controllers, always bind methods when registering routes:

```typescript
// Incorrect - 'this' context will be lost
app.get('/api/achievements', mockAuthMiddleware, achievementController.getAllAchievements);

// Correct - 'this' context is maintained
app.get('/api/achievements', mockAuthMiddleware, achievementController.getAllAchievements.bind(achievementController));
```

### Alternative Approach with Arrow Functions

You can also use arrow functions as a wrapper:

```typescript
app.get('/api/achievements', mockAuthMiddleware, (req, res, next) => 
  achievementController.getAllAchievements(req, res, next)
);
```

## Implementation-Test Alignment Verification

### Pre-Implementation Verification

Before proceeding to implementation, verify that tests align with the planned implementation:

```typescript
describe('Implementation alignment verification', () => {
  it('verifies controller interface matches planned implementation', () => {
    // Verify controller implements expected interface
    expect(achievementController).toHaveProperty('getAllAchievements');
    expect(achievementController).toHaveProperty('getAchievementById');
    expect(achievementController).toHaveProperty('createAchievement');
    
    // Verify method signatures
    expect(typeof achievementController.getAllAchievements).toBe('function');
    expect(achievementController.getAllAchievements.length).toBeGreaterThanOrEqual(2); // At least req, res
  });
  
  it('verifies model schema matches test expectations', () => {
    // Get the model schema
    const schema = Achievement.schema.obj;
    
    // Verify required fields exist in schema
    expect(schema).toHaveProperty('name');
    expect(schema).toHaveProperty('category');
    
    // Verify enum values match test data
    const categoryField = schema.category;
    expect(categoryField.enum || []).toContain('milestone');
    expect(categoryField.enum || []).toContain('time');
  });
});
```

## Writing Effective API Tests

### Example Test Suite Structure

```typescript
describe('Achievement API Routes', () => {
  // Test data setup
  let testAchievements: any[];
  
  beforeAll(async () => {
    // Database connection and setup
    await mongoose.connect('mongodb://localhost:27017/testdb');
    
    // Create test data using factory
    const testData = [
      createTestAchievement({ name: 'Test Achievement 1', category: 'milestone' }),
      createTestAchievement({ name: 'Test Achievement 2', category: 'time' })
    ];
    
    testAchievements = await Achievement.create(testData);
  });
  
  afterAll(async () => {
    // Clean up test data
    await Achievement.deleteMany({});
    
    // Close database connection
    await mongoose.connection.close();
  });
  
  describe('GET /api/achievements', () => {
    it('should return all achievements', async () => {
      const response = await agent.get('/api/achievements');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
    
    it('should filter achievements by category', async () => {
      const response = await agent.get('/api/achievements?category=milestone');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Achievement 1');
    });
  });
  
  describe('GET /api/achievements/:id', () => {
    it('should return a single achievement by ID', async () => {
      const response = await agent.get(`/api/achievements/${testAchievements[0]._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Achievement 1');
    });
    
    it('should return 404 for non-existent ID', async () => {
      const response = await agent.get('/api/achievements/60d21b4667d0d8992e610c86');
      
      expect(response.status).toBe(404);
    });
  });
});
```

### Best Practices for Test Cases

1. **Descriptive Test Names**: Use clear, action-oriented test descriptions.

2. **Test Isolation**: Each test should be independent and not rely on other tests.

3. **Edge Cases**: Include tests for error conditions and edge cases.

4. **Proper Assertions**: Be specific with your assertions, checking both status and content.

5. **Single Responsibility**: Each test should verify one specific aspect of functionality.

## Common Issues and Solutions

### "this" Context Issues

**Problem**: Controller methods not having access to class properties or methods.

**Solution**: Use `.bind(controller)` when registering routes, or use arrow function wrappers.

### MongoDB Connection Issues

**Problem**: Tests timeout due to connection management problems.

**Solution**: Follow the [MongoDB Connection Guide](./mongodb-connection-guide.md) for proper connection management.

### Route Order Matters

**Problem**: Routes registered in incorrect order causing tests to fail.

**Solution**: Register routes in the same order as in the main application, and use more specific routes first.

### TypeScript Type Issues

**Problem**: TypeScript errors with request/response objects.

**Solution**: 
1. Use proper interfaces (see [Type-First Development Guide](./type-first-development-guide.md))
2. Use type assertions only when necessary:

```typescript
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = { _id: 'testUserId', username: 'testuser' };
  next();
};
```

## Advanced Testing Patterns

### Testing with Query Parameters

```typescript
// Define type-safe query parameters
interface ResourceQueryParams {
  category?: string;
  minRating?: number;
  sortBy?: 'date' | 'popularity' | 'rating';
}

it('should filter resources by multiple criteria', async () => {
  // Type-safe query parameters
  const queryParams: ResourceQueryParams = { 
    category: 'test',
    minRating: 4,
    sortBy: 'date' 
  };
  
  const response = await agent.get('/api/resources')
    .query(queryParams);
  
  expect(response.status).toBe(200);
  // Add assertions for filtered results
});
```

### Testing File Uploads

```typescript
it('should handle file uploads', async () => {
  const response = await agent
    .post('/api/upload')
    .attach('file', 'test/fixtures/test-file.jpg')
    .field('description', 'Test file');
  
  expect(response.status).toBe(200);
  expect(response.body.fileUrl).toBeDefined();
});
```

### Testing Authenticated Routes

```typescript
// Setup authentication
beforeAll(async () => {
  // Get auth token
  const authResponse = await agent
    .post('/api/auth/login')
    .send({ username: 'testuser', password: 'password' });
  
  authToken = authResponse.body.token;
});

it('should access protected route with token', async () => {
  const response = await agent
    .get('/api/protected-resource')
    .set('Authorization', `Bearer ${authToken}`);
  
  expect(response.status).toBe(200);
});
```

## Pre-Implementation Checklist

Before proceeding to implementation, verify:

- [ ] All controller interfaces are defined and shared between tests and implementation
- [ ] Request/response types are fully documented
- [ ] Parameter validation is tested
- [ ] Model schemas match test expectations
- [ ] Test data factories create valid model data
- [ ] Controller method binding is properly implemented
- [ ] Error cases are tested

## Conclusion

Following these standardized API test patterns will ensure test reliability, maintainability, and isolation across our application. These patterns have been proven effective in solving the Achievement API endpoint test timeout issues and should be applied to all API tests going forward.

## Related Documentation

- [Type-First Development Guide](./type-first-development-guide.md)
- [MongoDB Connection Guide](./mongodb-connection-guide.md)
- [Testing Standards](../standards/testing-standards.md)
- [Architectural Dependency Guide](./architectural-dependency-guide.md)
- [Model Dependency Guide](./model-dependency-guide.md) 