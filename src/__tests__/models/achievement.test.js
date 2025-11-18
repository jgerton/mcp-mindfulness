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
const db_handler_1 = require("../test-utils/db-handler");
describe('Achievement Models', () => {
    let testAchievement;
    let testUserAchievement;
    let userId;
    let achievementId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        userId = new mongoose_1.default.Types.ObjectId();
        achievementId = new mongoose_1.default.Types.ObjectId();
        testAchievement = {
            name: 'Test Achievement',
            description: 'Test achievement description',
            category: achievement_model_1.AchievementCategory.MEDITATION,
            criteria: {
                type: achievement_model_1.AchievementType.TOTAL_SESSIONS,
                value: 10
            },
            icon: 'test-icon.svg',
            points: 100,
            type: achievement_model_1.AchievementType.BRONZE,
            progress: 0,
            target: 10,
            completed: false
        };
        testUserAchievement = {
            userId,
            achievementId,
            progress: 50,
            isCompleted: false,
            dateEarned: null
        };
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create achievement successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = yield achievement_model_1.Achievement.create(testAchievement);
            expect(achievement.name).toBe(testAchievement.name);
            expect(achievement.description).toBe(testAchievement.description);
            expect(achievement.category).toBe(testAchievement.category);
            expect(achievement.points).toBe(testAchievement.points);
            expect(achievement.type).toBe(testAchievement.type);
        }));
        it('should create user achievement successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = yield achievement_model_1.UserAchievement.create(testUserAchievement);
            expect(userAchievement.userId).toEqual(testUserAchievement.userId);
            expect(userAchievement.achievementId).toEqual(testUserAchievement.achievementId);
            expect(userAchievement.progress).toBe(testUserAchievement.progress);
            expect(userAchievement.isCompleted).toBe(false);
        }));
        it('should track achievement progress correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = yield achievement_model_1.UserAchievement.create(Object.assign(Object.assign({}, testUserAchievement), { progress: 0 }));
            userAchievement.progress = 75;
            yield userAchievement.save();
            expect(userAchievement.progress).toBe(75);
            userAchievement.progress = 100;
            userAchievement.isCompleted = true;
            userAchievement.dateEarned = new Date();
            yield userAchievement.save();
            expect(userAchievement.isCompleted).toBe(true);
            expect(userAchievement.dateEarned).toBeDefined();
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required achievement fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement({});
            const validationError = yield achievement.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.name).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.criteria).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.icon).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.points).toBeDefined();
        }));
        it('should reject invalid achievement values', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = new achievement_model_1.Achievement(Object.assign(Object.assign({}, testAchievement), { name: 'a'.repeat(101), description: 'a'.repeat(501), points: -1, category: 'invalid' }));
            const validationError = yield achievement.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.name).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.points).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
        }));
        it('should reject invalid user achievement values', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = new achievement_model_1.UserAchievement(Object.assign(Object.assign({}, testUserAchievement), { progress: -1 }));
            const validationError = yield userAchievement.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.progress).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle duplicate user achievements', () => __awaiter(void 0, void 0, void 0, function* () {
            yield achievement_model_1.UserAchievement.create(testUserAchievement);
            yield expect(achievement_model_1.UserAchievement.create(testUserAchievement))
                .rejects
                .toThrow();
        }));
        it('should handle progress boundary values', () => __awaiter(void 0, void 0, void 0, function* () {
            const userAchievement = yield achievement_model_1.UserAchievement.create(Object.assign(Object.assign({}, testUserAchievement), { progress: 0 }));
            // Test minimum value
            expect(userAchievement.progress).toBe(0);
            // Test maximum value
            userAchievement.progress = 100;
            yield userAchievement.save();
            expect(userAchievement.progress).toBe(100);
            // Test invalid values
            userAchievement.progress = 101;
            const validationError = yield userAchievement.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.progress).toBeDefined();
        }));
        it('should handle achievement completion edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievement = yield achievement_model_1.Achievement.create(Object.assign(Object.assign({}, testAchievement), { progress: 9, target: 10 }));
            // Test near completion
            expect(achievement.completed).toBe(false);
            // Test exact completion
            achievement.progress = achievement.target;
            achievement.completed = true;
            achievement.completedAt = new Date();
            yield achievement.save();
            expect(achievement.completed).toBe(true);
            expect(achievement.completedAt).toBeDefined();
        }));
    });
});
