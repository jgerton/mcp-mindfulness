# Task: Enhance Error Handling

## Document State
- [ ] Pre-Implementation (Placeholder)
- [ ] In Research/Planning
- [x] Test Plan Ready
- [x] Tests Implemented
- [x] Test Implementation Verified
- [x] Implementation Ready
- [x] In Progress
- [x] Implementation Verified
- [ ] Completed
- [ ] Archived

## TDD Enforcement
- [x] Project files to be created/modified are listed in Impact Analysis
- [ ] Git hooks are configured to prevent premature file creation
- [ ] Test files are created first with `.test.ts` suffix
- [ ] Implementation files are marked with `.impl.pending.ts` suffix until tests are verified
- [ ] CI checks verify test existence before allowing implementation
- [ ] Linter rules enforce test-first patterns
- [ ] Git commit messages must reference task state

### File Creation Rules
1. Research Phase: Only documentation files
2. Test Plan Ready: Only test plan files
3. Tests Implemented: Only test files and fixtures
4. Test Implementation Verified: Only after all tests fail appropriately
5. Implementation Ready: Rename `.impl.pending.ts` to final name

> **CRITICAL:** Currently in Test Plan Ready state. Next steps:
> 1. Implement planned test fixtures and helpers
> 2. Implement planned test cases (ensuring they fail appropriately)
> 3. Verify test implementation thoroughly before proceeding
> 4. Only move to implementation after Test Implementation Verified
>
> NO implementation code should be written until tests are properly implemented and verified.

> **Verification Issues:** If issues are discovered during verification steps:
>
> **Test Implementation Verified Issues:**
> 1. Document issues in Test Implementation Verification section
> 2. Roll back to appropriate state based on issue type:
>    - Test plan issues → "Test Plan Ready"
>      Examples:
>      - Missing test cases for specific error scenarios
>      - Incomplete error fixture data
>      - Gaps in error category coverage
>      - Missing integration test scenarios
>    
>    - Component/architectural issues → "Research/Planning"
>      Examples:
>      - Error handling pattern conflicts with existing code
>      - Middleware order dependencies discovered
>      - Shared error utilities need restructuring
>      - Cross-cutting logging concerns identified
>    
>    - Test implementation issues → "Tests Implemented"
>      Examples:
>      - Mock error scenarios not matching real behavior
>      - Incorrect error assertion patterns
>      - Test isolation problems with error state
>      - Incomplete error context verification
>
> **Implementation Verified Issues:**
> 1. Document issues in Implementation Verification section
> 2. Roll back to appropriate state based on issue type:
>    - Implementation bugs → "In Progress"
>      Examples:
>      - Error messages not properly localized
>      - Status codes inconsistent with error types
>      - Error context missing critical data
>      - Error logging format issues
>    
>    - Test coverage gaps → "Tests Implemented"
>      Examples:
>      - Edge case errors not covered
>      - Missing error propagation tests
>      - Insufficient error recovery testing
>      - Incomplete validation error scenarios
>    
>    - Design/architectural issues → "Research/Planning"
>      Examples:
>      - Error handling pattern breaks in specific controllers
>      - Performance issues with error logging
>      - Error recovery patterns need redesign
>      - Error categorization needs restructuring
>    
>    - Integration issues → "Implementation Ready"
>      Examples:
>      - Error middleware conflicts
>      - Database error wrapping inconsistencies
>      - Authentication error flow problems
>      - Error monitoring integration issues
>
> 3. Update affected documentation sections
> 4. Track original verification findings
> 5. Progress through states again with updated understanding
>
> The goal is to catch issues early, but when found later, we prioritize getting it right over moving forward with known issues.
> Document ALL findings from verification steps, even if rolling back, to ensure we don't lose insights.

## Research Phase Requirements

### Scope Analysis
1. **Current Error Handling State**:
   - Well-defined error utilities in `src/utils/errors.ts` and `src/utils/error-codes.ts`
   - Inconsistent usage across controllers
   - No centralized error handling middleware
   - No standardized error response format

