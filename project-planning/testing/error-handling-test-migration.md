# Error Handling Test Migration Guide

This guide provides instructions for migrating existing tests to the new error handling system. The new system introduces structured error responses with error codes, categories, and additional metadata.

## Overview of Changes

### Old Error Format
```json
{
  "error": "Error message"
}
```

### New Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "category": "ERROR_CATEGORY",
    "timestamp": "ISO timestamp",
    "requestId": "Request ID if available",
    "details": { ... },
    "userMessage": "User-friendly message",
  }
}
```

## Compatibility Utilities

We've created compatibility utilities to help with the transition:

1. `verifyErrorResponse`: Verifies error responses in either format
2. `createTestErrorResponse`: Creates error responses in either format for tests
3. `adaptLegacyErrorHandling`: Adapts error handling code to work with both formats
4. `convertToStructuredError`: Converts legacy error responses to the new format

## Migration Steps

### Step 1: Update Imports

```typescript
// Old imports
import { verifyErrorResponse } from '../helpers/error-test.helpers';

// New imports
import { verifyErrorResponse, createTestErrorResponse } from '../helpers/error-compatibility.helpers';
```

### Step 2: Update Error Verification

#### Before:
```typescript
// Checking a simple error message
expect(res.status).toHaveBeenCalledWith(500);
expect(res.json).toHaveBeenCalledWith({ error: 'Operation failed' });
```

#### After:
```typescript
// Using the compatibility helper
verifyErrorResponse(res, 500, 'Operation failed');

// For more specific verification with error codes
verifyErrorResponse(res, 400, ErrorCodes.VALIDATION_ERROR, {
  expectedCategory: ErrorCategory.VALIDATION,
  strictMode: true
});
```

### Step 3: Update Controller Error Handling

#### Before:
```typescript
try {
  // Controller logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Operation failed' });
}
```

#### After (Option 1 - Full migration):
```typescript
try {
  // Controller logic
} catch (error) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        category: error.category,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    const appError = new AppError(
      error instanceof Error ? error.message : 'Operation failed',
      ErrorCodes.INTERNAL_ERROR,
      ErrorCategory.TECHNICAL
    );
    res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
        category: appError.category,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

#### After (Option 2 - Using compatibility adapter):
```typescript
try {
  // Controller logic
} catch (error) {
  adaptLegacyErrorHandling(error, res, 'Operation failed');
}
```

## Example Test

```typescript
describe('ExampleController', () => {
  let controller;
  let req;
  let res;

  beforeEach(() => {
    controller = new ExampleController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should handle errors properly', async () => {
    // Arrange
    const mockError = new Error('Something went wrong');
    jest.spyOn(someService, 'someOperation').mockRejectedValue(mockError);

    // Act
    await controller.someAction(req, res);

    // Assert using compatibility helper
    verifyErrorResponse(res, 500, 'Operation failed');
  });
});
```

## Common Issues and Solutions

### Issue: Test expects the old format but gets the new format
**Solution**: Use the `verifyErrorResponse` helper which handles both formats

### Issue: Controller uses new error format but tests are written for old format
**Solution**: Either update the tests to expect the new format or wrap the controller with the `adaptLegacyErrorHandling` function

### Issue: Need to mock an error response for testing
**Solution**: Use the `createTestErrorResponse` helper to create error responses in either format

## Best Practices

1. **Gradual Migration**: Start by updating the error verification in tests before modifying controllers
2. **Use Compatibility Helpers**: Take advantage of the compatibility layer to ease the transition
3. **Document Changes**: Add comments when migrating tests to help other developers understand the changes
4. **Create New Tests for New Functionality**: When adding new features, write tests using the new error format
5. **Error Code Constants**: Always use the `ErrorCodes` enum constants rather than string literals

## Full Example

See the file `src/__tests__/examples/error-compatibility-example.test.ts` for a complete example of using the compatibility helpers. 