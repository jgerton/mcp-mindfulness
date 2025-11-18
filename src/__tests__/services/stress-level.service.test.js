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
const stress_level_service_1 = require("../../services/stress-level.service");
const stress_log_model_1 = require("../../models/stress-log.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('StressLevelService', () => {
    let testUserId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testUserId = new mongoose_1.default.Types.ObjectId().toString();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('getUserStressLevels', () => {
        describe('Success Cases', () => {
            it('should get all stress levels for a user', () => __awaiter(void 0, void 0, void 0, function* () {
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date('2024-01-01'),
                        level: 5,
                        triggers: ['work'],
                        symptoms: ['headache'],
                        notes: 'Test note 1'
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date('2024-01-02'),
                        level: 3,
                        triggers: ['family'],
                        symptoms: ['anxiety'],
                        notes: 'Test note 2'
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const result = yield stress_level_service_1.StressLevelService.getUserStressLevels(testUserId);
                expect(result).toHaveLength(2);
                expect(result[0].level).toBe(3); // Most recent first
                expect(result[1].level).toBe(5);
            }));
            it('should filter stress levels by date range', () => __awaiter(void 0, void 0, void 0, function* () {
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date('2024-01-01'),
                        level: 5
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date('2024-02-01'),
                        level: 3
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date('2024-03-01'),
                        level: 4
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const result = yield stress_level_service_1.StressLevelService.getUserStressLevels(testUserId, new Date('2024-01-15'), new Date('2024-02-15'));
                expect(result).toHaveLength(1);
                expect(result[0].level).toBe(3);
            }));
        });
        describe('Error Cases', () => {
            it('should handle invalid user ID format', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_level_service_1.StressLevelService.getUserStressLevels('invalid-id')).rejects.toThrow();
            }));
        });
        describe('Edge Cases', () => {
            it('should return empty array for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield stress_level_service_1.StressLevelService.getUserStressLevels(new mongoose_1.default.Types.ObjectId().toString());
                expect(result).toHaveLength(0);
            }));
            it('should handle empty date range', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield stress_level_service_1.StressLevelService.getUserStressLevels(testUserId, new Date('2024-01-01'), new Date('2024-01-01'));
                expect(result).toHaveLength(0);
            }));
        });
    });
    describe('getAverageStressLevel', () => {
        describe('Success Cases', () => {
            it('should calculate correct average stress level', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: today,
                        level: 5
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
                        level: 3
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                        level: 4
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const average = yield stress_level_service_1.StressLevelService.getAverageStressLevel(testUserId, 30);
                expect(average).toBe(4.0);
            }));
        });
        describe('Error Cases', () => {
            it('should handle invalid days parameter', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_level_service_1.StressLevelService.getAverageStressLevel(testUserId, -1)).rejects.toThrow();
            }));
        });
        describe('Edge Cases', () => {
            it('should return 0 for no stress logs', () => __awaiter(void 0, void 0, void 0, function* () {
                const average = yield stress_level_service_1.StressLevelService.getAverageStressLevel(testUserId);
                expect(average).toBe(0);
            }));
            it('should only include stress levels within specified days', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: today,
                        level: 5
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000),
                        level: 3
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const average = yield stress_level_service_1.StressLevelService.getAverageStressLevel(testUserId, 30);
                expect(average).toBe(5.0);
            }));
        });
    });
    describe('createStressLog', () => {
        describe('Success Cases', () => {
            it('should create stress log with all fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const logData = {
                    date: new Date('2024-01-01'),
                    level: 5,
                    triggers: ['work', 'deadlines'],
                    symptoms: ['headache', 'anxiety'],
                    notes: 'Feeling overwhelmed'
                };
                const result = yield stress_level_service_1.StressLevelService.createStressLog(testUserId, logData);
                expect(result.userId.toString()).toBe(testUserId);
                expect(result.level).toBe(5);
                expect(result.triggers).toEqual(['work', 'deadlines']);
                expect(result.symptoms).toEqual(['headache', 'anxiety']);
                expect(result.notes).toBe('Feeling overwhelmed');
            }));
            it('should create stress log with minimal fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const logData = {
                    level: 3
                };
                const result = yield stress_level_service_1.StressLevelService.createStressLog(testUserId, logData);
                expect(result.userId.toString()).toBe(testUserId);
                expect(result.level).toBe(3);
                expect(result.triggers).toEqual([]);
                expect(result.symptoms).toEqual([]);
                expect(result.date).toBeDefined();
            }));
        });
        describe('Error Cases', () => {
            it('should throw error for invalid stress level', () => __awaiter(void 0, void 0, void 0, function* () {
                const logData = {
                    level: 11
                };
                yield expect(stress_level_service_1.StressLevelService.createStressLog(testUserId, logData)).rejects.toThrow();
            }));
            it('should throw error for missing level', () => __awaiter(void 0, void 0, void 0, function* () {
                const logData = {
                    triggers: ['work']
                };
                yield expect(stress_level_service_1.StressLevelService.createStressLog(testUserId, logData)).rejects.toThrow();
            }));
        });
        describe('Edge Cases', () => {
            it('should handle empty arrays for triggers and symptoms', () => __awaiter(void 0, void 0, void 0, function* () {
                const logData = {
                    level: 5,
                    triggers: [],
                    symptoms: []
                };
                const result = yield stress_level_service_1.StressLevelService.createStressLog(testUserId, logData);
                expect(result.triggers).toEqual([]);
                expect(result.symptoms).toEqual([]);
            }));
        });
    });
    describe('getStressTrends', () => {
        describe('Success Cases', () => {
            it('should identify IMPROVING trend', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
                        level: 8,
                        triggers: ['work']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                        level: 6,
                        triggers: ['work']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: today,
                        level: 4,
                        triggers: ['work']
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const trends = yield stress_level_service_1.StressLevelService.getStressTrends(testUserId, 30);
                expect(trends.trend).toBe('IMPROVING');
                expect(trends.average).toBe(6.0);
                expect(trends.highestLevel).toBe(8);
                expect(trends.lowestLevel).toBe(4);
                expect(trends.commonTriggers).toContain('work');
            }));
            it('should identify WORSENING trend', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
                        level: 4,
                        triggers: ['work']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                        level: 6,
                        triggers: ['family']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: today,
                        level: 8,
                        triggers: ['health']
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const trends = yield stress_level_service_1.StressLevelService.getStressTrends(testUserId, 30);
                expect(trends.trend).toBe('WORSENING');
                expect(trends.average).toBe(6.0);
                expect(trends.highestLevel).toBe(8);
                expect(trends.lowestLevel).toBe(4);
                expect(trends.commonTriggers).toHaveLength(3);
            }));
        });
        describe('Error Cases', () => {
            it('should handle invalid days parameter', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(stress_level_service_1.StressLevelService.getStressTrends(testUserId, -1)).rejects.toThrow();
            }));
        });
        describe('Edge Cases', () => {
            it('should identify STABLE trend for small variations', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const stressLogs = [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
                        level: 5,
                        triggers: ['work']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                        level: 5,
                        triggers: ['work']
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(testUserId),
                        date: today,
                        level: 5,
                        triggers: ['work']
                    }
                ];
                yield stress_log_model_1.StressLog.insertMany(stressLogs);
                const trends = yield stress_level_service_1.StressLevelService.getStressTrends(testUserId, 30);
                expect(trends.trend).toBe('STABLE');
                expect(trends.average).toBe(5.0);
            }));
            it('should return default values for no stress logs', () => __awaiter(void 0, void 0, void 0, function* () {
                const trends = yield stress_level_service_1.StressLevelService.getStressTrends(testUserId);
                expect(trends).toEqual({
                    average: 0,
                    trend: 'STABLE',
                    highestLevel: 0,
                    lowestLevel: 0,
                    commonTriggers: []
                });
            }));
        });
    });
});