2. **Areas Requiring Enhancement**:
   - Global error handling middleware
   - Consistent error response format
   - Standardized error logging
   - Error monitoring and analytics
   - Test infrastructure for error handling

### Component Change Analysis
1. **Existing Reusable Components**:
   - Error Types:
     - `AppError` base class with rich error context
     - Specialized error classes (Authentication, Validation, NotFound, etc.)
     - Error codes, categories, and severity levels
   - Test Utilities:
     - Request/response mocking in `test-utils.ts`
     - MongoDB test setup in `setup.ts`

2. **Required Component Changes**:
   - Error Handler Middleware:
     - Centralized error handling
     - Environment-aware error details
     - Consistent response format
   - Error Testing Utilities:
     - Error response assertions
     - Error logging verification
     - Mock error generation

3. **Affected Components**:
   - Controllers:
     - `meditation.controller.ts` (custom APIError)
     - `breathing.controller.ts`
     - `pmr.controller.ts`
     - `stress.controller.ts`
     - `export.controller.ts`
     - `cache-stats.controller.ts`
   - Services:
     - `meditation-session.service.ts`
     - `breathing.service.ts`
     - `pmr.service.ts`

### Dependencies and Side Effects
1. **Direct Dependencies**:
   - Express.js error handling middleware
   - Mongoose error types
   - Winston/Morgan for logging

2. **Side Effects**:
   - Response format changes may affect clients
   - Error logging changes may affect monitoring
   - Performance impact of centralized error handling

## Purpose of This Document

This detailed task documentation serves four critical functions:

1. **Task Tracking**
   - Breaks down complex tasks into manageable pieces
   - Creates clear documentation of task scope and impact
   - Helps prevent overlooking dependencies or side effects

2. **Test Planning**
   - Aligns with TDD principles by planning tests before implementation
   - Helps identify test coverage gaps
   - Prevents test duplication
   - Forces consideration of test dependencies

3. **Documentation Benefits**
   - Creates living documentation during development
   - Makes sprint reviews more thorough and data-driven
   - Helps with knowledge sharing across team
   - Provides historical context for future changes

4. **Impact Analysis**
   - Clear visualization of affected files/components
   - Better understanding of ripple effects
   - Helps identify potential risks early
   - Makes refactoring decisions more informed

## Pre-Implementation Overview
From Sprint Four Planning:
- Task Description: Add comprehensive error handling to all controllers following `coding-standards.md` standards
- Known Dependencies: 
  - Achievement API endpoint tests must be stable (marked as completed)
  - MockArchitect system for testing error scenarios
  - Existing controller implementations

- Anticipated Major Impacts:
  - All API endpoints will have standardized error responses
  - Frontend will need to adapt to new error format
  - Logging and monitoring systems will be affected

- Initial Testing Needs:
  - New error handling middleware needs full test coverage (target: 90%)
  - Each controller needs error scenario tests (target: 85% per controller)
  - Integration tests needed for error propagation
  - Performance tests for error logging impact

## Goal
Implement a standardized, comprehensive error handling system across all API endpoints that improves debugging, user experience, and maintainability while following the guidelines in `api-error-handling-guidelines.md`.

## Test Infrastructure Verification

### Component Modification Analysis
1. **Existing Test Components**:
   - `test-utils.ts`: Request/response mocking
   - `setup.ts`: MongoDB test configuration
   - No dedicated error testing utilities

2. **Required Test Components**:
   - Error response fixtures
   - Error test helpers
   - Mock error generation utilities
   - Error logging verification

3. **Test Coverage Requirements**:
   - Error handler middleware tests
   - Controller error handling tests
   - Service error propagation tests
   - Integration tests for error scenarios

### Testing Strategy
1. **Unit Tests**:
   - Error handler middleware
   - Controller error handling
   - Service error propagation
   - Error utility functions

2. **Integration Tests**:
   - End-to-end error scenarios
   - Error logging verification
   - Response format validation

3. **Test Categories**:
   - Input validation errors
   - Database errors
   - Authentication errors
   - Business logic errors
   - External service errors

