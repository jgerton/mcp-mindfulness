# User Authentication Tests Documentation

## Overview
This document outlines the testing strategy and implementation for the User Authentication functionality in the MCP Mindfulness application. The tests cover various aspects of authentication, including user registration, login, token validation, and authorization checks.

## Test Structure

### Authentication Controller Tests
- **`auth.controller.test.ts`**: Tests for the AuthController class
  - Tests user registration functionality
  - Tests login validation and response
  - Tests token refresh functionality
  - Validates error handling for invalid credentials

### Authentication Middleware Tests
- **`auth.middleware.test.ts`**: Tests for the authentication middleware
  - Tests token validation and extraction
  - Tests user identification from tokens
  - Tests error handling for missing or invalid tokens
  - Tests authorization checks

### JWT Utility Tests
- **`jwt.utils.test.ts`**: Tests for JWT token utilities
  - Tests token generation
  - Tests token verification
  - Tests token expiration handling
  - Tests error handling for invalid tokens

### API Integration Tests
- Authentication tests are integrated into various API test files:
  - Tests for authentication requirements in protected endpoints
  - Tests for proper error responses when authentication fails
  - Tests for authorization checks preventing access to other users' resources

## Test Coverage

### User Registration
- **Input Validation**: Tests verify that registration inputs are properly validated
- **Duplicate User Handling**: Tests ensure duplicate usernames/emails are rejected
- **Password Security**: Tests confirm passwords are properly hashed
- **Response Format**: Tests validate the structure of successful registration responses

### User Login
- **Credential Validation**: Tests verify that login credentials are properly validated
- **Invalid Login Handling**: Tests ensure proper error responses for invalid credentials
- **Token Generation**: Tests confirm that valid tokens are generated on successful login
- **Response Format**: Tests validate the structure of successful login responses

### Token Validation
- **Token Extraction**: Tests verify that tokens are properly extracted from request headers
- **Token Verification**: Tests ensure tokens are properly verified
- **User Identification**: Tests confirm that user information is correctly extracted from tokens
- **Error Handling**: Tests validate proper error responses for invalid or expired tokens

### Authorization
- **Resource Access Control**: Tests verify that users can only access their own resources
- **Admin Access Control**: Tests ensure admin-only endpoints are properly protected
- **Cross-User Protection**: Tests confirm that users cannot modify other users' data

## Implementation Details

### Test Setup
- Each test suite uses an in-memory MongoDB database
- Test users are created with predefined credentials
- Authentication tokens are generated for testing protected endpoints
- Request headers are properly configured with authentication tokens

### Mock Data
- Test users with predefined credentials
- Valid and invalid tokens for testing different scenarios
- Test resources owned by different users for authorization testing

### Assertions
- Verification of registration and login responses
- Validation of token generation and verification
- Confirmation of proper error responses for authentication failures
- Verification of authorization checks

## Running the Tests
```bash
# Run all authentication tests
npx jest src/__tests__/controllers/auth.controller.test.ts src/__tests__/middleware/auth.middleware.test.ts src/__tests__/utils/jwt.utils.test.ts

# Run authentication controller tests only
npx jest src/__tests__/controllers/auth.controller.test.ts

# Run authentication middleware tests only
npx jest src/__tests__/middleware/auth.middleware.test.ts
```

## Authentication Testing in API Tests
Authentication testing is integrated into all API test files to ensure that:
1. Protected endpoints require valid authentication
2. Invalid tokens are properly rejected
3. Users can only access their own resources
4. Proper error responses are returned for authentication failures

Example from breathing.api.test.ts:
```typescript
// Create auth token for testing
authToken = jwt.sign({ _id: testUserId, username: testUsername }, config.jwtSecret, { expiresIn: '1h' });

// Test authentication requirement
it('should return 401 without auth token', async () => {
  const response = await request(app)
    .get('/api/breathing/patterns/4-7-8');
  expect(response.status).toBe(401);
});

// Test with valid authentication
it('should return a specific breathing pattern', async () => {
  const response = await request(app)
    .get('/api/breathing/patterns/4-7-8')
    .set('Authorization', `Bearer ${authToken}`);
  expect(response.status).toBe(200);
});
```

## Future Test Improvements
- Add performance testing for authentication operations
- Implement tests for token refresh mechanisms
- Add tests for password reset functionality
- Implement tests for multi-factor authentication
- Add tests for session management and logout functionality 