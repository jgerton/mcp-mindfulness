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
const mongodb_memory_server_1 = require("mongodb-memory-server");
const stress_analysis_service_1 = require("../../services/stress-analysis.service");
const stress_model_1 = require("../../models/stress.model");
const user_model_1 = require("../../models/user.model");
describe('StressAnalysisService', () => {
    let mongoServer;
    const testUserId = new mongoose_1.default.Types.ObjectId();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup MongoDB Memory Server
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        // Only connect if not already connected
        if (mongoose_1.default.connection.readyState === 0) {
            yield mongoose_1.default.connect(mongoUri);
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clear all collections
        yield stress_model_1.StressAssessment.deleteMany({});
        yield user_model_1.User.deleteMany({});
        // Create test user
        yield user_model_1.User.create({
            _id: testUserId,
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
    }));
    describe('analyzeStressData', () => {
        it('should return default values when no assessments exist', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            const result = yield stress_analysis_service_1.StressAnalysisService.analyzeStressData(testUserId);
            // Assert
            expect(result).toEqual({
                averageStressLevel: 0,
                stressTrend: 'INSUFFICIENT_DATA',
                commonTriggers: [],
                commonSymptoms: [],
                peakStressTimes: [],
                insights: ['No stress data available for the specified period.']
            });
        }));
        it('should analyze stress data correctly with multiple assessments', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange - Create stress assessments with a worsening trend
            const now = new Date();
            const dayInMs = 24 * 60 * 60 * 1000;
            yield stress_model_1.StressAssessment.create([
                {
                    userId: testUserId,
                    score: 3,
                    physicalSymptoms: 3,
                    emotionalSymptoms: 2,
                    behavioralSymptoms: 3,
                    cognitiveSymptoms: 4,
                    triggers: ['work', 'family'],
                    symptoms: ['headache', 'fatigue'],
                    timestamp: new Date(now.getTime() - 25 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 4,
                    physicalSymptoms: 4,
                    emotionalSymptoms: 3,
                    behavioralSymptoms: 4,
                    cognitiveSymptoms: 5,
                    triggers: ['work', 'health'],
                    symptoms: ['tension', 'insomnia'],
                    timestamp: new Date(now.getTime() - 20 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 5,
                    physicalSymptoms: 5,
                    emotionalSymptoms: 4,
                    behavioralSymptoms: 5,
                    cognitiveSymptoms: 6,
                    triggers: ['work', 'finances'],
                    symptoms: ['headache', 'anxiety'],
                    timestamp: new Date(now.getTime() - 15 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 6,
                    physicalSymptoms: 6,
                    emotionalSymptoms: 5,
                    behavioralSymptoms: 6,
                    cognitiveSymptoms: 7,
                    triggers: ['work', 'family'],
                    symptoms: ['headache', 'fatigue'],
                    timestamp: new Date(now.getTime() - 10 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 7,
                    physicalSymptoms: 7,
                    emotionalSymptoms: 6,
                    behavioralSymptoms: 7,
                    cognitiveSymptoms: 8,
                    triggers: ['work', 'health'],
                    symptoms: ['tension', 'insomnia'],
                    timestamp: new Date(now.getTime() - 5 * dayInMs)
                }
            ]);
            // Act
            const result = yield stress_analysis_service_1.StressAnalysisService.analyzeStressData(testUserId);
            // Assert
            expect(result.averageStressLevel).toBe(5);
            expect(result.stressTrend).toBe('WORSENING');
            expect(result.commonTriggers).toHaveLength(4);
            expect(result.commonTriggers[0].trigger).toBe('work');
            expect(result.insights.length).toBeGreaterThan(0);
        }));
        it('should respect date range parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange - Create stress assessments across different time periods
            const now = new Date();
            const dayInMs = 24 * 60 * 60 * 1000;
            yield stress_model_1.StressAssessment.create([
                {
                    userId: testUserId,
                    score: 3,
                    physicalSymptoms: 3,
                    emotionalSymptoms: 2,
                    behavioralSymptoms: 3,
                    cognitiveSymptoms: 4,
                    triggers: ['work'],
                    symptoms: ['headache'],
                    timestamp: new Date(now.getTime() - 40 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 4,
                    physicalSymptoms: 4,
                    emotionalSymptoms: 3,
                    behavioralSymptoms: 4,
                    cognitiveSymptoms: 5,
                    triggers: ['family'],
                    symptoms: ['fatigue'],
                    timestamp: new Date(now.getTime() - 30 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 8,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 8,
                    cognitiveSymptoms: 9,
                    triggers: ['finances'],
                    symptoms: ['anxiety'],
                    timestamp: new Date(now.getTime() - 20 * dayInMs)
                },
                {
                    userId: testUserId,
                    score: 9,
                    physicalSymptoms: 9,
                    emotionalSymptoms: 8,
                    behavioralSymptoms: 9,
                    cognitiveSymptoms: 10,
                    triggers: ['health'],
                    symptoms: ['insomnia'],
                    timestamp: new Date(now.getTime() - 10 * dayInMs)
                }
            ]);
            // Act - Analyze only the older assessments
            const startDate = new Date(now.getTime() - 45 * dayInMs);
            const endDate = new Date(now.getTime() - 25 * dayInMs);
            const result = yield stress_analysis_service_1.StressAnalysisService.analyzeStressData(testUserId, startDate, endDate);
            // Assert
            expect(result.averageStressLevel).toBe(3.5); // Average of 3 and 4
            expect(result.commonTriggers).toHaveLength(2);
            expect(result.commonTriggers[0].trigger).toBe('work');
            expect(result.commonTriggers[1].trigger).toBe('family');
        }));
        it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            jest.spyOn(stress_model_1.StressAssessment, 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            // Act & Assert
            yield expect(stress_analysis_service_1.StressAnalysisService.analyzeStressData(testUserId))
                .rejects.toThrow('Database error');
        }));
    });
    describe('identifyStressTriggers', () => {
        it('should return empty array when insufficient data exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange - Create just a few assessments (less than 5)
            yield stress_model_1.StressAssessment.create([
                {
                    userId: testUserId,
                    score: 7,
                    physicalSymptoms: 7,
                    emotionalSymptoms: 6,
                    behavioralSymptoms: 7,
                    cognitiveSymptoms: 8,
                    triggers: ['work', 'family'],
                    symptoms: ['headache', 'fatigue'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 5,
                    physicalSymptoms: 5,
                    emotionalSymptoms: 4,
                    behavioralSymptoms: 5,
                    cognitiveSymptoms: 6,
                    triggers: ['work', 'health'],
                    symptoms: ['tension', 'insomnia'],
                    timestamp: new Date()
                }
            ]);
            // Act
            const result = yield stress_analysis_service_1.StressAnalysisService.identifyStressTriggers(testUserId);
            // Assert
            expect(result).toEqual([]);
        }));
        it('should identify triggers correlated with high stress levels', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange - Create assessments with different triggers and stress levels
            yield stress_model_1.StressAssessment.create([
                {
                    userId: testUserId,
                    score: 9,
                    physicalSymptoms: 9,
                    emotionalSymptoms: 8,
                    behavioralSymptoms: 9,
                    cognitiveSymptoms: 10,
                    triggers: ['work', 'deadlines'],
                    symptoms: ['headache'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 8,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 8,
                    cognitiveSymptoms: 9,
                    triggers: ['work', 'meetings'],
                    symptoms: ['tension'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 8,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 8,
                    cognitiveSymptoms: 9,
                    triggers: ['deadlines', 'finances'],
                    symptoms: ['anxiety'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 4,
                    physicalSymptoms: 4,
                    emotionalSymptoms: 3,
                    behavioralSymptoms: 4,
                    cognitiveSymptoms: 5,
                    triggers: ['family', 'chores'],
                    symptoms: ['fatigue'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 3,
                    physicalSymptoms: 3,
                    emotionalSymptoms: 2,
                    behavioralSymptoms: 3,
                    cognitiveSymptoms: 4,
                    triggers: ['family', 'social'],
                    symptoms: ['mild tension'],
                    timestamp: new Date()
                }
            ]);
            // Act
            const result = yield stress_analysis_service_1.StressAnalysisService.identifyStressTriggers(testUserId);
            // Assert
            expect(result.length).toBeGreaterThan(0);
            // Work should be the highest stress trigger since it appears in more high-stress assessments
            expect(result[0].trigger).toBe('work');
            expect(result[0].averageStressLevel).toBeGreaterThanOrEqual(8);
            // Deadlines should also be a high stress trigger
            const deadlinesTrigger = result.find(t => t.trigger === 'deadlines');
            expect(deadlinesTrigger).toBeDefined();
            expect(deadlinesTrigger === null || deadlinesTrigger === void 0 ? void 0 : deadlinesTrigger.averageStressLevel).toBeGreaterThanOrEqual(8);
            // Family should be a lower stress trigger
            const familyTrigger = result.find(t => t.trigger === 'family');
            expect(familyTrigger).toBeDefined();
            expect(familyTrigger === null || familyTrigger === void 0 ? void 0 : familyTrigger.averageStressLevel).toBeLessThan(5);
        }));
        it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            jest.spyOn(stress_model_1.StressAssessment, 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            // Act
            const result = yield stress_analysis_service_1.StressAnalysisService.identifyStressTriggers(testUserId);
            // Assert
            expect(result).toEqual([]);
        }));
    });
});
