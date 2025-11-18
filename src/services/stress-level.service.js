"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressLevelService = void 0;
const stress_log_model_1 = require("../models/stress-log.model");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Service class for handling stress level data
 */
class StressLevelService {
    /**
     * Get stress levels for a user within a specified date range
     * @param userId The user's ID
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @returns Array of stress level entries
     */
    static async getUserStressLevels(userId, startDate, endDate) {
        try {
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
            if (startDate || endDate) {
                query.date = {};
                if (startDate)
                    query.date.$gte = startDate;
                if (endDate)
                    query.date.$lte = endDate;
            }
            const stressLevels = await stress_log_model_1.StressLog.find(query)
                .sort({ date: -1 })
                .lean();
            return stressLevels;
        }
        catch (error) {
            console.error('Error fetching user stress levels:', error);
            throw error;
        }
    }
    /**
     * Get average stress level for a user over a time period
     * @param userId The user's ID
     * @param days Number of days to calculate average from
     * @returns Average stress level
     */
    static async getAverageStressLevel(userId, days = 30) {
        try {
            if (days < 0) {
                throw new Error('Days parameter must be non-negative');
            }
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const result = await stress_log_model_1.StressLog.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        date: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageLevel: { $avg: '$level' }
                    }
                }
            ]);
            return result.length > 0 ? parseFloat(result[0].averageLevel.toFixed(1)) : 0;
        }
        catch (error) {
            console.error('Error calculating average stress level:', error);
            throw error;
        }
    }
    /**
     * Create a new stress level log
     * @param userId The user's ID
     * @param data Stress log data
     * @returns Created stress log
     */
    static async createStressLog(userId, data) {
        try {
            const stressLog = await stress_log_model_1.StressLog.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                date: data.date || new Date(),
                level: data.level,
                triggers: data.triggers || [],
                symptoms: data.symptoms || [],
                notes: data.notes
            });
            return stressLog;
        }
        catch (error) {
            console.error('Error creating stress log:', error);
            throw error;
        }
    }
    /**
     * Get stress level trends for a user
     * @param userId The user's ID
     * @param days Number of days to analyze
     * @returns Trend analysis
     */
    static async getStressTrends(userId, days = 30) {
        try {
            if (days < 0) {
                throw new Error('Days parameter must be non-negative');
            }
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const stressLogs = await stress_log_model_1.StressLog.find({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                date: { $gte: startDate }
            }).sort({ date: 1 }).lean();
            if (stressLogs.length === 0) {
                return {
                    average: 0,
                    trend: 'STABLE',
                    highestLevel: 0,
                    lowestLevel: 0,
                    commonTriggers: []
                };
            }
            // Calculate average
            const sum = stressLogs.reduce((acc, log) => acc + log.level, 0);
            const average = parseFloat((sum / stressLogs.length).toFixed(1));
            // Calculate trend (IMPROVING, WORSENING, STABLE)
            let trend = 'STABLE';
            if (stressLogs.length >= 3) {
                const firstHalf = stressLogs.slice(0, Math.floor(stressLogs.length / 2));
                const secondHalf = stressLogs.slice(Math.floor(stressLogs.length / 2));
                const firstAvg = firstHalf.reduce((acc, log) => acc + log.level, 0) / firstHalf.length;
                const secondAvg = secondHalf.reduce((acc, log) => acc + log.level, 0) / secondHalf.length;
                if (secondAvg < firstAvg - 0.5)
                    trend = 'IMPROVING';
                if (secondAvg > firstAvg + 0.5)
                    trend = 'WORSENING';
            }
            // Find highest and lowest levels
            const highestLevel = Math.max(...stressLogs.map(log => log.level));
            const lowestLevel = Math.min(...stressLogs.map(log => log.level));
            // Find common triggers
            const triggerCounts = {};
            stressLogs.forEach(log => {
                (log.triggers || []).forEach((trigger) => {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                });
            });
            const commonTriggers = Object.entries(triggerCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([trigger]) => trigger);
            return {
                average,
                trend,
                highestLevel,
                lowestLevel,
                commonTriggers
            };
        }
        catch (error) {
            console.error('Error analyzing stress trends:', error);
            throw error;
        }
    }
}
exports.StressLevelService = StressLevelService;