#### 1. Error Handler Middleware Tests
File: `src/__tests__/middleware/error-handler.middleware.test.ts`

1. **Error Response Format**
   ```typescript
   describe('Error Response Format', () => {
     it('should format AppError with standard structure')
     // Response should include:
     // - error.code (from ErrorCodes enum)
     // - error.message
     // - error.category (from ErrorCategory enum)
     // - error.details (if available)
     
     it('should format ValidationError with field-level details')
     // Should include validation details per field
     
     it('should format MongoError with safe details')
     // Should sanitize DB errors for security
     
     it('should format unknown errors safely')
     // Generic error for unexpected errors
   })
   ```

2. **Environment Handling**
   ```typescript
   describe('Environment-Specific Behavior', () => {
     it('should include stack trace in development')
     it('should omit stack trace in production')
     it('should sanitize error details in production')
     it('should include full error context in development')
   })
   ```

3. **Error Logging**
   ```typescript
   describe('Error Logging', () => {
     it('should log errors with proper severity levels')
     it('should include request context in logs')
     it('should log stack traces in development')
     it('should sanitize sensitive data in logs')
   })
   ```

4. **HTTP Status Codes**
   ```typescript
   describe('HTTP Status Codes', () => {
     it('should use 400 for ValidationError')
     it('should use 401 for AuthenticationError')
     it('should use 403 for unauthorized access')
     it('should use 404 for NotFoundError')
     it('should use 409 for ConcurrencyError')
     it('should use 500 for unknown errors')
   })
   ```

5. **Error Recovery Information**
   ```typescript
   describe('Error Recovery', () => {
     it('should include user-friendly messages')
     it('should indicate if error is retryable')
     it('should provide recovery suggestions when available')
     it('should include documentation links when available')
   })
   ```

6. **Error Context**
   ```typescript
   describe('Error Context', () => {
     it('should preserve error timestamps')
     it('should include request ID if available')
     it('should include user context if authenticated')
     it('should sanitize sensitive context data')
   })
   ```

#### Required Test Fixtures
File: `src/__tests__/fixtures/error-responses.ts`

```typescript
// HTTP Status Codes
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
} as const;

// Common Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: 'Invalid input data',
  AUTHENTICATION: 'Authentication required',
  NOT_FOUND: 'Resource not found',
  INTERNAL: 'Internal server error'
} as const;

// Test Error Responses
export const createErrorResponse = (
  code: ErrorCodes,
  message: string,
  category: ErrorCategory,
  details?: unknown
) => ({
  error: {
    code,
    message,
    category,
    ...(details && { details })
  }
});
```

#### Required Test Helpers
File: `src/__tests__/helpers/error-test.helpers.ts`

```typescript
// Error Response Verification
export const verifyErrorResponse = (
  response: Response,
  expectedStatus: number,
  expectedCode: ErrorCodes,
  expectedCategory: ErrorCategory
) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.error).toBeDefined();
  expect(response.body.error.code).toBe(expectedCode);
  expect(response.body.error.category).toBe(expectedCategory);
};

// Error Logging Verification
export const verifyErrorLogging = (
  mockLogger: jest.SpyInstance,
  expectedLevel: string,
  expectedMessage: string
) => {
  expect(mockLogger).toHaveBeenCalledWith(
    expectedLevel,
    expect.stringContaining(expectedMessage),
    expect.any(Object)
  );
};
```

#### Test Dependencies
- Mock logger implementation
- Request/response mocks from test-utils.ts
- Error fixtures and helpers
- Environment variable control

#### Coverage Targets
- Line Coverage: 90%
- Branch Coverage: 85%
- Function Coverage: 100%
- Statement Coverage: 90%

### Review Checklist
- [x] Research phase documented
- [x] Existing components analyzed
- [x] Required changes identified
- [x] Test infrastructure requirements defined
- [ ] Test plan completed
- [ ] No premature code changes made
- [ ] All affected tests identified

### Work Items
1. Research Phase:
   - [x] Document current error handling state
   - [x] Analyze existing components
   - [x] Identify required changes
   - [x] Complete test planning

