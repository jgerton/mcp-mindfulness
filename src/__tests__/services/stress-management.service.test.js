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
const stress_management_service_1 = require("../../services/stress-management.service");
const stress_model_1 = require("../../models/stress.model");
const stress_types_1 = require("../../types/stress.types");
const db_handler_1 = require("../test-utils/db-handler");
jest.mock('../../models/stress.model');
describe('StressManagementService', () => {
    const mockUserId = new mongoose_1.default.Types.ObjectId().toString();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.connect();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.clearDatabase();
        jest.clearAllMocks();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.clearDatabase();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.closeDatabase();
    }));
    describe('Stress Assessment', () => {
        describe('Success Cases', () => {
            it('should successfully assess high stress level', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: mockUserId,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 6,
                    cognitiveSymptoms: 7
                };
                const result = yield stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, assessment);
                expect(result).toBe(stress_types_1.StressLevel.HIGH);
            }));
            it('should successfully assess low stress level', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: mockUserId,
                    physicalSymptoms: 2,
                    emotionalSymptoms: 1,
                    behavioralSymptoms: 1,
                    cognitiveSymptoms: 2
                };
                const result = yield stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, assessment);
                expect(result).toBe(stress_types_1.StressLevel.LOW);
            }));
        });
        describe('Error Cases', () => {
            it('should throw error for missing user ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: '',
                    physicalSymptoms: 5,
                    emotionalSymptoms: 5,
                    behavioralSymptoms: 5,
                    cognitiveSymptoms: 5
                };
                yield expect(stress_management_service_1.StressManagementService.assessStressLevel('', assessment))
                    .rejects.toThrow('User ID is required for stress assessment');
            }));
            it('should throw error for invalid assessment data', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidAssessment = null;
                yield expect(stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, invalidAssessment))
                    .rejects.toThrow('Assessment data is required');
            }));
        });
        describe('Edge Cases', () => {
            it('should handle maximum symptom values', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: mockUserId,
                    physicalSymptoms: 10,
                    emotionalSymptoms: 10,
                    behavioralSymptoms: 10,
                    cognitiveSymptoms: 10
                };
                const result = yield stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, assessment);
                expect(result).toBe(stress_types_1.StressLevel.HIGH);
            }));
            it('should handle minimum symptom values', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: mockUserId,
                    physicalSymptoms: 0,
                    emotionalSymptoms: 0,
                    behavioralSymptoms: 0,
                    cognitiveSymptoms: 0
                };
                const result = yield stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, assessment);
                expect(result).toBe(stress_types_1.StressLevel.LOW);
            }));
            it('should handle missing symptom values with defaults', () => __awaiter(void 0, void 0, void 0, function* () {
                const assessment = {
                    userId: mockUserId,
                    physicalSymptoms: 5
                };
                const result = yield stress_management_service_1.StressManagementService.assessStressLevel(mockUserId, assessment);
                expect([stress_types_1.StressLevel.LOW, stress_types_1.StressLevel.MODERATE, stress_types_1.StressLevel.HIGH]).toContain(result);
            }));
        });
    });
    describe('Stress Recommendations', () => {
        describe('Success Cases', () => {
            it('should successfully return recommendations based on preferences', () => __awaiter(void 0, void 0, void 0, function* () {
                yield stress_model_1.UserPreferences.create({
                    userId: mockUserId,
                    preferredTechniques: [stress_types_1.TechniqueType.BREATHING, stress_types_1.TechniqueType.MEDITATION],
                    preferredDuration: 15,
                    timePreferences: {
                        reminderFrequency: 'DAILY',
                        preferredTimes: ['09:00', '18:00']
                    }
                });
                const recommendations = yield stress_management_service_1.StressManagementService.getRecommendations(mockUserId, stress_types_1.StressLevel.HIGH);
                expect(recommendations).toBeInstanceOf(Array);
                expect(recommendations.length).toBeGreaterThan(0);
                recommendations.forEach(rec => {
                    expect(rec).toHaveProperty('duration');
                    expect(rec).toHaveProperty('technique');
                    expect(rec).toHaveProperty('type');
                    expect(rec).toHaveProperty('title');
                    expect(rec).toHaveProperty('description');
                });
            }));
        });
        describe('Error Cases', () => {
            it('should throw error for invalid user ID', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.getRecommendations('invalid-id'))
                    .rejects.toThrow('Invalid user ID format');
            }));
        });
        describe('Edge Cases', () => {
            it('should handle user with no preferences', () => __awaiter(void 0, void 0, void 0, function* () {
                const newUserId = new mongoose_1.default.Types.ObjectId().toString();
                const recommendations = yield stress_management_service_1.StressManagementService.getRecommendations(newUserId, stress_types_1.StressLevel.MODERATE);
                expect(recommendations).toBeInstanceOf(Array);
                expect(recommendations.length).toBeGreaterThan(0);
                expect(recommendations[0].duration).toBeGreaterThan(0);
            }));
            it('should handle all stress levels', () => __awaiter(void 0, void 0, void 0, function* () {
                for (const level of Object.values(stress_types_1.StressLevel)) {
                    const recommendations = yield stress_management_service_1.StressManagementService.getRecommendations(mockUserId, level);
                    expect(recommendations).toBeInstanceOf(Array);
                    expect(recommendations.length).toBeGreaterThan(0);
                }
            }));
        });
    });
    describe('Stress Change Tracking', () => {
        describe('Success Cases', () => {
            it('should successfully record stress change', () => __awaiter(void 0, void 0, void 0, function* () {
                const consoleSpy = jest.spyOn(console, 'log');
                yield stress_management_service_1.StressManagementService.recordStressChange(mockUserId, stress_types_1.StressLevel.HIGH, stress_types_1.StressLevel.MODERATE, 'breathing_exercise');
                expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`User ${mockUserId} stress change: HIGH -> MODERATE using breathing_exercise`));
            }));
        });
        describe('Error Cases', () => {
            it('should throw error for missing parameters', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.recordStressChange(mockUserId, stress_types_1.StressLevel.HIGH, undefined, 'breathing_exercise')).rejects.toThrow('Missing required parameters for recordStressChange');
            }));
        });
        describe('Edge Cases', () => {
            it('should handle all stress level combinations', () => __awaiter(void 0, void 0, void 0, function* () {
                const levels = Object.values(stress_types_1.StressLevel);
                for (const before of levels) {
                    for (const after of levels) {
                        yield stress_management_service_1.StressManagementService.recordStressChange(mockUserId, before, after, 'test_technique');
                    }
                }
            }));
        });
    });
    describe('Stress History and Analytics', () => {
        describe('Success Cases', () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                const now = new Date();
                const assessments = [
                    { userId: mockUserId, level: stress_types_1.StressLevel.HIGH, score: 8, timestamp: now },
                    { userId: mockUserId, level: stress_types_1.StressLevel.LOW, score: 2, timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
                ];
                yield stress_model_1.StressAssessmentLegacy.insertMany(assessments);
            }));
            it('should return stress history', () => __awaiter(void 0, void 0, void 0, function* () {
                const history = yield stress_management_service_1.StressManagementService.getStressHistory(mockUserId);
                expect(history).toHaveLength(2);
                expect(history[0].level).toBe(stress_types_1.StressLevel.HIGH);
                expect(history[1].level).toBe(stress_types_1.StressLevel.LOW);
            }));
            it('should return correct analytics', () => __awaiter(void 0, void 0, void 0, function* () {
                const analytics = yield stress_management_service_1.StressManagementService.getStressAnalytics(mockUserId);
                expect(analytics).toHaveProperty('averageLevel');
                expect(analytics).toHaveProperty('trendAnalysis');
                expect(analytics).toHaveProperty('peakStressTimes');
            }));
            it('should identify correct patterns', () => __awaiter(void 0, void 0, void 0, function* () {
                const patterns = yield stress_management_service_1.StressManagementService.getStressPatterns(mockUserId);
                expect(patterns).toHaveProperty('weekdayPatterns');
                expect(patterns).toHaveProperty('timeOfDayPatterns');
                expect(patterns).toHaveProperty('commonTriggers');
            }));
            it('should identify peak stress hours', () => __awaiter(void 0, void 0, void 0, function* () {
                const peakHours = yield stress_management_service_1.StressManagementService.getPeakStressHours(mockUserId);
                expect(Array.isArray(peakHours)).toBe(true);
                expect(peakHours.length).toBeGreaterThan(0);
            }));
        });
        describe('Error Cases', () => {
            it('should throw error for invalid user ID in stress history', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.getStressHistory('invalid-id'))
                    .rejects.toThrow('Invalid user ID format');
            }));
            it('should throw error for invalid user ID in analytics', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.getStressAnalytics('invalid-id'))
                    .rejects.toThrow('Invalid user ID format');
            }));
            it('should throw error for invalid user ID in patterns', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.getStressPatterns('invalid-id'))
                    .rejects.toThrow('Invalid user ID format');
            }));
            it('should throw error for invalid user ID in peak hours', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_management_service_1.StressManagementService.getPeakStressHours('invalid-id'))
                    .rejects.toThrow('Invalid user ID format');
            }));
        });
        describe('Edge Cases', () => {
            it('should handle empty history', () => __awaiter(void 0, void 0, void 0, function* () {
                const history = yield stress_management_service_1.StressManagementService.getStressHistory(mockUserId);
                expect(history).toHaveLength(0);
            }));
            it('should handle no assessments in analytics', () => __awaiter(void 0, void 0, void 0, function* () {
                const analytics = yield stress_management_service_1.StressManagementService.getStressAnalytics(mockUserId);
                expect(analytics.averageLevel).toBe(0);
                expect(analytics.trendAnalysis).toBe('STABLE');
                expect(analytics.peakStressTimes).toBeInstanceOf(Array);
            }));
            it('should handle no assessments in patterns', () => __awaiter(void 0, void 0, void 0, function* () {
                const patterns = yield stress_management_service_1.StressManagementService.getStressPatterns(mockUserId);
                expect(patterns.weekdayPatterns).toBeDefined();
                expect(patterns.timeOfDayPatterns).toBeDefined();
                expect(patterns.commonTriggers).toBeDefined();
            }));
            it('should handle no assessments in peak hours', () => __awaiter(void 0, void 0, void 0, function* () {
                const peakHours = yield stress_management_service_1.StressManagementService.getPeakStressHours(mockUserId);
                expect(Array.isArray(peakHours)).toBe(true);
                expect(peakHours.length).toBe(0);
            }));
        });
    });
});
