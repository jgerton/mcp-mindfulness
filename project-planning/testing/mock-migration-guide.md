# MockArchitect Migration Guide

This guide provides step-by-step instructions for migrating existing tests to use the MockArchitect system. It includes examples of before and after code, best practices, and a pragmatic approach to ensure a smooth transition.

## Why Migrate?

The MockArchitect system offers several advantages over traditional testing approaches:

1. **Reduced Duplication**: Common mocking patterns are encapsulated in base classes
2. **Improved Maintainability**: Changes to mocking behavior can be made in one place
3. **Enhanced Readability**: Tests are more concise and focused on business logic
4. **Better Type Safety**: TypeScript interfaces and type annotations provide better IDE support
5. **Increased Test Reliability**: Consistent mocking approach reduces flaky tests

## Migration Strategy

We recommend a gradual migration approach:

1. **Start with New Tests**: Apply MockArchitect to all new tests
2. **Prioritize Critical Tests**: Migrate tests for critical functionality next
3. **Opportunistic Migration**: Update other tests when making changes to related code
4. **Complete Migration**: Eventually migrate all tests to use MockArchitect

## Step-by-Step Migration Guide

### Step 1: Import MockArchitect Components

Replace your existing imports with MockArchitect components:

**Before:**
```typescript
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Achievement } from '../../models/achievement.model';
```

**After:**
```typescript
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TestContext, ModelMock } from '../mocks';
```

### Step 2: Replace Request and Response Mocks

Replace your custom request and response mocks with MockArchitect versions:

**Before:**
```typescript
// Custom request mock
const mockRequest = (data: any = {}) => {
  return {
    user: data.user || { _id: 'test-user-id', username: 'test-user' },
    body: data.body || {},
    params: data.params || {},
    query: data.query || {}
  } as unknown as Request;
};

// Custom response mock
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Usage
const req = mockRequest({ user: { _id: 'user-123' } });
const res = mockResponse();
```

**After:**
```typescript
// Create a test context
const context = new TestContext();

// Create request and response objects
const req = context.createRequest({
  user: { _id: 'user-123', username: 'testuser' }
});
const res = context.createResponse();
```

### Step 3: Replace Model Mocks

Replace your custom model mocks with MockArchitect's ModelMock:

**Before:**
```typescript
// Mock the Achievement model
jest.mock('../../models/achievement.model', () => ({
  Achievement: {
    find: jest.fn().mockResolvedValue([
      {
        _id: 'achievement-1',
        userId: 'user-123',
        name: 'First Meditation',
        progress: 1,
        target: 1,
        completed: true
      }
    ]),
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'achievement-1') {
        return Promise.resolve({
          _id: 'achievement-1',
          userId: 'user-123',
          name: 'First Meditation',
          progress: 1,
          target: 1,
          completed: true
        });
      }
      return Promise.resolve(null);
    })
  }
}));
```

**After:**
```typescript
// Create a mock Achievement model
const achievementModel = new ModelMock('Achievement');

// Add sample data to the mock model
achievementModel.addMockData([
  {
    _id: 'achievement-1',
    userId: 'user-123',
    name: 'First Meditation',
    progress: 1,
    target: 1,
    completed: true
  }
]);

// Mock the Achievement model
jest.mock('../../models/achievement.model', () => ({
  Achievement: achievementModel
}));

// Configure specific method behavior if needed
achievementModel.findById.mockImplementation((id) => {
  if (id === 'achievement-1') {
    return Promise.resolve(achievementModel.getMockData()[0]);
  }
  return Promise.resolve(null);
});
```

### Step 4: Update Test Setup and Teardown

Update your test setup and teardown to use MockArchitect:

**Before:**
```typescript
describe('AchievementController', () => {
  let controller;
  
  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AchievementController();
  });
  
  // Tests...
});
```

