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
// Set NODE_ENV to test to ensure the correct JWT secret is used
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const test_db_1 = require("../utils/test-db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
// Mock the auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { _id: '507f1f77bcf86cd799439011', username: 'test-user' };
        next();
    }),
    authenticateUser: jest.fn((req, res, next) => {
        req.user = { _id: '507f1f77bcf86cd799439011', username: 'test-user' };
        next();
    })
}));
describe('Simple Meditation API Test', () => {
    let authToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.connect)();
        // Create auth token for testing with a fixed ID that matches the mock
        authToken = jsonwebtoken_1.default.sign({ _id: '507f1f77bcf86cd799439011', username: 'test-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
    }), 30000);
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, app_1.closeServer)();
        yield (0, test_db_1.closeDatabase)();
        // Add a small delay to ensure all connections are properly closed
        yield new Promise(resolve => setTimeout(resolve, 500));
    }), 30000);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.clearDatabase)();
    }));
    it('should access a simple API endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test a simple GET endpoint first to verify the API is working
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/meditation-sessions')
            .set('Authorization', `Bearer ${authToken}`)
            .timeout(10000);
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(response.body, null, 2));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessions');
    }), 15000);
});
