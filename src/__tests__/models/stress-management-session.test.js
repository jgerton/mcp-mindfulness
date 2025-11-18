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
const mongoose_1 = __importDefault(require("mongoose"));
const stress_management_session_model_1 = require("../../models/stress-management-session.model");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_handler_1 = require("../test-utils/db-handler");
const achievement_service_1 = require("../../services/achievement.service");
const createTestSession = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId(), technique: stress_management_session_model_1.StressManagementTechnique.DeepBreathing, stressLevelBefore: 7, duration: 600, startTime: new Date(), status: base_wellness_session_model_1.WellnessSessionStatus.Active }, overrides));
describe('StressManagementSession Model', () => {
    let testSession;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testSession = createTestSession();
        jest.spyOn(stress_management_session_model_1.StressManagementSession.prototype, 'save').mockImplementation(function () {
            return Promise.resolve(this);
        });
        jest.spyOn(achievement_service_1.AchievementService, 'processStressManagementAchievements').mockResolvedValue(undefined);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create and save session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(testSession);
            expect(session.userId).toBeDefined();
            expect(session.technique).toBe(testSession.technique);
            expect(session.stressLevelBefore).toBe(testSession.stressLevelBefore);
            expect(session.duration).toBe(testSession.duration);
        }));
        it('should complete session with feedback', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(testSession);
            const feedback = {
                effectivenessRating: 4,
                stressReductionRating: 4,
                comments: 'Very helpful session',
                improvements: ['More guided breathing']
            };
            yield session.addFeedback(feedback);
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(session.feedback).toEqual(expect.objectContaining(feedback));
        }));
        it('should calculate stress reduction correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(Object.assign(Object.assign({}, testSession), { stressLevelBefore: 8, stressLevelAfter: 4 }));
            expect(session.stressReduction).toBe(4);
        }));
    });
    describe('Error Cases', () => {
        it('should fail when required fields are missing', () => {
            expect(() => new stress_management_session_model_1.StressManagementSession({})).toThrow();
        });
        it('should reject invalid stress level', () => {
            expect(() => new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, testSession), { stressLevelBefore: 11 }))).toThrow();
        });
        it('should reject invalid technique', () => {
            expect(() => new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, testSession), { technique: 'invalid' }))).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle minimum stress level', () => {
            expect(() => new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, testSession), { stressLevelBefore: 1 }))).not.toThrow();
        });
        it('should handle maximum stress level', () => {
            expect(() => new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, testSession), { stressLevelBefore: 10 }))).not.toThrow();
        });
        it('should handle empty arrays', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(Object.assign(Object.assign({}, testSession), { triggers: [], physicalSymptoms: [], emotionalSymptoms: [] }));
            expect(session.triggers).toEqual([]);
            expect(session.physicalSymptoms).toEqual([]);
            expect(session.emotionalSymptoms).toEqual([]);
        }));
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession({});
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.technique).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.stressLevelBefore).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
        it('should validate stress level range', () => __awaiter(void 0, void 0, void 0, function* () {
            const highSession = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { stressLevelBefore: 11 // Above max
             }));
            const lowSession = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { stressLevelBefore: 0 // Below min
             }));
            const highError = yield highSession.validateSync();
            const lowError = yield lowSession.validateSync();
            expect(highError === null || highError === void 0 ? void 0 : highError.errors.stressLevelBefore).toBeDefined();
            expect(lowError === null || lowError === void 0 ? void 0 : lowError.errors.stressLevelBefore).toBeDefined();
        }));
        it('should validate technique enum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { technique: 'invalid' }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.technique).toBeDefined();
        }));
        it('should validate triggers array length', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { triggers: Array(6).fill('trigger') // Exceeds 5 max
             }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.triggers).toBeDefined();
        }));
        it('should validate trigger description length', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { triggers: ['a'.repeat(101)] // Exceeds 100 char limit
             }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['triggers.0']).toBeDefined();
        }));
        it('should validate symptoms array length', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { physicalSymptoms: Array(11).fill('symptom'), emotionalSymptoms: Array(11).fill('symptom') // Exceeds 10 max
             }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.physicalSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.emotionalSymptoms).toBeDefined();
        }));
        it('should validate symptom description length', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { physicalSymptoms: ['a'.repeat(51)], emotionalSymptoms: ['a'.repeat(51)] // Exceeds 50 char limit
             }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['physicalSymptoms.0']).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['emotionalSymptoms.0']).toBeDefined();
        }));
        it('should validate feedback structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { feedback: {
                    effectivenessRating: 6, // Above max
                    stressReductionRating: 0, // Below min
                    comments: 'a'.repeat(501), // Exceeds 500 char limit
                    improvements: Array(6).fill('improvement') // Exceeds 5 max
                } }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['feedback.effectivenessRating']).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['feedback.stressReductionRating']).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['feedback.comments']).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['feedback.improvements']).toBeDefined();
        }));
    });
    describe('Virtual Fields', () => {
        it('should handle missing stress level after', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, createTestSession()), { stressLevelBefore: 8, stressLevelAfter: undefined }));
            expect(session.stressReduction).toBe(0);
        }));
    });
    describe('Session Methods', () => {
        it('should process achievements on completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(Object.assign(Object.assign({}, createTestSession()), { stressLevelBefore: 8, stressLevelAfter: 3 }));
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            expect(achievement_service_1.AchievementService.processStressManagementAchievements).toHaveBeenCalledWith(expect.objectContaining({
                userId: session.userId,
                sessionId: session._id,
                technique: session.technique,
                stressReduction: 5,
                duration: session.duration
            }));
        }));
    });
    describe('Indexes', () => {
        it('should have compound index on userId and startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield stress_management_session_model_1.StressManagementSession.collection.getIndexes();
            const hasCompoundIndex = Object.values(indexes).some(index => index.key && index.key.userId === 1 && index.key.startTime === -1);
            expect(hasCompoundIndex).toBe(true);
        }));
    });
});
