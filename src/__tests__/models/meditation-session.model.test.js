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
const meditation_session_model_1 = require("../../models/meditation-session.model");
const achievement_service_1 = require("../../services/achievement.service");
const test_db_1 = require("../utils/test-db");
// Mock the AchievementService
jest.mock('../../services/achievement.service', () => ({
    AchievementService: {
        processMeditationAchievements: jest.fn().mockResolvedValue(undefined)
    }
}));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.connect)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.closeDatabase)();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.clearDatabase)();
    jest.clearAllMocks();
}));
describe('MeditationSession Model', () => {
    const userId = new mongoose_1.default.Types.ObjectId();
    const guidedMeditationId = new mongoose_1.default.Types.ObjectId();
    const validMeditationSessionData = {
        userId,
        title: 'Morning Meditation',
        description: 'A peaceful morning meditation session',
        duration: 600, // 10 minutes in seconds
        completed: false,
        startTime: new Date(),
        type: 'guided',
        guidedMeditationId,
        tags: ['morning', 'peaceful'],
        mood: {
            before: 'neutral',
            after: 'positive'
        },
        notes: 'Felt very relaxed after this session'
    };
    describe('Schema Validation', () => {
        it('should create a valid meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const meditationSession = new meditation_session_model_1.MeditationSession(validMeditationSessionData);
            const savedSession = yield meditationSession.save();
            expect(savedSession._id).toBeDefined();
            expect(savedSession.userId.toString()).toBe(userId.toString());
            expect(savedSession.title).toBe(validMeditationSessionData.title);
            expect(savedSession.description).toBe(validMeditationSessionData.description);
            expect(savedSession.duration).toBe(validMeditationSessionData.duration);
            expect(savedSession.completed).toBe(validMeditationSessionData.completed);
            expect(savedSession.startTime).toEqual(validMeditationSessionData.startTime);
            expect(savedSession.type).toBe(validMeditationSessionData.type);
            expect((_a = savedSession.guidedMeditationId) === null || _a === void 0 ? void 0 : _a.toString()).toBe(guidedMeditationId.toString());
            expect(savedSession.tags).toEqual(validMeditationSessionData.tags);
            expect((_b = savedSession.mood) === null || _b === void 0 ? void 0 : _b.before).toBe(validMeditationSessionData.mood.before);
            expect((_c = savedSession.mood) === null || _c === void 0 ? void 0 : _c.after).toBe(validMeditationSessionData.mood.after);
            expect(savedSession.notes).toBe(validMeditationSessionData.notes);
            expect(savedSession.createdAt).toBeDefined();
            expect(savedSession.updatedAt).toBeDefined();
        }));
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession({});
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.title).toBeDefined();
            expect(error.errors.duration).toBeDefined();
            expect(error.errors.startTime).toBeDefined();
            expect(error.errors.type).toBeDefined();
        }));
        it('should fail validation when duration is negative', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { duration: -10 }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.duration).toBeDefined();
            expect(error.errors.duration.message).toBe('Session duration must be at least 1 second');
        }));
        it('should fail validation when type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { type: 'invalid-type' }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.type).toBeDefined();
            expect(error.errors.type.message).toContain('Session type must be one of');
        }));
        it('should fail validation when guided meditation ID is missing for guided sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a session with type 'guided' but explicitly set guidedMeditationId to null
            const invalidSession = Object.assign(Object.assign({}, validMeditationSessionData), { type: 'guided', guidedMeditationId: null });
            // Use a try-catch block to handle the validation error
            try {
                const meditationSession = new meditation_session_model_1.MeditationSession(invalidSession);
                yield meditationSession.validate(); // Just validate, don't save
                fail('Should have thrown a validation error');
            }
            catch (err) {
                const error = err;
                expect(error).toBeDefined();
                expect(error.errors.guidedMeditationId).toBeDefined();
                expect(error.errors.guidedMeditationId.message).toBe('Guided meditation ID is required for guided sessions');
            }
        }));
        it('should allow missing guided meditation ID for non-guided sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { type: 'unguided', guidedMeditationId: undefined }));
            const savedSession = yield meditationSession.save();
            expect(savedSession._id).toBeDefined();
            expect(savedSession.type).toBe('unguided');
            expect(savedSession.guidedMeditationId).toBeUndefined();
        }));
        it('should fail validation when end time is before start time', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() - 1000); // 1 second before start time
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { startTime,
                endTime }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.endTime).toBeDefined();
            expect(error.errors.endTime.message).toBe('End time must be after start time');
        }));
        it('should fail validation when title exceeds maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { title: 'A'.repeat(101) }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.title).toBeDefined();
            expect(error.errors.title.message).toBe('Session title cannot be more than 100 characters');
        }));
        it('should fail validation when description exceeds maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { description: 'A'.repeat(501) }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.description.message).toBe('Session description cannot be more than 500 characters');
        }));
        it('should fail validation when notes exceed maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { notes: 'A'.repeat(1001) }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.notes).toBeDefined();
            expect(error.errors.notes.message).toBe('Notes cannot be more than 1000 characters');
        }));
        it('should fail validation when mood value is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { mood: {
                    before: 'invalid-mood',
                    after: 'positive'
                } }));
            let error;
            try {
                yield meditationSession.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors['mood.before']).toBeDefined();
            expect(error.errors['mood.before'].message).toContain('Mood must be one of');
        }));
    });
    describe('Virtual Properties', () => {
        it('should calculate duration in minutes correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { duration: 600 // 10 minutes in seconds
             })).save();
            expect(meditationSession.durationMinutes).toBe(10);
        }));
        it('should round duration minutes correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { duration: 590 // 9.83 minutes in seconds
             })).save();
            expect(meditationSession.durationMinutes).toBe(10); // Rounded to 10
        }));
        it('should calculate completion percentage correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(validMeditationSessionData).save();
            expect(meditationSession.completionPercentage).toBe(100);
        }));
        it('should determine streak eligibility correctly for completed sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { completed: true })).save();
            expect(meditationSession.isStreakEligible).toBe(true);
        }));
        it('should determine streak eligibility correctly for incomplete sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { completed: false })).save();
            expect(meditationSession.isStreakEligible).toBe(false);
        }));
    });
    describe('Methods', () => {
        it('should mark session as completed correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date(Date.now() - 600000); // 10 minutes ago
            const endTime = new Date();
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { startTime, duration: 300 // 5 minutes planned
             })).save();
            yield meditationSession.completeSession(endTime);
            expect(meditationSession.completed).toBe(true);
            expect(meditationSession.endTime).toEqual(endTime);
            expect(meditationSession.duration).toBe(600); // Actual duration (10 minutes)
        }));
        it('should not update duration if actual duration is negative', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() - 1000); // Invalid end time (before start)
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { startTime, duration: 300 // 5 minutes planned
             })).save();
            // Instead of trying to save an invalid endTime, just verify the validation works
            try {
                meditationSession.endTime = endTime;
                yield meditationSession.save();
                fail('Should have thrown a validation error');
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error.name).toBe('ValidationError');
                expect(error.errors.endTime).toBeDefined();
            }
            // Original duration should be preserved
            expect(meditationSession.duration).toBe(300);
        }));
        it('should process achievements for completed guided sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { completed: true })).save();
            yield meditationSession.processAchievements();
            expect(achievement_service_1.AchievementService.processMeditationAchievements).toHaveBeenCalledTimes(1);
            expect(achievement_service_1.AchievementService.processMeditationAchievements).toHaveBeenCalledWith(expect.objectContaining({
                userId: meditationSession.userId,
                sessionId: meditationSession._id,
                meditationId: meditationSession.guidedMeditationId,
                duration: meditationSession.duration
            }));
        }));
        it('should not process achievements for incomplete sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { completed: false })).save();
            yield meditationSession.processAchievements();
            expect(achievement_service_1.AchievementService.processMeditationAchievements).not.toHaveBeenCalled();
        }));
        it('should not process achievements for unguided incomplete sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditationSession = yield new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, validMeditationSessionData), { type: 'unguided', guidedMeditationId: undefined, completed: false })).save();
            yield meditationSession.processAchievements();
            expect(achievement_service_1.AchievementService.processMeditationAchievements).not.toHaveBeenCalled();
        }));
    });
});
