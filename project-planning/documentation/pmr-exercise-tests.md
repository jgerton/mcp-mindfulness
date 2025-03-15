# PMR Exercise Tests Documentation

## Overview
This document outlines the testing strategy and implementation for the Progressive Muscle Relaxation (PMR) functionality in the MCP Mindfulness application. The tests cover various aspects of PMR exercises, including muscle group management, session creation, progress tracking, and API integration.

## Test Structure

### API Integration Tests
- **`pmr.api.test.ts`**: End-to-end tests for PMR API endpoints
  - Tests authentication and authorization
  - Tests muscle group retrieval endpoints
  - Tests session management endpoints
  - Tests progress tracking endpoints
  - Validates error responses and edge cases

### Service Tests
- **`pmr.service.test.ts`**: Tests for the PMRService class
  - Tests muscle group initialization and management
  - Tests session creation, completion, and retrieval
  - Tests progress tracking and validation
  - Validates error handling for invalid inputs

### Controller Tests
- **`pmr.controller.test.ts`**: Tests for the PMRController class
  - Tests request handling and response formatting
  - Validates input validation and error handling
  - Tests controller-service integration

## Test Coverage

### Muscle Group Management
- **Group Initialization**: Tests verify that default muscle groups are correctly initialized
- **Group Retrieval**: Tests ensure muscle groups can be retrieved in the correct order
- **Group Validation**: Tests validate that invalid muscle group requests are properly handled

### Session Management
- **Session Creation**: Tests verify that new PMR sessions can be created with proper initial state
- **Session Completion**: Tests ensure sessions can be completed with appropriate metadata
- **Session Retrieval**: Tests confirm that user sessions can be retrieved
- **Progress Tracking**: Tests validate that muscle group progress is properly tracked

### Error Handling
- **Invalid Muscle Group**: Tests for proper error handling when invalid muscle groups are requested
- **Invalid Session ID**: Tests for proper error handling when invalid session IDs are provided
- **Validation Errors**: Tests for proper validation of stress levels and completion status
- **Authorization Errors**: Tests for proper handling of unauthorized access attempts
- **Duplicate Progress**: Tests for proper handling of attempts to complete the same muscle group twice

## Implementation Details

### Test Setup
- Each test suite uses an in-memory MongoDB database
- Default muscle groups are initialized before each test
- Test data is created before each test and cleaned up afterward
- Authentication tokens are generated for API tests

### Mock Data
- Test users with predefined IDs
- Default muscle groups (hands_and_forearms, face, neck_and_shoulders, etc.)
- Test PMR sessions with various states

### Assertions
- Verification of muscle group properties and order
- Validation of session creation and completion
- Confirmation of API response structures and status codes
- Proper error handling and status codes

## Running the Tests
```bash
# Run all PMR exercise tests
npx jest src/__tests__/api/pmr.api.test.ts src/__tests__/services/pmr.service.test.ts src/__tests__/controllers/pmr.controller.test.ts

# Run PMR API tests only
npx jest src/__tests__/api/pmr.api.test.ts

# Run PMR service tests only
npx jest src/__tests__/services/pmr.service.test.ts
```

## Future Test Improvements
- Add performance testing for high-volume session handling
- Expand test coverage for edge cases and error scenarios
- Add stress tests for concurrent session management
- Implement E2E tests with simulated user interactions
- Add tests for effectiveness metrics and stress reduction tracking 