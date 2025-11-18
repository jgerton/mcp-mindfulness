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
const test_db_1 = require("../utils/test-db");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.connect)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.closeDatabase)();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.clearDatabase)();
}));
describe('StressManagementSession Model', () => {
    const userId = new mongoose_1.default.Types.ObjectId();
    const validSessionData = {
        userId,
        startTime: new Date(),
        duration: 600, // 10 minutes in seconds
        status: base_wellness_session_model_1.WellnessSessionStatus.Active,
        technique: stress_management_session_model_1.StressManagementTechnique.DeepBreathing,
        stressLevelBefore: 7,
        triggers: ['Work deadline', 'Lack of sleep'],
        physicalSymptoms: ['Headache', 'Muscle tension'],
        emotionalSymptoms: ['Anxiety', 'Irritability']
    };
    describe('Schema Validation', () => {
        it('should create a valid stress management session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(validSessionData);
            const savedSession = yield session.save();
            expect(savedSession._id).toBeDefined();
            expect(savedSession.userId.toString()).toBe(userId.toString());
            expect(savedSession.startTime).toEqual(validSessionData.startTime);
            expect(savedSession.duration).toBe(validSessionData.duration);
            expect(savedSession.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
            expect(savedSession.technique).toBe(stress_management_session_model_1.StressManagementTechnique.DeepBreathing);
            expect(savedSession.stressLevelBefore).toBe(7);
            expect(savedSession.triggers).toEqual(['Work deadline', 'Lack of sleep']);
            expect(savedSession.physicalSymptoms).toEqual(['Headache', 'Muscle tension']);
            expect(savedSession.emotionalSymptoms).toEqual(['Anxiety', 'Irritability']);
            expect(savedSession.createdAt).toBeDefined();
            expect(savedSession.updatedAt).toBeDefined();
        }));
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession({});
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.startTime).toBeDefined();
            expect(error.errors.duration).toBeDefined();
            expect(error.errors.technique).toBeDefined();
            expect(error.errors.stressLevelBefore).toBeDefined();
        }));
        it('should fail validation when stressLevelBefore is below minimum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelBefore: 0 }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevelBefore).toBeDefined();
            expect(error.errors.stressLevelBefore.message).toBe('Stress level must be at least 1');
        }));
        it('should fail validation when stressLevelBefore exceeds maximum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelBefore: 11 }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevelBefore).toBeDefined();
            expect(error.errors.stressLevelBefore.message).toBe('Stress level cannot exceed 10');
        }));
        it('should fail validation when stressLevelAfter is below minimum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelAfter: 0 }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevelAfter).toBeDefined();
            expect(error.errors.stressLevelAfter.message).toBe('Stress level must be at least 1');
        }));
        it('should fail validation when stressLevelAfter exceeds maximum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelAfter: 11 }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevelAfter).toBeDefined();
            expect(error.errors.stressLevelAfter.message).toBe('Stress level cannot exceed 10');
        }));
        it('should fail validation when too many triggers are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { triggers: Array(6).fill('Trigger') }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.triggers).toBeDefined();
            expect(error.errors.triggers.message).toBe('Cannot have more than 5 triggers');
        }));
        it('should fail validation when too many physical symptoms are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { physicalSymptoms: Array(11).fill('Symptom') }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.physicalSymptoms).toBeDefined();
            expect(error.errors.physicalSymptoms.message).toBe('Cannot have more than 10 physical symptoms');
        }));
        it('should fail validation when too many emotional symptoms are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { emotionalSymptoms: Array(11).fill('Symptom') }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.emotionalSymptoms).toBeDefined();
            expect(error.errors.emotionalSymptoms.message).toBe('Cannot have more than 10 emotional symptoms');
        }));
        it('should fail validation when feedback effectiveness rating is below minimum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { feedback: {
                    effectivenessRating: 0,
                    stressReductionRating: 3,
                    comments: 'Test comment',
                    improvements: ['Test improvement']
                } }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors['feedback.effectivenessRating']).toBeDefined();
            expect(error.errors['feedback.effectivenessRating'].message).toBe('Effectiveness rating must be at least 1');
        }));
        it('should fail validation when feedback effectiveness rating exceeds maximum', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { feedback: {
                    effectivenessRating: 6,
                    stressReductionRating: 3,
                    comments: 'Test comment',
                    improvements: ['Test improvement']
                } }));
            let error;
            try {
                yield session.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors['feedback.effectivenessRating']).toBeDefined();
            expect(error.errors['feedback.effectivenessRating'].message).toBe('Effectiveness rating cannot exceed 5');
        }));
    });
    describe('Virtual Properties', () => {
        it('should calculate stress reduction correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelBefore: 8, stressLevelAfter: 3, status: base_wellness_session_model_1.WellnessSessionStatus.Completed })).save();
            // Use type assertion to access virtual property
            expect(session.stressReduction).toBe(5);
        }));
        it('should return 0 for stress reduction when stressLevelAfter is not set', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelBefore: 8 })).save();
            expect(session.stressReduction).toBe(0);
        }));
        it('should return 0 for stress reduction when stress level increased', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { stressLevelBefore: 5, stressLevelAfter: 7 })).save();
            expect(session.stressReduction).toBe(0);
        }));
    });
    describe('Instance Methods', () => {
        it('should complete a session correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(validSessionData).save();
            const endTime = new Date();
            // Use the complete method from the base class instead of completeSession
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            session.stressLevelAfter = 3;
            yield session.save();
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(session.stressLevelAfter).toBe(3);
            expect(session.endTime).toBeDefined();
            expect(session.stressReduction).toBe(4);
        }));
        it('should throw an error when completing an already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, endTime: new Date() })).save();
            let error;
            try {
                yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.message).toContain('Cannot complete session');
        }));
        it('should add feedback to a completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new session without feedback
            const session = new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, endTime: new Date(), stressLevelAfter: 3, 
                // Explicitly set feedback to undefined
                feedback: undefined }));
            // Save without feedback
            yield session.save();
            // Create a new session from the database to ensure clean state
            const retrievedSession = yield stress_management_session_model_1.StressManagementSession.findById(session._id);
            expect(retrievedSession).not.toBeNull();
            const feedback = {
                effectivenessRating: 4,
                stressReductionRating: 5,
                comments: 'Very helpful technique',
                improvements: ['Could be longer']
            };
            // Add feedback to the retrieved session
            const updatedSession = yield retrievedSession.addFeedback(feedback);
            expect(updatedSession.feedback).toBeDefined();
            expect(updatedSession.feedback.effectivenessRating).toBe(4);
            expect(updatedSession.feedback.stressReductionRating).toBe(5);
            expect(updatedSession.feedback.comments).toBe('Very helpful technique');
            expect(updatedSession.feedback.improvements).toEqual(['Could be longer']);
        }));
        it('should throw an error when adding feedback to a non-completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(validSessionData).save();
            const feedback = {
                effectivenessRating: 4,
                stressReductionRating: 5,
                comments: 'Very helpful technique',
                improvements: ['Could be longer']
            };
            let error;
            try {
                yield session.addFeedback(feedback);
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.message).toBe('Feedback can only be added to completed sessions');
        }));
        it('should throw an error when adding feedback to a session that already has feedback', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield new stress_management_session_model_1.StressManagementSession(Object.assign(Object.assign({}, validSessionData), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, endTime: new Date(), stressLevelAfter: 3, feedback: {
                    effectivenessRating: 3,
                    stressReductionRating: 3,
                    comments: 'Existing feedback',
                    improvements: []
                } })).save();
            const newFeedback = {
                effectivenessRating: 4,
                stressReductionRating: 5,
                comments: 'New feedback',
                improvements: ['Could be longer']
            };
            let error;
            try {
                yield session.addFeedback(newFeedback);
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.message).toBe('Feedback has already been provided for this session');
        }));
    });
    describe('Pre-save Middleware', () => {
        it('should set stressLevelAfter to stressLevelBefore when completing without specifying after level', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new stress_management_session_model_1.StressManagementSession(validSessionData);
            session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
            session.endTime = new Date();
            const savedSession = yield session.save();
            expect(savedSession.stressLevelAfter).toBe(savedSession.stressLevelBefore);
        }));
    });
});
