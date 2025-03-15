import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { errorHandler, APIError, catchAsync } from '../../src/middleware/error-handler';
import { authMiddleware } from '../../src/middleware/auth-middleware';
import jwt from 'jsonwebtoken';

/**
 * Example middleware test file
 * 
 * This file demonstrates best practices for testing middleware:
 * 1. Proper mocking of req, res, next objects
 * 2. Testing error handling middleware
 * 3. Testing authentication middleware
 * 4. Testing async middleware with catchAsync
 */
describe('Middleware Tests', () => {
  // Mock objects for Express request, response, and next function
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      headers: {},
      body: {},
      params: {},
      user: undefined
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      locals: {}
    };
    
    next = jest.fn();
  });

  describe('Error Handler Middleware', () => {
    it('should handle API errors with correct status code', () => {
      // Create a custom API error
      const error = new APIError('Test error message', 400);
      
      // Call the error handler middleware
      errorHandler(error, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Test error message'
        })
      );
    });

    it('should handle Mongoose validation errors', () => {
      // Create a Mongoose validation error
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: new mongoose.Error.ValidatorError({
          message: 'Name is required',
          path: 'name',
          type: 'required'
        })
      };
      
      // Call the error handler middleware
      errorHandler(validationError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Validation Error')
        })
      );
    });

    it('should handle Mongoose cast errors (invalid ObjectId)', () => {
      // Create a Mongoose cast error
      const castError = new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id');
      
      // Call the error handler middleware
      errorHandler(castError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Invalid id')
        })
      );
    });

    it('should handle duplicate key errors', () => {
      // Create a MongoDB duplicate key error
      const duplicateError = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };
      
      // Call the error handler middleware
      errorHandler(duplicateError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(409); // Conflict
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Duplicate value')
        })
      );
    });

    it('should handle JWT errors', () => {
      // Create a JWT error
      const jwtError = new Error('invalid token');
      jwtError.name = 'JsonWebTokenError';
      
      // Call the error handler middleware
      errorHandler(jwtError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid token. Please log in again.'
        })
      );
    });

    it('should handle JWT expired errors', () => {
      // Create a JWT expired error
      const jwtExpiredError = new Error('jwt expired');
      jwtExpiredError.name = 'TokenExpiredError';
      
      // Call the error handler middleware
      errorHandler(jwtExpiredError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Your token has expired. Please log in again.'
        })
      );
    });

    it('should handle unknown errors with 500 status code', () => {
      // Create an unknown error
      const unknownError = new Error('Something unexpected happened');
      
      // Call the error handler middleware
      errorHandler(unknownError, req as Request, res as Response, next as NextFunction);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringMatching(/Internal Server Error|Something went wrong/)
        })
      );
    });
  });

  describe('Auth Middleware', () => {
    // Mock JWT verify function
    const originalJwtVerify = jwt.verify;
    let jwtVerifyMock: jest.SpyInstance;

    beforeEach(() => {
      // Setup JWT verify mock
      jwtVerifyMock = jest.spyOn(jwt, 'verify');
    });

    afterEach(() => {
      // Restore original JWT verify function
      jwtVerifyMock.mockRestore();
    });

    it('should pass if valid token is provided', () => {
      // Mock a valid token
      req.headers = {
        authorization: 'Bearer valid-token'
      };
      
      // Mock JWT verify to return a valid user payload
      jwtVerifyMock.mockImplementation(() => ({
        id: '60d21b4667d0d8992e610c85',
        username: 'testuser'
      }));
      
      // Call the auth middleware
      authMiddleware(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called without error
      expect(next).toHaveBeenCalledWith();
      
      // Verify user was attached to request
      expect(req.user).toBeDefined();
      expect(req.user!.id).toBe('60d21b4667d0d8992e610c85');
      expect(req.user!.username).toBe('testuser');
    });

    it('should fail if no token is provided', () => {
      // No authorization header
      req.headers = {};
      
      // Call the auth middleware
      authMiddleware(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      
      // Get the error passed to next
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('No authentication token provided');
    });

    it('should fail if token format is invalid', () => {
      // Invalid token format (missing 'Bearer')
      req.headers = {
        authorization: 'invalid-token'
      };
      
      // Call the auth middleware
      authMiddleware(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      
      // Get the error passed to next
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token format');
    });

    it('should fail if token is invalid', () => {
      // Valid token format but invalid token
      req.headers = {
        authorization: 'Bearer invalid-token'
      };
      
      // Mock JWT verify to throw an error
      jwtVerifyMock.mockImplementation(() => {
        throw new Error('invalid token');
      });
      
      // Call the auth middleware
      authMiddleware(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      
      // Get the error passed to next
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    it('should fail if token is expired', () => {
      // Valid token format but expired token
      req.headers = {
        authorization: 'Bearer expired-token'
      };
      
      // Mock JWT verify to throw a TokenExpiredError
      const tokenExpiredError = new Error('jwt expired');
      tokenExpiredError.name = 'TokenExpiredError';
      jwtVerifyMock.mockImplementation(() => {
        throw tokenExpiredError;
      });
      
      // Call the auth middleware
      authMiddleware(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      
      // Get the error passed to next
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Token expired');
    });
  });

  describe('catchAsync Middleware', () => {
    it('should pass through successful async function results', async () => {
      // Create an async handler that succeeds
      const asyncHandler = async (req: Request, res: Response) => {
        res.status(200).json({ success: true });
      };
      
      // Wrap with catchAsync
      const wrappedHandler = catchAsync(asyncHandler);
      
      // Call the wrapped handler
      await wrappedHandler(req as Request, res as Response, next as NextFunction);
      
      // Verify response was set correctly
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      
      // Verify next was not called
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch errors and pass them to next()', async () => {
      // Create an async handler that throws an error
      const asyncHandler = async () => {
        throw new Error('Async error');
      };
      
      // Wrap with catchAsync
      const wrappedHandler = catchAsync(asyncHandler);
      
      // Call the wrapped handler
      await wrappedHandler(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with the error
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Async error');
    });

    it('should catch API errors and pass them to next()', async () => {
      // Create an async handler that throws an API error
      const asyncHandler = async () => {
        throw new APIError('Not found', 404);
      };
      
      // Wrap with catchAsync
      const wrappedHandler = catchAsync(asyncHandler);
      
      // Call the wrapped handler
      await wrappedHandler(req as Request, res as Response, next as NextFunction);
      
      // Verify next was called with the API error
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      
      // Get the error passed to next
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
    });
  });
}); 