2. Test Infrastructure:
   - [x] Create error response fixtures
   - [x] Implement error test helpers
   - [x] Add error logging verification

3. Test Implementation:
   - [x] Error handler middleware tests
   - [x] Controller error handling tests
   - [x] Service error propagation tests
   - [x] Integration tests

4. Code Implementation:
   - [x] Error handler middleware
   - [x] Controller updates
   - [x] Service updates
   - [x] Error monitoring

5. Documentation:
   - [x] Update API documentation with error response formats
   - [x] Add error handling section to README
   - [x] Add documentation comments to middleware
   - [x] Document error handling best practices

6. PR Creation:
   - [ ] Create PR for review
   - [ ] Address review feedback
   - [ ] Finalize implementation

### Notes
- Focus on reusing existing error utilities
- Ensure backward compatibility of error responses
- Consider performance implications
- Document error handling patterns for future development

## Impact Analysis

### Direct Code Changes Required
[Only to be implemented after tests are in place and failing]

#### Core Error Handling Infrastructure
- [ ] `/src/middleware/error-handler.middleware.ts` (New)
  - Global error handling middleware
  - Centralized error logging
  - Environment-aware error responses

- [ ] `/src/utils/errors/` (New Directory)
  - [ ] `api-error.ts` - Custom error classes
  - [ ] `error-types.ts` - Error type definitions
  - [ ] `error-messages.ts` - Standardized error messages

#### Controllers to Modify
- [ ] `/src/controllers/meditation.controller.ts`
- [ ] `/src/controllers/user.controller.ts`
- [ ] `/src/controllers/achievement.controller.ts`
- [ ] `/src/controllers/session.controller.ts`
- [ ] `/src/controllers/export.controller.ts`

Changes needed:
- Implement consistent error response format
- Add proper ObjectId validation
- Enhance input validation
- Add error logging
- Use custom error classes

### Indirect Effects

#### Test Updates Required
- [ ] Update controller tests to verify error responses
- [ ] Add tests for new error handling middleware
- [ ] Update API route tests to check error scenarios
- [ ] Add integration tests for error logging

Affected test files:
- `/src/__tests__/controllers/meditation.controller.test.ts`
- `/src/__tests__/controllers/user.controller.test.ts`
- `/src/__tests__/controllers/achievement.controller.test.ts`
- `/src/__tests__/controllers/session.controller.test.ts`
- `/src/__tests__/controllers/export.controller.test.ts`
- `/src/__tests__/middleware/error-handler.middleware.test.ts` (New)

#### Documentation Updates
- [x] Update API documentation with error response formats
- [x] Add error handling section to README
- [x] Update development guidelines

## Implementation Plan
[To be executed only after tests are implemented and failing as expected]

### Phase 1: Infrastructure Setup
1. Create error handling infrastructure
   - Custom error classes
   - Error types and messages
   - Global error middleware

2. Write tests for new components
   - Error class behavior
   - Middleware functionality
   - Error logging

### Phase 2: Controller Updates
1. Update each controller systematically
   - Start with meditation controller as template
   - Apply learnings to other controllers
   - Ensure consistent patterns

2. Update/add tests for each controller
   - Error response format
   - Input validation
   - ObjectId validation
   - Error logging

### Phase 3: Integration
1. Implement global error handling
2. Update API documentation
3. Add logging infrastructure
4. Run full test suite to verify changes

## Success Criteria
- All tests passing
- Coverage requirements met (80% minimum)
- All API endpoints use consistent error format
- All ObjectIds are validated before use
- Error logging is implemented and tested
- No duplicate error handling code
- Clear error messages for all scenarios
- Proper status codes used consistently
- Documentation updated
- Code review completed

## Dependencies
- MockArchitect for testing
- Existing controller implementations
- Current error handling patterns

## Risks
- Breaking changes to API response format
- Impact on frontend error handling
- Test suite maintenance
- Performance impact of added validation

