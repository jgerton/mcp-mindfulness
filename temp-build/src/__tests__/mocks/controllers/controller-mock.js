"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerMockFactory = exports.ControllerMock = void 0;
const base_mock_1 = require("../base-mock");
/**
 * Controller Mock Base Class
 *
 * A base class for creating controller mocks with configurable method behaviors
 */
class ControllerMock extends base_mock_1.BaseMock {
    constructor(options = {}) {
        super(options);
        this.methodOptions = options.methods || {};
    }
    /**
     * Configure a method's behavior
     */
    configureMethod(methodName, options) {
        this.methodOptions[methodName] = Object.assign(Object.assign({}, this.methodOptions[methodName]), options);
        return this;
    }
    /**
     * Set a method to succeed
     */
    setMethodToSucceed(methodName, data, status = 200) {
        return this.configureMethod(methodName, {
            shouldSucceed: true,
            successData: data,
            successStatus: status
        });
    }
    /**
     * Set a method to fail
     */
    setMethodToFail(methodName, message = 'Error', status = 500) {
        return this.configureMethod(methodName, {
            shouldSucceed: false,
            errorMessage: message,
            errorStatus: status
        });
    }
    /**
     * Set a method to throw an error
     */
    setMethodToThrow(methodName, message = 'Unexpected error') {
        return this.configureMethod(methodName, {
            throwError: true,
            errorMessage: message
        });
    }
    /**
     * Execute a controller method with standard behavior
     */
    executeControllerMethod(methodName, req, res, defaultSuccessData = { message: 'Success' }, defaultSuccessStatus = 200) {
        const options = this.methodOptions[methodName] || {};
        const { shouldSucceed = true, successStatus = defaultSuccessStatus, successData = defaultSuccessData, errorStatus = 500, errorMessage = 'Internal server error', delay = 0, throwError = false } = options;
        const execute = () => {
            try {
                if (throwError) {
                    throw new Error(errorMessage);
                }
                if (shouldSucceed) {
                    res.status(successStatus).json(successData);
                }
                else {
                    res.status(errorStatus).json({ error: errorMessage });
                }
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        if (delay > 0) {
            setTimeout(execute, delay);
        }
        else {
            execute();
        }
    }
}
exports.ControllerMock = ControllerMock;
/**
 * Factory for creating controller mocks
 */
class ControllerMockFactory {
    /**
     * Create a controller mock with the given methods
     */
    static createControllerMock(methodNames, options = {}) {
        const controllerMock = new GenericControllerMock(methodNames, options);
        // Create a controller object with all the specified methods
        const controller = {};
        methodNames.forEach(methodName => {
            controller[methodName] = (req, res) => {
                controllerMock.executeMethod(methodName, req, res);
            };
        });
        // Add the mock instance for configuration
        controller._mock = controllerMock;
        return controller;
    }
}
exports.ControllerMockFactory = ControllerMockFactory;
/**
 * Generic Controller Mock implementation
 */
class GenericControllerMock extends ControllerMock {
    constructor(methodNames, options = {}) {
        super(options);
        this.methodNames = methodNames;
    }
    initializeDefaultBehaviors() {
        // No default behaviors needed for generic controller
    }
    /**
     * Execute a method with the given name
     */
    executeMethod(methodName, req, res) {
        if (!this.methodNames.includes(methodName)) {
            throw new Error(`Method ${methodName} is not defined in this controller mock`);
        }
        this.executeControllerMethod(methodName, req, res);
    }
}
