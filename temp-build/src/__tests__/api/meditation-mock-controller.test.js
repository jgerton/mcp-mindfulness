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
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
// Mock user ID for testing
const testUserId = '507f1f77bcf86cd799439011';
const testUsername = 'test-user';
// Mock the auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: 'test-user' };
        next();
    }),
    authenticateUser: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: 'test-user' };
        next();
    })
}));
// Mock the entire meditation session controller
jest.mock('../../controllers/meditation-session.controller', () => {
    return {
        MeditationSessionController: jest.fn().mockImplementation(() => {
            return {
                getUserSessions: jest.fn((req, res) => {
                    res.status(200).json({
                        sessions: [],
                        pagination: {
                            total: 0,
                            page: 1,
                            limit: 10,
                            pages: 0
                        }
                    });
                }),
                getSessionById: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: false
                    });
                }),
                createSession: jest.fn((req, res) => {
                    res.status(201).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: req.body.title || 'Test Session',
                        duration: req.body.duration || 15,
                        completed: false
                    });
                }),
                updateSession: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Updated Session',
                        duration: 20,
                        completed: false
                    });
                }),
                completeSession: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: true,
                        endTime: new Date()
                    });
                }),
                getUserStats: jest.fn((req, res) => {
                    res.status(200).json({
                        totalSessions: 0,
                        totalTime: 0,
                        totalTimeFormatted: '0h 0m',
                        sessionsByType: []
                    });
                })
            };
        })
    };
});
describe('Meditation Session API with Mocked Controller', () => {
    let authToken;
    beforeAll(() => {
        // Create auth token for testing
        authToken = jsonwebtoken_1.default.sign({ _id: testUserId, username: testUsername }, config_1.default.jwtSecret, { expiresIn: '1h' });
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, app_1.closeServer)();
    }));
    it('should get meditation sessions', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/meditation-sessions')
            .set('Authorization', `Bearer ${authToken}`)
            .timeout(5000);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessions');
        expect(response.body).toHaveProperty('pagination');
    }));
    it('should create a meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionData = {
            title: 'New Session',
            duration: 15,
            type: 'unguided'
        };
        const response = yield (0, supertest_1.default)(app_1.app)
            .post('/api/meditation-sessions')
            .set('Authorization', `Bearer ${authToken}`)
            .send(sessionData)
            .timeout(5000);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.userId).toBe(testUserId);
    }));
});
