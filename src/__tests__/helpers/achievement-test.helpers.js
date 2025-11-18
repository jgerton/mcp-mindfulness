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
exports.setupAchievementTests = exports.clearAchievementData = exports.createTestUserAchievements = exports.createTestAchievements = exports.createTestUserAchievement = exports.createTestAchievement = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const achievement_model_1 = require("../../models/achievement.model");
/**
 * Creates a test achievement with provided options or defaults
 */
const createTestAchievement = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    const defaultOptions = {
        name: 'Test Achievement',
        description: 'A test achievement for testing purposes',
        category: 'milestone', // Valid category from the enum
        criteria: {
            type: 'session_count',
            value: 5
        },
        icon: 'test_icon.png',
        points: 10
    };
    try {
        const achievementData = Object.assign(Object.assign({}, defaultOptions), options);
        // Validate category to prevent schema validation errors
        if (!['meditation', 'streak', 'social', 'milestone', 'challenge', 'wellness'].includes(achievementData.category)) {
            console.warn(`Warning: Invalid category '${achievementData.category}'. Defaulting to 'milestone'.`);
            achievementData.category = 'milestone';
        }
        const achievement = new achievement_model_1.Achievement(achievementData);
        yield achievement.save();
        return achievement;
    }
    catch (error) {
        console.error('Error creating test achievement:', error);
        throw error;
    }
});
exports.createTestAchievement = createTestAchievement;
/**
 * Creates a test user achievement record with provided options or defaults
 */
const createTestUserAchievement = (userId_1, achievementId_1, ...args_1) => __awaiter(void 0, [userId_1, achievementId_1, ...args_1], void 0, function* (userId, achievementId, options = {}) {
    try {
        // If no achievementId is provided, create a test achievement
        if (!achievementId) {
            const achievement = yield (0, exports.createTestAchievement)();
            achievementId = achievement._id.toString();
        }
        const defaultOptions = {
            progress: 50,
            isCompleted: false
        };
        const userAchievementData = Object.assign(Object.assign({ userId: new mongoose_1.default.Types.ObjectId(userId), achievementId: new mongoose_1.default.Types.ObjectId(achievementId) }, defaultOptions), options);
        const userAchievement = new achievement_model_1.UserAchievement(userAchievementData);
        yield userAchievement.save();
        return userAchievement;
    }
    catch (error) {
        console.error('Error creating test user achievement:', error);
        throw error;
    }
});
exports.createTestUserAchievement = createTestUserAchievement;
/**
 * Creates multiple test achievements at once
 */
const createTestAchievements = (count_1, ...args_1) => __awaiter(void 0, [count_1, ...args_1], void 0, function* (count, baseOptions = {}) {
    const achievements = [];
    try {
        for (let i = 0; i < count; i++) {
            const achievement = yield (0, exports.createTestAchievement)(Object.assign({ name: `Test Achievement ${i + 1}` }, baseOptions));
            achievements.push(achievement);
            // Add small delay to prevent overwhelming the database
            if (i < count - 1) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        return achievements;
    }
    catch (error) {
        console.error('Error creating multiple test achievements:', error);
        throw error;
    }
});
exports.createTestAchievements = createTestAchievements;
/**
 * Creates multiple user achievements for a single user
 */
const createTestUserAchievements = (userId_1, count_1, ...args_1) => __awaiter(void 0, [userId_1, count_1, ...args_1], void 0, function* (userId, count, baseOptions = {}) {
    try {
        // First create the achievements
        const achievements = yield (0, exports.createTestAchievements)(count);
        // Then create user achievements for each
        const userAchievements = [];
        for (let i = 0; i < achievements.length; i++) {
            const userAchievement = yield (0, exports.createTestUserAchievement)(userId, achievements[i]._id.toString(), Object.assign({}, baseOptions));
            userAchievements.push(userAchievement);
            // Add small delay to prevent overwhelming the database
            if (i < achievements.length - 1) {
                yield new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        return userAchievements;
    }
    catch (error) {
        console.error('Error creating multiple user achievements:', error);
        throw error;
    }
});
exports.createTestUserAchievements = createTestUserAchievements;
/**
 * Clears all achievement-related data from the test database
 */
const clearAchievementData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            yield achievement_model_1.Achievement.deleteMany({});
            yield achievement_model_1.UserAchievement.deleteMany({});
        }
    }
    catch (error) {
        console.error('Error clearing achievement data:', error);
    }
});
exports.clearAchievementData = clearAchievementData;
/**
 * Set up achievement test helpers for beforeEach/afterEach hooks
 */
const setupAchievementTests = () => {
    // Clear achievement data after each test
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, exports.clearAchievementData)();
    }));
};
exports.setupAchievementTests = setupAchievementTests;
