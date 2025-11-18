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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.TestServer = void 0;
exports.createTestServer = createTestServer;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const mongoose_1 = __importDefault(require("mongoose"));
const test_db_1 = require("./test-db");
const express_1 = __importDefault(require("express"));
const export_routes_1 = __importDefault(require("../../routes/export.routes"));
/**
 * Test server class for managing server lifecycle in tests.
 * This class handles starting and stopping the server for tests,
 * and provides utilities for making requests and managing connections.
 */
class TestServer {
    constructor() {
        this.isRunning = false;
    }
    /**
     * Start the test server if it's not already running
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning) {
                console.log('Test server is already running');
                return;
            }
            try {
                // Connect to the test database
                yield (0, test_db_1.connectDB)();
                this.isRunning = true;
                console.log('Test server started');
            }
            catch (error) {
                console.error('Failed to start test server:', error);
                throw error;
            }
        });
    }
    /**
     * Close the test server and clean up resources
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning) {
                console.log('Test server is not running');
                return;
            }
            try {
                // Close the server
                yield (0, app_1.closeServer)();
                this.isRunning = false;
                // Small delay to allow resources to be released
                yield new Promise(resolve => setTimeout(resolve, 100));
                console.log('Test server closed');
            }
            catch (error) {
                console.error('Error closing test server:', error);
                // We'll swallow the error here to prevent test failures due to cleanup issues
            }
        });
    }
    /**
     * Get the supertest agent for making requests
     */
    getAgent() {
        if (!this.isRunning) {
            console.warn('Warning: Getting agent before server is started');
        }
        // Return a supertest agent with the correct type
        return (0, supertest_1.default)(app_1.app);
    }
    /**
     * Check for connection leaks
     */
    checkConnectionLeaks() {
        return mongoose_1.default.connections.length > 1;
    }
    /**
     * Log the current connection state for debugging
     */
    logConnectionState() {
        console.log({
            isRunning: this.isRunning,
            connectionCount: mongoose_1.default.connections.length,
            connectionState: mongoose_1.default.connection.readyState,
            hasLeaks: this.checkConnectionLeaks()
        });
    }
}
exports.TestServer = TestServer;
/**
 * Create a new test server instance
 */
function createTestServer() {
    return new TestServer();
}
const createServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/export', export_routes_1.default);
    return app;
});
exports.createServer = createServer;