## Review Checklist
- [ ] Complete research phase documented
- [ ] All potential code changes identified
- [ ] Component modification analysis completed
- [ ] Impact on reusable components assessed
- [ ] Test infrastructure changes planned
- [ ] No premature code changes made
- [ ] All affected tests identified
- [ ] Test plan reviewed and approved
- [ ] New tests implemented and failing (required)
- [ ] Existing tests updated (required)
- [ ] Implementation makes tests pass
- [ ] Full test suite passing
- [ ] Coverage requirements met (80%)
- [ ] All endpoints follow new error format
- [ ] Documentation is updated
- [ ] No duplicate error handling
- [ ] Logging is implemented
- [ ] Frontend team is notified of changes
- [ ] Code review completed

## Notes
- Consider impact on API versioning
- Plan frontend updates for new error format
- Document migration path for existing clients
- Consider monitoring and alerting needs

#### 2. Controller Error Handling Tests
File: `src/__tests__/controllers/meditation.controller.test.ts`

1. **Input Validation**
   ```typescript
   describe('Input Validation', () => {
     describe('createMeditation', () => {
       it('should validate session duration is a positive number')
       it('should validate required fields are present')
       it('should validate mood rating is between 1-5')
     })

     describe('updateMeditation', () => {
       it('should validate partial updates')
       it('should prevent invalid field updates')
     })
   })
   ```

2. **ObjectId Validation**
   ```typescript
   describe('ObjectId Validation', () => {
     it('should validate session ID format before database query')
     it('should validate user ID format before operations')
     it('should return 400 for invalid ID formats')
   })
   ```

3. **Database Error Handling**
   ```typescript
   describe('Database Error Handling', () => {
     it('should handle concurrent session updates')
     it('should handle database timeout errors')
     it('should handle unique constraint violations')
     it('should handle validation errors from schema')
   })
   ```

4. **Authentication/Authorization**
   ```typescript
   describe('Authentication/Authorization', () => {
     it('should handle missing authentication')
     it('should handle invalid tokens')
     it('should handle expired tokens')
     it('should prevent accessing other users sessions')
   })
   ```

5. **Not Found Scenarios**
   ```typescript
   describe('Not Found Handling', () => {
     it('should handle non-existent session access')
     it('should handle deleted session access')
     it('should handle invalid meditation type')
   })
   ```

6. **Error Response Format**
   ```typescript
   describe('Error Response Format', () => {
     it('should use consistent error structure')
     it('should include field-level validation details')
     it('should provide actionable error messages')
     it('should use correct HTTP status codes')
   })
   ```

Similar test structures will be needed for other controllers:
- `user.controller.test.ts`
- `achievement.controller.test.ts`
- `session.controller.test.ts`
- `export.controller.test.ts`

#### Required Test Data
File: `src/__tests__/fixtures/meditation-errors.ts`

```typescript
export const INVALID_MEDITATION_INPUTS = {
  negativeDuration: { duration: -1 },
  invalidMood: { moodRating: 6 },
  missingRequired: { type: 'GUIDED' }
} as const;

export const INVALID_IDS = {
  session: 'not-an-object-id',
  user: '123invalid456'
} as const;

export const DATABASE_ERRORS = {
  timeout: new Error('Database operation timeout'),
  duplicate: new Error('E11000 duplicate key error'),
  validation: new Error('Validation failed')
} as const;
```

#### Integration Test Scenarios
File: `src/__tests__/integration/error-handling.test.ts`

1. **Error Propagation**
   ```typescript
   describe('Error Propagation', () => {
     it('should propagate validation errors to global handler')
     it('should propagate database errors to global handler')
     it('should propagate auth errors to global handler')
   })
   ```

2. **Error Logging Flow**
   ```typescript
   describe('Error Logging Flow', () => {
     it('should log errors at appropriate levels')
     it('should include request context in logs')
     it('should maintain error categories through stack')
   })
   ```

3. **Client Response Format**
   ```typescript
   describe('Client Response Format', () => {
     it('should maintain consistent error format')
     it('should include appropriate status codes')
     it('should sanitize error details')
   })
   ```

