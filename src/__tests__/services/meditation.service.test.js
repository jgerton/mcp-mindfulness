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
const meditation_service_1 = require("../../services/meditation.service");
const meditation_session_model_1 = require("../../models/meditation-session.model");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('MeditationService', () => {
    let mockUserId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield db_handler_1.dbHandler.connect(); }));
    beforeEach(() => {
        mockUserId = new mongoose_1.default.Types.ObjectId();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.clearDatabase();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield db_handler_1.dbHandler.closeDatabase(); }));
    describe('Meditation CRUD Operations', () => {
        describe('Success Cases', () => {
            const mockMeditationData = {
                title: 'Test Meditation',
                description: 'A test meditation session',
                duration: 10,
                type: 'guided',
                audioUrl: 'https://example.com/meditation.mp3',
                category: 'mindfulness',
                difficulty: 'beginner',
                tags: ['test', 'meditation'],
                isActive: true
            };
            it('should create new meditation with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
                const meditation = yield meditation_service_1.MeditationService.createMeditation(mockMeditationData);
                expect(meditation).toBeDefined();
                expect(meditation.title).toBe(mockMeditationData.title);
                expect(meditation.duration).toBe(mockMeditationData.duration);
                expect(meditation.isActive).toBe(true);
            }));
            it('should get meditation by valid ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const created = yield meditation_service_1.MeditationService.createMeditation(mockMeditationData);
                const meditation = yield meditation_service_1.MeditationService.getMeditationById(created._id.toString());
                expect(meditation).toBeDefined();
                expect(meditation === null || meditation === void 0 ? void 0 : meditation.title).toBe(mockMeditationData.title);
            }));
            it('should update meditation with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
                const created = yield meditation_service_1.MeditationService.createMeditation(mockMeditationData);
                const updated = yield meditation_service_1.MeditationService.updateMeditation(created._id.toString(), { title: 'Updated Title', duration: 15 });
                expect(updated).toBeDefined();
                expect(updated === null || updated === void 0 ? void 0 : updated.title).toBe('Updated Title');
                expect(updated === null || updated === void 0 ? void 0 : updated.duration).toBe(15);
            }));
            it('should delete meditation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                const created = yield meditation_service_1.MeditationService.createMeditation(mockMeditationData);
                yield meditation_service_1.MeditationService.deleteMeditation(created._id.toString());
                const meditation = yield meditation_service_1.MeditationService.getMeditationById(created._id.toString());
                expect(meditation).toBeNull();
            }));
            it('should get all active meditations', () => __awaiter(void 0, void 0, void 0, function* () {
                yield meditation_service_1.MeditationService.createMeditation(Object.assign(Object.assign({}, mockMeditationData), { isActive: true }));
                yield meditation_service_1.MeditationService.createMeditation(Object.assign(Object.assign({}, mockMeditationData), { isActive: true }));
                yield meditation_service_1.MeditationService.createMeditation(Object.assign(Object.assign({}, mockMeditationData), { isActive: false }));
                const meditations = yield meditation_service_1.MeditationService.getAllMeditations();
                expect(meditations).toHaveLength(2);
                expect(meditations.every(m => m.isActive)).toBe(true);
            }));
        });
        describe('Error Cases', () => {
            it('should throw error when creating meditation with invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidData = {
                    // Missing required title
                    description: 'Invalid meditation',
                    duration: -1 // Invalid duration
                };
                yield expect(meditation_service_1.MeditationService.createMeditation(invalidData)).rejects.toThrow();
            }));
            it('should return null when getting meditation with invalid ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidId = new mongoose_1.default.Types.ObjectId().toString();
                const meditation = yield meditation_service_1.MeditationService.getMeditationById(invalidId);
                expect(meditation).toBeNull();
            }));
            it('should throw error when updating with invalid ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidId = new mongoose_1.default.Types.ObjectId().toString();
                yield expect(meditation_service_1.MeditationService.updateMeditation(invalidId, { title: 'New Title' }))
                    .resolves.toBeNull();
            }));
            it('should handle invalid ID format gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidId = 'invalid-id';
                yield expect(meditation_service_1.MeditationService.getMeditationById(invalidId)).rejects.toThrow();
            }));
        });
        describe('Edge Cases', () => {
            it('should handle empty update data', () => __awaiter(void 0, void 0, void 0, function* () {
                const meditation = yield meditation_service_1.MeditationService.createMeditation({
                    title: 'Test Meditation',
                    description: 'Test description',
                    duration: 10,
                    type: 'guided',
                    category: 'mindfulness',
                    difficulty: 'beginner'
                });
                const updated = yield meditation_service_1.MeditationService.updateMeditation(meditation._id.toString(), {});
                expect(updated).toBeDefined();
                expect(updated === null || updated === void 0 ? void 0 : updated.title).toBe('Test Meditation');
            }));
            it('should handle very long text fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const longTitle = 'a'.repeat(1000);
                const meditation = yield meditation_service_1.MeditationService.createMeditation({
                    title: longTitle,
                    description: 'Test description',
                    duration: 10,
                    type: 'guided',
                    category: 'mindfulness',
                    difficulty: 'beginner'
                });
                expect(meditation.title).toBe(longTitle);
            }));
        });
    });
    describe('User Meditation Sessions', () => {
        describe('Success Cases', () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                const sessions = [
                    {
                        userId: mockUserId,
                        startTime: new Date('2024-01-01'),
                        endTime: new Date('2024-01-01T00:15:00'),
                        duration: 15,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Morning Meditation'
                    },
                    {
                        userId: mockUserId,
                        startTime: new Date('2024-01-02'),
                        endTime: new Date('2024-01-02T00:20:00'),
                        duration: 20,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Evening Meditation'
                    },
                    {
                        userId: mockUserId,
                        startTime: new Date('2024-01-03'),
                        endTime: new Date('2024-01-03T00:10:00'),
                        duration: 10,
                        type: 'unguided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Quick Meditation'
                    }
                ];
                yield meditation_session_model_1.MeditationSession.insertMany(sessions);
            }));
            it('should get all user meditation sessions', () => __awaiter(void 0, void 0, void 0, function* () {
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(mockUserId.toString());
                expect(sessions).toHaveLength(3);
                expect(sessions[0].userId.toString()).toBe(mockUserId.toString());
            }));
            it('should get sessions within date range', () => __awaiter(void 0, void 0, void 0, function* () {
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(mockUserId.toString(), new Date('2024-01-01'), new Date('2024-01-02'));
                expect(sessions).toHaveLength(2);
            }));
            it('should sort sessions by startTime desc', () => __awaiter(void 0, void 0, void 0, function* () {
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(mockUserId.toString());
                for (let i = 1; i < sessions.length; i++) {
                    expect(new Date(sessions[i - 1].startTime).getTime())
                        .toBeGreaterThanOrEqual(new Date(sessions[i].startTime).getTime());
                }
            }));
        });
        describe('Error Cases', () => {
            it('should handle invalid user ID format', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(meditation_service_1.MeditationService.getUserMeditations('invalid-id'))
                    .rejects.toThrow();
            }));
            it('should handle invalid date range', () => __awaiter(void 0, void 0, void 0, function* () {
                const endDate = new Date('2024-01-01');
                const startDate = new Date('2024-01-02'); // Start after end
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(mockUserId.toString(), startDate, endDate);
                expect(sessions).toHaveLength(0);
            }));
        });
        describe('Edge Cases', () => {
            it('should handle date range at day boundaries', () => __awaiter(void 0, void 0, void 0, function* () {
                yield meditation_session_model_1.MeditationSession.create({
                    userId: mockUserId,
                    startTime: new Date('2024-01-01T23:59:59.999Z'),
                    endTime: new Date('2024-01-02T00:14:59.999Z'),
                    duration: 15,
                    type: 'guided',
                    status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                    title: 'Late Night Meditation'
                });
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(mockUserId.toString(), new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-01T23:59:59.999Z'));
                expect(sessions).toHaveLength(1);
            }));
            it('should handle empty result set', () => __awaiter(void 0, void 0, void 0, function* () {
                const sessions = yield meditation_service_1.MeditationService.getUserMeditations(new mongoose_1.default.Types.ObjectId().toString());
                expect(sessions).toHaveLength(0);
            }));
        });
    });
    describe('Meditation Statistics', () => {
        describe('Success Cases', () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const twoDaysAgo = new Date(today);
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                const sessions = [
                    {
                        userId: mockUserId,
                        startTime: today,
                        endTime: new Date(today.getTime() + 15 * 60000),
                        duration: 15,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Today Meditation'
                    },
                    {
                        userId: mockUserId,
                        startTime: yesterday,
                        endTime: new Date(yesterday.getTime() + 20 * 60000),
                        duration: 20,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Yesterday Meditation'
                    },
                    {
                        userId: mockUserId,
                        startTime: twoDaysAgo,
                        endTime: new Date(twoDaysAgo.getTime() + 10 * 60000),
                        duration: 10,
                        type: 'unguided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Two Days Ago Meditation'
                    }
                ];
                yield meditation_session_model_1.MeditationSession.insertMany(sessions);
            }));
            it('should calculate meditation stats correctly', () => __awaiter(void 0, void 0, void 0, function* () {
                const stats = yield meditation_service_1.MeditationService.getMeditationStats(mockUserId.toString());
                expect(stats).toEqual({
                    totalSessions: 3,
                    totalMinutes: 45,
                    averageDuration: 15,
                    longestSession: 20,
                    mostCommonTechnique: 'guided',
                    streak: 3
                });
            }));
            it('should calculate streak correctly', () => __awaiter(void 0, void 0, void 0, function* () {
                const streak = yield meditation_service_1.MeditationService.calculateStreak(mockUserId.toString());
                expect(streak).toBe(3);
            }));
        });
        describe('Error Cases', () => {
            it('should handle invalid user ID for stats', () => __awaiter(void 0, void 0, void 0, function* () {
                yield expect(meditation_service_1.MeditationService.getMeditationStats('invalid-id'))
                    .rejects.toThrow();
            }));
            it('should return default stats for user with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
                const newUserId = new mongoose_1.default.Types.ObjectId().toString();
                const stats = yield meditation_service_1.MeditationService.getMeditationStats(newUserId);
                expect(stats).toEqual({
                    totalSessions: 0,
                    totalMinutes: 0,
                    averageDuration: 0,
                    longestSession: 0,
                    mostCommonTechnique: null,
                    streak: 0
                });
            }));
        });
        describe('Edge Cases', () => {
            it('should handle broken streak correctly', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const threeDaysAgo = new Date(today);
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                yield meditation_session_model_1.MeditationSession.insertMany([
                    {
                        userId: mockUserId,
                        startTime: today,
                        endTime: new Date(today.getTime() + 15 * 60000),
                        duration: 15,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Today Meditation'
                    },
                    {
                        userId: mockUserId,
                        startTime: threeDaysAgo,
                        endTime: new Date(threeDaysAgo.getTime() + 20 * 60000),
                        duration: 20,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Three Days Ago Meditation'
                    }
                ]);
                const streak = yield meditation_service_1.MeditationService.calculateStreak(mockUserId.toString());
                expect(streak).toBe(1); // Only today's session counts
            }));
            it('should handle multiple sessions in same day for streak', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                yield meditation_session_model_1.MeditationSession.insertMany([
                    {
                        userId: mockUserId.toString(),
                        startTime: todayStart,
                        endTime: new Date(todayStart.getTime() + (10 * 60000)),
                        duration: 10,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Morning Meditation'
                    },
                    {
                        userId: mockUserId.toString(),
                        startTime: new Date(todayStart.getTime() + (15 * 60 * 60 * 1000)), // 3 PM
                        endTime: new Date(todayStart.getTime() + (15 * 60 * 60 * 1000) + (20 * 60000)),
                        duration: 20,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Afternoon Meditation'
                    }
                ]);
                const streak = yield meditation_service_1.MeditationService.calculateStreak(mockUserId.toString());
                expect(streak).toBe(1); // Multiple sessions on same day count as 1
            }));
            it('should handle sessions across month boundaries', () => __awaiter(void 0, void 0, void 0, function* () {
                const today = new Date();
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                yield meditation_session_model_1.MeditationSession.insertMany([
                    {
                        userId: mockUserId.toString(),
                        startTime: lastDayOfMonth,
                        endTime: new Date(lastDayOfMonth.getTime() + 15 * 60000),
                        duration: 15,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'Last Day Meditation'
                    },
                    {
                        userId: mockUserId.toString(),
                        startTime: firstDayOfMonth,
                        endTime: new Date(firstDayOfMonth.getTime() + 20 * 60000),
                        duration: 20,
                        type: 'guided',
                        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
                        title: 'First Day Meditation'
                    }
                ]);
                const stats = yield meditation_service_1.MeditationService.getMeditationStats(mockUserId.toString());
                expect(stats.totalSessions).toBe(2);
            }));
        });
    });
});
