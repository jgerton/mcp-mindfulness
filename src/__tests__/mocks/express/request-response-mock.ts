import { Request, Response } from 'express';
import { BaseMock, MockOptions } from '../base-mock';

export interface RequestMockOptions extends MockOptions {
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  user?: any;
  cookies?: Record<string, string>;
  session?: Record<string, any>;
}

export interface ResponseMockOptions extends MockOptions {
  locals?: Record<string, any>;
}

/**
 * Express Request Mock
 * 
 * A mock implementation of Express Request object for testing
 */
export class RequestMock extends BaseMock {
  public params: Record<string, any>;
  public query: Record<string, any>;
  public body: any;
  public headers: Record<string, string>;
  public user: any;
  public cookies: Record<string, string>;
  public session: Record<string, any>;
  
  constructor(options: RequestMockOptions = {}) {
    super(options);
    
    this.params = options.params || {};
    this.query = options.query || {};
    this.body = options.body || {};
    this.headers = options.headers || {};
    this.user = options.user || null;
    this.cookies = options.cookies || {};
    this.session = options.session || {};
  }
  
  protected initializeDefaultBehaviors(): void {
    this.defaultBehaviors.set('get', this.defaultGet.bind(this));
  }
  
  // Express Request methods
  
  get(name: string): string | undefined {
    return this.execute('get', name);
  }
  
  protected defaultGet(name: string): string | undefined {
    return this.headers[name.toLowerCase()];
  }
  
  // Builder methods for fluent API
  
  withParams(params: Record<string, any>): this {
    this.params = { ...this.params, ...params };
    return this;
  }
  
  withQuery(query: Record<string, any>): this {
    this.query = { ...this.query, ...query };
    return this;
  }
  
  withBody(body: any): this {
    this.body = body;
    return this;
  }
  
  withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }
  
  withUser(user: any): this {
    this.user = user;
    return this;
  }
  
  withCookies(cookies: Record<string, string>): this {
    this.cookies = { ...this.cookies, ...cookies };
    return this;
  }
  
  withSession(session: Record<string, any>): this {
    this.session = { ...this.session, ...session };
    return this;
  }
}

/**
 * Express Response Mock
 * 
 * A mock implementation of Express Response object for testing
 */
export class ResponseMock extends BaseMock {
  public statusCode: number = 200;
  public locals: Record<string, any>;
  public headersSent: boolean = false;
  private sentData: any = null;
  private headers: Record<string, string | string[]> = {};
  
  constructor(options: ResponseMockOptions = {}) {
    super(options);
    
    this.locals = options.locals || {};
  }
  
  protected initializeDefaultBehaviors(): void {
    this.defaultBehaviors.set('status', this.defaultStatus.bind(this));
    this.defaultBehaviors.set('json', this.defaultJson.bind(this));
    this.defaultBehaviors.set('send', this.defaultSend.bind(this));
    this.defaultBehaviors.set('sendStatus', this.defaultSendStatus.bind(this));
    this.defaultBehaviors.set('setHeader', this.defaultSetHeader.bind(this));
    this.defaultBehaviors.set('cookie', this.defaultCookie.bind(this));
    this.defaultBehaviors.set('clearCookie', this.defaultClearCookie.bind(this));
  }
  
  // Express Response methods
  
  status(code: number): ResponseMock {
    return this.execute('status', code);
  }
  
  json(data: any): ResponseMock {
    return this.execute('json', data);
  }
  
  send(data: any): ResponseMock {
    return this.execute('send', data);
  }
  
  sendStatus(code: number): ResponseMock {
    return this.execute('sendStatus', code);
  }
  
  setHeader(name: string, value: string | number | readonly string[]): ResponseMock {
    return this.execute('setHeader', name, value);
  }
  
  cookie(name: string, value: string, options?: any): ResponseMock {
    return this.execute('cookie', name, value, options);
  }
  
  clearCookie(name: string, options?: any): ResponseMock {
    return this.execute('clearCookie', name, options);
  }
  
  // Default implementations
  
  protected defaultStatus(code: number): ResponseMock {
    this.statusCode = code;
    return this;
  }
  
  protected defaultJson(data: any): ResponseMock {
    this.sentData = data;
    this.headersSent = true;
    return this;
  }
  
  protected defaultSend(data: any): ResponseMock {
    this.sentData = data;
    this.headersSent = true;
    return this;
  }
  
  protected defaultSendStatus(code: number): ResponseMock {
    this.statusCode = code;
    this.headersSent = true;
    return this;
  }
  
  protected defaultSetHeader(name: string, value: string | number | readonly string[]): ResponseMock {
    this.headers[name] = value as string | string[];
    return this;
  }
  
  protected defaultCookie(name: string, value: string, options?: any): ResponseMock {
    return this;
  }
  
  protected defaultClearCookie(name: string, options?: any): ResponseMock {
    return this;
  }
  
  // Helper methods for assertions
  
  getSentData(): any {
    return this.sentData;
  }
  
  getStatusCode(): number {
    return this.statusCode;
  }
  
  isHeadersSent(): boolean {
    return this.headersSent;
  }
  
  getHeader(name: string): string | string[] | undefined {
    return this.headers[name];
  }
}

/**
 * Factory for creating request and response mocks
 */
export class RequestResponseFactory {
  /**
   * Create a request mock
   */
  static createRequest(options: RequestMockOptions = {}): Request {
    return new RequestMock(options) as unknown as Request;
  }
  
  /**
   * Create a response mock
   */
  static createResponse(options: ResponseMockOptions = {}): Response {
    return new ResponseMock(options) as unknown as Response;
  }
  
  /**
   * Create both request and response mocks
   */
  static create(reqOptions: RequestMockOptions = {}, resOptions: ResponseMockOptions = {}): {
    req: Request;
    res: Response;
    reqMock: RequestMock;
    resMock: ResponseMock;
  } {
    const reqMock = new RequestMock(reqOptions);
    const resMock = new ResponseMock(resOptions);
    
    return {
      req: reqMock as unknown as Request,
      res: resMock as unknown as Response,
      reqMock,
      resMock
    };
  }
} 