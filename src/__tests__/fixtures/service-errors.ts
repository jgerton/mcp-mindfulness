import { Types } from 'mongoose';
import { AppError, ErrorCategory, ErrorSeverity } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';
import { ERROR_MESSAGES } from './error-responses';

// Database Operations
export const DATABASE_OPERATIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  FIND: 'FIND',
  AGGREGATE: 'AGGREGATE'
} as const;

// Operation States
export const OPERATION_STATES = {
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  FAILED: 'failed',
  COMPLETED: 'completed'
} as const;

// Test Entity IDs
export const TEST_IDS = {
  USER: new Types.ObjectId(),
  SESSION: new Types.ObjectId(),
  MEDITATION: new Types.ObjectId(),
  EXPORT: new Types.ObjectId()
} as const;

// Database Error Types
export const DATABASE_ERROR_TYPES = {
  CONNECTION: 'CONNECTION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  DUPLICATE: 'DUPLICATE_ERROR',
  VALIDATION: 'VALIDATION_ERROR'
} as const;

// Service contexts for error mocks
export const SERVICE_CONTEXTS = {
  MEDITATION: {
    entity: 'meditation',
    entityId: TEST_IDS.MEDITATION.toString(),
    fields: ['duration', 'type', 'completed']
  },
  USER: {
    entity: 'user',
    entityId: TEST_IDS.USER.toString(),
    fields: ['email', 'name', 'role']
  },
  SESSION: {
    entity: 'session',
    entityId: TEST_IDS.SESSION.toString(),
    fields: ['startTime', 'endTime', 'duration']
  }
} as const;

// Helper to create service errors
export const createServiceError = (
  operation: keyof typeof DATABASE_OPERATIONS | string,
  message: string,
  code: ErrorCodes,
  category: ErrorCategory,
  context: Record<string, unknown>,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): AppError => {
  return new AppError(
    message,
    code,
    category,
    severity,
    {
      operation,
      timestamp: new Date(),
      ...context
    }
  );
};

// Database error mocks
export const DB_ERROR_MOCKS = {
  CONNECTION_ERROR: createServiceError(
    'FIND',
    'Database connection failed',
    ErrorCodes.DATABASE_ERROR,
    ErrorCategory.TECHNICAL,
    SERVICE_CONTEXTS.MEDITATION
  ),
  
  TIMEOUT_ERROR: createServiceError(
    'CREATE',
    'Database operation timeout',
    ErrorCodes.SERVICE_UNAVAILABLE,
    ErrorCategory.TECHNICAL,
    SERVICE_CONTEXTS.USER
  ),
  
  DUPLICATE_ERROR: createServiceError(
    'UPDATE',
    ERROR_MESSAGES.CONCURRENCY,
    ErrorCodes.DUPLICATE_ERROR,
    ErrorCategory.VALIDATION,
    SERVICE_CONTEXTS.SESSION
  ),
  
  VALIDATION_ERROR: createServiceError(
    'CREATE',
    ERROR_MESSAGES.VALIDATION,
    ErrorCodes.VALIDATION_ERROR,
    ErrorCategory.VALIDATION,
    SERVICE_CONTEXTS.MEDITATION
  )
} as const; 