"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockServiceOperation = exports.verifyResourceCleanup = exports.createMockMongooseSession = exports.verifyTransactionRollback = exports.createOperationContext = exports.mockDatabaseError = exports.expectServiceError = void 0;
const errors_1 = require("../../utils/errors");
const service_errors_1 = require("../fixtures/service-errors");
/**
 * Verify that a service error has the expected structure and content
 */
const expectServiceError = (error, expectedCode, expectedCategory, context) => {
    expect(error).toBeInstanceOf(errors_1.AppError);
    expect(error.code).toBe(expectedCode);
    expect(error.category).toBe(expectedCategory);
    expect(error.context).toMatchObject(Object.assign(Object.assign({}, context), { timestamp: expect.any(Date) }));
};
exports.expectServiceError = expectServiceError;
/**
 * Create a mock database error with operation context
 */
const mockDatabaseError = (operation, errorType, additionalContext) => {
    const dbError = service_errors_1.DATABASE_ERROR_TYPES[errorType];
    const error = new Error(dbError.message);
    error.code = dbError.code;
    error.operation = operation;
    if (additionalContext) {
        error.context = additionalContext;
    }
    return error;
};
exports.mockDatabaseError = mockDatabaseError;
/**
 * Create an operation context object for testing
 */
const createOperationContext = (operation, entityType, state) => ({
    operation,
    entityType,
    state,
    startTime: new Date(),
    lastUpdated: new Date()
});
exports.createOperationContext = createOperationContext;
/**
 * Verify that a transaction rollback occurs when an operation fails
 */
const verifyTransactionRollback = (mockSession, operation) => __awaiter(void 0, void 0, void 0, function* () {
    yield expect(operation()).rejects.toThrow();
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
});
exports.verifyTransactionRollback = verifyTransactionRollback;
/**
 * Create a mock mongoose session for transaction testing
 */
const createMockMongooseSession = () => ({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
    id: jest.fn(),
    equals: jest.fn(),
    serverSession: null,
    supports: jest.fn(),
    inTransaction: jest.fn(),
    transaction: jest.fn()
});
exports.createMockMongooseSession = createMockMongooseSession;
/**
 * Verify that a cleanup function is called when an operation fails
 */
const verifyResourceCleanup = (cleanup, operation) => __awaiter(void 0, void 0, void 0, function* () {
    yield expect(operation()).rejects.toThrow();
    expect(cleanup).toHaveBeenCalled();
});
exports.verifyResourceCleanup = verifyResourceCleanup;
/**
 * Mock a service operation that can succeed or fail
 */
const mockServiceOperation = (shouldSucceed, result, error) => {
    const mock = jest.fn();
    if (shouldSucceed) {
        mock.mockResolvedValue(result);
    }
    else {
        mock.mockRejectedValue(error || new Error('Operation failed'));
    }
    return mock;
};
exports.mockServiceOperation = mockServiceOperation;
