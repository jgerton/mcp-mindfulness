import { Request, Response } from 'express';
import { AppError, ErrorCategory, ErrorSeverity } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';
import { ERROR_MESSAGES, ERROR_CONTEXTS } from '../fixtures/error-responses';
import { DATABASE_ERROR_TYPES, createServiceError } from '../fixtures/service-errors';
import { createErrorResponse } from '../fixtures/error-responses';

interface ErrorResponse {
  error: {
    code: ErrorCodes;
    message: string;
    category: ErrorCategory;
    details?: unknown;
  };
}

type TestResponse = Response & {
  body: ErrorResponse;
  status: jest.Mock;
  json: jest.Mock;
};

// Error Response Verification
export const verifyErrorResponse = (
  response: Response,
  expectedStatus: number,
  expectedCode: ErrorCodes,
  expectedCategory: ErrorCategory
): void => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalledWith({
    error: expect.objectContaining({
      code: expectedCode,
      category: expectedCategory,
      message: expect.any(String),
      timestamp: expect.any(String)
    })
  });
};

// Error Logging Verification
export const verifyErrorLogging = (
  mockLogger: jest.SpyInstance,
  expectedLevel: string,
  expectedMessage: string,
  expectedContext?: Record<string, unknown>
): void => {
  expect(mockLogger).toHaveBeenCalledWith(
    expectedLevel,
    expect.stringContaining(expectedMessage),
    expect.objectContaining({
      ...(expectedContext || {}),
      statusCode: expect.any(Number),
      errorCode: expect.any(String),
      errorCategory: expect.any(String)
    })
  );
};

// Verify error context structure
export const verifyErrorContext = (
  error: AppError,
  expectedContext: Record<string, unknown>
) => {
  expect(error.context).toBeDefined();
  expect(error.context).toMatchObject(expectedContext);
};

// Mock Error Generation
export const createMockError = (
  code: ErrorCodes = ErrorCodes.INTERNAL_ERROR,
  message = 'Test error',
  category: ErrorCategory = ErrorCategory.TECHNICAL,
  context: Record<string, unknown> = {}
): AppError => {
  const error = new AppError(
    message,
    code,
    category,
    ErrorSeverity.ERROR,
    context
  );
  return error;
};

// MongoDB Error Mocks
export const createMongoError = (code: string, message: string): Error => {
  const error = new Error(message);
  error.name = 'MongoError';
  (error as any).code = code;
  return error;
};

// Validation Error Mocks
export const createValidationError = (
  field: string,
  kind: string,
  message: string
): Error => {
  const error = new Error('Validation failed');
  error.name = 'ValidationError';
  (error as any).errors = {
    [field]: {
      kind,
      message,
      path: field,
      value: undefined
    }
  };
  return error;
};

// Authentication Error Mocks
export const createAuthError = (message: string): AppError => {
  return new AppError(
    message,
    ErrorCodes.AUTHENTICATION_ERROR,
    ErrorCategory.SECURITY
  );
};

// Create mock database error
export const createMockDbError = (
  code: string,
  message: string,
  operation?: string
): Error => {
  const error = new Error(message);
  (error as any).code = code;
  if (operation) {
    (error as any).operation = operation;
  }
  return error;
};

// Create mock request context
export const createMockRequestContext = (
  overrides?: Partial<typeof ERROR_CONTEXTS.REQUEST>
) => ({
  ...ERROR_CONTEXTS.REQUEST,
  ...overrides,
  requestId: overrides?.requestId || `test-${Date.now()}`
});

// Create mock user context
export const createMockUserContext = (
  overrides?: Partial<typeof ERROR_CONTEXTS.USER>
) => ({
  ...ERROR_CONTEXTS.USER,
  ...overrides
});

// Verify error message matches expected message
export const verifyErrorMessage = (
  error: AppError,
  expectedMessage: keyof typeof ERROR_MESSAGES
) => {
  expect(error.message).toBe(ERROR_MESSAGES[expectedMessage]);
};

// Verify HTTP status matches expected status
export const verifyHttpStatus = (
  response: Response,
  expectedStatus: number
) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
};

// Verify error recovery info
export const verifyErrorRecovery = (
  response: ErrorResponse,
  isRetryable: boolean,
  hasSuggestion: boolean
) => {
  if (isRetryable) {
    expect(response.error.details).toHaveProperty('retryable', true);
  }
  if (hasSuggestion) {
    expect(response.error.details).toHaveProperty('suggestion');
  }
};

// Create a mock ValidationError (mongoose style)
export const createMockValidationError = (
  errors: Record<string, { message: string; path: string; kind: string }>
): Error => {
  const error = new Error('Validation failed') as any;
  error.name = 'ValidationError';
  error.errors = errors;
  return error;
};

// Create a mock MongoDB error
export const createMockMongoError = (
  code: number | string,
  message = 'Database error'
): Error => {
  const error = new Error(message) as any;
  error.name = 'MongoError';
  error.code = code;
  return error;
};

// Create mock request and response objects
export const createMockReqRes = (
  reqOptions: Partial<Request> = {},
  headers: Record<string, string> = {}
): { req: Partial<Request>; res: Partial<Response>; next: jest.Mock } => {
  const req: Partial<Request> = {
    path: '/test',
    method: 'GET',
    headers: {
      'x-request-id': 'test-request-id',
      ...headers
    },
    ...reqOptions
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  return { req, res, next };
};

// Sanitize error context (helper to simulate what the middleware should do)
export const sanitizeErrorContext = (
  context: Record<string, unknown>
): Record<string, unknown> => {
  // Filter out sensitive data (passwords, tokens, etc.)
  const { password, token, secret, ...safeContext } = context;
  return safeContext;
}; 