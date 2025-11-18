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
const session_analytics_model_1 = require("../../models/session-analytics.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('SessionAnalytics Model', () => {
    let testAnalytics;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        testAnalytics = {
            userId: new mongoose_1.default.Types.ObjectId(),
            sessionId: new mongoose_1.default.Types.ObjectId(),
            meditationId: new mongoose_1.default.Types.ObjectId(),
            startTime: new Date(),
            endTime: null,
            duration: 15,
            durationCompleted: 15,
            completed: true,
            focusScore: 85,
            moodBefore: 'neutral',
            moodAfter: 'peaceful',
            interruptions: 0,
            notes: 'Test session',
            tags: ['focus', 'morning'],
            maintainedStreak: true
        };
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create and save analytics successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = yield session_analytics_model_1.SessionAnalytics.create(testAnalytics);
            expect(analytics.userId).toEqual(testAnalytics.userId);
            expect(analytics.sessionId).toEqual(testAnalytics.sessionId);
            expect(analytics.meditationId).toEqual(testAnalytics.meditationId);
            expect(analytics.completed).toBe(true);
        }));
        it('should accept valid mood values', () => __awaiter(void 0, void 0, void 0, function* () {
            const validMoods = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
            for (const mood of validMoods) {
                const analytics = new session_analytics_model_1.SessionAnalytics(Object.assign(Object.assign({}, testAnalytics), { moodBefore: mood, moodAfter: mood }));
                const validationError = yield analytics.validateSync();
                expect(validationError).toBeUndefined();
            }
        }));
        it('should properly index for efficient querying', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield session_analytics_model_1.SessionAnalytics.collection.getIndexes();
            const hasUserStartTimeIndex = Object.values(indexes).some(index => index.key && index.key.userId === 1 && index.key.startTime === -1);
            const hasUserCompletedIndex = Object.values(indexes).some(index => index.key && index.key.userId === 1 && index.key.completed === 1);
            expect(hasUserStartTimeIndex).toBe(true);
            expect(hasUserCompletedIndex).toBe(true);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = new session_analytics_model_1.SessionAnalytics({});
            const validationError = yield analytics.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.sessionId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.meditationId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
        }));
        it('should reject invalid mood values', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = new session_analytics_model_1.SessionAnalytics(Object.assign(Object.assign({}, testAnalytics), { moodBefore: 'invalid', moodAfter: 'invalid' }));
            const validationError = yield analytics.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.moodBefore).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.moodAfter).toBeDefined();
        }));
        it('should reject negative numeric values', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = new session_analytics_model_1.SessionAnalytics(Object.assign(Object.assign({}, testAnalytics), { duration: -1, durationCompleted: -1, interruptions: -1, focusScore: -1 }));
            const validationError = yield analytics.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.durationCompleted).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.interruptions).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.focusScore).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle null endTime for in-progress sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = yield session_analytics_model_1.SessionAnalytics.create(Object.assign(Object.assign({}, testAnalytics), { endTime: null, completed: false }));
            expect(analytics.endTime).toBeNull();
            expect(analytics.completed).toBe(false);
        }));
        it('should handle empty arrays and trim strings', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = yield session_analytics_model_1.SessionAnalytics.create(Object.assign(Object.assign({}, testAnalytics), { tags: [], notes: '  Test notes  ' }));
            expect(analytics.tags).toHaveLength(0);
            expect(analytics.notes).toBe('Test notes');
        }));
        it('should handle boundary values for numeric fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const analytics = yield session_analytics_model_1.SessionAnalytics.create(Object.assign(Object.assign({}, testAnalytics), { focusScore: 100, duration: 0, interruptions: 0 }));
            expect(analytics.focusScore).toBe(100);
            expect(analytics.duration).toBe(0);
            expect(analytics.interruptions).toBe(0);
        }));
    });
});
