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
Object.defineProperty(exports, "__esModule", { value: true });
const breathing_service_1 = require("../../services/breathing.service");
const breathing_model_1 = require("../../models/breathing.model");
const stress_management_service_1 = require("../../services/stress-management.service");
// Import the global setup
require("../setup");
jest.mock('../../services/stress-management.service', () => ({
    StressManagementService: {
        recordStressChange: jest.fn()
    }
}));
describe('BreathingService', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield breathing_model_1.BreathingPattern.deleteMany({});
        yield breathing_model_1.BreathingSession.deleteMany({});
        // Initialize patterns for all tests
        yield breathing_service_1.BreathingService.initializeDefaultPatterns();
        jest.clearAllMocks();
    }));
    describe('initializeDefaultPatterns', () => {
        it('should create default breathing patterns', () => __awaiter(void 0, void 0, void 0, function* () {
            // Patterns already initialized in beforeEach
            const patterns = yield breathing_model_1.BreathingPattern.find();
            expect(patterns).toHaveLength(3);
            expect(patterns.map(p => p.name)).toContain('4-7-8');
            expect(patterns.map(p => p.name)).toContain('BOX_BREATHING');
            expect(patterns.map(p => p.name)).toContain('QUICK_BREATH');
        }));
        it('should not duplicate patterns on multiple calls', () => __awaiter(void 0, void 0, void 0, function* () {
            yield breathing_service_1.BreathingService.initializeDefaultPatterns();
            const patterns = yield breathing_model_1.BreathingPattern.find();
            expect(patterns).toHaveLength(3);
        }));
    });
    describe('startSession', () => {
        it('should create a new breathing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 'test-user';
            const session = yield breathing_service_1.BreathingService.startSession(userId, '4-7-8', 7);
            expect(session.userId).toBe(userId);
            expect(session.patternName).toBe('4-7-8');
            expect(session.stressLevelBefore).toBe(7);
            expect(session.completedCycles).toBe(0);
            expect(session.targetCycles).toBe(4);
        }));
        it('should throw error for invalid pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(breathing_service_1.BreathingService.startSession('test-user', 'INVALID_PATTERN')).rejects.toThrow('Invalid breathing pattern');
        }));
    });
    describe('completeSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield breathing_service_1.BreathingService.startSession('test-user', '4-7-8', 7);
            sessionId = session._id.toString();
        }));
        it('should complete a breathing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const completedSession = yield breathing_service_1.BreathingService.completeSession(sessionId, 4, 3);
            expect(completedSession.completedCycles).toBe(4);
            expect(completedSession.stressLevelAfter).toBe(3);
            expect(completedSession.endTime).toBeDefined();
        }));
        it('should update stress management when stress levels are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            yield breathing_service_1.BreathingService.completeSession(sessionId, 4, 3);
            expect(stress_management_service_1.StressManagementService.recordStressChange).toHaveBeenCalledWith('test-user', expect.any(String), expect.any(String), expect.any(String));
        }));
        it('should not update stress management when stress levels are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            yield breathing_service_1.BreathingService.completeSession(sessionId, 4);
            expect(stress_management_service_1.StressManagementService.recordStressChange).not.toHaveBeenCalled();
        }));
        it('should throw error for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(breathing_service_1.BreathingService.completeSession('invalid-id', 4)).rejects.toThrow();
        }));
    });
    describe('getUserSessions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const userId = 'test-user';
            yield breathing_service_1.BreathingService.startSession(userId, '4-7-8');
            yield breathing_service_1.BreathingService.startSession(userId, 'BOX_BREATHING');
            yield breathing_service_1.BreathingService.startSession(userId, 'QUICK_BREATH');
        }));
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessions = yield breathing_service_1.BreathingService.getUserSessions('test-user');
            expect(sessions).toHaveLength(3);
        }));
        it('should respect the limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessions = yield breathing_service_1.BreathingService.getUserSessions('test-user', 2);
            expect(sessions).toHaveLength(2);
        }));
        it('should return sessions in descending order by start time', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessions = yield breathing_service_1.BreathingService.getUserSessions('test-user');
            const startTimes = sessions.map(s => s.startTime.getTime());
            expect(startTimes).toEqual([...startTimes].sort((a, b) => b - a));
        }));
    });
    describe('getEffectiveness', () => {
        const userId = 'test-user';
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create sessions with different patterns and stress levels
            const session1 = yield breathing_service_1.BreathingService.startSession(userId, '4-7-8', 8);
            yield breathing_service_1.BreathingService.completeSession(session1._id.toString(), 4, 4);
            const session2 = yield breathing_service_1.BreathingService.startSession(userId, 'BOX_BREATHING', 7);
            yield breathing_service_1.BreathingService.completeSession(session2._id.toString(), 4, 5);
            const session3 = yield breathing_service_1.BreathingService.startSession(userId, '4-7-8', 9);
            yield breathing_service_1.BreathingService.completeSession(session3._id.toString(), 4, 3);
        }));
        it('should calculate effectiveness metrics correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const effectiveness = yield breathing_service_1.BreathingService.getEffectiveness(userId);
            expect(effectiveness.totalSessions).toBe(3);
            expect(effectiveness.averageStressReduction).toBe(4); // (4 + 2 + 6) / 3
            expect(effectiveness.mostEffectivePattern).toBe('4-7-8'); // Average reduction: 5 vs 2
        }));
        it('should return default values for user with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const effectiveness = yield breathing_service_1.BreathingService.getEffectiveness('new-user');
            expect(effectiveness).toEqual({
                averageStressReduction: 0,
                totalSessions: 0,
                mostEffectivePattern: ''
            });
        }));
    });
});
