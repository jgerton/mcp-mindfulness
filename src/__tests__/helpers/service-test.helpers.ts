import { AppError, ErrorCodes, ErrorCategory } from '../../utils/errors';
import { DATABASE_OPERATIONS, DATABASE_ERROR_TYPES } from '../fixtures/service-errors';
import { ClientSession } from 'mongoose';

/**
 * Verify that a service error has the expected structure and content
 */
export const expectServiceError = (
  error: AppError,
  expectedCode: ErrorCodes,
  expectedCategory: ErrorCategory,
  context: Record<string, unknown>
) => {
  expect(error).toBeInstanceOf(AppError);
  expect(error.code).toBe(expectedCode);
  expect(error.category).toBe(expectedCategory);
  expect(error.context).toMatchObject({
    ...context,
    timestamp: expect.any(Date)
  });
};

/**
 * Create a mock database error with operation context
 */
export const mockDatabaseError = (
  operation: keyof typeof DATABASE_OPERATIONS,
  errorType: keyof typeof DATABASE_ERROR_TYPES,
  additionalContext?: Record<string, unknown>
) => {
  const dbError = DATABASE_ERROR_TYPES[errorType];
  const error = new Error(dbError.message);
  (error as any).code = dbError.code;
  (error as any).operation = operation;
  if (additionalContext) {
    (error as any).context = additionalContext;
  }
  return error;
};

/**
 * Create an operation context object for testing
 */
export const createOperationContext = (
  operation: keyof typeof DATABASE_OPERATIONS,
  entityType: string,
  state: string
) => ({
  operation,
  entityType,
  state,
  startTime: new Date(),
  lastUpdated: new Date()
});

/**
 * Verify that a transaction rollback occurs when an operation fails
 */
export const verifyTransactionRollback = async (
  mockSession: jest.Mocked<ClientSession>,
  operation: () => Promise<unknown>
) => {
  await expect(operation()).rejects.toThrow();
  expect(mockSession.abortTransaction).toHaveBeenCalled();
  expect(mockSession.endSession).toHaveBeenCalled();
};

/**
 * Create a mock mongoose session for transaction testing
 */
export const createMockMongooseSession = (): jest.Mocked<ClientSession> => ({
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
  id: jest.fn(),
  equals: jest.fn(),
  serverSession: null as any,
  supports: jest.fn(),
  inTransaction: jest.fn(),
  transaction: jest.fn()
});

/**
 * Verify that a cleanup function is called when an operation fails
 */
export const verifyResourceCleanup = async (
  cleanup: jest.Mock,
  operation: () => Promise<unknown>
) => {
  await expect(operation()).rejects.toThrow();
  expect(cleanup).toHaveBeenCalled();
};

/**
 * Mock a service operation that can succeed or fail
 */
export const mockServiceOperation = (
  shouldSucceed: boolean,
  result?: unknown,
  error?: Error
): jest.Mock => {
  const mock = jest.fn();
  if (shouldSucceed) {
    mock.mockResolvedValue(result);
  } else {
    mock.mockRejectedValue(error || new Error('Operation failed'));
  }
  return mock;
}; 