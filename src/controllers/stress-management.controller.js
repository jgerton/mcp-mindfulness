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
exports.StressManagementController = void 0;
const stress_management_service_1 = require("../services/stress-management.service");
const stress_model_1 = require("../models/stress.model");
class StressManagementController {
    static submitAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming auth middleware sets user
                const assessment = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const stressLevel = yield stress_management_service_1.StressManagementService.assessStressLevel(userId, assessment);
                const recommendations = yield stress_management_service_1.StressManagementService.getRecommendations(userId);
                res.json({
                    stressLevel,
                    recommendations
                });
            }
            catch (error) {
                console.error('Error submitting stress assessment:', error);
                res.status(500).json({ error: 'Failed to submit stress assessment' });
            }
        });
    }
    static getStressHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { startDate, endDate } = req.query;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const history = yield stress_model_1.StressAssessment.find({
                    userId,
                    timestamp: {
                        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        $lte: endDate ? new Date(endDate) : new Date()
                    }
                }).sort({ timestamp: -1 });
                res.json(history);
            }
            catch (error) {
                console.error('Error fetching stress history:', error);
                res.status(500).json({ error: 'Failed to fetch stress history' });
            }
        });
    }
    static getLatestAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const latestAssessment = yield stress_model_1.StressAssessment.findOne({ userId })
                    .sort({ timestamp: -1 });
                if (!latestAssessment) {
                    res.status(404).json({ error: 'No assessments found' });
                    return;
                }
                const recommendations = yield stress_management_service_1.StressManagementService.getRecommendations(userId);
                res.json({
                    assessment: latestAssessment,
                    recommendations
                });
            }
            catch (error) {
                console.error('Error fetching latest assessment:', error);
                res.status(500).json({ error: 'Failed to fetch latest assessment' });
            }
        });
    }
    static updatePreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const preferences = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const updatedPreferences = yield stress_model_1.UserPreferences.findOneAndUpdate({ userId }, Object.assign({}, preferences), { new: true, upsert: true });
                res.json(updatedPreferences);
            }
            catch (error) {
                console.error('Error updating preferences:', error);
                res.status(500).json({ error: 'Failed to update preferences' });
            }
        });
    }
    static getPreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const preferences = yield stress_model_1.UserPreferences.findOne({ userId });
                if (!preferences) {
                    res.status(404).json({ error: 'No preferences found' });
                    return;
                }
                res.json(preferences);
            }
            catch (error) {
                console.error('Error fetching preferences:', error);
                res.status(500).json({ error: 'Failed to fetch preferences' });
            }
        });
    }
    static getStressInsights(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Get last 30 days of assessments
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const assessments = yield stress_model_1.StressAssessment.find({
                    userId,
                    timestamp: { $gte: thirtyDaysAgo }
                }).sort({ timestamp: 1 });
                // Calculate insights
                const insights = {
                    averageLevel: this.calculateAverageStressLevel(assessments),
                    commonTriggers: this.findCommonTriggers(assessments),
                    trendAnalysis: this.analyzeTrend(assessments),
                    peakStressTimes: this.findPeakStressTimes(assessments)
                };
                res.json(insights);
            }
            catch (error) {
                console.error('Error generating stress insights:', error);
                res.status(500).json({ error: 'Failed to generate stress insights' });
            }
        });
    }
    static calculateAverageStressLevel(assessments) {
        if (!assessments.length)
            return 0;
        return assessments.reduce((sum, assessment) => sum + (assessment.score || 0), 0) / assessments.length;
    }
    static findCommonTriggers(assessments) {
        const triggerCount = new Map();
        assessments.forEach(assessment => {
            var _a;
            (_a = assessment.triggers) === null || _a === void 0 ? void 0 : _a.forEach(trigger => {
                triggerCount.set(trigger, (triggerCount.get(trigger) || 0) + 1);
            });
        });
        return Array.from(triggerCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([trigger]) => trigger);
    }
    static analyzeTrend(assessments) {
        if (assessments.length < 2)
            return 'STABLE';
        const firstHalf = assessments.slice(0, Math.floor(assessments.length / 2));
        const secondHalf = assessments.slice(Math.floor(assessments.length / 2));
        const firstAvg = this.calculateAverageStressLevel(firstHalf);
        const secondAvg = this.calculateAverageStressLevel(secondHalf);
        if (secondAvg < firstAvg - 0.5)
            return 'IMPROVING';
        if (secondAvg > firstAvg + 0.5)
            return 'WORSENING';
        return 'STABLE';
    }
    static findPeakStressTimes(assessments) {
        const hourlyStress = new Map();
        assessments.forEach(assessment => {
            const hour = new Date(assessment.timestamp).getHours();
            hourlyStress.set(hour, (hourlyStress.get(hour) || 0) + (assessment.score || 0));
        });
        return Array.from(hourlyStress.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([hour]) => `${hour}:00`);
    }
}
exports.StressManagementController = StressManagementController;
