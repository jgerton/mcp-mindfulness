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
const meditation_session_model_1 = require("../models/meditation-session.model");
const stress_assessment_model_1 = require("../models/stress-assessment.model");
/**
 * Service for managing achievements and user progress
 */
class AchievementService {
    /**
     * Process a user activity and update achievements accordingly
     * @param userId - The ID of the user
     * @param activityType - The type of activity performed
     * @param activityData - Additional data about the activity
     */
    processUserActivity(userId, activityType, activityData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert string ID to ObjectId if needed
            const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
            // Find all achievements that might be affected by this activity
            const relevantAchievements = yield achievement_model_1.Achievement.find({
                'criteria.type': activityType
            });
            // Process each achievement
            for (const achievement of relevantAchievements) {
                yield this.processAchievement(userObjectId, achievement, activityType, activityData);
            }
        });
    }
    /**
     * Process a specific achievement for a user
     * @param userId - The user ID
     * @param achievement - The achievement to process
     * @param activityType - The type of activity performed
     * @param activityData - Additional data about the activity
     */
    processAchievement(userId, achievement, activityType, activityData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find or create user achievement record
            let userAchievement = yield achievement_model_1.UserAchievement.findOne({
                userId,
                achievementId: achievement._id
            });
            // If no record exists, create a new one
            if (!userAchievement) {
                userAchievement = new achievement_model_1.UserAchievement({
                    userId,
                    achievementId: achievement._id,
                    progress: 0,
                    isCompleted: false
                });
            }
            // Skip if already completed
            if (userAchievement.isCompleted) {
                return;
            }
            // Update progress based on achievement criteria and activity
            const newProgress = yield this.calculateProgress(userId, achievement, activityType, activityData, userAchievement.progress);
            // Update user achievement
            userAchievement.progress = newProgress;
            // Check if achievement is now completed
            if (newProgress >= 100) {
                userAchievement.isCompleted = true;
                userAchievement.dateEarned = new Date();
            }
            // Save changes
            yield userAchievement.save();
        });
    }
    /**
     * Calculate progress for an achievement based on activity
     * @param userId - The user ID
     * @param achievement - The achievement to calculate progress for
     * @param activityType - The type of activity performed
     * @param activityData - Additional data about the activity
     * @param currentProgress - Current progress value
     * @returns New progress value (0-100)
     */
    calculateProgress(userId, achievement, activityType, activityData, currentProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, value } = achievement.criteria;
            // Ensure activity type matches achievement criteria
            if (type !== activityType) {
                return currentProgress;
            }
            switch (type) {
                case 'meditation_completed': {
                    // For meditation count achievements
                    if (achievement.category === 'count') {
                        const totalSessions = yield meditation_session_model_1.MeditationSession.countDocuments({
                            userId,
                            completed: true
                        });
                        return Math.min(100, Math.floor((totalSessions / value) * 100));
                    }
                    // For meditation duration achievements
                    if (achievement.category === 'duration') {
                        const sessions = yield meditation_session_model_1.MeditationSession.find({
                            userId,
                            completed: true
                        });
                        const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
                        const targetDuration = value * 60; // Convert minutes to seconds
                        return Math.min(100, Math.floor((totalDuration / targetDuration) * 100));
                    }
                    break;
                }
                case 'stress_assessment_completed': {
                    // For stress assessment count achievements
                    if (achievement.category === 'count') {
                        const totalAssessments = yield stress_assessment_model_1.StressAssessment.countDocuments({
                            userId
                        });
                        return Math.min(100, Math.floor((totalAssessments / value) * 100));
                    }
                    // For stress reduction achievements
                    if (achievement.category === 'milestone' && (activityData === null || activityData === void 0 ? void 0 : activityData.stressReduction)) {
                        const { stressReduction } = activityData;
                        if (stressReduction >= value) {
                            return 100;
                        }
                    }
                    break;
                }
                case 'streak': {
                    // For login streak achievements
                    if (achievement.category === 'streak' && (activityData === null || activityData === void 0 ? void 0 : activityData.currentStreak)) {
                        const { currentStreak } = activityData;
                        return Math.min(100, Math.floor((currentStreak / value) * 100));
                    }
                    // For meditation streak achievements
                    if (achievement.category === 'streak' && (activityData === null || activityData === void 0 ? void 0 : activityData.meditationStreak)) {
                        const { meditationStreak } = activityData;
                        return Math.min(100, Math.floor((meditationStreak / value) * 100));
                    }
                    break;
                }
                case 'login': {
                    // For login count achievements
                    if (achievement.category === 'count') {
                        const { loginCount } = activityData || { loginCount: 1 };
                        return Math.min(100, Math.floor((loginCount / value) * 100));
                    }
                    break;
                }
            }
            // Default: no change in progress
            return currentProgress;
        });
    }
    /**
     * Get all achievements for a user
     * @param userId - The user ID
     * @returns Array of user achievements with details
     */
    getUserAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
            // Find all user achievements and populate with achievement details
            const userAchievements = yield achievement_model_1.UserAchievement.find({ userId: userObjectId })
                .populate('achievementId')
                .lean();
            // Format the response
            return userAchievements.map(ua => ({
                id: ua.achievementId._id,
                name: ua.achievementId.name,
                description: ua.achievementId.description,
                category: ua.achievementId.category,
                icon: ua.achievementId.icon,
                points: ua.achievementId.points,
                progress: ua.progress,
                isCompleted: ua.isCompleted,
                dateEarned: ua.dateEarned
            }));
        });
    }
    /**
     * Get completed achievements for a user
     * @param userId - The user ID
     * @returns Array of completed achievements
     */
    getCompletedAchievements(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
            // Find completed user achievements
            const completedAchievements = yield achievement_model_1.UserAchievement.find({
                userId: userObjectId,
                isCompleted: true
            })
                .populate('achievementId')
                .lean();
            // Format the response
            return completedAchievements.map(ua => ({
                id: ua.achievementId._id,
                name: ua.achievementId.name,
                description: ua.achievementId.description,
                category: ua.achievementId.category,
                icon: ua.achievementId.icon,
                points: ua.achievementId.points,
                dateEarned: ua.dateEarned
            }));
        });
    }
    /**
     * Get total achievement points for a user
     * @param userId - The user ID
     * @returns Total points earned
     */
    getUserPoints(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
            // Find completed user achievements
            const completedAchievements = yield achievement_model_1.UserAchievement.find({
                userId: userObjectId,
                isCompleted: true
            })
                .populate('achievementId')
                .lean();
            // Sum up the points
            return completedAchievements.reduce((total, ua) => total + ua.achievementId.points, 0);
        });
    }
    /**
     * Create a new achievement
     * @param achievementData - The achievement data
     * @returns The created achievement
     */
    createAchievement(achievementData) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(achievementData);
            yield achievement.save();
            return achievement;
        });
    }
    /**
     * Update an existing achievement
     * @param id - The achievement ID
     * @param updateData - The data to update
     * @returns The updated achievement
     */
    updateAchievement(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievementId = typeof id === 'string' ? new mongoose_1.default.Types.ObjectId(id) : id;
            const achievement = yield achievement_model_1.Achievement.findByIdAndUpdate(achievementId, updateData, { new: true, runValidators: true });
            return achievement;
        });
    }
    /**
     * Delete an achievement
     * @param id - The achievement ID
     * @returns True if deleted, false otherwise
     */
    deleteAchievement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const achievementId = typeof id === 'string' ? new mongoose_1.default.Types.ObjectId(id) : id;
            // Delete the achievement
            const result = yield achievement_model_1.Achievement.deleteOne({ _id: achievementId });
            // Delete associated user achievements
            if (result.deletedCount > 0) {
                yield achievement_model_1.UserAchievement.deleteMany({ achievementId });
                return true;
            }
            return false;
        });
    }
}
exports.AchievementService = AchievementService;
exports.default = new AchievementService();
