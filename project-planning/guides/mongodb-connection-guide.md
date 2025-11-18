# MongoDB Connection Guide

## Connection Issues and Best Practices

This guide documents our findings from investigating timeout issues with MongoDB connections in our test suite, particularly the achievement API endpoint tests.

### Issues Identified

1. **Custom Server/Agent Creation**: Many tests create their own server and agent, not utilizing global hooks and connections established in setup files.
2. **Poor Connection Management**: Connections are not properly closed or reused, leading to connection pool exhaustion.
3. **Multiple Connection Attempts**: Tests attempting to create multiple connections with different URIs cause conflicts.
4. **Supertest Handle Leaks**: Supertest may leave TCP server handles open.
5. **Missing Cleanup in afterAll**: Test suites not properly cleaning up resources.
6. **Race Conditions**: Operations not properly awaited or given enough time to complete.

### Best Practices

#### Direct Controller Testing vs Route Testing

Tests using supertest to test Express routes through HTTP often lead to connection management issues. Instead:

1. **Prefer Direct Controller Testing**:
   - Test controller methods directly instead of through HTTP calls
   - Create mock Request and Response objects
   - Call controller methods with mocked objects
   - Verify expected behaviors directly

```typescript
// INSTEAD OF:
const response = await request(app)
  .get('/api/achievements')
  .set('Authorization', `Bearer ${authToken}`);

expect(response.status).toBe(200);

// USE THIS PATTERN:
const controller = new AchievementController();
const req = { user: { _id: userId } } as unknown as Request;
const res = createMockResponse();

await controller.getUserAchievements(req, res);

expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalled();
```

This approach eliminates network overhead and potential connection management issues while still testing the core functionality.

#### Test Setup and Teardown

1. **Reuse Global Connections**: 
   - Use the global connection established in `src/__tests__/setup.ts` 
   - Avoid creating new connections in individual test files

2. **Proper Cleanup**:
   - Close connections in `afterAll` hooks
   - Use Jest's `--detectOpenHandles` and `--forceExit` flags (already configured)
   - Add small delays between cleanup operations to prevent race conditions

```typescript
// Connect before tests
beforeAll(async () => {
  await connectToTestDB();
  
  // Other setup code...
  
  // Verify connection state at test start
  await logConnectionState('beforeAll');
});

// Clean up after tests
afterAll(async () => {
  // Clean up test resources
  await clearAchievementData();
  
  // Add small delay to ensure all operations are complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Disconnect from test database
  await closeTestDB();
  
  // Verify connection state after cleanup
  await logConnectionState('afterAll');
});
```

3. **Reset Data Between Tests**:
   - Use helper functions to clear collections between tests
   - Example: `clearAchievementData()` from our achievement helpers

```typescript
beforeEach(async () => {
  // Reset achievement data before each test
  await clearAchievementData();
  
  // Create sample achievement data for tests
  await createTestAchievement({
    // Test data...
  });
});
```

#### Connection Debugging Helpers

Add connection state logging functions to help diagnose issues:

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

Use this function at key points in your tests to track connection state:
- Before all tests
- After all tests
- Before/after complex operations
- When troubleshooting connection issues

#### Mock Response Pattern

For testing controllers directly, use a consistent mock response factory:

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

This creates chainable mock methods that mirror Express response behavior and allows for easy verification.

#### Connection Pooling

1. **Avoid Connection String Conflicts**:
   - Don't call `mongoose.connect()` with different URIs in the same process

2. **Handle Connection Sharing**:
   - Share the same connection across tests
   - Control concurrency with `maxWorkers: 1` in Jest config

#### Performance Optimization

1. **Use Shorter Timeouts**:
   - Set shorter Jest timeouts to fail faster when issues occur
   - Default: 30 seconds, but 5-10 seconds works better for connection management issues

```typescript
// Set shorter timeout for faster feedback
jest.setTimeout(5000);
```

2. **Optimize Test Structure**:
   - Group related tests using nested describe blocks
   - Use beforeAll for one-time setup
   - Use beforeEach only for data that needs reset between tests

#### Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `MongooseError: Can't call openUri() on an active connection with different connection strings` | Multiple connection attempts with different URIs | Use a single connection established in the setup file |
| `Exceeded timeout of 30000 ms for a test` | Connection or operation taking too long | Check if database operations are hanging |
| `Node was disposed during test - did you forget to restore mocks?` | Mocks not properly restored | Ensure all mocks are restored in afterEach/afterAll |
| `Unhandled promise rejection` | Async operations not properly awaited | Ensure all async operations are properly awaited |
| `"Transaction xxxxxx was aborted"` | MongoDB operation interrupted | Make sure operations complete before cleanup |

### Diagnostic Tools

We've added diagnostic test files to help identify connection issues:

1. **Connection Test**: `src/__tests__/diagnostics/connection.test.ts`
   - Monitors connection state
   - Tests concurrent operations
   - Checks for open handles
   - Validates connection pooling

### Implementation Status

- [x] Achievement test helpers created
- [x] Connection diagnostics implemented
- [x] Achievement route tests fixed to use global connection
- [x] Documentation updated with lessons learned
- [ ] Remaining route tests to be updated with same pattern

## Going Forward

When implementing new tests:

1. **Prefer direct controller testing** over route testing when possible
2. **Use shared test helpers** for creating and cleaning test data
3. **Follow consistent patterns** for connection management
4. **Add proper cleanup** in afterAll hooks with small delays
5. **Use connection state logging** when troubleshooting timeouts
6. **Implement shorter timeouts** to fail faster when issues occur
7. **Verify all tests pass consistently** before merging changes

### Test Implementation Pattern

For API route tests, follow this pattern:

1. Use direct controller invocation instead of supertest requests
2. Explicitly connect and disconnect from test database
3. Add connection state logging for troubleshooting
4. Use proper cleanup with small delays
5. Implement comprehensive test cases including error scenarios

## Related Guides

For API-specific testing patterns that build on these connection management principles, see the [API Test Patterns Guide](./api-test-patterns-guide.md), which covers:

- Creating isolated Express app instances
- Controller instantiation best practices
- Authentication middleware mocking
- Proper route registration for tests
- Examples from our achievement API implementation

For addressing TypeScript-related issues in tests, see the [Type-First Development Guide](./type-first-development-guide.md), which covers:

- Creating shared interfaces for controllers and models
- Defining parameter types for proper validation
- Using test data factories for consistent test data
- Implementation verification with interface compliance

By following these guidelines, we can prevent connection-related timeouts and ensure our test suite runs efficiently. 