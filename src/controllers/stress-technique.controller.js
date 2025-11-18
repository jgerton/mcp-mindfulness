"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTechniqueController = void 0;
const stress_technique_service_1 = require("../services/stress-technique.service");
const base_controller_1 = require("../core/base-controller");
const http_error_1 = require("../errors/http-error");
class StressTechniqueController extends base_controller_1.BaseController {
    /**
     * Get all stress management techniques
     * @route GET /api/stress-techniques
     */
    static async getAllTechniques(req, res) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const result = await stress_technique_service_1.StressTechniqueService.getAllTechniques(page, limit);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error getting techniques:', error);
            res.status(500).json({
                message: 'Error retrieving stress management techniques',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Get a stress management technique by ID
     * @route GET /api/stress-techniques/:id
     */
    static async getTechniqueById(req, res) {
        try {
            const technique = await stress_technique_service_1.StressTechniqueService.getTechniqueById(req.params.id);
            if (!technique) {
                res.status(404).json({ message: 'Stress management technique not found' });
                return;
            }
            res.status(200).json({ technique });
        }
        catch (error) {
            console.error('Error getting technique by ID:', error);
            res.status(500).json({
                message: 'Error retrieving stress management technique',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Get stress management techniques by category
     * @route GET /api/stress-techniques/category/:category
     */
    static async getTechniquesByCategory(req, res) {
        try {
            const techniques = await stress_technique_service_1.StressTechniqueService.getTechniquesByCategory(req.params.category);
            res.status(200).json({ techniques });
        }
        catch (error) {
            console.error('Error getting techniques by category:', error);
            res.status(500).json({
                message: 'Error retrieving stress management techniques by category',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Get stress management techniques by difficulty level
     * @route GET /api/stress-techniques/difficulty/:level
     */
    static async getTechniquesByDifficulty(req, res) {
        try {
            const techniques = await stress_technique_service_1.StressTechniqueService.getTechniquesByDifficulty(req.params.level);
            res.status(200).json({ techniques });
        }
        catch (error) {
            console.error('Error getting techniques by difficulty:', error);
            res.status(500).json({
                message: 'Error retrieving stress management techniques by difficulty',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Search stress management techniques
     * @route GET /api/stress-techniques/search
     */
    static async searchTechniques(req, res) {
        try {
            const query = req.query.q;
            if (!query) {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }
            const techniques = await stress_technique_service_1.StressTechniqueService.searchTechniques(query);
            res.status(200).json({ techniques });
        }
        catch (error) {
            console.error('Error searching techniques:', error);
            res.status(500).json({
                message: 'Error searching stress management techniques',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Get recommended stress management techniques for current user
     * @route GET /api/stress-techniques/recommendations
     */
    static async getRecommendedTechniques(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }
            const recommendations = await stress_technique_service_1.StressTechniqueService.getRecommendedTechniques(userId);
            res.status(200).json({ recommendations });
        }
        catch (error) {
            console.error('Error getting recommendations:', error);
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(500).json({
                message: 'Error retrieving stress management technique recommendations',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Create a new stress management technique
     * @route POST /api/stress-techniques
     */
    static async createTechnique(req, res) {
        try {
            const technique = await stress_technique_service_1.StressTechniqueService.createTechnique(req.body);
            res.status(201).json({
                message: 'Stress management technique created successfully',
                technique
            });
        }
        catch (error) {
            console.error('Error creating technique:', error);
            if (error instanceof Error && error.name === 'ValidationError') {
                res.status(400).json({
                    message: 'Validation error',
                    error: error.message
                });
                return;
            }
            res.status(500).json({
                message: 'Error creating stress management technique',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Update a stress management technique
     * @route PUT /api/stress-techniques/:id
     */
    static async updateTechnique(req, res) {
        try {
            const technique = await stress_technique_service_1.StressTechniqueService.updateTechnique(req.params.id, req.body);
            if (!technique) {
                res.status(404).json({ message: 'Stress management technique not found' });
                return;
            }
            res.status(200).json({
                message: 'Stress management technique updated successfully',
                technique
            });
        }
        catch (error) {
            console.error('Error updating technique:', error);
            if (error instanceof Error && error.name === 'ValidationError') {
                res.status(400).json({
                    message: 'Validation error',
                    error: error.message
                });
                return;
            }
            res.status(500).json({
                message: 'Error updating stress management technique',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    /**
     * Delete a stress management technique
     * @route DELETE /api/stress-techniques/:id
     */
    static async deleteTechnique(req, res) {
        try {
            const technique = await stress_technique_service_1.StressTechniqueService.deleteTechnique(req.params.id);
            if (!technique) {
                res.status(404).json({ message: 'Stress management technique not found' });
                return;
            }
            res.status(200).json({
                message: 'Stress management technique deleted successfully',
                technique
            });
        }
        catch (error) {
            console.error('Error deleting technique:', error);
            res.status(500).json({
                message: 'Error deleting stress management technique',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    async validateCreate(req) {
        const { name, description, duration, type, difficulty } = req.body;
        if (!name) {
            throw http_error_1.HttpError.badRequest('Name is required');
        }
        if (!description) {
            throw http_error_1.HttpError.badRequest('Description is required');
        }
        if (!duration || duration < 0) {
            throw http_error_1.HttpError.badRequest('Valid duration is required');
        }
        if (!type || !['BREATHING', 'MEDITATION', 'PHYSICAL'].includes(type)) {
            throw http_error_1.HttpError.badRequest('Valid type is required (BREATHING, MEDITATION, or PHYSICAL)');
        }
        if (!difficulty || !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
            throw http_error_1.HttpError.badRequest('Valid difficulty is required (BEGINNER, INTERMEDIATE, or ADVANCED)');
        }
    }
    async validateUpdate(req) {
        const { type, difficulty, duration } = req.body;
        if (type && !['BREATHING', 'MEDITATION', 'PHYSICAL'].includes(type)) {
            throw http_error_1.HttpError.badRequest('Invalid type specified');
        }
        if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
            throw http_error_1.HttpError.badRequest('Invalid difficulty specified');
        }
        if (duration !== undefined && duration < 0) {
            throw http_error_1.HttpError.badRequest('Duration must be a positive number');
        }
    }
    buildFilterQuery(req) {
        const filter = {};
        const { type, difficulty, minDuration, maxDuration, search } = req.query;
        if (type) {
            filter.type = type;
        }
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        if (minDuration || maxDuration) {
            filter.duration = {};
            if (minDuration) {
                filter.duration.$gte = Number(minDuration);
            }
            if (maxDuration) {
                filter.duration.$lte = Number(maxDuration);
            }
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        return filter;
    }
    // Custom methods specific to StressTechnique
    async getByDifficulty(req) {
        const { difficulty } = req.params;
        if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
            throw http_error_1.HttpError.badRequest('Invalid difficulty specified');
        }
        const techniques = await this.model
            .find({ difficulty })
            .sort({ duration: 1 })
            .exec();
        return techniques;
    }
    async getRecommended(req) {
        const { userId } = req.params;
        const userLevel = await this.getUserLevel(userId);
        const difficulty = this.mapUserLevelToDifficulty(userLevel);
        const techniques = await this.model
            .find({ difficulty })
            .limit(5)
            .sort({ rating: -1 })
            .exec();
        return techniques;
    }
    async getUserLevel(userId) {
        // This would typically come from a user service or progress tracking
        // For now, return a mock implementation
        return 2; // Mock intermediate level
    }
    mapUserLevelToDifficulty(level) {
        if (level <= 1)
            return 'BEGINNER';
        if (level <= 3)
            return 'INTERMEDIATE';
        return 'ADVANCED';
    }
}
exports.StressTechniqueController = StressTechniqueController;
