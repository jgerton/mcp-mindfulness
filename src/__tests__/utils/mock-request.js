"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockResponse = createMockResponse;
exports.createMockRequest = createMockRequest;
function createMockResponse() {
    let statusCode;
    let jsonData;
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
    res.status.mockImplementation((code) => {
        statusCode = code;
        return res;
    });
    return res;
}
function createMockRequest(options = {}) {
    return Object.assign({ params: {}, body: {}, query: {} }, options);
}
