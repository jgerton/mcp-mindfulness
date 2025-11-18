# Controller Test Patterns Guide

## Test Structure

### 1. File Organization
```
src/__tests__/controllers/[entity]/
├── [entity]-dependencies.ts    # Dependency map
├── [entity]-test.factory.ts    # Entity-specific test factory
└── [entity].controller.test.ts # Controller tests
```

### 2. Test Setup Flow
1. Map dependencies in `[entity]-dependencies.ts`
2. Create test factory in `[entity]-test.factory.ts`
3. Implement tests in `[entity].controller.test.ts`

## Required Test Cases

### 1. CRUD Operations
- **Create**
  - Success with valid input
  - Validation error with invalid input
  - Duplicate error if applicable
  
- **Read**
  - Get by ID success
  - Get by ID not found
  - List with filters
  - List with pagination
  
- **Update**
  - Success with valid input
  - Validation error with invalid input
  - Not found error
  - Concurrency handling if applicable
  
- **Delete**
  - Success
  - Not found error
  - Authorization error if applicable

### 2. Error Cases
- Invalid input validation
- Not found scenarios
- Authorization failures
- Database errors
- Concurrent modification
- Rate limiting if applicable

### 3. Edge Cases
- Empty input
- Maximum length/size
- Special characters
- Boundary conditions
- Race conditions

## Test Factory Requirements

### 1. Mock Creation Methods
```typescript
class EntityTestFactory extends BaseTestFactory<IEntity> {
  createMockEntity(data?: Partial<IEntity>): IEntity;
  setupModelMocks(options?: MockOptions): void;
  setupCustomMocks(options?: CustomMockOptions): void;
}
```

### 2. Mock Configuration
- Default values for all required fields
- Customizable through options
- Type-safe mock data
- Consistent with model constraints

## Assertion Patterns

### 1. Response Structure
```typescript
expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
expect(mockRes.json).toHaveBeenCalledWith({
  code: ErrorCode.EXPECTED_CODE,
  category: ErrorCategory.EXPECTED_CATEGORY,
  message: expect.any(String),
  data?: expect.any(Object)
});
```

### 2. Data Validation
```typescript
expect(mockRes.json).toHaveBeenCalledWith(
  expect.objectContaining({
    id: expect.any(String),
    requiredField: expectedValue,
    optionalField: expect.any(Type)
  })
);
```

## Common Pitfalls

### 1. Async Testing
- Always await async operations
- Use proper async error handling
- Test timeouts and retries

### 2. Mock Reset
- Reset mocks between tests
- Clear mock implementations
- Reset mock return values

### 3. Type Safety
- Avoid type assertions when possible
- Maintain proper interface matching
- Use type-safe mock factories

## Best Practices

### 1. Test Organization
- Group related tests with describe blocks
- Use clear test descriptions
- Follow AAA pattern (Arrange-Act-Assert)

### 2. Mock Management
- Use dependency map for consistency
- Centralize mock creation in factory
- Document mock behavior

### 3. Error Handling
- Test all error paths
- Verify error codes and categories
- Check error message patterns

### 4. Test Isolation
- Reset state between tests
- Avoid test interdependence
- Clean up resources properly

## Example Test Cases

### 1. Success Case
```typescript
it('should create entity with valid input', async () => {
  // Arrange
  const mockEntity = testFactory.createMockEntity();
  mockReq.body = validInput;
  testFactory.setupModelMocks({ createResult: mockEntity });

  // Act
  await controller.create(mockReq as Request, mockRes);

  // Assert
  expect(mockRes.status).toHaveBeenCalledWith(201);
  expect(mockRes.json).toHaveBeenCalledWith(mockEntity);
});
```

### 2. Error Case
```typescript
it('should handle not found error', async () => {
  // Arrange
  mockReq.params = { id: 'non-existent' };
  testFactory.setupModelMocks({ findByIdResult: null });

  // Act
  await controller.getById(mockReq as Request, mockRes);

  // Assert
  expect(mockRes.status).toHaveBeenCalledWith(404);
  expect(mockRes.json).toHaveBeenCalledWith({
    code: ErrorCode.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    message: expect.any(String)
  });
}); 