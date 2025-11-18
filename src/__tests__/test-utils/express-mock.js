"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockNext = exports.mockResponse = exports.mockRequest = void 0;
/**
 * Create a mock Express request object for testing.
 */
const mockRequest = (overrides = {}) => {
    return Object.assign({ body: {}, query: {}, params: {}, headers: {} }, overrides);
};
exports.mockRequest = mockRequest;
/**
 * Create a mock Express response object for testing.
 */
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};
exports.mockResponse = mockResponse;
/**
 * Create a mock Express next function for testing.
 */
const mockNext = () => jest.fn();
exports.mockNext = mockNext;
