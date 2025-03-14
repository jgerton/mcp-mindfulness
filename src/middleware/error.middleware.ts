import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorSeverity, ErrorCategory } from '../utils/errors';
import { ZodError } from 'zod';
import { ErrorCodes } from '../utils/error-codes';

interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  userMessage?: string;
  suggestedAction?: string;
  errors?: Array<{ field: string; message: string }>;
  requestId?: string;
  timestamp: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const requestId = req.headers['x-request-id'] as string;

  // Base error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    code: ErrorCodes.INTERNAL_ERROR,
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId
  };

  // Log error (we'll enhance this when we add the logging system)
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    requestId,
    context: err instanceof AppError ? err.context : undefined,
    category: err instanceof AppError ? err.category : ErrorCategory.TECHNICAL,
    severity: err instanceof AppError ? err.severity : ErrorSeverity.ERROR
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    if (err.recovery) {
      errorResponse.userMessage = err.recovery.userMessage;
      errorResponse.suggestedAction = err.recovery.suggestedAction;
    }
    
    // Include additional context in development
    if (isDevelopment) {
      Object.assign(errorResponse, {
        category: err.category,
        severity: err.severity,
        context: err.context
      });
    }

    return res.status(err.httpStatus).json(errorResponse);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    errorResponse.code = ErrorCodes.VALIDATION_ERROR;
    errorResponse.message = 'Validation error';
    errorResponse.userMessage = 'Please check your input and try again.';
    errorResponse.errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json(errorResponse);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    errorResponse.code = ErrorCodes.VALIDATION_ERROR;
    errorResponse.message = 'Data validation error';
    errorResponse.userMessage = 'Please check your input and try again.';

    return res.status(400).json(errorResponse);
  }

  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    errorResponse.code = ErrorCodes.ALREADY_EXISTS;
    errorResponse.message = 'Duplicate entry error';
    errorResponse.userMessage = 'This record already exists.';

    return res.status(409).json(errorResponse);
  }

  // Include stack trace in development
  if (isDevelopment) {
    Object.assign(errorResponse, {
      stack: err.stack,
      category: ErrorCategory.TECHNICAL,
      severity: ErrorSeverity.ERROR
    });
  }

  // Return generic error for unhandled cases
  return res.status(500).json(errorResponse);
}; 