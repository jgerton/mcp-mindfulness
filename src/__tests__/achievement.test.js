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
const user_model_1 = require("../models/user.model");
const meditation_model_1 = require("../models/meditation.model");
const meditation_session_model_1 = require("../models/meditation-session.model");
const achievement_model_1 = require("../models/achievement.model");
const achievement_service_1 = require("../services/achievement.service");
const db_1 = require("./helpers/db");
describe('Achievement System', () => {
    let userId;
    let meditationId;
    let achievementService;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.clearTestCollection)('users');
        yield (0, db_1.clearTestCollection)('meditations');
        yield (0, db_1.clearTestCollection)('meditationsessions');
        yield (0, db_1.clearTestCollection)('achievements');
        yield (0, db_1.clearTestCollection)('userpoints');
        const user = yield user_model_1.User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        const meditation = yield meditation_model_1.Meditation.create({
            title: 'Test Meditation',
            description: 'Test Description',
            audioUrl: 'test.mp3',
            duration: 10,
            difficulty: 'beginner',
            category: 'mindfulness',
            type: 'guided'
        });
        userId = user._id;
        meditationId = meditation._id;
        achievementService = new achievement_service_1.AchievementService();
    }));
    describe('Time-based Achievements', () => {
        it.skip('should award Early Bird achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId,
                meditationId,
                startTime: new Date('2024-03-12T05:00:00'),
                endTime: new Date('2024-03-12T05:10:00'),
                duration: 10,
                durationCompleted: 10,
                status: 'completed',
                interruptions: 0,
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            yield achievement_service_1.AchievementService.processSession(session.toObject());
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'early_bird' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].completed).toBe(true);
        }));
    });
    describe('Duration-based Achievements', () => {
        it.skip('should award Marathon Meditator achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId,
                meditationId,
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 60000),
                duration: 30,
                durationCompleted: 30,
                status: 'completed',
                interruptions: 0,
                completed: true,
                moodBefore: 'neutral',
                moodAfter: 'peaceful'
            });
            yield achievement_service_1.AchievementService.processSession(session.toObject());
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'marathon_meditator' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(1);
        }));
    });
    describe('Streak-based Achievements', () => {
        it.skip('should award Week Warrior achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            // Create 7 consecutive daily sessions
            const now = Date.now();
            for (let i = 0; i < 7; i++) {
                const session = yield meditation_session_model_1.MeditationSession.create({
                    userId,
                    meditationId,
                    startTime: new Date(now - (6 - i) * 24 * 60 * 60 * 1000),
                    endTime: new Date(now - (6 - i) * 24 * 60 * 60 * 1000 + 10 * 60000),
                    duration: 10,
                    durationCompleted: 10,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                });
                yield achievement_service_1.AchievementService.processSession(session.toObject());
            }
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'week_warrior' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(7);
        }));
    });
    describe('Mood-based Achievements', () => {
        it.skip('should award Mood Lifter achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            // Create 10 sessions with mood improvement
            for (let i = 0; i < 10; i++) {
                const session = yield meditation_session_model_1.MeditationSession.create({
                    userId,
                    meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 10 * 60000),
                    duration: 10,
                    durationCompleted: 10,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'anxious',
                    moodAfter: 'peaceful'
                });
                yield achievement_service_1.AchievementService.processSession(session.toObject());
            }
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'mood_lifter' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(10);
        }));
    });
    describe('Duration Achievements', () => {
        it.skip('should award beginner achievement for first session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId,
                meditationId,
                startTime: new Date(),
                endTime: new Date(Date.now() + 10 * 60000),
                duration: 10,
                durationCompleted: 10,
                status: 'completed',
                interruptions: 0,
                completed: true,
                moodBefore: 'neutral',
                moodAfter: 'peaceful'
            });
            yield achievement_service_1.AchievementService.processSession(session.toObject());
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'beginner_meditator' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(1);
        }));
        it.skip('should award intermediate achievement after 10 sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            // Create 10 sessions
            for (let i = 0; i < 10; i++) {
                const session = yield meditation_session_model_1.MeditationSession.create({
                    userId,
                    meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 10 * 60000),
                    duration: 10,
                    durationCompleted: 10,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                });
                yield achievement_service_1.AchievementService.processSession(session.toObject());
            }
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'intermediate_meditator' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(10);
        }));
        it.skip('should award advanced achievement after 50 sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_service_1.AchievementService.initializeAchievements(userId.toString());
            // Create 50 sessions
            for (let i = 0; i < 50; i++) {
                const session = yield meditation_session_model_1.MeditationSession.create({
                    userId,
                    meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 10 * 60000),
                    duration: 10,
                    durationCompleted: 10,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                });
                yield achievement_service_1.AchievementService.processSession(session.toObject());
            }
            const achievements = yield achievement_model_1.Achievement.find({ userId, type: 'advanced_meditator' });
            expect(achievements).toHaveLength(1);
            expect(achievements[0].progress).toBe(50);
        }));
        it.skip('should not award achievements for incomplete sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create an incomplete session
            const session = new meditation_session_model_1.MeditationSession({
                userId,
                meditationId: new mongoose_1.default.Types.ObjectId(),
                startTime: new Date(),
                duration: 600,
                durationCompleted: 300,
                interruptions: 2,
                status: 'abandoned', // Use a valid status enum value
                moodBefore: 'anxious',
                moodAfter: 'neutral'
            });
            yield session.save();
            // Process achievements
            yield session.processAchievements();
            // Check that no achievements were awarded
            const achievements = yield achievement_model_1.Achievement.find({ userId });
            expect(achievements.filter(a => a.completed)).toHaveLength(0);
        }));
    });
    describe('Points System', () => {
        it.skip('should calculate total points correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create achievements that award points
            const session1 = new meditation_session_model_1.MeditationSession({
                userId,
                meditationId: new mongoose_1.default.Types.ObjectId(),
                startTime: new Date(),
                duration: 600,
                durationCompleted: 600,
                interruptions: 0,
                status: 'completed',
                moodBefore: 'anxious',
                moodAfter: 'calm'
            });
            yield session1.save();
            yield session1.processAchievements();
            // Check the points
            const totalPoints = yield achievement_service_1.AchievementService.getUserPoints(userId.toString());
            expect(totalPoints.total).toBeGreaterThan(0); // Should have some points
        }));
        it('should return 0 points for user with no achievements', () => __awaiter(void 0, void 0, void 0, function* () {
            const totalPoints = yield achievement_service_1.AchievementService.getUserPoints(userId.toString());
            expect(totalPoints.total).toBe(0);
        }));
    });
});
