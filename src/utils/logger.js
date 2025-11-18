"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static error(message, context) {
        if (process.env.NODE_ENV === 'test') {
            return; // Don't log during tests
        }
        console.error(`[ERROR] ${message}`, context);
    }
    static info(message, context) {
        if (process.env.NODE_ENV === 'test') {
            return; // Don't log during tests
        }
        console.info(`[INFO] ${message}`, context);
    }
    static warn(message, context) {
        if (process.env.NODE_ENV === 'test') {
            return; // Don't log during tests
        }
        console.warn(`[WARN] ${message}`, context);
    }
    static debug(message, context) {
        if (process.env.NODE_ENV === 'test') {
            return; // Don't log during tests
        }
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, context);
        }
    }
}
exports.Logger = Logger;
