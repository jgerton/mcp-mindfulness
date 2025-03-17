# Breathing Exercise Tests Documentation

## Overview
This document outlines the testing strategy and implementation for the Breathing Exercise functionality in the MCP Mindfulness application. The tests cover various aspects of breathing exercises, including pattern management, session creation, completion, and API integration.

## Test Structure

### Unit Tests
- **`breathing.service.test.ts`**: Tests for the BreathingService class
  - Tests pattern initialization and management
  - Tests session creation, completion, and retrieval
  - Validates error handling for invalid inputs
  - Ensures proper session state management

### Controller Tests
- **`breathing.controller.test.ts`**: Tests for the BreathingController class
  - Tests request handling and response formatting
  - Validates input validation and error handling
  - Tests controller-service integration

### API Integration Tests
- **`breathing.api.test.ts`**: End-to-end tests for breathing API endpoints
  - Tests authentication and authorization
  - Tests pattern retrieval endpoints
  - Tests session management endpoints
  - Validates error responses and edge cases

## Test Coverage

### Pattern Management
- **Pattern Initialization**: Tests verify that default breathing patterns are correctly initialized
- **Pattern Retrieval**: Tests ensure patterns can be retrieved by name
- **Pattern Validation**: Tests validate that invalid pattern requests are properly handled

### Session Management
- **Session Creation**: Tests verify that new breathing sessions can be created with proper initial state
- **Session Completion**: Tests ensure sessions can be completed with appropriate metadata
- **Session Retrieval**: Tests confirm that user sessions can be retrieved
- **Cycle Tracking**: Tests validate that breathing cycles are properly tracked

### Error Handling
- **Invalid Pattern**: Tests for proper error handling when invalid patterns are requested
- **Invalid Session ID**: Tests for proper error handling when invalid session IDs are provided
- **Validation Errors**: Tests for proper validation of stress levels and cycle counts
- **Authorization Errors**: Tests for proper handling of unauthorized access attempts

## Implementation Details

### Test Setup
- Each test suite uses an in-memory MongoDB database
- Default breathing patterns are initialized before each test
- Test data is created before each test and cleaned up afterward
- Authentication tokens are generated for API tests

### Mock Data
- Test users with predefined IDs
- Default breathing patterns (4-7-8, Box Breathing, Quick Breath)
- Test breathing sessions with various states

### Assertions
- Verification of pattern properties
- Validation of session creation and completion
- Confirmation of API response structures and status codes
- Proper error handling and status codes

## Running the Tests
```bash
# Run all breathing exercise tests
npx jest src/__tests__/services/breathing.service.test.ts src/__tests__/controllers/breathing.controller.test.ts src/__tests__/api/breathing.api.test.ts

# Run breathing service tests only
npx jest src/__tests__/services/breathing.service.test.ts

# Run breathing API tests only
npx jest src/__tests__/api/breathing.api.test.ts
```

## Future Test Improvements
- Add performance testing for high-volume session handling
- Expand test coverage for edge cases and error scenarios
- Add stress tests for concurrent session management
- Implement E2E tests with simulated user interactions
- Add tests for breathing pattern effectiveness metrics 