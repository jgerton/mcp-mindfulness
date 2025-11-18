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
exports.AchievementController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const achievement_service_1 = require("../services/achievement.service");
const achievement_model_1 = require("../models/achievement.model");
/**
 * Controller for Achievement-related API endpoints
 */
class AchievementController {
    /**
     * Get all achievements
     * @route GET /api/achievements
     */
    getAllAchievements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const achievements = yield achievement_model_1.Achievement.find().lean();
                res.status(200).json(achievements);
            }
            catch (error) {
                console.error('Error fetching achievements:', error);
                res.status(500).json({ error: 'Failed to fetch achievements' });
            }
        });
    }
    /**
     * Get achievement by ID
     * @route GET /api/achievements/:id
     */
    getAchievementById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid achievement ID format' });
                    return;
                }
                const achievement = yield achievement_model_1.Achievement.findById(id).lean();
                if (!achievement) {
                    res.status(404).json({ error: 'Achievement not found' });
                    return;
                }
                res.status(200).json(achievement);
            }
            catch (error) {
                console.error('Error fetching achievement:', error);
                res.status(500).json({ error: 'Failed to fetch achievement' });
            }
        });
    }
    /**
     * Create a new achievement
     * @route POST /api/achievements
     */
    createAchievement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description, category, criteria, icon, points } = req.body;
                // Validate required fields
                if (!name || !description || !category || !criteria || !icon || points === undefined) {
                    res.status(400).json({ error: 'Missing required fields' });
                    return;
                }
                // Validate category
                const validCategories = ['time', 'duration', 'streak', 'milestone', 'special'];
                if (!validCategories.includes(category)) {
                    res.status(400).json({
                        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
                    });
                    return;
                }
                // Validate points
                if (typeof points !== 'number' || points < 0) {
                    res.status(400).json({ error: 'Points must be a non-negative number' });
                    return;
                }
                const newAchievement = new achievement_model_1.Achievement({
                    name,
                    description,
                    category,
                    criteria,
                    icon,
                    points
                });
                yield newAchievement.save();
                res.status(201).json(newAchievement);
            }
            catch (error) {
                console.error('Error creating achievement:', error);
                res.status(500).json({ error: 'Failed to create achievement' });
            }
        });
    }
    /**
     * Update an achievement
     * @route PUT /api/achievements/:id
     */
    updateAchievement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, description, category, criteria, icon, points } = req.body;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid achievement ID format' });
                    return;
                }
                // Find the achievement
                const achievement = yield achievement_model_1.Achievement.findById(id);
                if (!achievement) {
                    res.status(404).json({ error: 'Achievement not found' });
                    return;
                }
                // Validate category if provided
                if (category) {
                    const validCategories = ['time', 'duration', 'streak', 'milestone', 'special'];
                    if (!validCategories.includes(category)) {
                        res.status(400).json({
                            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
                        });
                        return;
                    }
                }
                // Validate points if provided
                if (points !== undefined && (typeof points !== 'number' || points < 0)) {
                    res.status(400).json({ error: 'Points must be a non-negative number' });
                    return;
                }
                // Update fields
                if (name)
                    achievement.name = name;
                if (description)
                    achievement.description = description;
                if (category)
                    achievement.category = category;
                if (criteria)
                    achievement.criteria = criteria;
                if (icon)
                    achievement.icon = icon;
                if (points !== undefined)
                    achievement.points = points;
                yield achievement.save();
                res.status(200).json(achievement);
            }
            catch (error) {
                console.error('Error updating achievement:', error);
                res.status(500).json({ error: 'Failed to update achievement' });
            }
        });
    }
    /**
     * Delete an achievement
     * @route DELETE /api/achievements/:id
     */
    deleteAchievement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid achievement ID format' });
                    return;
                }
                // Check if achievement exists
                const achievement = yield achievement_model_1.Achievement.findById(id);
                if (!achievement) {
                    res.status(404).json({ error: 'Achievement not found' });
                    return;
                }
                // Check if achievement is used by any users
                const userAchievementCount = yield achievement_model_1.UserAchievement.countDocuments({ achievementId: id });
                if (userAchievementCount > 0) {
                    res.status(400).json({
                        error: 'Cannot delete achievement that is assigned to users',
                        userCount: userAchievementCount
                    });
                    return;
                }
                // Delete the achievement
                yield achievement_model_1.Achievement.findByIdAndDelete(id);
                res.status(200).json({ message: 'Achievement deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting achievement:', error);
                res.status(500).json({ error: 'Failed to delete achievement' });
            }
        });
    }
    /**
     * Get all achievements for the current user
     * @route GET /api/achievements/user
     */
    getUserAchievements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const userAchievements = yield achievement_model_1.UserAchievement.find({ userId })
                    .populate('achievementId')
                    .lean();
                res.status(200).json(userAchievements);
            }
            catch (error) {
                console.error('Error fetching user achievements:', error);
                res.status(500).json({ error: 'Failed to fetch user achievements' });
            }
        });
    }
    /**
     * Get completed achievements for the current user
     * @route GET /api/achievements/user/completed
     */
    getCompletedAchievements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const completedAchievements = yield achievement_model_1.UserAchievement.find({
                    userId,
                    isCompleted: true
                })
                    .populate('achievementId')
                    .lean();
                res.status(200).json(completedAchievements);
            }
            catch (error) {
                console.error('Error fetching completed achievements:', error);
                res.status(500).json({ error: 'Failed to fetch completed achievements' });
            }
        });
    }
    /**
     * Get total points for the current user
     * @route GET /api/achievements/user/points
     */
    getUserPoints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const totalPoints = yield achievement_service_1.AchievementService.getUserPoints(userId.toString());
                res.status(200).json({
                    points: totalPoints
                });
            }
            catch (error) {
                console.error('Error fetching user points:', error);
                res.status(500).json({ error: 'Failed to fetch user points' });
            }
        });
    }
    /**
     * Process user activity for achievements
     * @route POST /api/achievements/process
     */
    processActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { activityType, activityData } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                if (!activityType) {
                    res.status(400).json({ error: 'Activity type is required' });
                    return;
                }
                // Use the static method for processing meditation achievements
                const result = yield achievement_service_1.AchievementService.processMeditationAchievements(Object.assign({ userId: userId }, activityData));
                res.status(200).json({
                    success: true,
                    message: 'Activity processed successfully',
                    result
                });
            }
            catch (error) {
                console.error('Error processing user activity:', error);
                res.status(500).json({ error: 'Failed to process user activity' });
            }
        });
    }
}
exports.AchievementController = AchievementController;
