"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const achievement_service_1 = require("../services/achievement.service");
const achievement_model_1 = require("../models/achievement.model");
const base_controller_1 = require("../core/base-controller");
const http_error_1 = require("../errors/http-error");
/**
 * Controller for Achievement-related API endpoints
 */
class AchievementController extends base_controller_1.BaseController {
    constructor() {
        super(achievement_model_1.Achievement);
    }
    async validateCreate(req) {
        const { title, description, criteria, userId } = req.body;
        if (!title) {
            throw http_error_1.HttpError.badRequest('Title is required');
        }
        if (!description) {
            throw http_error_1.HttpError.badRequest('Description is required');
        }
        if (!criteria || !criteria.type || !criteria.target) {
            throw http_error_1.HttpError.badRequest('Valid criteria with type and target is required');
        }
        if (!['SESSION_COUNT', 'STREAK_DAYS', 'TOTAL_MINUTES'].includes(criteria.type)) {
            throw http_error_1.HttpError.badRequest('Invalid criteria type');
        }
        if (criteria.target <= 0) {
            throw http_error_1.HttpError.badRequest('Criteria target must be positive');
        }
        if (!userId) {
            throw http_error_1.HttpError.badRequest('User ID is required');
        }
    }
    async validateUpdate(req) {
        const { criteria } = req.body;
        if (criteria) {
            if (!criteria.type || !criteria.target) {
                throw http_error_1.HttpError.badRequest('Criteria must include both type and target');
            }
            if (!['SESSION_COUNT', 'STREAK_DAYS', 'TOTAL_MINUTES'].includes(criteria.type)) {
                throw http_error_1.HttpError.badRequest('Invalid criteria type');
            }
            if (criteria.target <= 0) {
                throw http_error_1.HttpError.badRequest('Criteria target must be positive');
            }
        }
    }
    buildFilterQuery(req) {
        const filter = {};
        const { userId, isCompleted, criteriaType, search } = req.query;
        if (userId) {
            filter.userId = userId;
        }
        if (isCompleted !== undefined) {
            filter.isCompleted = isCompleted === 'true';
        }
        if (criteriaType) {
            filter['criteria.type'] = criteriaType;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        return filter;
    }
    /**
     * Get all achievements
     * @route GET /api/achievements
     */
    async getAllAchievements(req, res) {
        try {
            const { category } = req.query;
            const filter = category ? { category } : {};
            const achievements = await achievement_model_1.Achievement.find(filter).lean();
            res.status(200).json(achievements);
        }
        catch (error) {
            console.error('Error fetching achievements:', error);
            res.status(500).json({ error: 'Failed to fetch achievements' });
        }
    }
    /**
     * Get achievement by ID
     * @route GET /api/achievements/:id
     */
    async getAchievementById(req, res) {
        try {
            const { id } = req.params;
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid achievement ID format' });
                return;
            }
            const achievement = await achievement_model_1.Achievement.findById(id).lean();
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
    }
    /**
     * Create a new achievement
     * @route POST /api/achievements
     */
    async createAchievement(req, res) {
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
            await newAchievement.save();
            res.status(201).json(newAchievement);
        }
        catch (error) {
            console.error('Error creating achievement:', error);
            res.status(500).json({ error: 'Failed to create achievement' });
        }
    }
    /**
     * Update an achievement
     * @route PUT /api/achievements/:id
     */
    async updateAchievement(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category, criteria, icon, points } = req.body;
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid achievement ID format' });
                return;
            }
            // Find the achievement
            const achievement = await achievement_model_1.Achievement.findById(id);
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
            await achievement.save();
            res.status(200).json(achievement);
        }
        catch (error) {
            console.error('Error updating achievement:', error);
            res.status(500).json({ error: 'Failed to update achievement' });
        }
    }
    /**
     * Delete an achievement
     * @route DELETE /api/achievements/:id
     */
    async deleteAchievement(req, res) {
        try {
            const { id } = req.params;
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid achievement ID format' });
                return;
            }
            // Check if achievement exists
            const achievement = await achievement_model_1.Achievement.findById(id);
            if (!achievement) {
                res.status(404).json({ error: 'Achievement not found' });
                return;
            }
            // Check if achievement is used by any users
            const userAchievementCount = await achievement_model_1.UserAchievement.countDocuments({ achievementId: id });
            if (userAchievementCount > 0) {
                res.status(400).json({
                    error: 'Cannot delete achievement that is assigned to users',
                    userCount: userAchievementCount
                });
                return;
            }
            // Delete the achievement
            await achievement_model_1.Achievement.findByIdAndDelete(id);
            res.status(200).json({ message: 'Achievement deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting achievement:', error);
            res.status(500).json({ error: 'Failed to delete achievement' });
        }
    }
    /**
     * Get all achievements for the current user
     * @route GET /api/achievements/user
     */
    async getUserAchievements(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            const userAchievements = await achievement_model_1.UserAchievement.find({ userId })
                .populate('achievementId')
                .lean();
            res.status(200).json(userAchievements);
        }
        catch (error) {
            console.error('Error fetching user achievements:', error);
            res.status(500).json({ error: 'Failed to fetch user achievements' });
        }
    }
    /**
     * Get completed achievements for the current user
     * @route GET /api/achievements/user/completed
     */
    async getCompletedAchievements(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            const completedAchievements = await achievement_model_1.UserAchievement.find({
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
    }
    /**
     * Get total points for the current user
     * @route GET /api/achievements/user/points
     */
    async getUserPoints(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            const totalPoints = await achievement_service_1.AchievementService.getUserPoints(userId.toString());
            res.status(200).json({
                points: totalPoints
            });
        }
        catch (error) {
            console.error('Error fetching user points:', error);
            res.status(500).json({ error: 'Failed to fetch user points' });
        }
    }
    /**
     * Process user activity for achievements
     * @route POST /api/achievements/process
     */
    async processActivity(req, res) {
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
            const result = await achievement_service_1.AchievementService.processMeditationAchievements({
                userId: userId,
                ...activityData
            });
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
    }
    // Custom methods specific to Achievement
    async getByUser(req) {
        const { userId } = req.params;
        if (!userId) {
            throw http_error_1.HttpError.badRequest('User ID is required');
        }
        const achievements = await this.model
            .find({ userId })
            .sort({ createdAt: -1 })
            .exec();
        return achievements;
    }
    async updateProgress(req) {
        const { achievementId, progress } = req.body;
        const achievement = await achievement_model_1.Achievement.findById(achievementId);
        if (!achievement) {
            throw new http_error_1.HttpError(404, 'Achievement not found');
        }
        achievement.progress = progress;
        if (achievement.target !== undefined && progress >= achievement.target && !achievement.completed) {
            achievement.completed = true;
            achievement.completedAt = new Date();
        }
        const updatedAchievement = await achievement.save();
        return updatedAchievement;
    }
    async getInProgress(req) {
        const { userId } = req.params;
        if (!userId) {
            throw http_error_1.HttpError.badRequest('User ID is required');
        }
        const achievements = await this.model
            .find({
            userId,
            isCompleted: false,
            'criteria.progress': { $gt: 0 }
        })
            .sort({ 'criteria.progress': -1 })
            .exec();
        return achievements;
    }
    async getRecentlyCompleted(req) {
        const { userId } = req.params;
        const { limit = 5 } = req.query;
        if (!userId) {
            throw http_error_1.HttpError.badRequest('User ID is required');
        }
        const achievements = await this.model
            .find({
            userId,
            isCompleted: true
        })
            .sort({ completedAt: -1 })
            .limit(Number(limit))
            .exec();
        return achievements;
    }
}
exports.AchievementController = AchievementController;
