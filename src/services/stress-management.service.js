"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressManagementService = void 0;
const stress_model_1 = require("../models/stress.model");
const stress_types_1 = require("../types/stress.types");
const mongoose_1 = __importDefault(require("mongoose"));
class StressManagementService {
    static async assessStressLevel(userId, assessment) {
        try {
            if (!userId) {
                throw new Error('User ID is required for stress assessment');
            }
            // Calculate stress score based on assessment answers
            const stressScore = this.calculateStressScore(assessment);
            // Get user's historical stress data
            const historicalData = await this.getUserStressHistory(userId.toString());
            // Determine stress level category
            const stressLevel = this.determineStressLevel(stressScore, historicalData);
            // Save assessment results
            await this.saveStressAssessment(userId.toString(), {
                ...assessment,
                score: stressScore,
                level: stressLevel,
                timestamp: new Date()
            });
            return stressLevel;
        }
        catch (error) {
            console.error('Error assessing stress level:', error);
            throw error;
        }
    }
    static async getRecommendations(userId, currentLevel) {
        try {
            const userIdStr = userId.toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
                throw new Error('Invalid user ID format');
            }
            const preferences = await stress_model_1.UserPreferences.findOne({ userId: userIdStr });
            if (!currentLevel) {
                const latestAssessment = await stress_model_1.StressAssessmentLegacy.findOne({ userId: userIdStr }).sort({ timestamp: -1 });
                currentLevel = (latestAssessment === null || latestAssessment === void 0 ? void 0 : latestAssessment.level) || stress_types_1.StressLevel.MODERATE;
            }
            return this.generateRecommendations(currentLevel || stress_types_1.StressLevel.MODERATE, preferences);
        }
        catch (error) {
            console.error('Error getting stress recommendations:', error);
            throw error;
        }
    }
    static async recordStressChange(userId, stressLevelBefore, stressLevelAfter, technique) {
        try {
            if (!userId || !stressLevelBefore || !stressLevelAfter || !technique) {
                throw new Error('Missing required parameters for recordStressChange');
            }
            // Log the stress change
            console.log(`User ${userId} stress change: ${stressLevelBefore} -> ${stressLevelAfter} using ${technique}`);
        }
        catch (error) {
            console.error('Error recording stress change:', error);
            throw error;
        }
    }
    static async getStressHistory(userId) {
        try {
            const userIdStr = userId.toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
                throw new Error('Invalid user ID format');
            }
            const history = await stress_model_1.StressAssessmentLegacy.find({ userId: userIdStr })
                .sort({ timestamp: -1 })
                .limit(30);
            return history;
        }
        catch (error) {
            console.error('Error getting stress history:', error);
            throw error;
        }
    }
    static async getStressAnalytics(userId) {
        try {
            const userIdStr = userId.toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
                throw new Error('Invalid user ID format');
            }
            const history = await this.getStressHistory(userIdStr);
            const analytics = {
                averageLevel: this.calculateAverageStressLevel(history),
                trendAnalysis: this.analyzeTrend(history),
                peakStressTimes: this.findPeakStressTimes(history)
            };
            return analytics;
        }
        catch (error) {
            console.error('Error getting stress analytics:', error);
            throw error;
        }
    }
    static async getStressPatterns(userId) {
        try {
            const userIdStr = userId.toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
                throw new Error('Invalid user ID format');
            }
            const history = await this.getStressHistory(userIdStr);
            const patterns = {
                weekdayPatterns: this.analyzeWeekdayPatterns(history),
                timeOfDayPatterns: this.analyzeTimeOfDayPatterns(history),
                commonTriggers: this.findCommonTriggers(history)
            };
            return patterns;
        }
        catch (error) {
            console.error('Error getting stress patterns:', error);
            throw error;
        }
    }
    static async getPeakStressHours(userId) {
        try {
            const userIdStr = userId.toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userIdStr)) {
                throw new Error('Invalid user ID format');
            }
            const history = await this.getStressHistory(userIdStr);
            return this.findPeakStressTimes(history);
        }
        catch (error) {
            console.error('Error getting peak stress hours:', error);
            throw error;
        }
    }
    // Private helper methods
    static calculateStressScore(assessment) {
        var _a, _b, _c, _d;
        // Validate assessment data
        if (!assessment) {
            throw new Error('Assessment data is required');
        }
        // Ensure all required fields are present with defaults if missing
        const physicalSymptoms = (_a = assessment.physicalSymptoms) !== null && _a !== void 0 ? _a : 0;
        const emotionalSymptoms = (_b = assessment.emotionalSymptoms) !== null && _b !== void 0 ? _b : 0;
        const behavioralSymptoms = (_c = assessment.behavioralSymptoms) !== null && _c !== void 0 ? _c : 0;
        const cognitiveSymptoms = (_d = assessment.cognitiveSymptoms) !== null && _d !== void 0 ? _d : 0;
        // Calculate weighted score based on symptoms
        const physicalWeight = 0.25;
        const emotionalWeight = 0.3;
        const behavioralWeight = 0.2;
        const cognitiveWeight = 0.25;
        return (physicalSymptoms * physicalWeight +
            emotionalSymptoms * emotionalWeight +
            behavioralSymptoms * behavioralWeight +
            cognitiveSymptoms * cognitiveWeight);
    }
    static determineStressLevel(score, history) {
        // Validate input
        if (score === undefined || score === null) {
            return stress_types_1.StressLevel.MODERATE; // Default to moderate if score is invalid
        }
        // Determine stress level based on score and history
        if (score < 3)
            return stress_types_1.StressLevel.LOW;
        if (score < 7)
            return stress_types_1.StressLevel.MODERATE;
        return stress_types_1.StressLevel.HIGH;
    }
    static async saveStressAssessment(userId, assessment) {
        // Validate inputs
        if (!userId || !assessment) {
            throw new Error('User ID and assessment data are required');
        }
        // Save assessment to database
        // Implementation would create and save a StressAssessment document
        console.log(`Saving stress assessment for user ${userId}: ${JSON.stringify(assessment)}`);
    }
    static async getUserStressHistory(userId) {
        // Validate input
        if (!userId) {
            return []; // Return empty array for invalid user ID
        }
        // Get user's stress history from database
        // Implementation would query StressAssessment collection
        return [];
    }
    static async getRecentAssessments(userId) {
        // Validate input
        if (!userId) {
            return []; // Return empty array for invalid user ID
        }
        // Get recent stress assessments
        // Implementation would query StressAssessment collection with time filter
        return [];
    }
    static generateRecommendations(level, preferences) {
        // Validate inputs
        if (!level) {
            level = stress_types_1.StressLevel.MODERATE; // Default to moderate if level is invalid
        }
        // Ensure preferences exists
        const safePreferences = preferences || {
            preferredTechniques: [],
            preferredDuration: 5,
            avoidedTechniques: []
        };
        // Generate recommendations based on stress level and user preferences
        const recommendations = [
            {
                duration: 5,
                technique: "4-7-8 Breathing",
                type: stress_types_1.TechniqueType.BREATHING,
                title: "Calming Breath Exercise",
                description: "A simple breathing technique to reduce anxiety"
            },
            {
                duration: 10,
                technique: "Body Scan",
                type: stress_types_1.TechniqueType.MEDITATION,
                title: "Body Awareness Meditation",
                description: "A meditation focusing on body sensations"
            },
            {
                duration: 15,
                technique: "Progressive Muscle Relaxation",
                type: stress_types_1.TechniqueType.PMR,
                title: "Tension Release",
                description: "Systematically tense and relax muscle groups"
            },
            {
                duration: 2,
                technique: "Square Breathing",
                type: stress_types_1.TechniqueType.BREATHING,
                title: "Quick Grounding Exercise",
                description: "A short breathing pattern to quickly reduce stress"
            }
        ];
        return recommendations;
    }
    static calculateAverageStressLevel(history) {
        if (!history.length)
            return 0;
        return history.reduce((sum, assessment) => sum + (assessment.score || 0), 0) / history.length;
    }
    static analyzeTrend(history) {
        if (history.length < 2)
            return 'STABLE';
        const firstHalf = history.slice(0, Math.floor(history.length / 2));
        const secondHalf = history.slice(Math.floor(history.length / 2));
        const firstAvg = this.calculateAverageStressLevel(firstHalf);
        const secondAvg = this.calculateAverageStressLevel(secondHalf);
        if (secondAvg < firstAvg - 0.5)
            return 'IMPROVING';
        if (secondAvg > firstAvg + 0.5)
            return 'WORSENING';
        return 'STABLE';
    }
    static findPeakStressTimes(history) {
        const hourlyStress = new Map();
        history.forEach(assessment => {
            const hour = new Date(assessment.timestamp).getHours();
            hourlyStress.set(hour, (hourlyStress.get(hour) || 0) + (assessment.score || 0));
        });
        return Array.from(hourlyStress.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`);
    }
    static analyzeWeekdayPatterns(history) {
        const weekdayStress = new Map();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        history.forEach(assessment => {
            const weekday = weekdays[new Date(assessment.timestamp).getDay()];
            const current = weekdayStress.get(weekday) || { total: 0, count: 0 };
            weekdayStress.set(weekday, {
                total: current.total + (assessment.score || 0),
                count: current.count + 1
            });
        });
        const result = {};
        weekdayStress.forEach((value, day) => {
            result[day] = value.total / value.count;
        });
        return result;
    }
    static analyzeTimeOfDayPatterns(history) {
        const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
        const timeStress = new Map();
        history.forEach(assessment => {
            const hour = new Date(assessment.timestamp).getHours();
            let timeSlot = '';
            if (hour >= 5 && hour < 12)
                timeSlot = 'Morning';
            else if (hour >= 12 && hour < 17)
                timeSlot = 'Afternoon';
            else if (hour >= 17 && hour < 22)
                timeSlot = 'Evening';
            else
                timeSlot = 'Night';
            const current = timeStress.get(timeSlot) || { total: 0, count: 0 };
            timeStress.set(timeSlot, {
                total: current.total + (assessment.score || 0),
                count: current.count + 1
            });
        });
        const result = {};
        timeStress.forEach((value, slot) => {
            result[slot] = value.total / value.count;
        });
        return result;
    }
    static findCommonTriggers(history) {
        const triggerCount = new Map();
        history.forEach(assessment => {
            var _a;
            (_a = assessment.triggers) === null || _a === void 0 ? void 0 : _a.forEach((trigger) => {
                triggerCount.set(trigger, (triggerCount.get(trigger) || 0) + 1);
            });
        });
        return Array.from(triggerCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([trigger]) => trigger);
    }
}
exports.StressManagementService = StressManagementService;
