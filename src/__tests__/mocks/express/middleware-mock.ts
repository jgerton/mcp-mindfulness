import { Request, Response, NextFunction } from 'express';
import { BaseMock, MockOptions } from '../base-mock';

export interface MiddlewareMockOptions extends MockOptions {
  shouldSucceed?: boolean;
  errorMessage?: string;
  errorStatus?: number;
  modifyRequest?: (req: Request) => void;
  modifyResponse?: (res: Response) => void;
}

/**
 * Express Middleware Mock
 * 
 * A mock implementation of Express middleware for testing
 */
export class MiddlewareMock extends BaseMock {
  protected shouldSucceed: boolean;
  protected errorMessage: string;
  protected errorStatus: number;
  protected modifyRequest?: (req: Request) => void;
  protected modifyResponse?: (res: Response) => void;
  
  constructor(options: MiddlewareMockOptions = {}) {
    super(options);
    
    this.shouldSucceed = options.shouldSucceed !== undefined ? options.shouldSucceed : true;
    this.errorMessage = options.errorMessage || 'Middleware error';
    this.errorStatus = options.errorStatus || 401;
    this.modifyRequest = options.modifyRequest;
    this.modifyResponse = options.modifyResponse;
  }
  
  protected initializeDefaultBehaviors(): void {
    this.defaultBehaviors.set('execute', this.defaultExecute.bind(this));
  }
  
  /**
   * Execute the middleware
   */
  executeMiddleware(req: Request, res: Response, next: NextFunction): void {
    return this.execute('execute', req, res, next);
  }
  
  /**
   * Default middleware execution behavior
   */
  protected defaultExecute(req: Request, res: Response, next: NextFunction): void {
    // Apply request modifications if specified
    if (this.modifyRequest) {
      this.modifyRequest(req);
    }
    
    // Apply response modifications if specified
    if (this.modifyResponse) {
      this.modifyResponse(res);
    }
    
    if (this.shouldSucceed) {
      next();
    } else {
      res.status(this.errorStatus).json({ error: this.errorMessage });
    }
  }
  
  /**
   * Get the middleware function
   */
  getMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return this.executeMiddleware.bind(this);
  }
  
  /**
   * Configure the middleware to succeed
   */
  succeed(): this {
    this.shouldSucceed = true;
    return this;
  }
  
  /**
   * Configure the middleware to fail
   */
  fail(errorMessage?: string, errorStatus?: number): this {
    this.shouldSucceed = false;
    if (errorMessage) this.errorMessage = errorMessage;
    if (errorStatus) this.errorStatus = errorStatus;
    return this;
  }
  
  /**
   * Set a function to modify the request object
   */
  withRequestModifier(modifier: (req: Request) => void): this {
    this.modifyRequest = modifier;
    return this;
  }
  
  /**
   * Set a function to modify the response object
   */
  withResponseModifier(modifier: (res: Response) => void): this {
    this.modifyResponse = modifier;
    return this;
  }
}

/**
 * Authentication Middleware Mock
 * 
 * A specialized middleware mock for authentication
 */
export class AuthMiddlewareMock extends MiddlewareMock {
  protected user: any;
  
  constructor(options: MiddlewareMockOptions & { user?: any } = {}) {
    super(options);
    
    this.user = options.user || { _id: 'mock-user-id', email: 'mock@example.com' };
    
    // Set default request modifier to add user to request
    if (!this.modifyRequest) {
      this.modifyRequest = (req: Request) => {
        if (this.shouldSucceed) {
          (req as any).user = this.user;
        }
      };
    }
  }
  
  /**
   * Set the user for successful authentication
   */
  withUser(user: any): this {
    this.user = user;
    
    // Update the request modifier
    this.modifyRequest = (req: Request) => {
      if (this.shouldSucceed) {
        (req as any).user = this.user;
      }
    };
    
    return this;
  }
}

/**
 * Validation Middleware Mock
 * 
 * A specialized middleware mock for request validation
 */
export class ValidationMiddlewareMock extends MiddlewareMock {
  protected validationErrors: any[];
  
  constructor(options: MiddlewareMockOptions & { validationErrors?: any[] } = {}) {
    super({
      ...options,
      errorStatus: options.errorStatus || 400,
      errorMessage: options.errorMessage || 'Validation error'
    });
    
    this.validationErrors = options.validationErrors || [];
    
    // Set default behavior based on validation errors
    this.shouldSucceed = options.shouldSucceed !== undefined 
      ? options.shouldSucceed 
      : this.validationErrors.length === 0;
  }
  
  /**
   * Set validation errors
   */
  withValidationErrors(errors: any[]): this {
    this.validationErrors = errors;
    this.shouldSucceed = errors.length === 0;
    
    return this;
  }
  
  /**
   * Default middleware execution behavior for validation
   */
  protected defaultExecute(req: Request, res: Response, next: NextFunction): void {
    // Apply request modifications if specified
    if (this.modifyRequest) {
      this.modifyRequest(req);
    }
    
    // Apply response modifications if specified
    if (this.modifyResponse) {
      this.modifyResponse(res);
    }
    
    if (this.shouldSucceed) {
      next();
    } else {
      res.status(this.errorStatus).json({ 
        error: this.errorMessage,
        validationErrors: this.validationErrors
      });
    }
  }
}

/**
 * Factory for creating middleware mocks
 */
export class MiddlewareFactory {
  /**
   * Create a generic middleware mock
   */
  static createMiddleware(options: MiddlewareMockOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
    return new MiddlewareMock(options).getMiddleware();
  }
  
  /**
   * Create an authentication middleware mock
   */
  static createAuthMiddleware(options: MiddlewareMockOptions & { user?: any } = {}): (req: Request, res: Response, next: NextFunction) => void {
    return new AuthMiddlewareMock(options).getMiddleware();
  }
  
  /**
   * Create a validation middleware mock
   */
  static createValidationMiddleware(options: MiddlewareMockOptions & { validationErrors?: any[] } = {}): (req: Request, res: Response, next: NextFunction) => void {
    return new ValidationMiddlewareMock(options).getMiddleware();
  }
  
  /**
   * Create a middleware that always succeeds
   */
  static createPassthrough(): (req: Request, res: Response, next: NextFunction) => void {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  
  /**
   * Create a middleware that always fails
   */
  static createBlocker(errorMessage: string = 'Access denied', errorStatus: number = 403): (req: Request, res: Response, next: NextFunction) => void {
    return (_req: Request, res: Response, _next: NextFunction) => {
      res.status(errorStatus).json({ error: errorMessage });
    };
  }
} 