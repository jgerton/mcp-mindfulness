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
const stress_assessment_model_1 = require("../../models/stress-assessment.model");
const db_handler_1 = require("../test-utils/db-handler");
const stress_factory_1 = require("../factories/stress.factory");
const stress_types_1 = require("../../types/stress.types");
describe('StressAssessment Model', () => {
    let stressAssessmentFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        stressAssessmentFactory = new stress_factory_1.StressAssessmentTestFactory();
        jest.spyOn(stress_assessment_model_1.StressAssessment.prototype, 'save').mockImplementation(function () {
            return Promise.resolve(this);
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create and save assessment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = stressAssessmentFactory.create();
            const assessment = yield stress_assessment_model_1.StressAssessment.create(testData);
            expect(assessment.userId).toBeDefined();
            expect(assessment.level).toBe(testData.level);
            expect(assessment.physicalSymptoms).toBe(testData.physicalSymptoms);
            expect(assessment.emotionalSymptoms).toBe(testData.emotionalSymptoms);
            expect(assessment.behavioralSymptoms).toBe(testData.behavioralSymptoms);
            expect(assessment.cognitiveSymptoms).toBe(testData.cognitiveSymptoms);
        }));
        it('should handle high symptom levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = yield stress_assessment_model_1.StressAssessment.create(stressAssessmentFactory.withHighSymptoms());
            expect(assessment.physicalSymptoms).toBe(8);
            expect(assessment.emotionalSymptoms).toBe(9);
            expect(assessment.behavioralSymptoms).toBe(8);
            expect(assessment.cognitiveSymptoms).toBe(9);
            expect(assessment.score).toBe(9);
        }));
        it('should handle low symptom levels', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = yield stress_assessment_model_1.StressAssessment.create(stressAssessmentFactory.withLowSymptoms());
            expect(assessment.physicalSymptoms).toBe(2);
            expect(assessment.emotionalSymptoms).toBe(1);
            expect(assessment.behavioralSymptoms).toBe(2);
            expect(assessment.cognitiveSymptoms).toBe(1);
            expect(assessment.score).toBe(1);
        }));
    });
    describe('Error Cases', () => {
        it('should fail when required fields are missing', () => {
            expect(() => new stress_assessment_model_1.StressAssessment({})).toThrow();
        });
        it('should reject invalid stress level', () => {
            expect(() => new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.create({
                level: 'INVALID_LEVEL'
            }))).toThrow();
        });
        it('should reject invalid symptom scores', () => {
            expect(() => new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.create({
                physicalSymptoms: 11,
                emotionalSymptoms: 11,
                behavioralSymptoms: 11,
                cognitiveSymptoms: 11
            }))).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle minimum symptom scores', () => {
            expect(() => new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.withLowSymptoms())).not.toThrow();
        });
        it('should handle maximum symptom scores', () => {
            expect(() => new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.withHighSymptoms())).not.toThrow();
        });
        it('should handle all stress levels', () => {
            Object.values(stress_types_1.StressLevel).forEach(level => {
                expect(() => new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.withLevel(level))).not.toThrow();
            });
        });
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = new stress_assessment_model_1.StressAssessment({});
            const validationError = yield assessment.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.level).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.physicalSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.emotionalSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.behavioralSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.cognitiveSymptoms).toBeDefined();
        }));
        it('should validate symptom score ranges', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.create({
                physicalSymptoms: 11,
                emotionalSymptoms: 11,
                behavioralSymptoms: 11,
                cognitiveSymptoms: 11
            }));
            const validationError = yield assessment.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.physicalSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.emotionalSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.behavioralSymptoms).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.cognitiveSymptoms).toBeDefined();
        }));
        it('should validate stress level enum', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = new stress_assessment_model_1.StressAssessment(stressAssessmentFactory.create({
                level: 'INVALID_LEVEL'
            }));
            const validationError = yield assessment.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.level).toBeDefined();
        }));
    });
    describe('Data Integrity', () => {
        it('should set timestamps', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = yield stress_assessment_model_1.StressAssessment.create(stressAssessmentFactory.create());
            expect(assessment.timestamp).toBeDefined();
            expect(assessment.timestamp).toBeInstanceOf(Date);
        }));
        it('should calculate score correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const assessment = yield stress_assessment_model_1.StressAssessment.create(stressAssessmentFactory.create({
                physicalSymptoms: 5,
                emotionalSymptoms: 7,
                behavioralSymptoms: 3,
                cognitiveSymptoms: 6
            }));
            // Average of all symptom scores, rounded
            expect(assessment.score).toBe(5);
        }));
    });
});
