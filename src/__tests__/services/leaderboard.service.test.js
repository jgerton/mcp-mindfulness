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
const leaderboard_service_1 = require("../../services/leaderboard.service");
const user_points_model_1 = require("../../models/user-points.model");
const user_model_1 = require("../../models/user.model");
const cache_manager_service_1 = require("../../services/cache-manager.service");
const db_handler_1 = require("../test-utils/db-handler");
const user_factory_1 = require("../factories/user.factory");
// Mock cache manager
jest.mock('../../services/cache-manager.service');
describe('LeaderboardService', () => {
    let userFactory;
    let users;
    let userPoints;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        userFactory = new user_factory_1.UserTestFactory();
        jest.clearAllMocks();
        // Create test users
        users = Array.from({ length: 5 }, (_, i) => ({
            _id: new mongoose_1.default.Types.ObjectId(),
            username: `user${i + 1}`
        }));
        yield user_model_1.User.insertMany(users);
        // Create user points with different scores
        userPoints = users.map((user, i) => ({
            userId: user._id,
            totalPoints: (5 - i) * 100,
            meditationPoints: (5 - i) * 50,
            streakPoints: (5 - i) * 25,
            socialPoints: (5 - i) * 75,
            history: [
                {
                    date: new Date(),
                    points: (5 - i) * 10,
                    type: 'meditation'
                }
            ]
        }));
        yield user_points_model_1.UserPoints.insertMany(userPoints);
        // Mock cache methods
        cache_manager_service_1.CacheManager.get.mockResolvedValue(null);
        cache_manager_service_1.CacheManager.set.mockResolvedValue(true);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('getLeaderboard', () => {
        it('should return cached leaderboard if available', () => __awaiter(void 0, void 0, void 0, function* () {
            const cachedData = [{ userId: users[0]._id, username: 'user1', points: 100, rank: 1 }];
            cache_manager_service_1.CacheManager.get.mockResolvedValueOnce(cachedData);
            const result = yield leaderboard_service_1.LeaderboardService.getLeaderboard();
            expect(result).toEqual(cachedData);
            expect(cache_manager_service_1.CacheManager.get).toHaveBeenCalled();
        }));
        it('should return correct leaderboard for total points', () => __awaiter(void 0, void 0, void 0, function* () {
            const leaderboard = yield leaderboard_service_1.LeaderboardService.getLeaderboard('all-time', 'total', 5);
            expect(leaderboard).toHaveLength(5);
            expect(leaderboard[0].username).toBe('user1');
            expect(leaderboard[0].points).toBe(500);
            expect(leaderboard[0].rank).toBe(1);
        }));
        it('should return correct leaderboard for meditation category', () => __awaiter(void 0, void 0, void 0, function* () {
            const leaderboard = yield leaderboard_service_1.LeaderboardService.getLeaderboard('all-time', 'meditation', 3);
            expect(leaderboard).toHaveLength(3);
            expect(leaderboard[0].points).toBe(250);
            expect(leaderboard[1].points).toBe(200);
            expect(leaderboard[2].points).toBe(150);
        }));
        it('should respect the limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const leaderboard = yield leaderboard_service_1.LeaderboardService.getLeaderboard('all-time', 'total', 2);
            expect(leaderboard).toHaveLength(2);
        }));
    });
    describe('getUserRank', () => {
        it('should return cached rank if available', () => __awaiter(void 0, void 0, void 0, function* () {
            const cachedData = { rank: 1, total: 500, totalUsers: 5 };
            cache_manager_service_1.CacheManager.get.mockResolvedValueOnce(cachedData);
            const result = yield leaderboard_service_1.LeaderboardService.getUserRank(users[0]._id);
            expect(result).toEqual(cachedData);
        }));
        it('should return correct rank for top user', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield leaderboard_service_1.LeaderboardService.getUserRank(users[0]._id);
            expect(result.rank).toBe(1);
            expect(result.total).toBe(500);
            expect(result.totalUsers).toBe(5);
        }));
        it('should return correct rank for middle user', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield leaderboard_service_1.LeaderboardService.getUserRank(users[2]._id);
            expect(result.rank).toBe(3);
            expect(result.total).toBe(300);
        }));
        it('should handle non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield leaderboard_service_1.LeaderboardService.getUserRank(new mongoose_1.default.Types.ObjectId());
            expect(result).toEqual({
                rank: 0,
                total: 0,
                totalUsers: 0
            });
        }));
    });
    describe('getTopAchievers', () => {
        it('should return cached achievers if available', () => __awaiter(void 0, void 0, void 0, function* () {
            const cachedData = [{ userId: users[0]._id, username: 'user1', points: 500, rank: 1 }];
            cache_manager_service_1.CacheManager.get.mockResolvedValueOnce(cachedData);
            const result = yield leaderboard_service_1.LeaderboardService.getTopAchievers();
            expect(result).toEqual(cachedData);
        }));
        it('should return top 3 achievers by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievers = yield leaderboard_service_1.LeaderboardService.getTopAchievers();
            expect(achievers).toHaveLength(3);
            expect(achievers[0].points).toBeGreaterThan(achievers[1].points);
            expect(achievers[1].points).toBeGreaterThan(achievers[2].points);
        }));
        it('should respect custom limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const achievers = yield leaderboard_service_1.LeaderboardService.getTopAchievers(2);
            expect(achievers).toHaveLength(2);
        }));
    });
    describe('getWeeklyProgress', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Add historical data
            const now = new Date();
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            yield user_points_model_1.UserPoints.findOneAndUpdate({ userId: users[0]._id }, {
                $push: {
                    history: [
                        { date: now, points: 100, type: 'meditation' },
                        { date: lastWeek, points: 50, type: 'meditation' }
                    ]
                }
            });
        }));
        it('should return cached progress if available', () => __awaiter(void 0, void 0, void 0, function* () {
            const cachedData = {
                currentWeek: 100,
                previousWeek: 50,
                change: 50,
                percentChange: 100
            };
            cache_manager_service_1.CacheManager.get.mockResolvedValueOnce(cachedData);
            const result = yield leaderboard_service_1.LeaderboardService.getWeeklyProgress(users[0]._id);
            expect(result).toEqual(cachedData);
        }));
        it('should calculate correct weekly progress', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield leaderboard_service_1.LeaderboardService.getWeeklyProgress(users[0]._id);
            expect(progress.currentWeek).toBe(100);
            expect(progress.previousWeek).toBe(50);
            expect(progress.change).toBe(50);
            expect(progress.percentChange).toBe(100);
        }));
        it('should handle user with no history', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield leaderboard_service_1.LeaderboardService.getWeeklyProgress(new mongoose_1.default.Types.ObjectId());
            expect(progress.currentWeek).toBe(0);
            expect(progress.previousWeek).toBe(0);
            expect(progress.change).toBe(0);
            expect(progress.percentChange).toBe(0);
        }));
    });
    describe('invalidateUserCache', () => {
        it('should delete all cache entries for user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield leaderboard_service_1.LeaderboardService.invalidateUserCache(users[0]._id);
            expect(cache_manager_service_1.CacheManager.del).toHaveBeenCalledTimes(1);
            expect(cache_manager_service_1.CacheManager.del).toHaveBeenCalledWith(expect.stringContaining(users[0]._id.toString()));
        }));
    });
});
