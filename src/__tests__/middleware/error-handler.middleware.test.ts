import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCategory, ErrorSeverity } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';
import { errorHandler } from '../../middleware/error-handler.middleware';
import { ERROR_SCENARIOS, ERROR_MESSAGES, HTTP_STATUS } from '../fixtures/error-responses';
import { DATABASE_ERROR_TYPES, createServiceError } from '../fixtures/service-errors';
import { verifyErrorResponse, verifyErrorLogging, createMockError } from '../helpers/error-test.helpers';
import { Logger } from '../../utils/logger';

// Mock implementation to test against for now
jest.mock('../../utils/logger', () => ({
  Logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

interface MockResponse extends Partial<Response> {
  body?: any;
}

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: MockResponse;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
      headers: {}
    };

    const jsonMock = jest.fn().mockImplementation(function(this: any, body: any) {
      this.body = body;
      return this;
    });

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
      body: undefined
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('Error Response Format', () => {
    it('should format AppError with standard structure', () => {
      const error = new AppError(
        ERROR_MESSAGES.VALIDATION,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      verifyErrorResponse(
        mockResponse as any,
        HTTP_STATUS.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCategory.VALIDATION
      );
    });

    it('should format ValidationError with field-level details', () => {
      const error = new AppError(
        ERROR_MESSAGES.VALIDATION,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        {
          fields: {
            name: 'Name is required',
            age: 'Age must be positive'
          }
        }
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: ERROR_MESSAGES.VALIDATION,
          category: ErrorCategory.VALIDATION,
          details: {
            fields: {
              name: 'Name is required',
              age: 'Age must be positive'
            }
          },
          timestamp: expect.any(String),
          requestId: undefined
        }
      });
    });

    it('should format MongoError with safe details', () => {
      const error = createServiceError(
        'CREATE',
        'Database operation failed',
        ErrorCodes.DATABASE_ERROR,
        ErrorCategory.TECHNICAL,
        { type: DATABASE_ERROR_TYPES.CONNECTION }
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      verifyErrorResponse(
        mockResponse as any,
        HTTP_STATUS.INTERNAL_ERROR,
        ErrorCodes.DATABASE_ERROR,
        ErrorCategory.TECHNICAL
      );
    });

    it('should format unknown errors safely', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      verifyErrorResponse(
        mockResponse as any,
        HTTP_STATUS.INTERNAL_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        ErrorCategory.TECHNICAL
      );
    });
  });

  describe('Environment-Specific Behavior', () => {
    const originalEnv = process.env.NODE_ENV;

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError(
        ERROR_MESSAGES.INTERNAL,
        ErrorCodes.INTERNAL_ERROR,
        ErrorCategory.TECHNICAL,
        ErrorSeverity.ERROR
      );
      error.stack = 'Test stack trace';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: 'Test stack trace'
          })
        })
      );
    });

    it('should omit stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError(
        ERROR_MESSAGES.INTERNAL,
        ErrorCodes.INTERNAL_ERROR,
        ErrorCategory.TECHNICAL,
        ErrorSeverity.ERROR
      );
      error.stack = 'Test stack trace';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          error: expect.objectContaining({
            stack: expect.any(String)
          })
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should log errors with proper severity levels', () => {
      const error = new AppError(
        ERROR_MESSAGES.INTERNAL,
        ErrorCodes.INTERNAL_ERROR,
        ErrorCategory.TECHNICAL,
        ErrorSeverity.ERROR
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(Logger.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.INTERNAL,
        expect.objectContaining({
          path: '/test',
          method: 'GET'
        })
      );
    });

    it('should include request context in logs', () => {
      const error = new AppError(
        ERROR_MESSAGES.VALIDATION,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCategory.VALIDATION,
        ErrorSeverity.WARNING
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(Logger.warn).toHaveBeenCalledWith(
        ERROR_MESSAGES.VALIDATION,
        expect.objectContaining({
          path: '/test',
          method: 'GET'
        })
      );
    });
  });

  describe('HTTP Status Codes', () => {
    it.each([
      ['validation error', ERROR_SCENARIOS.validation],
      ['authentication error', ERROR_SCENARIOS.authentication],
      ['authorization error', ERROR_SCENARIOS.authorization],
      ['not found error', ERROR_SCENARIOS.notFound],
      ['concurrency error', ERROR_SCENARIOS.concurrency],
      ['internal error', ERROR_SCENARIOS.internal]
    ])('should use correct status code for %s', (_, scenario) => {
      const error = new AppError(
        scenario.response.error.message,
        scenario.response.error.code,
        scenario.response.error.category,
        ErrorSeverity.ERROR
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(scenario.status);
    });
  });

  describe('Error Recovery Information', () => {
    it('should include user-friendly messages', () => {
      const error = new AppError(
        ERROR_MESSAGES.VALIDATION,
        ErrorCodes.VALIDATION_ERROR,
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        { userMessage: 'Please check your input and try again' }
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            userMessage: 'Please check your input and try again'
          })
        })
      );
    });

    it('should indicate if error is retryable', () => {
      const error = new AppError(
        ERROR_MESSAGES.INTERNAL,
        ErrorCodes.SERVICE_UNAVAILABLE,
        ErrorCategory.TECHNICAL,
        ErrorSeverity.ERROR,
        { retryable: true }
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            retryable: true
          })
        })
      );
    });
  });
}); 