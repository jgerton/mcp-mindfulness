# Achievement Controller Test Example Using MockArchitect

This document provides a practical example of how to test the Achievement controller using the MockArchitect system. It demonstrates the recommended patterns and practices for controller testing.

## Test File Structure

```typescript
// src/__tests__/controllers/achievement.controller.test.ts

import { TestContext, ModelMock } from '../mocks';
import { AchievementController } from '../../controllers/achievement.controller';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

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
        _id: new mongoose.Types.ObjectId().toString(),
        userId: 'user-123',
        name: 'First Meditation',
        description: 'Complete your first meditation session',
        type: 'meditation',
        progress: 1,
        target: 1,
        completed: true,
        completedAt: new Date(),
        icon: 'meditation-icon'
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: 'user-123',
        name: 'Meditation Streak',
        description: 'Complete 5 meditation sessions in a row',
        type: 'meditation',
        progress: 3,
        target: 5,
        completed: false,
        icon: 'streak-icon'
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
      expect(res.getSentData().achievements).toHaveLength(2);
      
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
    
    it('should handle database errors', async () => {
      // Arrange
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' }
      });
      const res = context.createResponse();
      
      // Configure the mock to throw an error
      const dbError = new Error('Database error');
      achievementModel.find.mockRejectedValueOnce(dbError);
      
      // Act
      await controller.getUserAchievements(req, res);
      
      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.getSentData()).toHaveProperty('error', 'Internal server error');
      
      // Verify the model was called
      expect(achievementModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });
  });
  
  describe('getAchievementById', () => {
    it('should return a single achievement by ID', async () => {
      // Arrange
      const achievementId = achievementModel.getMockData()[0]._id;
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' },
        params: { id: achievementId }
      });
      const res = context.createResponse();
      
      // Configure the mock to return our test data
      achievementModel.findById.mockResolvedValueOnce(achievementModel.getMockData()[0]);
      
      // Act
      await controller.getAchievementById(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getSentData()).toHaveProperty('_id', achievementId);
      expect(res.getSentData()).toHaveProperty('name', 'First Meditation');
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.findById).toHaveBeenCalledWith(achievementId);
    });
    
    it('should return 400 for invalid achievement ID', async () => {
      // Arrange
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' },
        params: { id: 'invalid-id' }
      });
      const res = context.createResponse();
      
      // Act
      await controller.getAchievementById(req, res);
      
      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.getSentData()).toHaveProperty('error', 'Invalid achievement ID format');
      
      // Verify the model was not called
      expect(achievementModel.findById).not.toHaveBeenCalled();
    });
    
    it('should return 404 when achievement not found', async () => {
      // Arrange
      const achievementId = new mongoose.Types.ObjectId().toString();
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' },
        params: { id: achievementId }
      });
      const res = context.createResponse();
      
      // Configure the mock to return null (not found)
      achievementModel.findById.mockResolvedValueOnce(null);
      
      // Act
      await controller.getAchievementById(req, res);
      
      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.getSentData()).toHaveProperty('error', 'Achievement not found');
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.findById).toHaveBeenCalledWith(achievementId);
    });
    
    it('should return 403 when user tries to access another user\'s achievement', async () => {
      // Arrange
      const achievementId = achievementModel.getMockData()[0]._id;
      const req = context.createRequest({
        user: { _id: 'different-user', username: 'otheruser' },
        params: { id: achievementId }
      });
      const res = context.createResponse();
      
      // Configure the mock to return our test data
      achievementModel.findById.mockResolvedValueOnce(achievementModel.getMockData()[0]);
      
      // Act
      await controller.getAchievementById(req, res);
      
      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.getSentData()).toHaveProperty('error', 'Access denied: Not authorized to view this achievement');
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.findById).toHaveBeenCalledWith(achievementId);
    });
  });
  
  describe('updateAchievementProgress', () => {
    it('should update achievement progress', async () => {
      // Arrange
      const achievementId = achievementModel.getMockData()[1]._id;
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' },
        params: { id: achievementId },
        body: { progress: 4 }
      });
      const res = context.createResponse();
      
      // Configure the mock to return our test data
      const achievement = { ...achievementModel.getMockData()[1] };
      achievementModel.findById.mockResolvedValueOnce(achievement);
      
      // Mock the save method
      achievement.save = jest.fn().mockResolvedValueOnce({
        ...achievement,
        progress: 4
      });
      
      // Act
      await controller.updateAchievementProgress(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getSentData()).toHaveProperty('progress', 4);
      expect(res.getSentData()).toHaveProperty('completed', false);
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.findById).toHaveBeenCalledWith(achievementId);
      expect(achievement.save).toHaveBeenCalled();
    });
    
    it('should complete achievement when progress reaches target', async () => {
      // Arrange
      const achievementId = achievementModel.getMockData()[1]._id;
      const req = context.createRequest({
        user: { _id: 'user-123', username: 'testuser' },
        params: { id: achievementId },
        body: { progress: 5 }
      });
      const res = context.createResponse();
      
      // Configure the mock to return our test data
      const achievement = { ...achievementModel.getMockData()[1] };
      achievementModel.findById.mockResolvedValueOnce(achievement);
      
      // Mock the save method
      achievement.save = jest.fn().mockResolvedValueOnce({
        ...achievement,
        progress: 5,
        completed: true,
        completedAt: expect.any(Date)
      });
      
      // Act
      await controller.updateAchievementProgress(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.getSentData()).toHaveProperty('progress', 5);
      expect(res.getSentData()).toHaveProperty('completed', true);
      expect(res.getSentData()).toHaveProperty('completedAt');
      
      // Verify the model was called with the correct parameters
      expect(achievementModel.findById).toHaveBeenCalledWith(achievementId);
      expect(achievement.save).toHaveBeenCalled();
    });
  });
});
```

