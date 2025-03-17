# Achievement API Endpoint Test Fixes

## Issues Identified

After extensive investigation, we've identified several issues causing timeout problems in the Achievement API endpoint tests:

1. **MongoDB Connection Management**
   - Multiple connections being created and not properly closed
   - Connection conflicts between the main application and test environment
   - Mongoose warnings about duplicate schema indexes

2. **Supertest Connection Handling**
   - Open TCP handles from supertest requests not being properly closed
   - Requests hanging and not completing within the timeout period

3. **Schema Validation Errors**
   - Achievement category validation failing with incorrect values
   - Schema validation errors preventing tests from completing

4. **Test Structure Issues**
   - Jest done.fail() function not available in newer Jest versions
   - Uncaught promises causing tests to hang
   - Improper error handling in async tests

5. **Middleware Mocking Problems**
   - Incomplete mocking of authentication middleware
   - Validation middleware not properly mocked

## Solutions Implemented

### 1. MongoDB Connection Management

```typescript
// Use a dedicated connection for tests
let mongoServer: MongoMemoryServer;
let mongoConnection: mongoose.Connection;

// Setup before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Create a dedicated connection for this test file
  mongoConnection = await mongoose.createConnection(mongoUri);
  
  // Make models use this connection
  const AchievementModel = mongoConnection.model('Achievement', Achievement.schema);
  const UserAchievementModel = mongoConnection.model('UserAchievement', UserAchievement.schema);
  
  // Replace the models with our connection-specific ones
  jest.spyOn(Achievement, 'find').mockImplementation(function() {
    return AchievementModel.find();
  });
  
  // Additional model method mocks...
});

// Clean up after all tests
afterAll(async () => {
  // Close mongoose connection
  if (mongoConnection) {
    await mongoConnection.close();
  }
  
  // Stop MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Close Express server
  if (closeServer) {
    await closeServer();
  }
});
```

### 2. Supertest Connection Handling

```typescript
// Use done callback pattern for all tests to ensure proper cleanup
it('should return a specific achievement by ID', (done) => {
  Achievement.findOne().then((achievement) => {
    if (!achievement) {
      done(new Error('No achievement found'));
      return;
    }
    
    const achievementId = (achievement as any)._id.toString();
    
    request(app)
      .get(`/api/achievements/${achievementId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, response) => {
        if (err) return done(err);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id', achievementId);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('description');
        done();
      });
  }).catch(done);
});
```

### 3. Schema Validation Fixes

```typescript
// Sample achievement data with valid category values
const sampleAchievements = [
  {
    name: 'First Meditation',
    description: 'Complete your first meditation session',
    category: 'milestone', // Valid category from enum
    criteria: {
      type: 'session_count',
      value: 1
    },
    points: 10,
    icon: 'meditation_icon.png'
  },
  {
    name: 'Meditation Streak',
    description: 'Complete 3 days of meditation in a row',
    category: 'streak', // Valid category from enum
    criteria: {
      type: 'streak_days',
      value: 3
    },
    points: 30,
    icon: 'streak_icon.png'
  }
];
```

### 4. Comprehensive Middleware Mocking

```typescript
// Mock all required modules before importing app
jest.mock('../../middleware/auth.middleware', () => ({
  authenticateToken: jest.fn((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      req.user = { _id: 'testUserId', username: 'testUsername' };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }),
  authenticateUser: jest.fn((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      req.user = { _id: 'testUserId', username: 'testUsername' };
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  })
}));

jest.mock('../../middleware/validation.middleware', () => ({
  validateRequest: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  validateStressTracking: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  validateAssessment: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  validatePreferences: jest.fn((req: Request, res: Response, next: NextFunction) => next())
}));
```

### 5. Express Server Cleanup

```typescript
// In app.js
// Function to close server and connections for testing
export const closeServer = async (): Promise<void> => {
  return new Promise((resolve) => {
    console.log('Closing HTTP server and socket connections...');
    // First close the HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
      // Then close any socket connections
      if (socketManager) {
        console.log('Closing socket connections...');
        socketManager.close();
        console.log('Socket connections closed');
      }
      // Resolve the promise after all connections are closed
      console.log('All connections closed');
      resolve();
    });
  });
};
```

## Best Practices for Future Tests

1. **Connection Management**
   - Use dedicated connections for tests
   - Always close connections in afterAll hooks
   - Consider using connection pooling for better performance

2. **Test Structure**
   - Use done callback pattern for tests with async operations
   - Properly handle errors in async tests
   - Set appropriate timeouts for long-running tests

3. **Mocking**
   - Mock all external dependencies
   - Ensure middleware is properly mocked
   - Use jest.spyOn for model methods

4. **Cleanup**
   - Reset mocks in afterEach hooks
   - Close all connections in afterAll hooks
   - Use --detectOpenHandles flag to identify leaks

5. **Error Handling**
   - Add proper error handling for all async operations
   - Use try/catch blocks in async tests
   - Add timeout handling for long-running operations

By implementing these solutions and following these best practices, we can ensure that our tests run reliably and efficiently without timeout issues. 