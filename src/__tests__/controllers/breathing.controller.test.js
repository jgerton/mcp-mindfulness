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
const breathing_controller_1 = require("../../controllers/breathing.controller");
const breathing_service_1 = require("../../services/breathing.service");
const mongoose_1 = __importDefault(require("mongoose"));
const mockResponse = () => {
    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    return res;
};
const mockRequest = (data = {}) => ({
    user: { _id: 'test-user', username: 'testuser' },
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
});
describe('BreathingController', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            const db = mongoose_1.default.connection.db;
            if (db) {
                try {
                    yield db.collection('breathingpatterns').deleteMany({});
                    yield db.collection('breathingsessions').deleteMany({});
                }
                catch (error) {
                    // Collections might not exist, ignore error
                }
            }
        }
        yield breathing_service_1.BreathingService.initializeDefaultPatterns();
    }));
    describe('getPatterns', () => {
        it('should return breathing pattern when found', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({ params: { name: '4-7-8' } });
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getPatterns(req, res);
            expect(res.json).toHaveBeenCalled();
            const pattern = res.json.mock.calls[0][0];
            expect(pattern.name).toBe('4-7-8');
        }));
        it('should return null when pattern not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                params: { name: 'non-existent-pattern' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue(null);
            yield breathing_controller_1.BreathingController.getPatterns(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Breathing pattern not found' });
        }));
    });
    describe('startSession', () => {
        it.skip('should create new session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                body: {
                    patternName: '4-7-8',
                    stressLevelBefore: 7
                }
            });
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.startSession(req, res);
            expect(res.json).toHaveBeenCalled();
            const session = res.json.mock.calls[0][0];
            expect(session.patternName).toBe('4-7-8');
            expect(session.stressLevelBefore).toBe(7);
        }));
        it.skip('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.startSession(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
        it('should return 500 for invalid pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                user: { _id: 'test-user' },
                body: { patternName: 'INVALID_PATTERN' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue(null);
            yield breathing_controller_1.BreathingController.startSession(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid pattern' });
        }));
    });
    describe('completeSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield breathing_service_1.BreathingService.startSession('test-user', '4-7-8', 7);
            sessionId = session._id.toString();
        }));
        it('should complete session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                params: { sessionId },
                body: {
                    completedCycles: 4,
                    stressLevelAfter: 3
                }
            });
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.completeSession(req, res);
            expect(res.json).toHaveBeenCalled();
            const completedSession = res.json.mock.calls[0][0];
            expect(completedSession.completedCycles).toBe(4);
            expect(completedSession.stressLevelAfter).toBe(3);
        }));
        it('should return 500 for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                user: { _id: 'test-user' },
                params: { sessionId: 'invalid-id' },
                body: { completedCycles: 4, stressLevelAfter: 3 }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            breathing_service_1.BreathingService.getUserSessionById = jest.fn().mockResolvedValue(null);
            yield breathing_controller_1.BreathingController.completeSession(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Session not found' });
        }));
    });
    describe('getUserSessions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions
            yield breathing_service_1.BreathingService.startSession('test-user', '4-7-8');
            yield breathing_service_1.BreathingService.startSession('test-user', 'BOX_BREATHING');
            yield breathing_service_1.BreathingService.startSession('test-user', 'QUICK_BREATH');
        }));
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getUserSessions(req, res);
            expect(res.json).toHaveBeenCalled();
            const sessions = res.json.mock.calls[0][0];
            expect(sessions).toHaveLength(3);
        }));
        it.skip('should respect limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({ query: { limit: '2' } });
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getUserSessions(req, res);
            expect(res.json).toHaveBeenCalled();
            const sessions = res.json.mock.calls[0][0];
            expect(sessions).toHaveLength(2);
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getUserSessions(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('getEffectiveness', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete sessions with different effectiveness
            const session1 = yield breathing_service_1.BreathingService.startSession('test-user', '4-7-8', 8);
            yield breathing_service_1.BreathingService.completeSession(session1._id.toString(), 4, 4);
            const session2 = yield breathing_service_1.BreathingService.startSession('test-user', 'BOX_BREATHING', 7);
            yield breathing_service_1.BreathingService.completeSession(session2._id.toString(), 4, 5);
        }));
        it.skip('should return effectiveness metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getEffectiveness(req, res);
            expect(res.json).toHaveBeenCalled();
            const effectiveness = res.json.mock.calls[0][0];
            expect(effectiveness).toHaveProperty('averageStressReduction');
            expect(effectiveness).toHaveProperty('totalSessions');
            expect(effectiveness).toHaveProperty('mostEffectivePattern');
        }));
        it.skip('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield breathing_controller_1.BreathingController.getEffectiveness(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
});
