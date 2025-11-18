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
// Mock the BreathingService
jest.mock('../../services/breathing.service');
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
    let mockRequest;
    let mockResponse;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });
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
            const mockPattern = {
                name: '4-7-8',
                inhale: 4,
                hold: 7,
                exhale: 8
            };
            mockRequest.params = { name: '4-7-8' };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue(mockPattern);
            breathing_service_1.BreathingService.initializeDefaultPatterns = jest.fn().mockResolvedValue(undefined);
            yield breathing_controller_1.BreathingController.getPatterns(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPattern);
        }));
        it('should return null when pattern not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { name: 'non-existent-pattern' };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue(null);
            breathing_service_1.BreathingService.initializeDefaultPatterns = jest.fn().mockResolvedValue(undefined);
            yield breathing_controller_1.BreathingController.getPatterns(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Breathing pattern not found' });
        }));
    });
    describe('startSession', () => {
        it('should return 500 for invalid pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.body = { patternName: 'INVALID_PATTERN' };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue(null);
            yield breathing_controller_1.BreathingController.startSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid pattern' });
        }));
        it('should create new session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: 'test-session-id',
                userId: 'test-user',
                patternName: '4-7-8',
                startTime: new Date()
            };
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.body = { patternName: '4-7-8', stressLevelBefore: 7 };
            breathing_service_1.BreathingService.getPattern = jest.fn().mockResolvedValue({
                name: '4-7-8',
                inhale: 4,
                hold: 7,
                exhale: 8
            });
            breathing_service_1.BreathingService.startSession = jest.fn().mockResolvedValue(mockSession);
            yield breathing_controller_1.BreathingController.startSession(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            mockRequest.body = { patternName: '4-7-8', stressLevelBefore: 7 };
            yield breathing_controller_1.BreathingController.startSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('completeSession', () => {
        it('should complete session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: 'test-session-id',
                userId: 'test-user',
                patternName: '4-7-8',
                completedCycles: 4,
                stressLevelAfter: 3,
                endTime: new Date()
            };
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.params = { sessionId: 'test-session-id' };
            mockRequest.body = { completedCycles: 4, stressLevelAfter: 3 };
            // Mock mongoose.Types.ObjectId.isValid to return true
            jest.spyOn(mongoose_1.default.Types.ObjectId, 'isValid').mockReturnValue(true);
            breathing_service_1.BreathingService.getUserSessionById = jest.fn().mockResolvedValue({
                _id: 'test-session-id',
                userId: {
                    toString: () => 'test-user'
                },
                toString: () => 'test-user'
            });
            breathing_service_1.BreathingService.completeSession = jest.fn().mockResolvedValue(mockSession);
            yield breathing_controller_1.BreathingController.completeSession(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 500 for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.params = { sessionId: 'invalid-id' };
            mockRequest.body = { completedCycles: 4, stressLevelAfter: 3 };
            // Mock mongoose.Types.ObjectId.isValid to return false
            jest.spyOn(mongoose_1.default.Types.ObjectId, 'isValid').mockReturnValue(false);
            yield breathing_controller_1.BreathingController.completeSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid session ID' });
        }));
    });
    describe('getUserSessions', () => {
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [
                { _id: 'session1', patternName: '4-7-8' },
                { _id: 'session2', patternName: 'BOX_BREATHING' }
            ];
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.query = {};
            breathing_service_1.BreathingService.getUserSessions = jest.fn().mockResolvedValue(mockSessions);
            yield breathing_controller_1.BreathingController.getUserSessions(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSessions);
            expect(breathing_service_1.BreathingService.getUserSessions).toHaveBeenCalledWith('test-user', 10);
        }));
        it('should respect limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [
                { _id: 'session1', patternName: '4-7-8' },
                { _id: 'session2', patternName: 'BOX_BREATHING' }
            ];
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            mockRequest.query = { limit: '2' };
            breathing_service_1.BreathingService.getUserSessions = jest.fn().mockResolvedValue(mockSessions);
            yield breathing_controller_1.BreathingController.getUserSessions(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSessions);
            expect(breathing_service_1.BreathingService.getUserSessions).toHaveBeenCalledWith('test-user', 2);
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            mockRequest.query = {};
            yield breathing_controller_1.BreathingController.getUserSessions(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('getEffectiveness', () => {
        it('should return effectiveness metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockEffectiveness = {
                averageStressReduction: 3.5,
                totalSessions: 10,
                mostEffectivePattern: '4-7-8'
            };
            mockRequest.user = { _id: 'test-user', username: 'testuser' };
            breathing_service_1.BreathingService.getEffectiveness = jest.fn().mockResolvedValue(mockEffectiveness);
            yield breathing_controller_1.BreathingController.getEffectiveness(mockRequest, mockResponse);
            expect(mockResponse.json).toHaveBeenCalledWith(mockEffectiveness);
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield breathing_controller_1.BreathingController.getEffectiveness(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
});
