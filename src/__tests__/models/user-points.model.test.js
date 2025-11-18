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
const user_points_model_1 = require("../../models/user-points.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestUserPoints = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId(), total: 0, achievements: [], streaks: [], recent: [] }, overrides));
describe('UserPoints Model', () => {
    let testUserPoints;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testUserPoints = createTestUserPoints();
        jest.spyOn(user_points_model_1.UserPoints.prototype, 'save').mockImplementation(function () {
            return Promise.resolve(this);
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create and save user points successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            expect(userPoints.userId).toBeDefined();
            expect(userPoints.total).toBe(0);
            expect(userPoints.achievements).toEqual([]);
            expect(userPoints.streaks).toEqual([]);
            expect(userPoints.recent).toEqual([]);
        }));
        it('should add points correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            const pointsToAdd = 100;
            yield userPoints.addPoints(pointsToAdd, 'meditation', 'Completed meditation session');
            expect(userPoints.total).toBe(pointsToAdd);
        }));
        it('should track achievements successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            const achievement = {
                id: 'meditation_master',
                name: 'Meditation Master',
                description: 'Complete 10 meditation sessions',
                points: 500,
                earnedAt: new Date()
            };
            userPoints.achievements.push(achievement);
            yield userPoints.save();
            expect(userPoints.achievements).toHaveLength(1);
        }));
    });
    describe('Error Cases', () => {
        it('should fail when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(() => new user_points_model_1.UserPoints({})).toThrow();
        }));
        it('should reject duplicate userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            yield user_points_model_1.UserPoints.create(Object.assign(Object.assign({}, testUserPoints), { userId }));
            yield expect(user_points_model_1.UserPoints.create(Object.assign(Object.assign({}, testUserPoints), { userId }))).rejects.toThrow();
        }));
        it('should fail when adding invalid points', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            expect(() => userPoints.addPoints(NaN, 'test', 'Invalid points')).toThrow();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle zero points correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            yield userPoints.addPoints(0, 'test', 'Zero points');
            expect(userPoints.total).toBe(0);
        }));
        it('should handle negative points', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(Object.assign(Object.assign({}, testUserPoints), { total: 100 }));
            yield userPoints.addPoints(-50, 'penalty', 'Point deduction');
            expect(userPoints.total).toBe(50);
        }));
        it('should handle maximum recent points history', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(testUserPoints);
            const maxEntries = 10;
            for (let i = 0; i < maxEntries + 5; i++) {
                yield userPoints.addPoints(10, 'test', `Entry ${i}`);
            }
            expect(userPoints.recent).toHaveLength(maxEntries);
        }));
    });
    describe('Schema Validation', () => {
        it('should initialize with default values', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            expect(userPoints.total).toBe(0);
            expect(userPoints.achievements).toEqual([]);
            expect(userPoints.streaks).toEqual([]);
            expect(userPoints.recent).toEqual([]);
        }));
    });
    describe('Points Management', () => {
        it('should maintain recent points history limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            const maxRecentEntries = 10; // Assuming this is the limit
            // Add more entries than the limit
            for (let i = 0; i < maxRecentEntries + 5; i++) {
                yield userPoints.addPoints(10, 'test', `Entry ${i}`);
            }
            expect(userPoints.recent).toHaveLength(maxRecentEntries);
            expect(userPoints.recent[0].description).toBe(`Entry ${maxRecentEntries + 4}`);
        }));
    });
    describe('Achievement Tracking', () => {
        it('should prevent duplicate achievements', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            const achievementId = 'meditation_master';
            const achievement = {
                id: achievementId,
                name: 'Meditation Master',
                description: 'Complete 10 meditation sessions',
                points: 500,
                earnedAt: new Date()
            };
            userPoints.achievements.push(achievement);
            yield userPoints.save();
            // Attempt to add the same achievement again
            userPoints.achievements.push(Object.assign(Object.assign({}, achievement), { points: 1000 }));
            const validationError = yield userPoints.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['achievements']).toBeDefined();
        }));
    });
    describe('Streak Management', () => {
        it('should track streaks correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            const streak = {
                type: 'meditation',
                count: 5,
                startDate: new Date(),
                lastUpdateDate: new Date()
            };
            userPoints.streaks.push(streak);
            yield userPoints.save();
            expect(userPoints.streaks).toHaveLength(1);
            expect(userPoints.streaks[0]).toMatchObject(streak);
        }));
        it('should update existing streak', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            const initialStreak = {
                type: 'meditation',
                count: 5,
                startDate: new Date(),
                lastUpdateDate: new Date()
            };
            userPoints.streaks.push(initialStreak);
            yield userPoints.save();
            // Update the streak
            const updatedStreak = Object.assign(Object.assign({}, initialStreak), { count: 6, lastUpdateDate: new Date() });
            userPoints.streaks[0] = updatedStreak;
            yield userPoints.save();
            expect(userPoints.streaks[0].count).toBe(6);
        }));
    });
    describe('Virtual Fields', () => {
        it('should calculate level based on total points', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            // Test different point thresholds
            const testCases = [
                { points: 0, expectedLevel: 1 },
                { points: 1000, expectedLevel: 2 },
                { points: 5000, expectedLevel: 3 },
                { points: 10000, expectedLevel: 4 }
            ];
            for (const { points, expectedLevel } of testCases) {
                userPoints.total = points;
                yield userPoints.save();
                expect(userPoints.level).toBe(expectedLevel);
            }
        }));
        it('should calculate points to next level', () => __awaiter(void 0, void 0, void 0, function* () {
            const userPoints = yield user_points_model_1.UserPoints.create(createTestUserPoints());
            userPoints.total = 500; // Level 1
            yield userPoints.save();
            expect(userPoints.pointsToNextLevel).toBe(500); // 1000 - 500
            userPoints.total = 1500; // Level 2
            yield userPoints.save();
            expect(userPoints.pointsToNextLevel).toBe(3500); // 5000 - 1500
        }));
    });
    describe('Indexes', () => {
        it('should have an index on userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield user_points_model_1.UserPoints.collection.getIndexes();
            const hasUserIdIndex = Object.values(indexes).some(index => index.key.userId !== undefined);
            expect(hasUserIdIndex).toBe(true);
        }));
    });
});
