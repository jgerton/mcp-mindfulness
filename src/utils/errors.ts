import { Response } from 'express';
import { ErrorCodes, ErrorCategory } from './error-codes';

export { ErrorCodes, ErrorCategory };

export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface ErrorContext {
  [key: string]: any;
}

export interface ErrorRecovery {
  userMessage: string;
  suggestedAction?: string;
  retryable: boolean;
  documentationLink?: string;
}

export class BaseError extends Error {
  public severity: ErrorSeverity;
  public context?: ErrorContext;
  public recovery?: ErrorRecovery;
  public httpStatus: number;

  constructor(
    public name: string,
    public code: ErrorCodes,
    public message: string,
    public category: ErrorCategory = ErrorCategory.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: ErrorContext,
    recovery?: ErrorRecovery
  ) {
    super(message);
    this.severity = severity;
    this.context = context;
    this.recovery = recovery;
    this.httpStatus = this.getStatusCodeFromCategory(category);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  private getStatusCodeFromCategory(category: ErrorCategory): number {
    switch (category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.BAD_REQUEST:
        return 400;
      case ErrorCategory.AUTHENTICATION:
        return 401;
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.FORBIDDEN:
        return 403;
      case ErrorCategory.NOT_FOUND:
        return 404;
      case ErrorCategory.CONFLICT:
        return 409;
      case ErrorCategory.INTERNAL:
      case ErrorCategory.TECHNICAL:
      default:
        return 500;
    }
  }
}

// Alias for compatibility
export class AppError extends BaseError {}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super('ValidationError', ErrorCodes.VALIDATION_ERROR, message, ErrorCategory.VALIDATION);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super('NotFoundError', ErrorCodes.NOT_FOUND, message, ErrorCategory.NOT_FOUND);
  }
}

export class DuplicateError extends BaseError {
  constructor(message: string) {
    super('DuplicateError', ErrorCodes.DUPLICATE_ERROR, message, ErrorCategory.CONFLICT);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string) {
    super('AuthenticationError', ErrorCodes.AUTHENTICATION_ERROR, message, ErrorCategory.AUTHENTICATION);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string) {
    super('AuthorizationError', ErrorCodes.AUTHORIZATION_ERROR, message, ErrorCategory.AUTHORIZATION);
  }
}

export class InternalError extends BaseError {
  constructor(message: string) {
    super('InternalError', ErrorCodes.INTERNAL_ERROR, message, ErrorCategory.INTERNAL);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super('BadRequestError', ErrorCodes.BAD_REQUEST, message, ErrorCategory.BAD_REQUEST);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super('ConflictError', ErrorCodes.CONFLICT, message, ErrorCategory.CONFLICT);
  }
}

// Concurrency Errors
export class ConcurrencyError extends BaseError {
  constructor(message: string) {
    super('ConcurrencyError', ErrorCodes.CONCURRENCY_ERROR, message, ErrorCategory.CONFLICT);
  }
}

// Integration Errors (for external service issues)
export class IntegrationError extends BaseError {
  constructor(message: string) {
    super('IntegrationError', ErrorCodes.EXTERNAL_SERVICE_ERROR, message, ErrorCategory.INTERNAL);
  }
}

export function handleError(error: unknown, res: Response): void {
  console.error('Error:', error);

  if (error instanceof BaseError) {
    const statusCode = getStatusCodeFromCategory(error.category);
    res.status(statusCode).json({
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        category: error.category
      }
    });
  } else {
    const internalError = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({
      error: {
        name: 'InternalError',
        code: ErrorCodes.INTERNAL_ERROR,
        message: internalError.message || 'An unexpected error occurred',
        category: ErrorCategory.INTERNAL
      }
    });
  }
}

function getStatusCodeFromCategory(category: ErrorCategory): number {
  switch (category) {
    case ErrorCategory.VALIDATION:
    case ErrorCategory.BAD_REQUEST:
      return 400;
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.NOT_FOUND:
      return 404;
    case ErrorCategory.CONFLICT:
      return 409;
    case ErrorCategory.INTERNAL:
    default:
      return 500;
  }
} 