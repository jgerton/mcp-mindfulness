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
const achievement_model_1 = require("../../models/achievement.model");
const test_db_1 = require("../utils/test-db");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.connect)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.closeDatabase)();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, test_db_1.clearDatabase)();
}));
describe('Achievement Model', () => {
    const validAchievementData = {
        name: 'Meditation Master',
        description: 'Complete 10 meditation sessions',
        category: 'milestone',
        criteria: {
            type: 'sessionCount',
            value: 10
        },
        icon: 'meditation-icon.png',
        points: 100
    };
    describe('Schema Validation', () => {
        it('should create a valid achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(validAchievementData);
            const savedAchievement = yield achievement.save();
            expect(savedAchievement._id).toBeDefined();
            expect(savedAchievement.name).toBe(validAchievementData.name);
            expect(savedAchievement.description).toBe(validAchievementData.description);
            expect(savedAchievement.category).toBe(validAchievementData.category);
            expect(savedAchievement.criteria.type).toBe(validAchievementData.criteria.type);
            expect(savedAchievement.criteria.value).toBe(validAchievementData.criteria.value);
            expect(savedAchievement.icon).toBe(validAchievementData.icon);
            expect(savedAchievement.points).toBe(validAchievementData.points);
            expect(savedAchievement.createdAt).toBeDefined();
            expect(savedAchievement.updatedAt).toBeDefined();
        }));
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement({});
            let error;
            try {
                yield achievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.category).toBeDefined();
            expect(error.errors['criteria.type']).toBeDefined();
            expect(error.errors['criteria.value']).toBeDefined();
            expect(error.errors.icon).toBeDefined();
            expect(error.errors.points).toBeDefined();
        }));
        it('should fail validation when category is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(Object.assign(Object.assign({}, validAchievementData), { category: 'invalid-category' }));
            let error;
            try {
                yield achievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.category).toBeDefined();
            expect(error.errors.category.message).toContain('Achievement category must be one of');
        }));
        it('should fail validation when points are negative', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(Object.assign(Object.assign({}, validAchievementData), { points: -10 }));
            let error;
            try {
                yield achievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.points).toBeDefined();
            expect(error.errors.points.message).toBe('Achievement points cannot be negative');
        }));
        it('should fail validation when name exceeds maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(Object.assign(Object.assign({}, validAchievementData), { name: 'A'.repeat(101) }));
            let error;
            try {
                yield achievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
            expect(error.errors.name.message).toBe('Achievement name cannot be more than 100 characters');
        }));
        it('should fail validation when description exceeds maximum length', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(Object.assign(Object.assign({}, validAchievementData), { description: 'A'.repeat(501) }));
            let error;
            try {
                yield achievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.description).toBeDefined();
            expect(error.errors.description.message).toBe('Achievement description cannot be more than 500 characters');
        }));
    });
});
describe('UserAchievement Model', () => {
    let testAchievement;
    const userId = new mongoose_1.default.Types.ObjectId();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testAchievement = yield new achievement_model_1.Achievement({
            name: 'Meditation Master',
            description: 'Complete 10 meditation sessions',
            category: 'milestone',
            criteria: {
                type: 'sessionCount',
                value: 10
            },
            icon: 'meditation-icon.png',
            points: 100
        }).save();
    }));
    const validUserAchievementData = () => ({
        userId,
        achievementId: testAchievement._id,
        progress: 50,
        isCompleted: false
    });
    describe('Schema Validation', () => {
        it('should create a valid user achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = validUserAchievementData();
            const userAchievement = new achievement_model_1.UserAchievement(data);
            const savedUserAchievement = yield userAchievement.save();
            expect(savedUserAchievement._id).toBeDefined();
            expect(savedUserAchievement.userId.toString()).toBe(data.userId.toString());
            expect(savedUserAchievement.achievementId.toString()).toBe(data.achievementId.toString());
            expect(savedUserAchievement.progress).toBe(data.progress);
            expect(savedUserAchievement.isCompleted).toBe(data.isCompleted);
            expect(savedUserAchievement.dateEarned).toBeNull();
            expect(savedUserAchievement.createdAt).toBeDefined();
            expect(savedUserAchievement.updatedAt).toBeDefined();
        }));
        it('should set default values correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = new achievement_model_1.UserAchievement({
                userId,
                achievementId: testAchievement._id,
                progress: 50
            });
            const savedUserAchievement = yield userAchievement.save();
            expect(savedUserAchievement.isCompleted).toBe(false);
            expect(savedUserAchievement.dateEarned).toBeNull();
        }));
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = new achievement_model_1.UserAchievement({});
            let error;
            try {
                yield userAchievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.achievementId).toBeDefined();
            expect(error.errors.progress).toBeDefined();
        }));
        it('should fail validation when progress is negative', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = new achievement_model_1.UserAchievement(Object.assign(Object.assign({}, validUserAchievementData()), { progress: -10 }));
            let error;
            try {
                yield userAchievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.progress).toBeDefined();
            expect(error.errors.progress.message).toBe('Achievement progress cannot be negative');
        }));
        it('should fail validation when progress exceeds 100', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = new achievement_model_1.UserAchievement(Object.assign(Object.assign({}, validUserAchievementData()), { progress: 110 }));
            let error;
            try {
                yield userAchievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.errors.progress).toBeDefined();
            expect(error.errors.progress.message).toBe('Achievement progress cannot exceed 100');
        }));
        it('should enforce unique constraint on userId and achievementId', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create first user achievement
            yield new achievement_model_1.UserAchievement(validUserAchievementData()).save();
            // Try to create another with the same userId and achievementId
            const duplicateUserAchievement = new achievement_model_1.UserAchievement(validUserAchievementData());
            let error;
            try {
                yield duplicateUserAchievement.save();
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeDefined();
            expect(error.code).toBe(11000); // MongoDB duplicate key error code
        }));
        it('should update dateEarned when isCompleted is set to true', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = yield new achievement_model_1.UserAchievement(Object.assign(Object.assign({}, validUserAchievementData()), { isCompleted: true, dateEarned: new Date() })).save();
            expect(userAchievement.isCompleted).toBe(true);
            expect(userAchievement.dateEarned).toBeDefined();
            expect(userAchievement.dateEarned).not.toBeNull();
        }));
    });
});
