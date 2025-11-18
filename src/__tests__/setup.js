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
exports.setupAppForTesting = void 0;
// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("../routes/auth.routes"));
const meditation_routes_1 = __importDefault(require("../routes/meditation.routes"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const achievement_routes_1 = __importDefault(require("../routes/achievement.routes"));
const group_session_routes_1 = __importDefault(require("../routes/group-session.routes"));
const friend_routes_1 = __importDefault(require("../routes/friend.routes"));
const chat_routes_1 = __importDefault(require("../routes/chat.routes"));
const session_analytics_routes_1 = __importDefault(require("../routes/session-analytics.routes"));
const meditation_session_routes_1 = __importDefault(require("../routes/meditation-session.routes"));
const cache_stats_routes_1 = __importDefault(require("../routes/cache-stats.routes"));
const stress_management_routes_1 = __importDefault(require("../routes/stress-management.routes"));
const breathing_routes_1 = __importDefault(require("../routes/breathing.routes"));
const pmr_routes_1 = __importDefault(require("../routes/pmr.routes"));
const stress_routes_1 = __importDefault(require("../routes/stress.routes"));
const export_routes_1 = __importDefault(require("../routes/export.routes"));
const stress_technique_routes_1 = __importDefault(require("../routes/stress-technique.routes"));
const swagger_1 = require("../config/swagger");
let mongod;
// Increase timeout for slow tests
jest.setTimeout(30000);
// Clear all mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});
// Configure mongoose for testing
mongoose_1.default.set('strictQuery', true);
// Helper function to wait for a short time
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Close any existing connections
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
            // Add a small delay to ensure connection is fully closed
            yield delay(100);
        }
        // Configure MongoDB Memory Server
        mongod = yield mongodb_memory_server_1.MongoMemoryServer.create({
            instance: {
                dbName: 'jest',
                port: 27017,
                ip: '127.0.0.1',
            },
            binary: {
                version: '6.0.12',
                downloadDir: './.cache/mongodb-binaries',
            },
        });
        const uri = mongod.getUri();
        yield mongoose_1.default.connect(uri, {
            maxPoolSize: 5, // Reduce pool size to prevent connection issues
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 10000,
            family: 4
        });
    }
    catch (error) {
        console.error('Error during setup:', error);
        throw error;
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Add a small delay before closing connections
        yield delay(100);
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.connection.close();
            // Add a small delay to ensure connection is fully closed
            yield delay(100);
        }
        if (mongod) {
            yield mongod.stop({ force: true });
        }
    }
    catch (error) {
        console.error('Error during cleanup:', error);
    }
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            // Reconnect if connection is lost
            const uri = mongod.getUri();
            yield mongoose_1.default.connect(uri, {
                maxPoolSize: 5, // Reduce pool size to prevent connection issues
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 60000,
                connectTimeoutMS: 10000,
                family: 4
            });
        }
        if (mongoose_1.default.connection.db) {
            try {
                const collections = yield mongoose_1.default.connection.db.collections();
                // Add a small delay between operations
                yield delay(50);
                // Process collections in sequence rather than in parallel to reduce connection load
                for (const collection of collections) {
                    yield collection.deleteMany({});
                    // Small delay between collection operations
                    yield delay(10);
                }
            }
            catch (err) {
                console.error('Error clearing collections:', err);
                // Continue execution even if clearing fails
            }
        }
    }
    catch (error) {
        console.error('Error during collection cleanup:', error);
        // Don't throw here to allow tests to continue
        console.warn('Continuing tests despite cleanup error');
    }
}));
// Verify database connection
describe('Test Setup', () => {
    it('should connect to the in-memory database', () => {
        expect(mongoose_1.default.connection.readyState).toBe(1);
    });
});
expect.extend({
    toBeSortedBy(received, sortKey) {
        const pass = Array.isArray(received) &&
            received.every((item, index) => index === 0 ||
                String(received[index - 1][sortKey]) <= String(item[sortKey]));
        if (pass) {
            return {
                message: () => `expected array not to be sorted by ${sortKey}`,
                pass: true
            };
        }
        else {
            return {
                message: () => `expected array to be sorted by ${sortKey}`,
                pass: false
            };
        }
    }
});
/**
 * Sets up the app for testing with a clean database connection
 * Returns the Express app instance and a function to close the server
 */
const setupAppForTesting = () => __awaiter(void 0, void 0, void 0, function* () {
    // Setup DB connection for testing, only if not already connected
    if (mongoose_1.default.connection.readyState === 0) {
        yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness_test');
    }
    // Create a test app instance
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Setup basic middleware
    app.use(express_1.default.urlencoded({ extended: true }));
    // Setup Swagger
    (0, swagger_1.setupSwagger)(app);
    // Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/meditations', meditation_routes_1.default);
    app.use('/api/users', user_routes_1.default);
    app.use('/api/achievements', achievement_routes_1.default);
    app.use('/api/group-sessions', group_session_routes_1.default);
    app.use('/api/friends', friend_routes_1.default);
    app.use('/api/chat', chat_routes_1.default);
    app.use('/api/analytics', session_analytics_routes_1.default);
    app.use('/api/meditation-sessions', meditation_session_routes_1.default);
    app.use('/api/cache-stats', cache_stats_routes_1.default);
    app.use('/api/stress-management', stress_management_routes_1.default);
    app.use('/api/breathing', breathing_routes_1.default);
    app.use('/api/pmr', pmr_routes_1.default);
    app.use('/api/stress', stress_routes_1.default);
    app.use('/api/export', export_routes_1.default);
    app.use('/api/stress-techniques', stress_technique_routes_1.default);
    // Return both the app and a function to close connections
    const server = app.listen(0); // Random available port
    const closeServer = () => __awaiter(void 0, void 0, void 0, function* () {
        server.close();
        // Only close mongoose if we opened it
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.connection.close();
        }
    });
    return { app, server, closeServer };
});
exports.setupAppForTesting = setupAppForTesting;
