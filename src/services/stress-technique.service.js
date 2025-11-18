"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTechniqueService = void 0;
const stress_technique_model_1 = __importDefault(require("../models/stress-technique.model"));
const user_model_1 = require("../models/user.model");
class StressTechniqueService {
    /**
     * Get a technique by its ID
     */
    static async getTechniqueById(id) {
        return stress_technique_model_1.default.findById(id);
    }
    /**
     * Get all techniques with optional pagination
     */
    static async getAllTechniques(page, limit) {
        if (page && limit) {
            const skip = (page - 1) * limit;
            const totalResults = await stress_technique_model_1.default.countDocuments();
            const totalPages = Math.ceil(totalResults / limit);
            const techniques = await stress_technique_model_1.default.find()
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 });
            return {
                techniques,
                pagination: {
                    totalResults,
                    totalPages,
                    currentPage: page,
                    limit
                }
            };
        }
        const techniques = await stress_technique_model_1.default.find().sort({ name: 1 });
        return { techniques };
    }
    /**
     * Get techniques by category
     */
    static async getTechniquesByCategory(category) {
        return stress_technique_model_1.default.find({ category });
    }
    /**
     * Get techniques by difficulty level
     */
    static async getTechniquesByDifficulty(difficultyLevel) {
        return stress_technique_model_1.default.find({ difficultyLevel });
    }
    /**
     * Search techniques by query string (searches name, description, and tags)
     */
    static async searchTechniques(query) {
        // Use text search for more complex queries
        if (query.length > 3) {
            return stress_technique_model_1.default.find({ $text: { $search: query } })
                .sort({ score: { $meta: 'textScore' } });
        }
        // Use regex for simple queries
        const regex = new RegExp(query, 'i');
        return stress_technique_model_1.default.find({
            $or: [
                { name: regex },
                { description: regex },
                { tags: regex }
            ]
        });
    }
    /**
     * Get techniques within a duration range
     */
    static async getTechniquesByDuration(minDuration, maxDuration) {
        return stress_technique_model_1.default.find({
            durationMinutes: { $gte: minDuration, $lte: maxDuration }
        });
    }
    /**
     * Get recommended techniques for a user based on their preferences
     */
    static async getRecommendedTechniques(userId) {
        var _a;
        // Find the user and their preferences
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Default preferences if none are set
        const defaultPreferences = {
            preferredCategories: ['breathing', 'meditation'],
            preferredDuration: 10,
            difficultyLevel: 'beginner'
        };
        // Get user preferences or use defaults
        const preferences = ((_a = user.preferences) === null || _a === void 0 ? void 0 : _a.stressManagement) || defaultPreferences;
        // Build query based on user preferences
        const query = {};
        // Filter by preferred categories if available
        if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
            query.category = { $in: preferences.preferredCategories };
        }
        // Filter by difficulty level
        if (preferences.difficultyLevel) {
            query.difficultyLevel = preferences.difficultyLevel;
        }
        // Find techniques matching preferences
        const techniques = await stress_technique_model_1.default.find(query);
        // If no techniques match preferences, return beginner techniques
        if (techniques.length === 0) {
            return stress_technique_model_1.default.find({ difficultyLevel: 'beginner' }).limit(3);
        }
        return techniques;
    }
    /**
     * Create a new technique
     */
    static async createTechnique(techniqueData) {
        const technique = new stress_technique_model_1.default(techniqueData);
        return technique.save();
    }
    /**
     * Update an existing technique
     */
    static async updateTechnique(id, techniqueData) {
        return stress_technique_model_1.default.findByIdAndUpdate(id, techniqueData, {
            new: true,
            runValidators: true
        });
    }
    /**
     * Delete a technique
     */
    static async deleteTechnique(id) {
        return stress_technique_model_1.default.findByIdAndDelete(id);
    }
}
exports.StressTechniqueService = StressTechniqueService;
