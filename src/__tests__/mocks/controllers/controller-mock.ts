import { Request, Response } from 'express';
import { BaseMock, MockOptions } from '../base-mock';

export interface ControllerMethodMockOptions {
  shouldSucceed?: boolean;
  successStatus?: number;
  successData?: any;
  errorStatus?: number;
  errorMessage?: string;
  delay?: number;
  throwError?: boolean;
}

export interface ControllerMockOptions extends MockOptions {
  methods?: Record<string, ControllerMethodMockOptions>;
}

/**
 * Controller Mock Base Class
 * 
 * A base class for creating controller mocks with configurable method behaviors
 */
export abstract class ControllerMock extends BaseMock {
  protected methodOptions: Record<string, ControllerMethodMockOptions>;
  
  constructor(options: ControllerMockOptions = {}) {
    super(options);
    
    this.methodOptions = options.methods || {};
  }
  
  /**
   * Configure a method's behavior
   */
  configureMethod(
    methodName: string, 
    options: ControllerMethodMockOptions
  ): this {
    this.methodOptions[methodName] = {
      ...this.methodOptions[methodName],
      ...options
    };
    return this;
  }
  
  /**
   * Set a method to succeed
   */
  setMethodToSucceed(
    methodName: string, 
    data?: any, 
    status: number = 200
  ): this {
    return this.configureMethod(methodName, {
      shouldSucceed: true,
      successData: data,
      successStatus: status
    });
  }
  
  /**
   * Set a method to fail
   */
  setMethodToFail(
    methodName: string, 
    message: string = 'Error', 
    status: number = 500
  ): this {
    return this.configureMethod(methodName, {
      shouldSucceed: false,
      errorMessage: message,
      errorStatus: status
    });
  }
  
  /**
   * Set a method to throw an error
   */
  setMethodToThrow(
    methodName: string, 
    message: string = 'Unexpected error'
  ): this {
    return this.configureMethod(methodName, {
      throwError: true,
      errorMessage: message
    });
  }
  
  /**
   * Execute a controller method with standard behavior
   */
  protected executeControllerMethod(
    methodName: string,
    req: Request,
    res: Response,
    defaultSuccessData: any = { message: 'Success' },
    defaultSuccessStatus: number = 200
  ): void {
    const options = this.methodOptions[methodName] || {};
    
    const {
      shouldSucceed = true,
      successStatus = defaultSuccessStatus,
      successData = defaultSuccessData,
      errorStatus = 500,
      errorMessage = 'Internal server error',
      delay = 0,
      throwError = false
    } = options;
    
    const execute = () => {
      try {
        if (throwError) {
          throw new Error(errorMessage);
        }
        
        if (shouldSucceed) {
          res.status(successStatus).json(successData);
        } else {
          res.status(errorStatus).json({ error: errorMessage });
        }
      } catch (error) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };
    
    if (delay > 0) {
      setTimeout(execute, delay);
    } else {
      execute();
    }
  }
}

/**
 * Factory for creating controller mocks
 */
export class ControllerMockFactory {
  /**
   * Create a controller mock with the given methods
   */
  static createControllerMock(
    methodNames: string[],
    options: ControllerMockOptions = {}
  ): Record<string, (req: Request, res: Response) => void> {
    const controllerMock = new GenericControllerMock(methodNames, options);
    
    // Create a controller object with all the specified methods
    const controller: Record<string, (req: Request, res: Response) => void> = {};
    
    methodNames.forEach(methodName => {
      controller[methodName] = (req: Request, res: Response) => {
        controllerMock.executeMethod(methodName, req, res);
      };
    });
    
    // Add the mock instance for configuration
    (controller as any)._mock = controllerMock;
    
    return controller;
  }
}

/**
 * Generic Controller Mock implementation
 */
class GenericControllerMock extends ControllerMock {
  private methodNames: string[];
  
  constructor(methodNames: string[], options: ControllerMockOptions = {}) {
    super(options);
    this.methodNames = methodNames;
  }
  
  protected initializeDefaultBehaviors(): void {
    // No default behaviors needed for generic controller
  }
  
  /**
   * Execute a method with the given name
   */
  executeMethod(methodName: string, req: Request, res: Response): void {
    if (!this.methodNames.includes(methodName)) {
      throw new Error(`Method ${methodName} is not defined in this controller mock`);
    }
    
    this.executeControllerMethod(methodName, req, res);
  }
} 