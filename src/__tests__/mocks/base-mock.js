"use strict";
/**
 * Base Mock Class
 *
 * This abstract class serves as the foundation for all mock classes in the testing system.
 * It provides common functionality for tracking calls, resetting state, and configuring behavior.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMock = void 0;
class BaseMock {
    constructor(options = {}) {
        this.calls = new Map();
        this.behaviors = new Map();
        this.defaultBehaviors = new Map();
        this.options = Object.assign({ throwOnUnexpectedCall: false, recordCalls: true, defaultReturnValue: undefined, name: this.constructor.name }, options);
        this.initializeDefaultBehaviors();
    }
    /**
     * Record a method call with its arguments and result
     */
    recordCall(method, args, returnValue, error) {
        if (!this.options.recordCalls)
            return;
        if (!this.calls.has(method)) {
            this.calls.set(method, []);
        }
        this.calls.get(method).push({
            method,
            args,
            timestamp: Date.now(),
            returnValue,
            error
        });
    }
    /**
     * Execute a method with call recording and behavior lookup
     */
    execute(method, ...args) {
        // Look for specific behavior
        const behavior = this.behaviors.get(method) || this.defaultBehaviors.get(method);
        if (!behavior) {
            if (this.options.throwOnUnexpectedCall) {
                throw new Error(`Unexpected call to ${this.options.name}.${method}()`);
            }
            this.recordCall(method, args, this.options.defaultReturnValue);
            return this.options.defaultReturnValue;
        }
        try {
            const result = behavior.apply(this, args);
            this.recordCall(method, args, result);
            return result;
        }
        catch (error) {
            this.recordCall(method, args, undefined, error);
            throw error;
        }
    }
    /**
     * Set a custom behavior for a method
     */
    setBehavior(method, behavior) {
        this.behaviors.set(method, behavior);
        return this;
    }
    /**
     * Reset all recorded calls
     */
    resetCalls() {
        this.calls.clear();
        return this;
    }
    /**
     * Reset all custom behaviors
     */
    resetBehaviors() {
        this.behaviors.clear();
        return this;
    }
    /**
     * Reset everything (calls and behaviors)
     */
    reset() {
        this.resetCalls();
        this.resetBehaviors();
        return this;
    }
    /**
     * Get all recorded calls for a method
     */
    getCalls(method) {
        if (method) {
            return this.calls.get(method) || [];
        }
        // Flatten all calls into a single array
        return Array.from(this.calls.values()).flat();
    }
    /**
     * Check if a method was called
     */
    wasCalled(method) {
        const calls = this.calls.get(method);
        return !!calls && calls.length > 0;
    }
    /**
     * Get the number of times a method was called
     */
    callCount(method) {
        const calls = this.calls.get(method);
        return calls ? calls.length : 0;
    }
    /**
     * Get the arguments from the last call to a method
     */
    lastCallArgs(method) {
        const calls = this.calls.get(method);
        if (!calls || calls.length === 0)
            return undefined;
        return calls[calls.length - 1].args;
    }
}
exports.BaseMock = BaseMock;