## Key Concepts Demonstrated

### 1. Test Context

The `TestContext` class provides a convenient way to create and manage test objects:

```typescript
context = new TestContext();
const req = context.createRequest({
  user: { _id: 'user-123', username: 'testuser' }
});
const res = context.createResponse();
```

This approach makes it easy to create properly typed request and response objects with the necessary methods and properties.

### 2. Model Mocking

The `ModelMock` class provides a flexible way to mock Mongoose models:

```typescript
achievementModel = new ModelMock('Achievement');
achievementModel.addMockData([
  // Sample data
]);
```

This allows you to:
- Add sample data for tests
- Mock specific model methods
- Verify method calls with the correct parameters

### 3. Request and Response Mocking

The MockArchitect system provides typed request and response mocks:

```typescript
const req = context.createRequest({
  user: { _id: 'user-123', username: 'testuser' },
  params: { id: achievementId }
});
const res = context.createResponse();
```

The response mock includes helpful methods for assertions:

```typescript
expect(res.statusCode).toBe(200);
expect(res.getSentData()).toHaveProperty('achievements');
```

### 4. Comprehensive Test Coverage

The example demonstrates testing various scenarios:

1. **Success cases**: Retrieving achievements, updating progress
2. **Authentication errors**: User not authenticated
3. **Authorization errors**: User trying to access another user's data
4. **Validation errors**: Invalid ID format
5. **Not found errors**: Achievement not found
6. **Database errors**: Error handling for database operations

### 5. Behavior Verification

The tests verify both the response and the interactions with dependencies:

```typescript
// Verify response
expect(res.statusCode).toBe(200);
expect(res.getSentData()).toHaveProperty('achievements');

// Verify model interaction
expect(achievementModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on the state from other tests.

2. **Reset Mocks**: Use `jest.resetAllMocks()` in `afterEach` to ensure a clean state for each test.

3. **Test Error Handling**: Always include tests for error scenarios, not just the happy path.

4. **Verify Interactions**: Check that your controller interacts with dependencies correctly.

5. **Use Descriptive Test Names**: Test names should clearly describe the scenario being tested.

6. **Group Related Tests**: Use nested `describe` blocks to organize related tests.

7. **Mock Only What's Necessary**: Only mock the methods that are actually used in the test.

## Migration Tips

When migrating existing tests to use the MockArchitect system:

1. Start by replacing the request and response mocks with the MockArchitect versions.

2. Replace model mocks with `ModelMock` instances.

3. Use the `TestContext` to manage test objects.

4. Update assertions to use the helper methods provided by the response mock.

5. Add more comprehensive error handling tests.

By following these patterns, you can create more maintainable and reliable tests for your controllers. 