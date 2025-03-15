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
exports.AchievementService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const achievement_model_1 = require("../models/achievement.model");
const friend_model_1 = require("../models/friend.model");
const meditation_session_model_1 = require("../models/meditation-session.model");
const user_points_model_1 = require("../models/user-points.model");
const leaderboard_service_1 = require("./leaderboard.service");
// Define achievements
const MEDITATION_ACHIEVEMENTS = [
    {
        id: 'first_session',
        name: 'First Steps',
        description: 'Complete your first meditation session',
        type: 'beginner_meditator',
        condition: () => true, // Always awarded on first session
        points: 50,
        title: 'First Steps'
    },
    {
        id: 'focused_session',
        name: 'Deep Focus',
        description: 'Complete a session with focus rating of 5',
        type: 'mood_lifter',
        condition: (data) => data.focusRating === 5,
        points: 30,
        title: 'Deep Focus'
    },
    {
        id: 'long_session',
        name: 'Extended Practice',
        description: 'Complete a session of 20 minutes or more',
        type: 'marathon_meditator',
        condition: (data) => data.duration >= 1200, // 20 minutes in seconds
        points: 40,
        title: 'Extended Practice'
    },
    {
        id: 'no_interruptions',
        name: 'Undisturbed',
        description: 'Complete a session without any interruptions',
        type: 'mood_lifter',
        condition: (data) => data.interruptions === 0,
        points: 25,
        title: 'Undisturbed'
    },
    {
        id: 'streak_3',
        name: 'Building Habit',
        description: 'Maintain a 3-day meditation streak',
        type: 'week_warrior',
        condition: (data) => Boolean(data.streakMaintained && data.streakDay === 3),
        points: 60,
        title: 'Building Habit'
    },
    {
        id: 'streak_7',
        name: 'Weekly Warrior',
        description: 'Maintain a 7-day meditation streak',
        type: 'week_warrior',
        condition: (data) => Boolean(data.streakMaintained && data.streakDay === 7),
        points: 100,
        title: 'Weekly Warrior'
    },
    {
        id: 'mood_improvement',
        name: 'Mood Lifter',
        description: 'Experience significant mood improvement after meditation',
        type: 'mood_lifter',
        condition: (data) => (data.moodImprovement || 0) >= 3,
        points: 35,
        title: 'Mood Lifter'
    }
];
class AchievementService {
    static initializeAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievementTypes = Object.keys(this.ACHIEVEMENT_TARGETS);
            for (const type of achievementTypes) {
                yield achievement_model_1.Achievement.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId), type }, {
                    $setOnInsert: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        type,
                        progress: 0,
                        target: this.ACHIEVEMENT_TARGETS[type],
                        title: this.ACHIEVEMENT_DETAILS[type].title,
                        description: this.ACHIEVEMENT_DETAILS[type].description,
                        points: this.ACHIEVEMENT_DETAILS[type].points,
                        completed: false,
                        completedAt: null
                    }
                }, { upsert: true, new: true });
            }
        });
    }
    static processSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!session.completed) {
                return;
            }
            const startTime = new Date(session.startTime);
            const hour = startTime.getHours();
            // Early Bird (5-9 AM)
            if (hour >= 5 && hour < 9) {
                yield this.completeAchievement(session.userId.toString(), 'early_bird');
            }
            // Night Owl (10 PM-2 AM)
            if (hour >= 22 || hour < 2) {
                yield this.completeAchievement(session.userId.toString(), 'night_owl');
            }
            // Marathon Meditator (30+ minutes)
            if (session.duration >= 30) {
                yield this.completeAchievement(session.userId.toString(), 'marathon_meditator');
            }
            // Mood Lifter (mood improvement)
            if (session.moodBefore && session.moodAfter && this.isMoodImproved(session.moodBefore, session.moodAfter)) {
                yield this.completeAchievement(session.userId.toString(), 'mood_lifter');
            }
            // Week Warrior (7 consecutive days)
            yield this.checkStreakAchievements(session);
            // Session count achievements
            yield this.checkSessionCountAchievements(session);
        });
    }
    static processGroupSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.incrementAchievement(userId, 'community_pillar');
        });
    }
    static getUserPoints(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
            if (!userPoints) {
                return { total: 0, achievements: 0, streaks: 0, recent: 0 };
            }
            return {
                total: userPoints.totalPoints,
                achievements: userPoints.achievementPoints,
                streaks: userPoints.streakPoints,
                recent: userPoints.recentPoints
            };
        });
    }
    static isMoodImproved(before, after) {
        const moodScale = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
        return moodScale.indexOf(after) > moodScale.indexOf(before);
    }
    static incrementAchievement(userId_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (userId, type, increment = 1) {
            const achievement = yield achievement_model_1.Achievement.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type
            });
            if (!achievement) {
                return;
            }
            achievement.progress = Math.min(achievement.target, achievement.progress + increment);
            if (achievement.progress >= achievement.target && !achievement.completed) {
                achievement.completed = true;
                achievement.completedAt = new Date();
            }
            yield achievement.save();
        });
    }
    static completeAchievement(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievement = yield achievement_model_1.Achievement.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type
            });
            if (!achievement || achievement.completed) {
                return;
            }
            achievement.progress = achievement.target;
            achievement.completed = true;
            achievement.completedAt = new Date();
            yield achievement.save();
        });
    }
    static processFriendAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            // Count accepted friend requests
            const friendCount = yield friend_model_1.Friend.countDocuments({
                $or: [
                    { requesterId: userObjectId, status: 'accepted' },
                    { recipientId: userObjectId, status: 'accepted' }
                ]
            });
            // Get or create the social butterfly achievement
            let achievement = yield achievement_model_1.Achievement.findOne({
                userId: userObjectId,
                type: 'social_butterfly'
            });
            if (!achievement) {
                achievement = new achievement_model_1.Achievement({
                    userId: userObjectId,
                    type: 'social_butterfly',
                    progress: 0,
                    target: this.ACHIEVEMENT_TARGETS.social_butterfly
                });
            }
            // Update progress
            achievement.progress = friendCount;
            // Check if achievement is completed
            if (achievement.progress >= achievement.target && !achievement.completedAt) {
                achievement.completedAt = new Date();
            }
            yield achievement.save();
        });
    }
    static checkDurationAchievements(session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (((_a = session.durationCompleted) !== null && _a !== void 0 ? _a : 0) >= 30) {
                yield AchievementService.completeAchievement(session.userId.toString(), 'marathon_meditator');
            }
        });
    }
    static checkSessionCountAchievements(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session.userId.toString();
            const sessionCount = yield meditation_session_model_1.MeditationSession.countDocuments({
                userId: session.userId,
                completed: true
            });
            // Beginner achievement (first session)
            if (sessionCount === 1) {
                yield this.completeAchievement(userId, 'beginner_meditator');
            }
            // Intermediate achievement (10 sessions)
            if (sessionCount >= 10) {
                yield this.completeAchievement(userId, 'intermediate_meditator');
            }
            // Advanced achievement (50 sessions)
            if (sessionCount >= 50) {
                yield this.completeAchievement(userId, 'advanced_meditator');
            }
        });
    }
    static checkStreakAchievements(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session.userId.toString();
            const today = new Date(session.startTime);
            today.setHours(0, 0, 0, 0);
            // Get all completed sessions for the user in the last 30 days
            const sessions = yield meditation_session_model_1.MeditationSession.find({
                userId: session.userId,
                completed: true,
                startTime: { $gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
            }).sort({ startTime: 1 });
            // Group sessions by date
            const sessionsByDate = new Map();
            sessions.forEach(s => {
                const date = new Date(s.startTime);
                date.setHours(0, 0, 0, 0);
                sessionsByDate.set(date.toISOString(), true);
            });
            // Find the earliest session date
            const earliestSession = sessions[0];
            if (!earliestSession)
                return;
            const startDate = new Date(earliestSession.startTime);
            startDate.setHours(0, 0, 0, 0);
            // Calculate current streak by looking forward from the earliest date
            let streak = 0;
            let currentStreak = 0;
            for (let i = 0; i < 30; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                date.setHours(0, 0, 0, 0);
                if (sessionsByDate.has(date.toISOString())) {
                    currentStreak++;
                    streak = Math.max(streak, currentStreak);
                }
                else {
                    currentStreak = 0;
                }
            }
            // Update Week Warrior achievement
            const weekWarrior = yield achievement_model_1.Achievement.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type: 'week_warrior'
            });
            if (weekWarrior && !weekWarrior.completed) {
                weekWarrior.progress = streak;
                if (streak >= weekWarrior.target) {
                    weekWarrior.completed = true;
                    weekWarrior.completedAt = new Date();
                }
                yield weekWarrior.save();
            }
            // Update Mindful Month achievement
            const mindfulMonth = yield achievement_model_1.Achievement.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type: 'mindful_month'
            });
            if (mindfulMonth && !mindfulMonth.completed) {
                mindfulMonth.progress = streak;
                if (streak >= mindfulMonth.target) {
                    mindfulMonth.completed = true;
                    mindfulMonth.completedAt = new Date();
                }
                yield mindfulMonth.save();
            }
        });
    }
    static getUnlockedAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievements = yield achievement_model_1.Achievement.find({
                userId,
                completed: true
            });
            return achievements.map(a => a.type);
        });
    }
    static saveAchievement(userId, achievementId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievementDetails = this.ACHIEVEMENT_DETAILS[achievementId];
            if (!achievementDetails)
                return;
            yield achievement_model_1.Achievement.findOneAndUpdate({ userId, type: achievementId }, {
                $setOnInsert: {
                    userId,
                    type: achievementId,
                    title: achievementDetails.title,
                    description: achievementDetails.description,
                    points: achievementDetails.points,
                    target: this.ACHIEVEMENT_TARGETS[achievementId] || 1
                },
                $set: {
                    completed: true,
                    completedAt: new Date(),
                    progress: this.ACHIEVEMENT_TARGETS[achievementId] || 1
                }
            }, { upsert: true, new: true });
        });
    }
    static updateUserPoints(userId, points, achievementType, description) {
        return __awaiter(this, void 0, void 0, function* () {
            let userPoints = yield user_points_model_1.UserPoints.findOne({ userId });
            if (!userPoints) {
                userPoints = new user_points_model_1.UserPoints({ userId });
            }
            yield userPoints.addPoints(points, 'achievement', description);
            // Invalidate leaderboard caches for this user
            leaderboard_service_1.LeaderboardService.invalidateUserCache(userId);
        });
    }
    static processMeditationAchievements(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get already unlocked achievements
            const unlockedAchievements = yield this.getUnlockedAchievements(data.userId);
            // Check for new achievements
            const newAchievements = MEDITATION_ACHIEVEMENTS.filter(achievement => !unlockedAchievements.includes(achievement.id) &&
                achievement.condition(data));
            // Process new achievements
            if (newAchievements.length > 0) {
                // Save new achievements and update points
                yield Promise.all(newAchievements.map((achievement) => __awaiter(this, void 0, void 0, function* () {
                    yield this.saveAchievement(data.userId, achievement.id, data.sessionId);
                    yield this.updateUserPoints(data.userId, achievement.points, achievement.id, `Unlocked achievement: ${achievement.name}`);
                })));
                // Get user's new rank after points update
                const { rank, totalUsers } = yield leaderboard_service_1.LeaderboardService.getUserRank(data.userId);
                // If user is in top 3, we could trigger some special notification or reward
                if (rank <= 3) {
                    // TODO: Implement special reward or notification
                    console.log(`User ${data.userId} reached top 3 rank!`);
                }
            }
        });
    }
    static processStreakPoints(userId, streakDays) {
        return __awaiter(this, void 0, void 0, function* () {
            const streakPoints = streakDays * 10; // 10 points per streak day
            let userPoints = yield user_points_model_1.UserPoints.findOne({ userId });
            if (!userPoints) {
                userPoints = new user_points_model_1.UserPoints({ userId });
            }
            yield userPoints.addPoints(streakPoints, 'streak', `${streakDays} day meditation streak`);
            // Invalidate leaderboard caches for this user
            leaderboard_service_1.LeaderboardService.invalidateUserCache(userId);
        });
    }
    static getUserAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unlockedIds = yield this.getUnlockedAchievements(userId);
            return MEDITATION_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
        });
    }
    static getAvailableAchievements() {
        return __awaiter(this, void 0, void 0, function* () {
            return MEDITATION_ACHIEVEMENTS;
        });
    }
    static getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [points, allTimeRank, weeklyRank, monthlyRank] = yield Promise.all([
                this.getUserPoints(userId.toString()),
                leaderboard_service_1.LeaderboardService.getUserRank(userId),
                leaderboard_service_1.LeaderboardService.getUserRank(userId, 'weekly'),
                leaderboard_service_1.LeaderboardService.getUserRank(userId, 'monthly')
            ]);
            return {
                points,
                rank: {
                    current: allTimeRank.rank,
                    total: allTimeRank.totalUsers,
                    weekly: weeklyRank.rank,
                    monthly: monthlyRank.rank
                }
            };
        });
    }
    static getTopUsers() {
        return __awaiter(this, arguments, void 0, function* (limit = 3) {
            return leaderboard_service_1.LeaderboardService.getTopAchievers(limit);
        });
    }
}
exports.AchievementService = AchievementService;
AchievementService.ACHIEVEMENT_TARGETS = {
    early_bird: 5,
    night_owl: 5,
    marathon_meditator: 1,
    mood_lifter: 10,
    community_pillar: 10,
    group_guide: 5,
    week_warrior: 7,
    mindful_month: 30,
    social_butterfly: 5,
    beginner_meditator: 1,
    intermediate_meditator: 10,
    advanced_meditator: 50
};
AchievementService.ACHIEVEMENT_DETAILS = {
    early_bird: {
        title: 'Early Bird',
        description: 'Complete 5 meditation sessions before 9 AM',
        points: 100
    },
    night_owl: {
        title: 'Night Owl',
        description: 'Complete 5 meditation sessions after 10 PM',
        points: 100
    },
    marathon_meditator: {
        title: 'Marathon Meditator',
        description: 'Complete a meditation session of 30 minutes or longer',
        points: 150
    },
    mood_lifter: {
        title: 'Mood Lifter',
        description: 'Improve your mood in 10 meditation sessions',
        points: 200
    },
    community_pillar: {
        title: 'Community Pillar',
        description: 'Participate in 10 group meditation sessions',
        points: 300
    },
    group_guide: {
        title: 'Group Guide',
        description: 'Host 5 group meditation sessions',
        points: 250
    },
    week_warrior: {
        title: 'Week Warrior',
        description: 'Meditate for 7 consecutive days',
        points: 200
    },
    mindful_month: {
        title: 'Mindful Month',
        description: 'Meditate for 30 consecutive days',
        points: 500
    },
    social_butterfly: {
        title: 'Social Butterfly',
        description: 'Make 5 friends in the community',
        points: 150
    },
    beginner_meditator: {
        title: 'Beginner Meditator',
        description: 'Complete your first meditation session',
        points: 10
    },
    intermediate_meditator: {
        title: 'Intermediate Meditator',
        description: 'Complete 10 meditation sessions',
        points: 50
    },
    advanced_meditator: {
        title: 'Advanced Meditator',
        description: 'Complete 50 meditation sessions',
        points: 100
    }
};
