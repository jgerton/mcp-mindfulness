import mongoose from 'mongoose';
import { AppError, ErrorCodes, ErrorCategory } from '../../utils/errors';

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
  return new AppError(code, message, category, context);
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
  MONGO: {
    CONNECTION: createMongoError(
      -1,
      'MongoNetworkError: connection timed out'
    ),
    DUPLICATE_EMAIL: createDuplicateKeyError(
      'email',
      'test@example.com'
    ),
    INVALID_ID: createMongoError(
      -2,
      'BSONTypeError: Invalid ObjectId'
    )
  },
  VALIDATION: {
    REQUIRED_FIELD: createValidationError(
      'name',
      undefined,
      'Path `name` is required'
    ),
    INVALID_EMAIL: createValidationError(
      'email',
      'invalid-email',
      'Invalid email format'
    ),
    EXPRESS: createExpressValidationError(
      'password',
      'Password must be at least 8 characters'
    )
  },
  APP: {
    UNAUTHORIZED: createAppError(
      ErrorCodes.UNAUTHORIZED,
      'User not authenticated',
      ErrorCategory.AUTHENTICATION
    ),
    NOT_FOUND: createAppError(
      ErrorCodes.NOT_FOUND,
      'Resource not found',
      ErrorCategory.NOT_FOUND,
      { resourceType: 'user', id: '123' }
    ),
    BUSINESS_RULE: createAppError(
      ErrorCodes.BUSINESS_RULE_VIOLATION,
      'Invalid state transition',
      ErrorCategory.BUSINESS_RULE,
      { currentState: 'DRAFT', targetState: 'COMPLETED' }
    )
  }
} as const; 