import { Request, Response } from 'express';

/**
 * Create a mock Express request object for testing.
 */
export const mockRequest = (overrides = {}): Partial<Request> => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides
  };
};

/**
 * Create a mock Express response object for testing.
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock Express next function for testing.
 */
export const mockNext = () => jest.fn(); 