import { ErrorCodes, ErrorCategory } from '../utils/error-codes';

export interface HttpErrorDetails {
  code: ErrorCodes;
  category: ErrorCategory;
  details?: Record<string, any>;
}

export class HttpError extends Error {
  statusCode: number;
  code: ErrorCodes;
  category: ErrorCategory;
  details?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    errorDetails?: HttpErrorDetails
  ) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = errorDetails?.code || ErrorCodes.INTERNAL_ERROR;
    this.category = errorDetails?.category || ErrorCategory.INTERNAL;
    this.details = errorDetails?.details;
  }

  static notFound(message: string = 'Resource not found'): HttpError {
    return new HttpError(404, message);
  }

  static badRequest(message: string, details?: any): HttpError {
    return new HttpError(400, message, { code: ErrorCodes.BAD_REQUEST, category: ErrorCategory.BAD_REQUEST, details });
  }

  static unauthorized(message: string = 'Unauthorized'): HttpError {
    return new HttpError(401, message, { code: ErrorCodes.UNAUTHORIZED, category: ErrorCategory.UNAUTHORIZED });
  }

  static forbidden(message: string = 'Forbidden'): HttpError {
    return new HttpError(403, message, { code: ErrorCodes.FORBIDDEN, category: ErrorCategory.FORBIDDEN });
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, message, { code: ErrorCodes.CONFLICT, category: ErrorCategory.CONFLICT });
  }

  static internal(message: string = 'Internal server error'): HttpError {
    return new HttpError(500, message, { code: ErrorCodes.INTERNAL_ERROR, category: ErrorCategory.INTERNAL });
  }
} 