#### Coverage Requirements
Each controller should have:
- Error scenario coverage: 85%
- Input validation coverage: 90%
- Authentication error coverage: 90%
- Database error coverage: 85%

#### 3. Service Error Handling Tests
File: `src/__tests__/services/meditation-session.service.test.ts`

1. **Error Propagation**
   ```typescript
   describe('Error Propagation', () => {
     describe('Database Errors', () => {
       it('should propagate connection errors with proper context')
       it('should wrap mongoose errors in domain errors')
       it('should preserve error stack traces')
     })

     describe('Validation Errors', () => {
       it('should convert schema validation errors to ValidationError')
       it('should include field-level validation details')
       it('should maintain validation context')
     })

     describe('Business Logic Errors', () => {
       it('should throw SessionError for invalid state transitions')
       it('should throw NotFoundError for missing resources')
       it('should throw ConcurrencyError for conflicts')
     })
   })
   ```

2. **Error Context**
   ```typescript
   describe('Error Context', () => {
     it('should include operation context in errors')
     it('should include entity IDs in errors')
     it('should include relevant state in errors')
     it('should sanitize sensitive data in errors')
   })
   ```

3. **Error Recovery**
   ```typescript
   describe('Error Recovery', () => {
     it('should handle transaction rollbacks')
     it('should cleanup resources on errors')
     it('should maintain data consistency on errors')
   })
   ```

Similar test structures needed for:
- `meditation.service.test.ts`
- `user.service.test.ts`
- `achievement.service.test.ts`
- `export.service.test.ts`

#### Service Test Fixtures
File: `src/__tests__/fixtures/service-errors.ts`

```typescript
export const DATABASE_OPERATIONS = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  find: 'find'
} as const;

export const ERROR_CONTEXTS = {
  session: {
    operation: DATABASE_OPERATIONS.create,
    entityId: 'test-session-id',
    userId: 'test-user-id',
    state: 'ACTIVE'
  },
  user: {
    operation: DATABASE_OPERATIONS.update,
    entityId: 'test-user-id',
    role: 'USER'
  }
} as const;

export const createServiceError = (
  operation: keyof typeof DATABASE_OPERATIONS,
  context: Record<string, unknown>
) => ({
  operation,
  timestamp: new Date(),
  context
});
```

#### Service Test Helpers
File: `src/__tests__/helpers/service-test.helpers.ts`

```typescript
export const expectServiceError = (
  error: AppError,
  expectedCode: ErrorCodes,
  expectedCategory: ErrorCategory,
  context: Record<string, unknown>
) => {
  expect(error).toBeInstanceOf(AppError);
  expect(error.code).toBe(expectedCode);
  expect(error.category).toBe(expectedCategory);
  expect(error.context).toMatchObject(context);
};

export const mockDatabaseError = (
  operation: string,
  code: number,
  message: string
) => {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).operation = operation;
  return error;
};
```

#### Coverage Requirements for Services
- Error handling coverage: 90%
- Error context coverage: 85%
- Error recovery coverage: 85%
- Transaction handling coverage: 90%

Now that we have detailed test plans for:
1. Error handler middleware
2. Controller error handling
3. Service error handling

Would you like me to update the task state to "Test Plan Ready" and proceed with implementing the tests in order? 

## Next Actions Required
1. Test Implementation Phase:
   - [ ] Create error response fixtures as planned
   - [ ] Implement error test helpers
   - [ ] Write failing tests for error handler middleware
   - [ ] Write failing tests for controller error handling
   - [ ] Write failing tests for service error propagation
   - [ ] Implement integration test scenarios
   - [ ] Verify all tests fail for expected reasons

2. After Test Implementation:
   - [ ] Complete Test Implementation Verification checklist
   - [ ] Document any issues found during verification
   - [ ] Address any test implementation issues
   - [ ] Only then proceed to Implementation Ready state

> **Note:** Implementation Plan and related sections will be reviewed and updated after test implementation is verified. Current implementation details are preliminary and subject to change based on test implementation findings. 