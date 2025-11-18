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
// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
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
