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
const meditation_session_model_1 = require("../../models/meditation-session.model");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_1 = require("../helpers/db");
const achievement_service_1 = require("../../services/achievement.service");
// Import the global setup
require("../setup");
// Mock achievement service
jest.mock('../../services/achievement.service');
describe.skip('MeditationSession', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.clearTestCollection)('meditationsessions');
        jest.clearAllMocks();
    }));
    const createBasicSession = () => ({
        userId: (0, db_1.getTestObjectId)(),
        meditationId: (0, db_1.getTestObjectId)(),
        duration: 900, // 15 minutes in seconds
        durationCompleted: 900,
        interruptions: 0,
        focusRating: 4,
        moodBefore: base_wellness_session_model_1.WellnessMoodState.Neutral,
        moodAfter: base_wellness_session_model_1.WellnessMoodState.Peaceful,
        status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
        startTime: new Date(),
        endTime: new Date(Date.now() + 15 * 60 * 1000),
        streakDay: 1,
        maintainedStreak: true
    });
    describe('Schema Validation', () => {
        it('should require meditation-specific fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession({
                userId: (0, db_1.getTestObjectId)(),
                startTime: new Date(),
                duration: 600
            });
            const error = yield session.validate().catch(e => e);
            expect(error.errors.meditationId).toBeDefined();
            expect(error.errors.durationCompleted).toBeDefined();
        }));
        it('should validate focus rating range', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { focusRating: 6 }));
            const error = yield session.validate().catch(e => e);
            expect(error.errors.focusRating).toBeDefined();
        }));
        it('should validate completed duration against planned duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { duration: 600, durationCompleted: 700 }));
            const error = yield session.validate().catch(e => e);
            expect(error.errors.durationCompleted).toBeDefined();
        }));
        it('should validate streak day is positive', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { streakDay: 0 }));
            const error = yield session.validate().catch(e => e);
            expect(error.errors.streakDay).toBeDefined();
        }));
    });
    describe('Virtual Fields', () => {
        it('should calculate completion percentage', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { duration: 600, durationCompleted: 480 // 80%
             }));
            expect(session.completionPercentage).toBe(80);
        }));
        it('should determine streak eligibility', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, duration: 600, durationCompleted: 540, focusRating: 4 }));
            expect(session.isStreakEligible).toBe(true);
        }));
        it('should not be streak eligible with low completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, duration: 600, durationCompleted: 300, focusRating: 4 }));
            expect(session.isStreakEligible).toBe(false);
        }));
        it('should not be streak eligible with low focus', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, duration: 600, durationCompleted: 540, focusRating: 2 }));
            expect(session.isStreakEligible).toBe(false);
        }));
    });
    describe('Session Completion', () => {
        it('should handle completion with mood and focus rating', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(createBasicSession());
            yield session.save();
            // Wait to simulate session duration
            yield new Promise(resolve => setTimeout(resolve, 100));
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            if (session.focusRating) {
                session.focusRating = session.focusRating;
                yield session.save();
            }
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(session.moodAfter).toBe(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            expect(session.focusRating).toBeDefined();
            expect(session.durationCompleted).toBeGreaterThan(0);
            expect(session.endTime).toBeDefined();
        }));
        it('should calculate actual duration on completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(createBasicSession());
            yield session.save();
            const startTime = new Date();
            session.startTime = startTime;
            yield new Promise(resolve => setTimeout(resolve, 100));
            yield session.complete();
            const expectedMinDuration = 0.1; // 100ms in seconds
            expect(session.durationCompleted).toBeGreaterThanOrEqual(expectedMinDuration);
        }));
    });
    describe('Achievement Processing', () => {
        it('should process achievements on completion', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockProcessAchievements = jest.spyOn(achievement_service_1.AchievementService, 'processMeditationAchievements');
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { moodBefore: base_wellness_session_model_1.WellnessMoodState.Stressed, streakDay: 3, maintainedStreak: true }));
            yield session.save();
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            if (session.focusRating) {
                session.focusRating = session.focusRating;
                yield session.save();
            }
            expect(mockProcessAchievements).toHaveBeenCalledWith(expect.objectContaining({
                userId: session.userId,
                meditationId: session.meditationId,
                duration: session.durationCompleted,
                focusRating: session.focusRating,
                streakDay: 3,
                streakMaintained: true,
                moodImprovement: 4 // Stressed(1) to Peaceful(5) = 4 improvement
            }));
        }));
        it('should not process achievements for incomplete session', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockProcessAchievements = jest.spyOn(achievement_service_1.AchievementService, 'processMeditationAchievements');
            const session = new meditation_session_model_1.MeditationSession(createBasicSession());
            yield session.save();
            yield session.processAchievements();
            expect(mockProcessAchievements).not.toHaveBeenCalled();
        }));
    });
    describe('Mood Improvement', () => {
        it('should calculate mood improvement correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { moodBefore: base_wellness_session_model_1.WellnessMoodState.Anxious }));
            yield session.save();
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            const achievementData = achievement_service_1.AchievementService.processMeditationAchievements.mock.calls[0][0];
            expect(achievementData.moodImprovement).toBe(2); // Anxious(2) to Calm(4) = 2 improvement
        }));
        it('should handle equal moods', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { moodBefore: base_wellness_session_model_1.WellnessMoodState.Calm }));
            yield session.save();
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            const achievementData = achievement_service_1.AchievementService.processMeditationAchievements.mock.calls[0][0];
            expect(achievementData.moodImprovement).toBe(0);
        }));
    });
    describe('Interruption Handling', () => {
        it('should validate interruption count', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(Object.assign(Object.assign({}, createBasicSession()), { interruptions: -1 }));
            const error = yield session.validate().catch(e => e);
            expect(error.errors.interruptions).toBeDefined();
        }));
        it('should default interruptions to 0', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new meditation_session_model_1.MeditationSession(createBasicSession());
            expect(session.interruptions).toBe(0);
        }));
    });
});
