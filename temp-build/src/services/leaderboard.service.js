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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const cache_manager_service_1 = require("./cache-manager.service");
const user_points_model_1 = require("../models/user-points.model");
class LeaderboardService {
    static getCacheKey(period = 'all-time', category = 'total', limit = 10) {
        return `leaderboard:${period}:${category}:${limit}`;
    }
    static getUserRankCacheKey(userId, period = 'all-time', category = 'total') {
        return `rank:${userId}:${period}:${category}`;
    }
    static getLeaderboard() {
        return __awaiter(this, arguments, void 0, function* (period = 'all-time', category = 'total', limit = 10) {
            const cacheKey = `leaderboard:${period}:${category}:${limit}`;
            // Try to get from cache first
            const cached = yield cache_manager_service_1.CacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Build aggregation pipeline
            const dateFilter = this.getDateFilter(period);
            const pointsField = this.getPointsField(category);
            const pipeline = [
                // Match documents within the time period
                ...(dateFilter ? [{ $match: dateFilter }] : []),
                // Group by user
                {
                    $group: {
                        _id: '$userId',
                        points: this.getPointsAggregation(category, period)
                    }
                },
                // Sort by points descending
                { $sort: { points: -1 } },
                // Limit results
                { $limit: limit },
                // Lookup user details
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                // Project final fields
                {
                    $project: {
                        userId: '$_id',
                        username: { $arrayElemAt: ['$user.username', 0] },
                        points: 1,
                        _id: 0
                    }
                }
            ];
            const results = yield user_points_model_1.UserPoints.aggregate(pipeline);
            // Add rank
            const leaderboard = results.map((entry, index) => (Object.assign(Object.assign({}, entry), { rank: index + 1 })));
            // Cache results
            yield cache_manager_service_1.CacheManager.set(cacheKey, leaderboard, 300); // 5 minutes
            return leaderboard;
        });
    }
    static getUserRank(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, period = 'all-time', category = 'total') {
            const userIdStr = userId.toString();
            const cacheKey = `leaderboard:rank:${userIdStr}:${period}:${category}`;
            const cached = yield cache_manager_service_1.CacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const pointsField = this.getPointsField(category);
            const dateFilter = this.getDateFilter(period);
            // Get the user's points
            const userPoints = yield user_points_model_1.UserPoints.findOne({ userId });
            if (!userPoints) {
                return { rank: 0, total: 0, totalUsers: 0 };
            }
            // Get the total number of users with points
            const totalUsers = yield user_points_model_1.UserPoints.countDocuments(Object.assign({ [pointsField]: { $gt: 0 } }, dateFilter));
            // Get the user's rank
            const rank = (yield user_points_model_1.UserPoints.countDocuments(Object.assign({ [pointsField]: { $gt: userPoints.get(pointsField) || 0 } }, dateFilter))) + 1;
            const result = {
                rank,
                total: userPoints.get(pointsField) || 0,
                totalUsers
            };
            yield cache_manager_service_1.CacheManager.set(cacheKey, result, 300); // Cache for 5 minutes
            return result;
        });
    }
    static getTopAchievers() {
        return __awaiter(this, arguments, void 0, function* (limit = 3) {
            const cacheKey = `topAchievers:${limit}`;
            // Try to get from cache first
            const cached = yield cache_manager_service_1.CacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Get leaderboard with achievements category
            return this.getLeaderboard('all-time', 'total', limit);
        });
    }
    static getWeeklyProgress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `weeklyProgress:${userId}`;
            // Try to get from cache first
            const cached = yield cache_manager_service_1.CacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Calculate date ranges
            const now = new Date();
            const currentWeekStart = new Date(now);
            currentWeekStart.setDate(now.getDate() - 7);
            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(currentWeekStart.getDate() - 7);
            // Get user points
            const userPoints = yield user_points_model_1.UserPoints.findOne({ userId });
            // Calculate points for current week
            const currentWeekPoints = (userPoints === null || userPoints === void 0 ? void 0 : userPoints.history.filter(entry => entry.date >= currentWeekStart).reduce((sum, entry) => sum + entry.points, 0)) || 0;
            // Calculate points for previous week
            const previousWeekPoints = (userPoints === null || userPoints === void 0 ? void 0 : userPoints.history.filter(entry => entry.date >= previousWeekStart && entry.date < currentWeekStart).reduce((sum, entry) => sum + entry.points, 0)) || 0;
            // Calculate change
            const change = currentWeekPoints - previousWeekPoints;
            const percentChange = previousWeekPoints > 0
                ? (change / previousWeekPoints) * 100
                : (currentWeekPoints > 0 ? 100 : 0);
            const result = {
                currentWeek: currentWeekPoints,
                previousWeek: previousWeekPoints,
                change,
                percentChange
            };
            // Cache results
            yield cache_manager_service_1.CacheManager.set(cacheKey, result, 3600); // 1 hour
            return result;
        });
    }
    static invalidateUserCache(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Delete all cache keys related to this user
            yield cache_manager_service_1.CacheManager.del(`userRank:${userId}:all-time:total`);
            yield cache_manager_service_1.CacheManager.del(`userRank:${userId}:weekly:total`);
            yield cache_manager_service_1.CacheManager.del(`userRank:${userId}:monthly:total`);
            yield cache_manager_service_1.CacheManager.del(`weeklyProgress:${userId}`);
            // Also invalidate leaderboard caches
            yield cache_manager_service_1.CacheManager.del('leaderboard:all-time:total:10');
            yield cache_manager_service_1.CacheManager.del('leaderboard:weekly:total:10');
            yield cache_manager_service_1.CacheManager.del('leaderboard:monthly:total:10');
            yield cache_manager_service_1.CacheManager.del('topAchievers:3');
        });
    }
    // Helper methods
    static getDateFilter(period) {
        const now = new Date();
        switch (period) {
            case 'daily':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return { 'history.date': { $gte: today } };
            case 'weekly':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                return { 'history.date': { $gte: weekStart } };
            case 'monthly':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return { 'history.date': { $gte: monthStart } };
            case 'all-time':
            default:
                return null;
        }
    }
    static getPointsField(category) {
        switch (category) {
            case 'meditation':
                return 'meditationPoints';
            case 'streak':
                return 'streakPoints';
            case 'social':
                return 'socialPoints';
            case 'total':
            default:
                return 'totalPoints';
        }
    }
    static getPointsAggregation(category, period) {
        if (period === 'all-time') {
            // For all-time, use the accumulated field
            const field = this.getPointsField(category);
            return { $sum: `$${field}` };
        }
        else {
            // For time-limited periods, sum from history
            const dateFilter = this.getDateFilter(period);
            const sourceFilter = category === 'total'
                ? {}
                : { 'history.source': category === 'meditation' ? 'achievement' : category };
            return {
                $sum: {
                    $cond: [
                        { $and: [
                                dateFilter ? { $gte: ['$history.date', dateFilter['history.date'].$gte] } : true,
                                Object.keys(sourceFilter).length > 0
                                    ? { $eq: ['$history.source', sourceFilter['history.source']] }
                                    : true
                            ] },
                        '$history.points',
                        0
                    ]
                }
            };
        }
    }
    // Start the cache cleanup when the service initializes
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize cache and other resources
        });
    }
    static shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            // Cleanup resources
        });
    }
}
exports.LeaderboardService = LeaderboardService;
