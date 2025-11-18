// Base mock
export * from './base-mock';

// Database mocks
export * from './database/model-mock';

// Express mocks
export * from './express/request-response-mock';
export * from './express/middleware-mock';

// Controller mocks
export * from './controllers/controller-mock';

// Utilities
export * from './utils/test-utils';

/**
 * Mock System
 * 
 * This module provides a comprehensive set of mock classes and utilities for testing
 * Express applications with MongoDB. The mocks are designed to be composable and
 * configurable, allowing for flexible test setups.
 * 
 * Key components:
 * 
 * 1. Base Mocks:
 *    - BaseMock: Foundation for all mock classes with call tracking and behavior configuration
 * 
 * 2. Database Mocks:
 *    - ModelMock: Mock implementation of Mongoose models
 * 
 * 3. Express Mocks:
 *    - RequestMock/ResponseMock: Mock implementations of Express req/res objects
 *    - MiddlewareMock: Configurable mock for Express middleware
 *    - AuthMiddlewareMock: Specialized mock for authentication middleware
 *    - ValidationMiddlewareMock: Specialized mock for validation middleware
 * 
 * 4. Controller Mocks:
 *    - ControllerMock: Base class for controller mocks
 * 
 * 5. Utilities:
 *    - TestContext: Container for test-related objects and utilities
 *    - Various helper functions for common testing tasks
 * 
 * Usage example:
 * 
 * ```typescript
 * import { 
 *   createTestContext, 
 *   createMockModelFactory,
 *   MiddlewareFactory,
 *   ControllerMockFactory
 * } from '../mocks';
 * 
 * describe('UserController', () => {
 *   let context;
 *   let userModel;
 *   
 *   beforeEach(() => {
 *     context = createTestContext();
 *     
 *     // Create a mock User model
 *     const userModelFactory = createMockModelFactory('User', [
 *       { _id: '1', name: 'Test User', email: 'test@example.com' }
 *     ]);
 *     userModel = userModelFactory.model;
 *     
 *     // Register the mock with the context
 *     context.registerMock('UserModel', userModelFactory.mock);
 *   });
 *   
 *   it('should get user by id', async () => {
 *     const { req, res } = context;
 *     req.params.id = '1';
 *     
 *     // Call the controller method
 *     await userController.getUserById(req, res);
 *     
 *     // Assert the response
 *     expect(res.statusCode).toBe(200);
 *     expect(res.getSentData()).toEqual({
 *       _id: '1',
 *       name: 'Test User',
 *       email: 'test@example.com'
 *     });
 *   });
 * });
 * ```
 */ 