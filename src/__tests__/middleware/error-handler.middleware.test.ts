import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCategory, ErrorSeverity } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';
import { errorHandler } from '../../middleware/error-handler.middleware';
import { ERROR_SCENARIOS, ERROR_MESSAGES, HTTP_STATUS } from '../fixtures/error-responses';
import { DATABASE_ERROR_TYPES, createServiceError } from '../fixtures/service-errors';
import { verifyErrorResponse, verifyErrorLogging, createMockError } from '../helpers/error-test.helpers';
import { Logger } from '../../utils/logger';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import { mockRequest, mockResponse } from '../test-utils/express-mock';
import { ZodError, z } from 'zod';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}


describe('Error-handlerMiddleware Tests', () => {
  let context: TestContext;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeAll(() => {
    // Setup any test-wide configurations
  });

  beforeEach(() => {
    // Initialize test context
    context = {
      mockReq: {
        params: {},
        body: {},
        query: {},
      } as Request,
      mockRes: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response,
      testFactory: new TestFactory(),
    };
    req = mockRequest() as Request;
    res = mockResponse() as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    
      it('should successfully process valid input', async () => {
        // Arrange
        const input = context.testFactory.createValidInput();
        context.mockReq.body = input;
        
        const expectedResult = context.testFactory.createExpectedResult();
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockResolvedValue(expectedResult);

        // Act
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);

          // Assert
          expect(context.mockRes.status).toHaveBeenCalledWith(200);
          expect(context.mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining(expectedResult)
          );
        } catch (error) {
          fail('Should not throw an error');
        }
      });
    
  });

  describe('Error Cases', () => {
    
      it('should handle invalid input error', async () => {
        // Arrange
        const invalidInput = context.testFactory.createInvalidInput();
        context.mockReq.body = invalidInput;

        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockRejectedValue({
            code: ErrorCode.INVALID_INPUT,
            category: ErrorCategory.VALIDATION,
            message: 'Invalid input provided',
          });

        // Act & Assert
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);
          fail('Should throw an error');
        } catch (error: any) {
          expect(error.code).toBe(ErrorCode.INVALID_INPUT);
          expect(error.category).toBe(ErrorCategory.VALIDATION);
          expect(context.mockRes.status).not.toHaveBeenCalled();
        }
      });
    
  });

  describe('Edge Cases', () => {
    
      it('should handle boundary conditions', async () => {
        // Arrange
        const edgeInput = context.testFactory.createEdgeCaseInput();
        context.mockReq.body = edgeInput;

        // Mock implementation with specific logic
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockImplementation(async (input) => {
            if (someEdgeCondition(input)) {
              return specialHandling(input);
            }
            return normalHandling(input);
          });

        // Act
        await controller.handleComponent(context.mockReq, context.mockRes);

        // Assert
        expect(context.mockRes.status).toHaveBeenCalledWith(200);
        expect(context.mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            // Edge case specific assertions
          })
        );
      });
    
  });

  describe('AppError Handling', () => {
    it('should handle validation error', () => {
      const error = new AppError('Invalid input', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        context: {
          fields: {
            name: 'Name is required',
            age: 'Age must be positive'
          }
        }
      });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Invalid input data',
          category: ErrorCategory.VALIDATION,
          timestamp: expect.any(String),
          details: {
            fields: {
              name: 'Name is required',
              age: 'Age must be positive'
            }
          }
        }
      });
    });

    it('should handle authentication error', () => {
      const error = new AppError('Authentication failed', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION
      });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.AUTHENTICATION_ERROR,
          message: 'Authentication failed',
          category: ErrorCategory.AUTHENTICATION,
          timestamp: expect.any(String),
          userMessage: 'Authentication required',
          retryable: true
        }
      });
    });

    it('should handle authorization error', () => {
      const error = new AppError('Not authorized', {
        code: ErrorCodes.AUTHORIZATION_ERROR,
        category: ErrorCategory.AUTHORIZATION
      });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.AUTHORIZATION_ERROR,
          message: 'Not authorized',
          category: ErrorCategory.AUTHORIZATION,
          timestamp: expect.any(String),
          userMessage: 'You do not have permission to perform this action'
        }
      });
    });

    it('should handle not found error', () => {
      const error = new AppError('Resource not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.TECHNICAL
      });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Resource not found',
          category: ErrorCategory.TECHNICAL,
          timestamp: expect.any(String),
          userMessage: 'The requested resource was not found'
        }
      });
    });

    it('should handle database error', () => {
      const error = new AppError('Database connection failed', {
        code: ErrorCodes.DATABASE_ERROR,
        category: ErrorCategory.TECHNICAL,
        severity: ErrorSeverity.ERROR
      });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Database connection failed',
          category: ErrorCategory.TECHNICAL,
          timestamp: expect.any(String),
          userMessage: 'A database error occurred',
          retryable: true
        }
      });
    });
  });

  describe('Zod Validation Error Handling', () => {
    it('should handle Zod validation error', () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().positive()
      });

      let zodError;
      try {
        schema.parse({ name: 'Jo', age: -1 });
      } catch (error) {
        zodError = error;
      }

      errorHandler(zodError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation error',
          category: ErrorCategory.VALIDATION,
          timestamp: expect.any(String),
          requestId: undefined,
          userMessage: 'Please check your input and try again',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String)
            })
          ])
        }
      });
    });
  });

  describe('Mongoose Error Handling', () => {
    it('should handle Mongoose validation error', () => {
      const error = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          name: {
            message: 'Name is required',
            kind: 'required',
            path: 'name'
          },
          age: {
            message: 'Age must be positive',
            kind: 'min',
            path: 'age',
            value: -1
          }
        }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Invalid input data',
          category: ErrorCategory.VALIDATION,
          timestamp: expect.any(String),
          details: {
            fields: {
              name: 'Name is required',
              age: 'Age must be positive'
            }
          }
        }
      });
    });

    it('should handle MongoDB duplicate key error', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        message: 'Duplicate key error'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Duplicate key error',
          category: ErrorCategory.TECHNICAL,
          timestamp: expect.any(String),
          userMessage: 'A database error occurred',
          retryable: true
        }
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Unknown error',
          category: ErrorCategory.TECHNICAL,
          timestamp: expect.any(String),
          userMessage: 'An unexpected error occurred'
        }
      });
    });

    it('should include request ID when available', () => {
      const error = new Error('Test error');
      req.headers['x-request-id'] = 'test-request-id';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Test error',
          category: ErrorCategory.TECHNICAL,
          timestamp: expect.any(String),
          requestId: 'test-request-id',
          userMessage: 'An unexpected error occurred'
        }
      });
    });
  });
});