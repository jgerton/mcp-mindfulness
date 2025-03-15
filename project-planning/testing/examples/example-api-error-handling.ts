import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../../src/utils/logger';

/**
 * Example API error handling middleware
 * 
 * This file demonstrates best practices for API error handling:
 * 1. Centralized error handling middleware
 * 2. Proper error classification
 * 3. Consistent error response format
 * 4. Appropriate HTTP status codes
 * 5. Error logging
 */

// Custom error class for API errors
export class APIError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler - converts Mongoose validation errors to API errors
export const handleValidationError = (err: mongoose.Error.ValidationError): APIError => {
  const message = Object.values(err.errors)
    .map(error => error.message)
    .join(', ');
  
  return new APIError(`Validation Error: ${message}`, 400);
};

// Cast error handler - converts Mongoose cast errors (e.g., invalid ObjectId) to API errors
export const handleCastError = (err: mongoose.Error.CastError): APIError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

// Duplicate key error handler - converts MongoDB duplicate key errors to API errors
export const handleDuplicateKeyError = (err: any): APIError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value: ${value} for field ${field}. Please use another value.`;
  
  return new APIError(message, 409); // 409 Conflict
};

// JWT error handler - converts JWT errors to API errors
export const handleJWTError = (): APIError => {
  return new APIError('Invalid token. Please log in again.', 401);
};

// JWT expired error handler
export const handleJWTExpiredError = (): APIError => {
  return new APIError('Your token has expired. Please log in again.', 401);
};

// Global error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 server error
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';
  
  // Log error
  logger.error({
    error: err,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user._id : 'unauthenticated'
  });
  
  // Handle specific error types
  let error = { ...err };
  error.message = err.message;
  
  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  }
  
  // Mongoose cast error (e.g., invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  
  // Development vs. Production error responses
  if (process.env.NODE_ENV === 'development') {
    // In development, send detailed error information
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      error: error,
      stack: err.stack
    });
  } else {
    // In production, don't leak error details for non-operational errors
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    } else {
      // For programming or unknown errors, don't leak error details
      logger.error('Non-operational error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};

// Async error handler wrapper to avoid try/catch blocks in route handlers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Example usage in a route handler
export const exampleRouteHandler = catchAsync(async (req: Request, res: Response) => {
  // This will automatically catch any errors and pass them to the error handler
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError('Invalid ID format', 400);
  }
  
  // Example of throwing a custom error
  const item = await SomeModel.findById(id);
  if (!item) {
    throw new APIError('Resource not found', 404);
  }
  
  // Example of successful response
  res.status(200).json({
    status: 'success',
    data: item
  });
}); 