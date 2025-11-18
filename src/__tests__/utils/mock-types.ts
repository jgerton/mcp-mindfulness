import { Response } from 'express';

export interface MockExpressResponse extends Partial<Response> {
  status: jest.Mock<MockExpressResponse>;
  json: jest.Mock<MockExpressResponse>;
  send: jest.Mock<MockExpressResponse>;
  _getJSON?: () => any;
  _getStatus?: () => number;
}

export interface MockAuthUtils {
  comparePasswords: jest.Mock<Promise<boolean>>;
  hashPassword: jest.Mock<Promise<string>>;
  generateToken: jest.Mock<string>;
  verifyToken: jest.Mock<any>;
}

export interface MockErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
} 