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
const stress_assessment_model_1 = require("../../models/stress-assessment.model");
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
describe('StressAssessment Model', () => {
    const userId = new mongoose_1.default.Types.ObjectId();
    const validStressAssessmentData = {
        userId,
        date: new Date(),
        stressLevel: 6,
        physicalSymptoms: ['Headache', 'Muscle tension'],
        emotionalSymptoms: ['Anxiety', 'Irritability'],
        triggers: ['Work deadline', 'Lack of sleep']
    };
    describe('Schema Validation', () => {
        it('should create a valid stress assessment', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(validStressAssessmentData);
            const savedStressAssessment = yield stressAssessment.save();
            expect(savedStressAssessment._id).toBeDefined();
            expect(savedStressAssessment.userId.toString()).toBe(userId.toString());
            expect(savedStressAssessment.date).toEqual(validStressAssessmentData.date);
            expect(savedStressAssessment.stressLevel).toBe(validStressAssessmentData.stressLevel);
            expect(savedStressAssessment.physicalSymptoms).toEqual(validStressAssessmentData.physicalSymptoms);
            expect(savedStressAssessment.emotionalSymptoms).toEqual(validStressAssessmentData.emotionalSymptoms);
            expect(savedStressAssessment.triggers).toEqual(validStressAssessmentData.triggers);
            expect(savedStressAssessment.createdAt).toBeDefined();
            expect(savedStressAssessment.updatedAt).toBeDefined();
        }));
        it('should set default values correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment({
                userId,
                stressLevel: 5,
                physicalSymptoms: ['Headache'],
                emotionalSymptoms: ['Anxiety'],
                triggers: ['Work deadline']
            });
            const savedStressAssessment = yield stressAssessment.save();
            expect(savedStressAssessment.date).toBeDefined();
            expect(savedStressAssessment.date instanceof Date).toBe(true);
        }));
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment({});
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.stressLevel).toBeDefined();
        }));
        it('should fail validation when stressLevel is below minimum', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { stressLevel: 0 }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevel).toBeDefined();
            expect(error.errors.stressLevel.message).toBe('Stress level must be at least 1');
        }));
        it('should fail validation when stressLevel exceeds maximum', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { stressLevel: 11 }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.stressLevel).toBeDefined();
            expect(error.errors.stressLevel.message).toBe('Stress level cannot exceed 10');
        }));
        it('should fail validation when too many physical symptoms are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { physicalSymptoms: Array(11).fill('Symptom') }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.physicalSymptoms).toBeDefined();
            expect(error.errors.physicalSymptoms.message).toBe('Cannot have more than 10 physical symptoms');
        }));
        it('should fail validation when too many emotional symptoms are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { emotionalSymptoms: Array(11).fill('Symptom') }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.emotionalSymptoms).toBeDefined();
            expect(error.errors.emotionalSymptoms.message).toBe('Cannot have more than 10 emotional symptoms');
        }));
        it('should fail validation when too many triggers are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { triggers: Array(6).fill('Trigger') }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.triggers).toBeDefined();
            expect(error.errors.triggers.message).toBe('Cannot have more than 5 triggers');
        }));
        it('should fail validation when notes exceed maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { notes: 'A'.repeat(1001) }));
            let error;
            try {
                yield stressAssessment.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.notes).toBeDefined();
            expect(error.errors.notes.message).toBe('Notes cannot be more than 1000 characters');
        }));
    });
    describe('Virtual Properties', () => {
        it('should calculate low stress category correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = yield new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { stressLevel: 3 })).save();
            // Use type assertion to access virtual property
            expect(stressAssessment.stressCategory).toBe('low');
        }));
        it('should calculate moderate stress category correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = yield new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { stressLevel: 6 })).save();
            expect(stressAssessment.stressCategory).toBe('moderate');
        }));
        it('should calculate high stress category correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const stressAssessment = yield new stress_assessment_model_1.StressAssessment(Object.assign(Object.assign({}, validStressAssessmentData), { stressLevel: 8 })).save();
            expect(stressAssessment.stressCategory).toBe('high');
        }));
    });
    describe('Static Methods', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple stress assessments for testing
            yield stress_assessment_model_1.StressAssessment.create([
                {
                    userId,
                    date: new Date('2023-06-01'),
                    stressLevel: 3,
                    physicalSymptoms: ['Headache'],
                    emotionalSymptoms: ['Anxiety'],
                    triggers: ['Work']
                },
                {
                    userId,
                    date: new Date('2023-06-05'),
                    stressLevel: 7,
                    physicalSymptoms: ['Muscle tension'],
                    emotionalSymptoms: ['Irritability'],
                    triggers: ['Lack of sleep']
                },
                {
                    userId,
                    date: new Date('2023-06-10'),
                    stressLevel: 5,
                    physicalSymptoms: ['Fatigue'],
                    emotionalSymptoms: ['Worry'],
                    triggers: ['Financial concerns']
                }
            ]);
        }));
        it('should calculate average stress level correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const startDate = new Date('2023-06-01');
            const endDate = new Date('2023-06-10');
            const result = yield stress_assessment_model_1.StressAssessment.getAverageStressLevel(userId, startDate, endDate);
            expect(result.averageStressLevel).toBe(5); // (3 + 7 + 5) / 3 = 5
            expect(result.count).toBe(3);
        }));
        it('should return zero for average when no assessments exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const differentUserId = new mongoose_1.default.Types.ObjectId();
            const startDate = new Date('2023-06-01');
            const endDate = new Date('2023-06-10');
            const result = yield stress_assessment_model_1.StressAssessment.getAverageStressLevel(differentUserId, startDate, endDate);
            expect(result.averageStressLevel).toBe(0);
            expect(result.count).toBe(0);
        }));
        it('should filter by date range correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const startDate = new Date('2023-06-02');
            const endDate = new Date('2023-06-07');
            const result = yield stress_assessment_model_1.StressAssessment.getAverageStressLevel(userId, startDate, endDate);
            expect(result.averageStressLevel).toBe(7); // Only the second assessment is in range
            expect(result.count).toBe(1);
        }));
    });
});
