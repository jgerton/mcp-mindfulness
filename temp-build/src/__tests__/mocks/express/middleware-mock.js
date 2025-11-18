"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareFactory = exports.ValidationMiddlewareMock = exports.AuthMiddlewareMock = exports.MiddlewareMock = void 0;
const base_mock_1 = require("../base-mock");
/**
 * Express Middleware Mock
 *
 * A mock implementation of Express middleware for testing
 */
class MiddlewareMock extends base_mock_1.BaseMock {
    constructor(options = {}) {
        super(options);
        this.shouldSucceed = options.shouldSucceed !== undefined ? options.shouldSucceed : true;
        this.errorMessage = options.errorMessage || 'Middleware error';
        this.errorStatus = options.errorStatus || 401;
        this.modifyRequest = options.modifyRequest;
        this.modifyResponse = options.modifyResponse;
    }
    initializeDefaultBehaviors() {
        this.defaultBehaviors.set('execute', this.defaultExecute.bind(this));
    }
    /**
     * Execute the middleware
     */
    executeMiddleware(req, res, next) {
        return this.execute('execute', req, res, next);
    }
    /**
     * Default middleware execution behavior
     */
    defaultExecute(req, res, next) {
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
        }
        else {
            res.status(this.errorStatus).json({ error: this.errorMessage });
        }
    }
    /**
     * Get the middleware function
     */
    getMiddleware() {
        return this.executeMiddleware.bind(this);
    }
    /**
     * Configure the middleware to succeed
     */
    succeed() {
        this.shouldSucceed = true;
        return this;
    }
    /**
     * Configure the middleware to fail
     */
    fail(errorMessage, errorStatus) {
        this.shouldSucceed = false;
        if (errorMessage)
            this.errorMessage = errorMessage;
        if (errorStatus)
            this.errorStatus = errorStatus;
        return this;
    }
    /**
     * Set a function to modify the request object
     */
    withRequestModifier(modifier) {
        this.modifyRequest = modifier;
        return this;
    }
    /**
     * Set a function to modify the response object
     */
    withResponseModifier(modifier) {
        this.modifyResponse = modifier;
        return this;
    }
}
exports.MiddlewareMock = MiddlewareMock;
/**
 * Authentication Middleware Mock
 *
 * A specialized middleware mock for authentication
 */
class AuthMiddlewareMock extends MiddlewareMock {
    constructor(options = {}) {
        super(options);
        this.user = options.user || { _id: 'mock-user-id', email: 'mock@example.com' };
        // Set default request modifier to add user to request
        if (!this.modifyRequest) {
            this.modifyRequest = (req) => {
                if (this.shouldSucceed) {
                    req.user = this.user;
                }
            };
        }
    }
    /**
     * Set the user for successful authentication
     */
    withUser(user) {
        this.user = user;
        // Update the request modifier
        this.modifyRequest = (req) => {
            if (this.shouldSucceed) {
                req.user = this.user;
            }
        };
        return this;
    }
}
exports.AuthMiddlewareMock = AuthMiddlewareMock;
/**
 * Validation Middleware Mock
 *
 * A specialized middleware mock for request validation
 */
class ValidationMiddlewareMock extends MiddlewareMock {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { errorStatus: options.errorStatus || 400, errorMessage: options.errorMessage || 'Validation error' }));
        this.validationErrors = options.validationErrors || [];
        // Set default behavior based on validation errors
        this.shouldSucceed = options.shouldSucceed !== undefined
            ? options.shouldSucceed
            : this.validationErrors.length === 0;
    }
    /**
     * Set validation errors
     */
    withValidationErrors(errors) {
        this.validationErrors = errors;
        this.shouldSucceed = errors.length === 0;
        return this;
    }
    /**
     * Default middleware execution behavior for validation
     */
    defaultExecute(req, res, next) {
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
        }
        else {
            res.status(this.errorStatus).json({
                error: this.errorMessage,
                validationErrors: this.validationErrors
            });
        }
    }
}
exports.ValidationMiddlewareMock = ValidationMiddlewareMock;
/**
 * Factory for creating middleware mocks
 */
class MiddlewareFactory {
    /**
     * Create a generic middleware mock
     */
    static createMiddleware(options = {}) {
        return new MiddlewareMock(options).getMiddleware();
    }
    /**
     * Create an authentication middleware mock
     */
    static createAuthMiddleware(options = {}) {
        return new AuthMiddlewareMock(options).getMiddleware();
    }
    /**
     * Create a validation middleware mock
     */
    static createValidationMiddleware(options = {}) {
        return new ValidationMiddlewareMock(options).getMiddleware();
    }
    /**
     * Create a middleware that always succeeds
     */
    static createPassthrough() {
        return (_req, _res, next) => next();
    }
    /**
     * Create a middleware that always fails
     */
    static createBlocker(errorMessage = 'Access denied', errorStatus = 403) {
        return (_req, res, _next) => {
            res.status(errorStatus).json({ error: errorMessage });
        };
    }
}
exports.MiddlewareFactory = MiddlewareFactory;
