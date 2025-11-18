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
const stress_management_session_model_1 = require("../../models/stress-management-session.model");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_handler_1 = require("../test-utils/db-handler");
const stress_management_session_factory_1 = require("../factories/stress-management-session.factory");
describe('StressManagementSession Model', () => {
    let factory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
        factory = new stress_management_session_factory_1.StressManagementSessionTestFactory();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    describe('Schema Validation', () => {
        it('should create a valid stress management session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create();
            const savedSession = yield stress_management_session_model_1.StressManagementSession.create(session);
            expect(savedSession._id).toBeDefined();
            expect(savedSession.technique).toBe(session.technique);
            expect(savedSession.stressLevelBefore).toBe(session.stressLevelBefore);
        }));
        it('should require technique', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({ technique: undefined });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
        it('should require stressLevelBefore', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({ stressLevelBefore: undefined });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
        it('should validate technique enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({ technique: 'invalid' });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
        it('should validate stress level ranges', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({
                stressLevelBefore: 11,
                stressLevelAfter: 0
            });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
        it('should validate triggers array length', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({
                triggers: Array(6).fill('trigger')
            });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
        it('should validate symptoms array lengths', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.create({
                physicalSymptoms: Array(11).fill('symptom'),
                emotionalSymptoms: Array(11).fill('symptom')
            });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
    });
    describe('Virtual Fields', () => {
        it('should calculate stress reduction correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withStressLevels(8, 4));
            expect(session.stressReduction).toBe(4);
        }));
        it('should return 0 stress reduction when levels are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.create({ stressLevelAfter: undefined }));
            expect(session.stressReduction).toBe(0);
        }));
        it('should not return negative stress reduction', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withStressLevels(4, 8));
            expect(session.stressReduction).toBe(0);
        }));
    });
    describe('Methods', () => {
        it('should add feedback to completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.completed());
            const feedback = {
                effectivenessRating: 4,
                stressReductionRating: 4,
                comments: 'Very helpful',
                improvements: ['More guided options']
            };
            yield session.addFeedback(feedback);
            expect(session.feedback).toEqual(feedback);
        }));
        it('should not add feedback to incomplete session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.create({ status: base_wellness_session_model_1.WellnessSessionStatus.InProgress }));
            const feedback = {
                effectivenessRating: 4,
                stressReductionRating: 4,
                comments: 'Very helpful',
                improvements: []
            };
            yield expect(session.addFeedback(feedback)).rejects.toThrow();
        }));
        it('should not add feedback when feedback already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withFeedback());
            const newFeedback = {
                effectivenessRating: 5,
                stressReductionRating: 5,
                comments: 'New feedback',
                improvements: []
            };
            yield expect(session.addFeedback(newFeedback)).rejects.toThrow();
        }));
        it('should process achievements for completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.completed());
            const processAchievementsSpy = jest.spyOn(session, 'processAchievements');
            yield session.save();
            expect(processAchievementsSpy).toHaveBeenCalled();
        }));
    });
    describe('Pre-save Middleware', () => {
        it('should copy stressLevelBefore to stressLevelAfter if not set on completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.create({
                status: base_wellness_session_model_1.WellnessSessionStatus.InProgress,
                stressLevelBefore: 7,
                stressLevelAfter: undefined
            }));
            session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
            yield session.save();
            expect(session.stressLevelAfter).toBe(session.stressLevelBefore);
        }));
    });
    describe('Indexes', () => {
        it('should have compound indexes', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield stress_management_session_model_1.StressManagementSession.collection.getIndexes();
            const hasUserStartTimeIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.startTime === -1);
            const hasUserTechniqueIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.technique === 1);
            const hasUserStatusIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.status === 1);
            expect(hasUserStartTimeIndex).toBe(true);
            expect(hasUserTechniqueIndex).toBe(true);
            expect(hasUserStatusIndex).toBe(true);
        }));
    });
    describe('Technique-specific Behavior', () => {
        it('should create guided imagery session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withTechnique(stress_management_session_model_1.StressManagementTechnique.GuidedImagery));
            expect(session.technique).toBe(stress_management_session_model_1.StressManagementTechnique.GuidedImagery);
        }));
        it('should create deep breathing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withTechnique(stress_management_session_model_1.StressManagementTechnique.DeepBreathing));
            expect(session.technique).toBe(stress_management_session_model_1.StressManagementTechnique.DeepBreathing);
        }));
        it('should create PMR session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withTechnique(stress_management_session_model_1.StressManagementTechnique.ProgressiveMuscleRelaxation));
            expect(session.technique).toBe(stress_management_session_model_1.StressManagementTechnique.ProgressiveMuscleRelaxation);
        }));
    });
    describe('Symptoms and Triggers', () => {
        it('should store and retrieve symptoms', () => __awaiter(void 0, void 0, void 0, function* () {
            const physical = ['headache', 'tension'];
            const emotional = ['anxiety', 'irritability'];
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withSymptoms(physical, emotional));
            expect(session.physicalSymptoms).toEqual(physical);
            expect(session.emotionalSymptoms).toEqual(emotional);
        }));
        it('should store and retrieve triggers', () => __awaiter(void 0, void 0, void 0, function* () {
            const triggers = ['work stress', 'deadlines', 'conflicts'];
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withTriggers(triggers));
            expect(session.triggers).toEqual(triggers);
        }));
    });
    describe('Feedback Management', () => {
        it('should store and retrieve feedback', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield stress_management_session_model_1.StressManagementSession.create(factory.withFeedback({
                effectivenessRating: 5,
                stressReductionRating: 4,
                comments: 'Very effective technique',
                improvements: ['More variety', 'Longer sessions']
            }));
            expect(session.feedback).toBeDefined();
            expect(session.feedback.effectivenessRating).toBe(5);
            expect(session.feedback.stressReductionRating).toBe(4);
            expect(session.feedback.improvements).toHaveLength(2);
        }));
        it('should validate feedback ratings', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = factory.withFeedback({
                effectivenessRating: 6,
                stressReductionRating: 0
            });
            yield expect(stress_management_session_model_1.StressManagementSession.create(session)).rejects.toThrow();
        }));
    });
});
