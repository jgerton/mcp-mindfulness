import { Response } from 'express';
import { AppError, ErrorCategory } from '../../utils/errors';
import { ErrorCodes } from '../../utils/error-codes';

/**
 * Error compatibility helpers
 * 
 * This file provides utility functions to help transition tests from the old error
 * format to the new structured error response format. It allows tests to work with
 * both formats during the migration period.
 */

// Type definition for legacy error format
interface LegacyErrorResponse {
  error: string;
}

// Type definition for new structured error format
interface StructuredErrorResponse {
  error: {
    code: string;
    message: string;
    category: string;
    timestamp: string;
    details?: unknown;
    userMessage?: string;
  };
}

/**
 * Verifies error response in either legacy or new structured format
 */
export const verifyErrorResponse = (
  response: Response, 
  expectedStatus: number,
  expectedErrorMessageOrCode: string | ErrorCodes,
  options: {
    expectedCategory?: ErrorCategory;
    checkExactMessage?: boolean;
    strictMode?: boolean;
  } = {}
): void => {
  const { expectedCategory, checkExactMessage = false, strictMode = false } = options;
  
  // Verify status code
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  
  // Get the response body from the JSON mock
  const responseBody = (response.json as jest.Mock).mock.calls[0][0];
  
  // Handle both error formats
  if (responseBody && typeof responseBody.error === 'string') {
    // Legacy format: { error: 'message' }
    if (checkExactMessage) {
      expect(responseBody.error).toBe(expectedErrorMessageOrCode);
    } else {
      expect(responseBody.error).toContain(expectedErrorMessageOrCode);
    }
  } else if (responseBody && typeof responseBody.error === 'object') {
    // New structure: { error: { code, message, category, ... } }
    if (typeof expectedErrorMessageOrCode === 'string') {
      // If we provided a message string, check against message
      if (checkExactMessage) {
        expect(responseBody.error.message).toBe(expectedErrorMessageOrCode);
      } else {
        expect(responseBody.error.message).toContain(expectedErrorMessageOrCode);
      }
    } else {
      // If we provided an error code, check against code
      expect(responseBody.error.code).toBe(expectedErrorMessageOrCode);
    }
    
    // Verify category if provided
    if (expectedCategory && strictMode) {
      expect(responseBody.error.category).toBe(expectedCategory);
    }
    
    // Verify timestamp exists
    expect(responseBody.error.timestamp).toBeDefined();
  } else if (strictMode) {
    // If strict mode is enabled and the response doesn't match either format, fail the test
    fail(`Response doesn't match either error format: ${JSON.stringify(responseBody)}`);
  }
};

/**
 * Creates an error response in the format expected by tests
 * Supports both legacy and new structured formats
 */
export const createTestErrorResponse = (
  message: string,
  code: ErrorCodes = ErrorCodes.INTERNAL_ERROR,
  category: ErrorCategory = ErrorCategory.TECHNICAL,
  useStructuredFormat = true
): LegacyErrorResponse | StructuredErrorResponse => {
  if (useStructuredFormat) {
    return {
      error: {
        code,
        message,
        category,
        timestamp: expect.any(String)
      }
    };
  } else {
    return {
      error: message
    };
  }
};

/**
 * Maps HTTP status codes to error categories
 */
export const mapStatusToCategory = (status: number): ErrorCategory => {
  if (status >= 400 && status < 500) {
    if (status === 401 || status === 403) {
      return ErrorCategory.SECURITY;
    }
    return ErrorCategory.VALIDATION;
  }
  return ErrorCategory.TECHNICAL;
};

/**
 * Adapts legacy controller error handling to the new AppError structure
 * Use this to wrap error handling blocks during migration
 */
export const adaptLegacyErrorHandling = (
  error: unknown, 
  res: Response, 
  defaultMessage = 'Operation failed',
  defaultStatus = 500,
  defaultCode = ErrorCodes.INTERNAL_ERROR
): void => {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    // Already using new error format
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        category: error.category,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    // Legacy error handling - simple format
    res.status(defaultStatus).json({ 
      error: error instanceof Error ? error.message : defaultMessage 
    });
  }
};

/**
 * Converts legacy error response to structured format
 */
export const convertToStructuredError = (
  legacyError: { error: string },
  status = 500
): StructuredErrorResponse => {
  return {
    error: {
      code: status >= 500 ? ErrorCodes.INTERNAL_ERROR : ErrorCodes.VALIDATION_ERROR,
      message: legacyError.error,
      category: mapStatusToCategory(status),
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Mocks the response with a compatible error format
 * Automatically detects which format to use based on the test expectations
 */
export const mockErrorResponse = (
  res: Response,
  status: number,
  messageOrStructuredError: string | Partial<StructuredErrorResponse>
): void => {
  res.status(status);
  
  if (typeof messageOrStructuredError === 'string') {
    // Legacy format
    res.json({ error: messageOrStructuredError });
  } else {
    // New structured format
    res.json(messageOrStructuredError);
  }
}; 