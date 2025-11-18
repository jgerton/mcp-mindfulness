import { Request, Response } from 'express';
import { RequestResponseFactory } from '../express/request-response-mock';
import { MiddlewareFactory } from '../express/middleware-mock';
import { ModelMock } from '../database/model-mock';

/**
 * Test Context
 * 
 * A container for test-related objects and utilities
 */
export class TestContext {
  private mocks: Map<string, any> = new Map();
  private req: Request;
  private res: Response;
  
  constructor() {
    const { req, res } = RequestResponseFactory.create();
    this.req = req;
    this.res = res;
  }
  
  /**
   * Get the request object
   */
  getRequest(): Request {
    return this.req;
  }
  
  /**
   * Get the response object
   */
  getResponse(): Response {
    return this.res;
  }
  
  /**
   * Register a mock with the context
   */
  registerMock(name: string, mock: any): this {
    this.mocks.set(name, mock);
    return this;
  }
  
  /**
   * Get a registered mock
   */
  getMock<T>(name: string): T {
    const mock = this.mocks.get(name);
    if (!mock) {
      throw new Error(`Mock '${name}' not found in test context`);
    }
    return mock as T;
  }
  
  /**
   * Reset all mocks
   */
  resetMocks(): this {
    this.mocks.forEach(mock => {
      if (typeof mock.reset === 'function') {
        mock.reset();
      }
    });
    return this;
  }
  
  /**
   * Create a new request object
   */
  createRequest(options: any = {}): Request {
    this.req = RequestResponseFactory.createRequest(options);
    return this.req;
  }
  
  /**
   * Create a new response object
   */
  createResponse(options: any = {}): Response {
    this.res = RequestResponseFactory.createResponse(options);
    return this.res;
  }
}

/**
 * Create a test context with common mocks
 */
export function createTestContext(): TestContext {
  return new TestContext();
}

/**
 * Create a test context with authentication
 */
export function createAuthenticatedContext(user: any = { _id: 'test-user-id' }): TestContext {
  const context = new TestContext();
  const req = context.getRequest();
  (req as any).user = user;
  return context;
}

/**
 * Run middleware and return a promise
 */
export function runMiddleware(
  middleware: (req: Request, res: Response, next: Function) => void,
  req: Request,
  res: Response
): Promise<void> {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Create a mock model factory
 */
export function createMockModelFactory<T = any>(
  modelName: string,
  initialData: any[] = []
): { 
  model: any; 
  mock: ModelMock;
  getData: () => any[];
  addData: (data: any | any[]) => void;
  clearData: () => void;
} {
  const mockModel = ModelMock.createModelMock({
    name: modelName,
    mockData: initialData,
    autoIncrement: true
  });
  
  return {
    model: mockModel,
    mock: mockModel._mock,
    getData: () => mockModel._mock.getMockData(),
    addData: (data) => mockModel._mock.addMockData(data),
    clearData: () => mockModel._mock.clearMockData()
  };
}

/**
 * Create a test suite with common setup and teardown
 */
export function createTestSuite(
  name: string,
  tests: (context: TestContext) => void,
  beforeEachFn?: (context: TestContext) => void | Promise<void>,
  afterEachFn?: (context: TestContext) => void | Promise<void>
): void {
  describe(name, () => {
    let context: TestContext;
    
    beforeEach(async () => {
      context = new TestContext();
      if (beforeEachFn) {
        await beforeEachFn(context);
      }
    });
    
    afterEach(async () => {
      if (afterEachFn) {
        await afterEachFn(context);
      }
      context.resetMocks();
    });
    
    it('placeholder to ensure context is initialized', () => {
      // This ensures context is initialized before tests run
    });
    
    tests(new TestContext());
  });
}

/**
 * Create a mock for Express next function
 */
export function createNextMock(): jest.Mock & { error?: any } {
  const nextMock = jest.fn().mockImplementation((error?: any) => {
    if (error) {
      (nextMock as any).error = error;
    }
  });
  
  return nextMock as jest.Mock & { error?: any };
}

/**
 * Create a complete middleware test environment
 */
export function createMiddlewareTestEnv(): {
  req: Request;
  res: Response;
  next: jest.Mock;
} {
  const { req, res } = RequestResponseFactory.create();
  const next = createNextMock();
  
  return { req, res, next };
}

/**
 * Create a complete controller test environment
 */
export function createControllerTestEnv(user?: any): {
  req: Request;
  res: Response;
  context: TestContext;
} {
  const context = user ? createAuthenticatedContext(user) : createTestContext();
  const req = context.getRequest();
  const res = context.getResponse();
  
  return { req, res, context };
}

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assert that a function was called with specific arguments
 */
export function assertCalledWith(
  fn: jest.Mock,
  ...expectedArgs: any[]
): void {
  expect(fn).toHaveBeenCalled();
  const calls = fn.mock.calls;
  const lastCall = calls[calls.length - 1];
  
  expectedArgs.forEach((arg, index) => {
    expect(lastCall[index]).toEqual(arg);
  });
}

/**
 * Create a mock function that returns a promise
 */
export function createAsyncMock<T = any>(
  returnValue?: T,
  error?: Error
): jest.Mock<Promise<T>> {
  if (error) {
    return jest.fn().mockRejectedValue(error);
  }
  return jest.fn().mockResolvedValue(returnValue);
} 