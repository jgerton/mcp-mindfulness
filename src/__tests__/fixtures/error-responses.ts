import { ErrorCategory } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';

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
  INTERNAL: 'Internal server error',
  UNAUTHORIZED: 'Not authorized to perform this action',
  CONCURRENCY: 'Resource was modified by another request'
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
    ...(details ? { details } : {}),
    timestamp: expect.any(String)
  }
});

// Error response matchers
export const errorResponseMatcher = {
  code: expect.any(String),
  message: expect.any(String),
  category: expect.any(String),
  timestamp: expect.any(String)
};

// Validation error details matcher
export const validationErrorDetailsMatcher = {
  fields: expect.any(Object)
};

// Sample errors for different scenarios
export const sampleErrors = {
  validation: {
    code: ErrorCodes.VALIDATION_ERROR,
    message: 'Validation failed',
    category: ErrorCategory.VALIDATION,
    details: {
      fields: {
        email: 'Invalid email format',
        password: 'Password too short'
      }
    }
  },
  notFound: {
    code: ErrorCodes.NOT_FOUND,
    message: 'Resource not found',
    category: ErrorCategory.BUSINESS
  },
  authentication: {
    code: ErrorCodes.AUTHENTICATION_ERROR,
    message: 'Authentication required',
    category: ErrorCategory.SECURITY
  },
  database: {
    code: ErrorCodes.DATABASE_ERROR,
    message: 'Database operation failed',
    category: ErrorCategory.TECHNICAL
  }
};

// Common Test Error Scenarios
export const ERROR_SCENARIOS = {
  validation: {
    status: HTTP_STATUS.BAD_REQUEST,
    response: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ERROR_MESSAGES.VALIDATION,
      ErrorCategory.VALIDATION
    )
  },
  authentication: {
    status: HTTP_STATUS.UNAUTHORIZED,
    response: createErrorResponse(
      ErrorCodes.AUTHENTICATION_ERROR,
      ERROR_MESSAGES.AUTHENTICATION,
      ErrorCategory.SECURITY
    )
  },
  authorization: {
    status: HTTP_STATUS.FORBIDDEN,
    response: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ERROR_MESSAGES.AUTHENTICATION,
      ErrorCategory.SECURITY
    )
  },
  notFound: {
    status: HTTP_STATUS.NOT_FOUND,
    response: createErrorResponse(
      ErrorCodes.NOT_FOUND,
      ERROR_MESSAGES.NOT_FOUND,
      ErrorCategory.BUSINESS
    )
  },
  concurrency: {
    status: HTTP_STATUS.CONFLICT,
    response: createErrorResponse(
      ErrorCodes.CONCURRENCY_ERROR,
      ERROR_MESSAGES.CONCURRENCY,
      ErrorCategory.TECHNICAL
    )
  },
  internal: {
    status: HTTP_STATUS.INTERNAL_ERROR,
    response: createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      ERROR_MESSAGES.INTERNAL,
      ErrorCategory.TECHNICAL
    )
  }
} as const;

// Common validation error details
export const VALIDATION_ERROR_DETAILS = {
  REQUIRED_FIELD: {
    type: 'REQUIRED',
    message: 'Field is required'
  },
  INVALID_FORMAT: {
    type: 'INVALID_FORMAT',
    message: 'Invalid format'
  },
  OUT_OF_RANGE: {
    type: 'OUT_OF_RANGE',
    message: 'Value is out of allowed range'
  },
  INVALID_VALUE: {
    type: 'INVALID_VALUE',
    message: 'Invalid value'
  }
} as const;

// Test error contexts
export const ERROR_CONTEXTS = {
  REQUEST: {
    path: '/api/v1/test',
    method: 'POST',
    requestId: 'test-request-id'
  },
  USER: {
    userId: 'test-user-id',
    role: 'USER'
  }
} as const; 