import { Request, Response } from 'express';

export interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  _getJSON: () => any;
  _getStatus: () => number;
}

export interface MockRequest {
  params: any;
  body: any;
  query: any;
  user?: any;
}

export function createMockResponse(): MockResponse {
  let statusCode: number;
  let jsonData: any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
      jsonData = data;
      return res;
    }),
    send: jest.fn().mockReturnThis(),
    _getJSON: () => jsonData,
    _getStatus: () => statusCode
  };

  res.status.mockImplementation((code: number) => {
    statusCode = code;
    return res;
  });

  return res;
}

export function createMockRequest(options: Partial<MockRequest> = {}): Partial<Request> {
  return {
    params: {},
    body: {},
    query: {},
    ...options
  };
} 