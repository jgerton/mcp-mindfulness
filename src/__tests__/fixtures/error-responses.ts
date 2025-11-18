import { ErrorCodes, ErrorCategory } from '../../utils/errors';

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Common Error Messages
export const COMMON_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error'
} as const;

// Test Error Responses
export const createErrorResponse = (
  code: ErrorCodes,
  category: ErrorCategory,
  message: string,
  details?: any
) => ({
  error: {
    timestamp: expect.any(Date),
    code,
    category,
    message,
    details
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
    category: ErrorCategory.NOT_FOUND
  },
  authentication: {
    code: ErrorCodes.AUTHENTICATION_ERROR,
    message: 'Authentication required',
    category: ErrorCategory.AUTHENTICATION
  },
  database: {
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'Database operation failed',
    category: ErrorCategory.INTERNAL
  }
};

// Common Test Error Scenarios
export const ERROR_SCENARIOS = {
  validation: {
    status: HTTP_STATUS.BAD_REQUEST,
    response: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      COMMON_ERROR_MESSAGES.VALIDATION_ERROR
    )
  },
  authentication: {
    status: HTTP_STATUS.UNAUTHORIZED,
    response: createErrorResponse(
      ErrorCodes.AUTHENTICATION_ERROR,
      ErrorCategory.AUTHENTICATION,
      COMMON_ERROR_MESSAGES.UNAUTHORIZED
    )
  },
  authorization: {
    status: HTTP_STATUS.FORBIDDEN,
    response: createErrorResponse(
      ErrorCodes.FORBIDDEN,
      ErrorCategory.FORBIDDEN,
      COMMON_ERROR_MESSAGES.FORBIDDEN
    )
  },
  notFound: {
    status: HTTP_STATUS.NOT_FOUND,
    response: createErrorResponse(
      ErrorCodes.NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      COMMON_ERROR_MESSAGES.NOT_FOUND
    )
  },
  concurrency: {
    status: HTTP_STATUS.CONFLICT,
    response: createErrorResponse(
      ErrorCodes.CONFLICT,
      ErrorCategory.CONFLICT,
      COMMON_ERROR_MESSAGES.DATABASE_ERROR
    )
  },
  internal: {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    response: createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      ErrorCategory.INTERNAL,
      COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    )
  },
  database: {
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    response: createErrorResponse(
      ErrorCodes.DATABASE_ERROR,
      ErrorCategory.INFRASTRUCTURE,
      COMMON_ERROR_MESSAGES.DATABASE_ERROR,
      { retryable: true }
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

// Test errors
export const TEST_ERRORS = {
  VALIDATION: {
    REQUIRED_FIELD: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Required field missing',
      { field: 'name', constraint: 'required' }
    ),
    INVALID_EMAIL: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Invalid email format',
      { field: 'email', constraint: 'format' }
    ),
    INVALID_PASSWORD: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Invalid password',
      { field: 'password', constraint: 'format' }
    ),
    PASSWORD_LENGTH: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Password must be at least 8 characters',
      { field: 'password', constraint: 'minLength', min: 8 }
    ),
    DUPLICATE_EMAIL: createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Email already exists',
      { field: 'email', constraint: 'unique' }
    )
  },
  AUTH: {
    INVALID_CREDENTIALS: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Invalid email or password'
    ),
    ACCOUNT_INACTIVE: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Account is inactive'
    ),
    ACCOUNT_LOCKED: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Account is locked',
      { unlockTime: expect.any(String) }
    ),
    INVALID_TOKEN: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Invalid or expired token'
    ),
    TOKEN_EXPIRED: createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Token has expired'
    )
  },
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSIONS: createErrorResponse(
      ErrorCodes.FORBIDDEN,
      ErrorCategory.AUTHORIZATION,
      'Insufficient permissions',
      { requiredRole: 'ADMIN' }
    ),
    RESOURCE_ACCESS_DENIED: createErrorResponse(
      ErrorCodes.FORBIDDEN,
      ErrorCategory.AUTHORIZATION,
      'Access to resource denied'
    )
  },
  NOT_FOUND: {
    RESOURCE_NOT_FOUND: createErrorResponse(
      ErrorCodes.NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      'Resource not found',
      { resourceType: 'user' }
    ),
    RESOURCE_DELETED: createErrorResponse(
      ErrorCodes.NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      'Resource not found',
      { resourceType: 'user', reason: 'deleted' }
    )
  },
  INFRASTRUCTURE: {
    DATABASE_ERROR: createErrorResponse(
      ErrorCodes.DATABASE_ERROR,
      ErrorCategory.INFRASTRUCTURE,
      'Database error occurred',
      { retryable: true }
    ),
    SERVICE_UNAVAILABLE: createErrorResponse(
      ErrorCodes.SERVICE_UNAVAILABLE,
      ErrorCategory.INFRASTRUCTURE,
      'Service temporarily unavailable',
      { retryAfter: expect.any(Number) }
    )
  }
}; 