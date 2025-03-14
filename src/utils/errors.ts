import { ErrorCodes } from './error-codes';

export enum ErrorCategory {
  VALIDATION = 'validation',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  SECURITY = 'security',
  INTEGRATION = 'integration'
}

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  [key: string]: unknown;
  timestamp?: Date;
  requestId?: string;
  userId?: string;
}

export interface ErrorRecovery {
  userMessage: string;
  suggestedAction?: string;
  retryable: boolean;
  documentationLink?: string;
}

export class AppError extends Error {
  public timestamp: Date;

  constructor(
    message: string,
    public code: ErrorCodes,
    public category: ErrorCategory,
    public severity: ErrorSeverity = ErrorSeverity.ERROR,
    public context: ErrorContext = {},
    public recovery?: ErrorRecovery,
    public httpStatus: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: this.context,
      recovery: this.recovery,
      timestamp: this.timestamp
    };
  }
}

// Authentication Errors
export class AuthenticationError extends AppError {
  constructor(
    message: string,
    code: ErrorCodes = ErrorCodes.AUTHENTICATION_ERROR,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorCategory.SECURITY, ErrorSeverity.ERROR, context, {
      userMessage: 'Please sign in again to continue.',
      retryable: true
    }, 401);
  }
}

// Validation Errors
export class ValidationError extends AppError {
  constructor(
    message: string,
    context: ErrorContext = {}
  ) {
    super(message, ErrorCodes.VALIDATION_ERROR, ErrorCategory.VALIDATION, ErrorSeverity.WARNING, context, {
      userMessage: 'Please check your input and try again.',
      retryable: true
    }, 400);
  }
}

// Resource Not Found Errors
export class NotFoundError extends AppError {
  constructor(
    message: string,
    context: ErrorContext = {}
  ) {
    super(message, ErrorCodes.NOT_FOUND, ErrorCategory.BUSINESS, ErrorSeverity.WARNING, context, {
      userMessage: 'The requested resource could not be found.',
      retryable: false
    }, 404);
  }
}

// Session Errors
export class SessionError extends AppError {
  constructor(
    message: string,
    code: ErrorCodes,
    context: ErrorContext = {}
  ) {
    super(message, code, ErrorCategory.BUSINESS, ErrorSeverity.WARNING, context, {
      userMessage: 'There was an issue with your meditation session.',
      retryable: true
    }, 400);
  }
}

// Concurrency Errors
export class ConcurrencyError extends AppError {
  constructor(
    message: string,
    context: ErrorContext = {}
  ) {
    super(message, ErrorCodes.CONCURRENCY_ERROR, ErrorCategory.TECHNICAL, ErrorSeverity.ERROR, context, {
      userMessage: 'The operation could not be completed due to a conflict.',
      retryable: true
    }, 409);
  }
}

// Integration Errors (for external service issues)
export class IntegrationError extends AppError {
  constructor(
    message: string,
    service: string,
    context: ErrorContext = {}
  ) {
    super(
      message,
      ErrorCodes.EXTERNAL_SERVICE_ERROR,
      ErrorCategory.INTEGRATION,
      ErrorSeverity.ERROR,
      { ...context, service },
      {
        userMessage: 'We are experiencing technical difficulties.',
        retryable: true,
        suggestedAction: 'Please try again in a few minutes.'
      },
      503
    );
  }
} 