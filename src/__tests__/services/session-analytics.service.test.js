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
const session_analytics_service_1 = require("../../services/session-analytics.service");
const session_analytics_model_1 = require("../../models/session-analytics.model");
const db_handler_1 = require("../test-utils/db-handler");
const session_analytics_factory_1 = require("../factories/session-analytics.factory");
describe('SessionAnalyticsService', () => {
    let service;
    let factory;
    let userId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        service = new session_analytics_service_1.SessionAnalyticsService();
        factory = new session_analytics_factory_1.SessionAnalyticsTestFactory();
        userId = new mongoose_1.default.Types.ObjectId();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('createSessionAnalytics', () => {
        it('should create new analytics entry', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = factory.create({ userId });
            const result = yield service.createSessionAnalytics(data);
            expect(result._id).toBeDefined();
            expect(result.userId).toEqual(userId);
            expect(result.sessionId).toEqual(data.sessionId);
        }));
        it('should update existing analytics entry', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = factory.create({ userId });
            yield service.createSessionAnalytics(data);
            const updatedData = Object.assign(Object.assign({}, data), { focusScore: 95 });
            const result = yield service.createSessionAnalytics(updatedData);
            expect(result.focusScore).toBe(95);
        }));
        it('should handle invalid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = { userId: 'invalid' };
            yield expect(service.createSessionAnalytics(invalidData)).rejects.toThrow();
        }));
    });
    describe('updateSessionAnalytics', () => {
        it('should update existing analytics', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = factory.create({ userId });
            const created = yield service.createSessionAnalytics(data);
            const result = yield service.updateSessionAnalytics(created.sessionId.toString(), { focusScore: 85 });
            expect(result === null || result === void 0 ? void 0 : result.focusScore).toBe(85);
        }));
        it('should return null for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.updateSessionAnalytics(new mongoose_1.default.Types.ObjectId().toString(), { focusScore: 85 });
            expect(result).toBeNull();
        }));
    });
    describe('getUserSessionHistory', () => {
        it('should return paginated session history', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create 15 sessions
            const sessions = Array.from({ length: 15 }, () => factory.create({ userId }));
            yield session_analytics_model_1.SessionAnalytics.insertMany(sessions);
            const result = yield service.getUserSessionHistory(userId.toString(), {
                page: 1,
                limit: 10
            });
            expect(result.sessions).toHaveLength(10);
            expect(result.totalSessions).toBe(15);
            expect(result.totalPages).toBe(2);
        }));
        it('should handle empty history', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getUserSessionHistory(userId.toString(), {
                page: 1,
                limit: 10
            });
            expect(result.sessions).toHaveLength(0);
            expect(result.totalSessions).toBe(0);
            expect(result.totalPages).toBe(0);
        }));
    });
    describe('getUserStats', () => {
        it('should calculate user statistics correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessions = [
                factory.create({
                    userId,
                    durationCompleted: 600,
                    focusScore: 80,
                    interruptions: 2
                }),
                factory.create({
                    userId,
                    durationCompleted: 900,
                    focusScore: 90,
                    interruptions: 1
                })
            ];
            yield session_analytics_model_1.SessionAnalytics.insertMany(sessions);
            const stats = yield service.getUserStats(userId.toString());
            expect(stats.totalSessions).toBe(2);
            expect(stats.totalMinutes).toBe(1500);
            expect(stats.averageFocusScore).toBe(85);
            expect(stats.totalInterruptions).toBe(3);
        }));
        it('should return zero stats for new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const stats = yield service.getUserStats(userId.toString());
            expect(stats.totalSessions).toBe(0);
            expect(stats.totalMinutes).toBe(0);
            expect(stats.averageFocusScore).toBe(0);
            expect(stats.totalInterruptions).toBe(0);
        }));
    });
    describe('getMoodImprovementStats', () => {
        it('should calculate mood improvement rate correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const sessions = [
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 1000),
                    moodBefore: 'stressed',
                    moodAfter: 'calm'
                }),
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 2000),
                    moodBefore: 'anxious',
                    moodAfter: 'peaceful'
                }),
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 3000),
                    moodBefore: 'neutral',
                    moodAfter: 'neutral'
                })
            ];
            yield session_analytics_model_1.SessionAnalytics.insertMany(sessions);
            const stats = yield service.getMoodImprovementStats(userId.toString(), startTime);
            expect(stats.totalSessions).toBe(3);
            expect(stats.totalImproved).toBe(2);
            expect(stats.improvementRate).toBe((2 / 3) * 100);
        }));
        it('should handle sessions without mood data', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const sessions = [
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 1000)
                }),
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 2000),
                    moodBefore: 'stressed'
                })
            ];
            yield session_analytics_model_1.SessionAnalytics.insertMany(sessions);
            const stats = yield service.getMoodImprovementStats(userId.toString(), startTime);
            expect(stats.totalSessions).toBe(2);
            expect(stats.totalImproved).toBe(0);
            expect(stats.improvementRate).toBe(0);
        }));
        it('should filter sessions by start time', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const sessions = [
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() - 1000), // Before start time
                    moodBefore: 'stressed',
                    moodAfter: 'calm'
                }),
                factory.create({
                    userId,
                    startTime: new Date(startTime.getTime() + 1000), // After start time
                    moodBefore: 'anxious',
                    moodAfter: 'peaceful'
                })
            ];
            yield session_analytics_model_1.SessionAnalytics.insertMany(sessions);
            const stats = yield service.getMoodImprovementStats(userId.toString(), startTime);
            expect(stats.totalSessions).toBe(1);
            expect(stats.totalImproved).toBe(1);
            expect(stats.improvementRate).toBe(100);
        }));
    });
    describe('findOne', () => {
        it('should find session by filter', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = factory.create({ userId });
            yield service.createSessionAnalytics(data);
            const result = yield service.findOne({ userId: data.userId });
            expect(result === null || result === void 0 ? void 0 : result.userId).toEqual(data.userId);
        }));
        it('should return null when no match found', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.findOne({ userId });
            expect(result).toBeNull();
        }));
    });
});
