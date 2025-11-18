import mongoose from 'mongoose';
import { AppError } from '../../utils/errors';
import { ErrorCodes, ErrorCategory } from '../../utils/errors';

// MongoDB Error Types
export const createMongoError = (code: number, message: string): mongoose.Error => {
  const error = new mongoose.Error(message);
  (error as any).code = code;
  return error;
};

// Mongoose Validation Error
export const createValidationError = (
  path: string,
  value: unknown,
  message: string
): mongoose.Error.ValidationError => {
  const error = new mongoose.Error.ValidationError();
  error.errors[path] = new mongoose.Error.ValidatorError({
    path,
    value,
    message,
    type: 'user defined'
  });
  return error;
};

// Mongoose Duplicate Key Error
export const createDuplicateKeyError = (
  field: string,
  value: unknown
): mongoose.Error => {
  const error = createMongoError(11000, 'E11000 duplicate key error');
  (error as any).keyValue = { [field]: value };
  return error;
};

// Custom Application Errors
export const createAppError = (
  code: ErrorCodes,
  message: string,
  category: ErrorCategory,
  context?: Record<string, unknown>
): AppError => {
  return new AppError(message, code, category, undefined, context);
};

// Mock Express Validation Error
export const createExpressValidationError = (
  field: string,
  message: string,
  value?: unknown
) => ({
  errors: [{
    location: 'body',
    msg: message,
    param: field,
    value: value
  }]
});

// Common Test Errors
export const MOCK_ERRORS = {
  APP: {
    NOT_FOUND: new AppError(
      ErrorCodes.NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      'Resource not found'
    ),
    VALIDATION: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Validation error'
    ),
    UNAUTHORIZED: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Unauthorized'
    ),
    FORBIDDEN: new AppError(
      ErrorCodes.FORBIDDEN,
      ErrorCategory.AUTHORIZATION,
      'Forbidden'
    ),
    INTERNAL: new AppError(
      ErrorCodes.INTERNAL_ERROR,
      ErrorCategory.INTERNAL,
      'Internal server error'
    )
  },
  AUTH: {
    INVALID_CREDENTIALS: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Invalid email or password'
    ),
    ACCOUNT_LOCKED: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Account is locked',
      { unlockTime: new Date().toISOString() }
    ),
    INVALID_TOKEN: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Invalid or expired token'
    ),
    TOKEN_EXPIRED: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Token has expired'
    ),
    ACCOUNT_INACTIVE: new AppError(
      ErrorCodes.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
      'Account is inactive'
    )
  },
  VALIDATION: {
    REQUIRED_FIELD: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Required field missing',
      { field: 'name', constraint: 'required' }
    ),
    INVALID_EMAIL: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Invalid email format',
      { field: 'email', constraint: 'format' }
    ),
    INVALID_PASSWORD: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Invalid password',
      { field: 'password', constraint: 'format' }
    ),
    PASSWORD_LENGTH: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Password must be at least 8 characters',
      { field: 'password', constraint: 'minLength', min: 8 }
    ),
    DUPLICATE_EMAIL: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Email already exists',
      { field: 'email', constraint: 'unique' }
    )
  },
  MONGO: {
    CONNECTION: new AppError(
      ErrorCodes.DATABASE_ERROR,
      ErrorCategory.INFRASTRUCTURE,
      'Database connection error',
      { retryable: true }
    ),
    DUPLICATE_KEY: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Duplicate key error',
      { field: 'email', constraint: 'unique' }
    ),
    VALIDATION: new AppError(
      ErrorCodes.VALIDATION_ERROR,
      ErrorCategory.VALIDATION,
      'Document validation failed'
    )
  }
} as const; 