**After:**
```typescript
describe('AchievementController', () => {
  let context: TestContext;
  let controller: AchievementController;
  let achievementModel: ModelMock;
  
  beforeEach(() => {
    // Create a new test context for each test
    context = new TestContext();
    
    // Create a mock Achievement model
    achievementModel = new ModelMock('Achievement');
    
    // Add sample data to the mock model
    achievementModel.addMockData([
      // Sample data...
    ]);
    
    // Mock the Achievement model
    jest.mock('../../models/achievement.model', () => ({
      Achievement: achievementModel
    }));
    
    // Create the controller instance
    controller = new AchievementController();
  });
  
  afterEach(() => {
    // Clean up mocks
    jest.resetAllMocks();
  });
  
  // Tests...
});
```

### Step 5: Update Assertions

Update your assertions to use the helper methods provided by MockArchitect:

**Before:**
```typescript
// Call the controller method
await controller.getUserAchievements(req, res);

// Assert the response
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({
  achievements: expect.arrayContaining([
    expect.objectContaining({
      name: 'First Meditation'
    })
  ])
});

// Check model interaction
expect(Achievement.find).toHaveBeenCalledWith({ userId: 'user-123' });
```

**After:**
```typescript
// Call the controller method
await controller.getUserAchievements(req, res);

// Assert the response
expect(res.statusCode).toBe(200);
expect(res.getSentData()).toHaveProperty('achievements');
expect(res.getSentData().achievements[0]).toHaveProperty('name', 'First Meditation');

// Check model interaction
expect(achievementModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
```

## Complete Example: Before and After

### Before Migration

```typescript
import { Request, Response } from 'express';
import { AchievementController } from '../../controllers/achievement.controller';
import { Achievement } from '../../models/achievement.model';

// Mock the Achievement model
jest.mock('../../models/achievement.model', () => ({
  Achievement: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  }
}));

// Custom request mock
const mockRequest = (data: any = {}) => {
  return {
    user: data.user || { _id: 'test-user-id', username: 'test-user' },
    body: data.body || {},
    params: data.params || {},
    query: data.query || {}
  } as unknown as Request;
};

// Custom response mock
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('AchievementController', () => {
  let controller;
  
  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AchievementController();
  });
  
  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      // Mock data
      const achievements = [
        {
          _id: 'achievement-1',
          userId: 'user-123',
          name: 'First Meditation',
          progress: 1,
          target: 1,
          completed: true
        }
      ];
      
      // Mock the find method
      (Achievement.find as jest.Mock).mockResolvedValue(achievements);
      
      // Create request and response
      const req = mockRequest({ user: { _id: 'user-123', username: 'testuser' } });
      const res = mockResponse();
      
      // Call the controller method
      await controller.getUserAchievements(req, res);
      
      // Assert the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        achievements: achievements
      });
      
      // Check model interaction
      expect(Achievement.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Create request without user
      const req = mockRequest({ user: null });
      const res = mockResponse();
      
      // Call the controller method
      await controller.getUserAchievements(req, res);
      
      // Assert the response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      });
      
      // Check model was not called
      expect(Achievement.find).not.toHaveBeenCalled();
    });
  });
});
```

### After Migration

```typescript
import { Request, Response } from 'express';
import { AchievementController } from '../../controllers/achievement.controller';
import { TestContext, ModelMock } from '../mocks';

describe('AchievementController', () => {
  let context: TestContext;
  let controller: AchievementController;
  let achievementModel: ModelMock;
  
  beforeEach(() => {
    // Create a new test context for each test
    context = new TestContext();
    
    // Create a mock Achievement model
    achievementModel = new ModelMock('Achievement');
    
    // Add sample data to the mock model
    achievementModel.addMockData([
      {
        _id: 'achievement-1',
        userId: 'user-123',
        name: 'First Meditation',
        progress: 1,
        target: 1,
        completed: true
      }
    ]);
    
    // Mock the Achievement model
    jest.mock('../../models/achievement.model', () => ({
      Achievement: achievementModel
    }));
    
    // Create the controller instance
    controller = new AchievementController();
  });
  
  afterEach(() => {
    // Clean up mocks
    jest.resetAllMocks();
  });
  
  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      // Arrange
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' }
      });
      const res = context.createResponse();
      
      // Configure the mock to return our test data
      achievementModel.find.mockResolvedValueOnce(achievementModel.getMockData());
      
      // Act
      await controller.getUserAchievements(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getSentData()).toHaveProperty('achievements');
      expect(res.getSentData().achievements[0]).toHaveProperty('name', 'First Meditation');
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const req = context.createRequest(); // No user object
      const res = context.createResponse();
      
      // Act
      await controller.getUserAchievements(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(res.getSentData()).toHaveProperty('error', 'Unauthorized: User not authenticated');
      
      // Verify the model was not called
      expect(achievementModel.find).not.toHaveBeenCalled();
    });
  });
});
```

