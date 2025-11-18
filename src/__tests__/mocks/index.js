"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Base mock
__exportStar(require("./base-mock"), exports);
// Database mocks
__exportStar(require("./database/model-mock"), exports);
// Express mocks
__exportStar(require("./express/request-response-mock"), exports);
__exportStar(require("./express/middleware-mock"), exports);
// Controller mocks
__exportStar(require("./controllers/controller-mock"), exports);
// Utilities
__exportStar(require("./utils/test-utils"), exports);
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
