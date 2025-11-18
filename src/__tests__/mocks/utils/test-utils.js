"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestContext = void 0;
exports.createTestContext = createTestContext;
exports.createAuthenticatedContext = createAuthenticatedContext;
exports.runMiddleware = runMiddleware;
exports.createMockModelFactory = createMockModelFactory;
exports.createTestSuite = createTestSuite;
exports.createNextMock = createNextMock;
exports.createMiddlewareTestEnv = createMiddlewareTestEnv;
exports.createControllerTestEnv = createControllerTestEnv;
exports.wait = wait;
exports.assertCalledWith = assertCalledWith;
exports.createAsyncMock = createAsyncMock;
const request_response_mock_1 = require("../express/request-response-mock");
const model_mock_1 = require("../database/model-mock");
/**
 * Test Context
 *
 * A container for test-related objects and utilities
 */
class TestContext {
    constructor() {
        this.mocks = new Map();
        const { req, res } = request_response_mock_1.RequestResponseFactory.create();
        this.req = req;
        this.res = res;
    }
    /**
     * Get the request object
     */
    getRequest() {
        return this.req;
    }
    /**
     * Get the response object
     */
    getResponse() {
        return this.res;
    }
    /**
     * Register a mock with the context
     */
    registerMock(name, mock) {
        this.mocks.set(name, mock);
        return this;
    }
    /**
     * Get a registered mock
     */
    getMock(name) {
        const mock = this.mocks.get(name);
        if (!mock) {
            throw new Error(`Mock '${name}' not found in test context`);
        }
        return mock;
    }
    /**
     * Reset all mocks
     */
    resetMocks() {
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
    createRequest(options = {}) {
        this.req = request_response_mock_1.RequestResponseFactory.createRequest(options);
        return this.req;
    }
    /**
     * Create a new response object
     */
    createResponse(options = {}) {
        this.res = request_response_mock_1.RequestResponseFactory.createResponse(options);
        return this.res;
    }
}
exports.TestContext = TestContext;
/**
 * Create a test context with common mocks
 */
function createTestContext() {
    return new TestContext();
}
/**
 * Create a test context with authentication
 */
function createAuthenticatedContext(user = { _id: 'test-user-id' }) {
    const context = new TestContext();
    const req = context.getRequest();
    req.user = user;
    return context;
}
/**
 * Run middleware and return a promise
 */
function runMiddleware(middleware, req, res) {
    return new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Create a mock model factory
 */
function createMockModelFactory(modelName, initialData = []) {
    const mockModel = model_mock_1.ModelMock.createModelMock({
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
function createTestSuite(name, tests, beforeEachFn, afterEachFn) {
    describe(name, () => {
        let context;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            context = new TestContext();
            if (beforeEachFn) {
                yield beforeEachFn(context);
            }
        }));
        afterEach(() => __awaiter(this, void 0, void 0, function* () {
            if (afterEachFn) {
                yield afterEachFn(context);
            }
            context.resetMocks();
        }));
        it('placeholder to ensure context is initialized', () => {
            // This ensures context is initialized before tests run
        });
        tests(new TestContext());
    });
}
/**
 * Create a mock for Express next function
 */
function createNextMock() {
    const nextMock = jest.fn().mockImplementation((error) => {
        if (error) {
            nextMock.error = error;
        }
    });
    return nextMock;
}
/**
 * Create a complete middleware test environment
 */
function createMiddlewareTestEnv() {
    const { req, res } = request_response_mock_1.RequestResponseFactory.create();
    const next = createNextMock();
    return { req, res, next };
}
/**
 * Create a complete controller test environment
 */
function createControllerTestEnv(user) {
    const context = user ? createAuthenticatedContext(user) : createTestContext();
    const req = context.getRequest();
    const res = context.getResponse();
    return { req, res, context };
}
/**
 * Wait for a specified time
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Assert that a function was called with specific arguments
 */
function assertCalledWith(fn, ...expectedArgs) {
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
function createAsyncMock(returnValue, error) {
    if (error) {
        return jest.fn().mockRejectedValue(error);
    }
    return jest.fn().mockResolvedValue(returnValue);
}