## Best Practices for Migration

1. **Migrate One Test File at a Time**: Focus on one test file at a time to ensure a smooth transition.

2. **Start with Simple Tests**: Begin with simpler tests before tackling more complex ones.

3. **Use the Arrange-Act-Assert Pattern**: Structure your tests using the AAA pattern for clarity:
   ```typescript
   // Arrange
   const req = context.createRequest({ /* ... */ });
   const res = context.createResponse();
   
   // Act
   await controller.someMethod(req, res);
   
   // Assert
   expect(res.statusCode).toBe(200);
   ```

4. **Add More Test Cases**: Use the migration as an opportunity to add more comprehensive test coverage, especially for error handling.

5. **Verify Both Response and Interactions**: Test both the response sent to the client and the interactions with dependencies.

6. **Use Descriptive Test Names**: Make your test names clear and descriptive to improve readability.

7. **Group Related Tests**: Use nested `describe` blocks to organize related tests.

## Common Migration Challenges

### Challenge 1: Complex Model Mocking

**Problem**: Your existing tests have complex model mocking logic.

**Solution**: Use the `ModelMock` class's advanced features:

```typescript
// Configure method behavior based on parameters
achievementModel.findById.mockImplementation((id) => {
  if (id === 'valid-id') {
    return Promise.resolve(achievementModel.getMockData()[0]);
  } else if (id === 'other-user-id') {
    return Promise.resolve({
      ...achievementModel.getMockData()[0],
      userId: 'other-user'
    });
  }
  return Promise.resolve(null);
});

// Mock method to throw an error
achievementModel.find.mockImplementation(() => {
  throw new Error('Database error');
});
```

### Challenge 2: Middleware Testing

**Problem**: You need to test middleware functions.

**Solution**: Use the `MiddlewareFactory` to create middleware mocks:

```typescript
import { MiddlewareFactory } from '../mocks';

// Create a middleware mock
const authMiddleware = MiddlewareFactory.createAuthMiddleware({
  user: { _id: 'user-123', username: 'testuser' }
});

// Test the middleware
const req = context.createRequest();
const res = context.createResponse();
const next = jest.fn();

authMiddleware(req, res, next);

expect(req.user).toEqual({ _id: 'user-123', username: 'testuser' });
expect(next).toHaveBeenCalled();
```

### Challenge 3: Document Methods

**Problem**: You need to mock document methods like `save()`.

**Solution**: Add methods to the mock data objects:

```typescript
// Get a document from the mock data
const achievement = { ...achievementModel.getMockData()[0] };

// Add a save method
achievement.save = jest.fn().mockResolvedValueOnce({
  ...achievement,
  progress: 5,
  completed: true
});

// Configure findById to return this document
achievementModel.findById.mockResolvedValueOnce(achievement);

// Test
await controller.updateAchievementProgress(req, res);
expect(achievement.save).toHaveBeenCalled();
```

## Conclusion

Migrating to the MockArchitect system is a worthwhile investment that will improve the maintainability and reliability of your tests. By following this guide and taking a pragmatic approach, you can gradually transition your existing tests while ensuring they remain effective at catching regressions.

Remember that the goal is not just to use the new system, but to improve your tests in the process. Take the opportunity to add more comprehensive test coverage, especially for error handling and edge cases.

For more examples and detailed documentation, refer to the [MockArchitect README](../../src/__tests__/mocks/README.md) and the [example tests](../testing/examples/). 