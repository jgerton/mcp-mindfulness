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
const session_analytics_model_1 = require("../../models/session-analytics.model");
const db_handler_1 = require("../test-utils/db-handler");
const session_analytics_factory_1 = require("../factories/session-analytics.factory");
describe('SessionAnalytics Model', () => {
    let factory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
        factory = new session_analytics_factory_1.SessionAnalyticsTestFactory();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    describe('Schema Validation', () => {
        it('should create a valid session analytics record', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create();
            const savedAnalytics = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(savedAnalytics._id).toBeDefined();
            expect(savedAnalytics.userId).toEqual(analytics.userId);
            expect(savedAnalytics.sessionId).toEqual(analytics.sessionId);
            expect(savedAnalytics.meditationId).toEqual(analytics.meditationId);
        }));
        it('should require userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ userId: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require sessionId', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ sessionId: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require meditationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ meditationId: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ startTime: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ duration: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require durationCompleted', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ durationCompleted: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require completed status', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ completed: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require moodBefore', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ moodBefore: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should validate mood enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const validMoods = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
            for (const mood of validMoods) {
                const analytics = factory.create({ moodBefore: mood, moodAfter: mood });
                const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
                expect(saved.moodBefore).toBe(mood);
                expect(saved.moodAfter).toBe(mood);
            }
            const invalidMood = 'happy';
            const analytics = factory.create({ moodBefore: invalidMood });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require interruptions count', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ interruptions: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
        it('should require maintainedStreak', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ maintainedStreak: undefined });
            yield expect(session_analytics_model_1.SessionAnalytics.create(analytics)).rejects.toThrow();
        }));
    });
    describe('Indexes', () => {
        it('should have compound index on userId and startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield session_analytics_model_1.SessionAnalytics.collection.getIndexes();
            const hasIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.startTime === -1);
            expect(hasIndex).toBe(true);
        }));
        it('should have compound index on userId and completed', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield session_analytics_model_1.SessionAnalytics.collection.getIndexes();
            const hasIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.completed === 1);
            expect(hasIndex).toBe(true);
        }));
    });
    describe('Data Integrity', () => {
        it('should handle endTime after startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.completed();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.endTime.getTime()).toBeGreaterThan(saved.startTime.getTime());
        }));
        it('should handle duration and durationCompleted relationship', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.incomplete();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.durationCompleted).toBeLessThan(saved.duration);
            expect(saved.completed).toBe(false);
        }));
        it('should handle completed sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.completed();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.durationCompleted).toBe(saved.duration);
            expect(saved.completed).toBe(true);
            expect(saved.moodAfter).toBeDefined();
        }));
        it('should handle mood transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.withMoodImprovement();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.moodBefore).toBe('stressed');
            expect(saved.moodAfter).toBe('peaceful');
        }));
        it('should handle tags', () => __awaiter(void 0, void 0, void 0, function* () {
            const tags = ['morning', 'focus', 'energy'];
            const analytics = factory.withTags(tags);
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.tags).toEqual(expect.arrayContaining(tags));
        }));
    });
    describe('Analytics Features', () => {
        it('should track focus score', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.withHighFocus();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.focusScore).toBeGreaterThanOrEqual(9);
            expect(saved.focusScore).toBeLessThanOrEqual(10);
        }));
        it('should track interruptions', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.create({ interruptions: 3 });
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.interruptions).toBe(3);
        }));
        it('should track streak maintenance', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = factory.completed();
            const saved = yield session_analytics_model_1.SessionAnalytics.create(analytics);
            expect(saved.maintainedStreak).toBe(true);
            const incompleteAnalytics = factory.incomplete();
            const savedIncomplete = yield session_analytics_model_1.SessionAnalytics.create(incompleteAnalytics);
            expect(savedIncomplete.maintainedStreak).toBe(false);
        }));
        it('should handle batch analytics creation', () => __awaiter(void 0, void 0, void 0, function* () {
            const count = 5;
            const analyticsBatch = factory.batch(count);
            const savedBatch = yield session_analytics_model_1.SessionAnalytics.create(analyticsBatch);
            expect(Array.isArray(savedBatch)).toBe(true);
            expect(savedBatch).toHaveLength(count);
        }));
    });
});
