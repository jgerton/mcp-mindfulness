"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
class UserService {
    /**
     * Get a user by ID
     * @param userId The user's ID
     * @returns User document or null if not found
     */
    static async getUserById(userId) {
        try {
            const user = await user_model_1.User.findById(new mongoose_1.default.Types.ObjectId(userId)).lean();
            return user;
        }
        catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    }
    /**
     * Get user preferences
     * @param userId The user's ID
     * @returns User preferences
     */
    static async getUserPreferences(userId) {
        var _a, _b, _c, _d;
        try {
            const user = await user_model_1.User.findById(new mongoose_1.default.Types.ObjectId(userId)).lean();
            if (!user) {
                return null;
            }
            return {
                userId,
                preferredTechniques: ((_b = (_a = user.preferences) === null || _a === void 0 ? void 0 : _a.stressManagement) === null || _b === void 0 ? void 0 : _b.preferredCategories) || [],
                preferredDuration: ((_d = (_c = user.preferences) === null || _c === void 0 ? void 0 : _c.stressManagement) === null || _d === void 0 ? void 0 : _d.preferredDuration) || 10,
                preferredTime: 'morning', // Default value as this field doesn't exist in the model
                notificationFrequency: 'daily' // Default value as this field doesn't exist in the model
            };
        }
        catch (error) {
            console.error('Error fetching user preferences:', error);
            throw error;
        }
    }
    /**
     * Update user preferences
     * @param userId The user's ID
     * @param preferences Updated preferences
     * @returns Updated user document
     */
    static async updateUserPreferences(userId, preferences) {
        try {
            const updateData = {};
            if (preferences.preferredTechniques) {
                updateData['preferences.techniques'] = preferences.preferredTechniques;
            }
            if (preferences.preferredDuration) {
                updateData['preferences.duration'] = preferences.preferredDuration;
            }
            if (preferences.preferredTime) {
                updateData['preferences.time'] = preferences.preferredTime;
            }
            if (preferences.notificationFrequency) {
                updateData['preferences.notificationFrequency'] = preferences.notificationFrequency;
            }
            const user = await user_model_1.User.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(userId), { $set: updateData }, { new: true }).lean();
            return user;
        }
        catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
