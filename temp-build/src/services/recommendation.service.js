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
exports.RecommendationService = void 0;
const meditation_session_model_1 = require("../models/meditation-session.model");
const stress_model_1 = require("../models/stress.model");
const user_model_1 = require("../models/user.model");
const session_analytics_service_1 = require("./session-analytics.service");
/**
 * Service for generating personalized recommendations for meditation sessions
 */
class RecommendationService {
    /**
     * Get personalized session recommendations for a user
     * @param userId The user ID to get recommendations for
     * @param limit The maximum number of recommendations to return
     * @returns Array of recommended session objects
     */
    static getPersonalizedRecommendations(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 3) {
            try {
                // Get user's recent sessions
                const recentSessions = yield meditation_session_model_1.MeditationSession.find({ userId })
                    .sort({ completedAt: -1 })
                    .limit(10)
                    .lean();
                // Get user's stress assessments
                const recentStressAssessments = yield stress_model_1.StressAssessment.find({ userId })
                    .sort({ timestamp: -1 })
                    .limit(5)
                    .lean();
                // Get user preferences
                const user = yield user_model_1.User.findById(userId).lean();
                // Get analytics for the user
                const analytics = yield session_analytics_service_1.SessionAnalyticsService.getUserAnalytics(userId.toString());
                // Generate recommendations based on collected data
                const recommendations = yield this.generateRecommendations(userId, recentSessions, recentStressAssessments, user, analytics);
                return recommendations.slice(0, limit);
            }
            catch (error) {
                console.error('Error getting personalized recommendations:', error);
                return [];
            }
        });
    }
    /**
     * Generate recommendations based on user data
     * @param userId User ID
     * @param recentSessions Recent meditation sessions
     * @param recentStressAssessments Recent stress assessments
     * @param user User object with preferences
     * @param analytics User analytics data
     * @returns Array of recommendation objects
     */
    static generateRecommendations(userId, recentSessions, recentStressAssessments, user, analytics) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // 1. Recommend based on stress level
            if (recentStressAssessments.length > 0) {
                const latestAssessment = recentStressAssessments[0];
                const stressLevel = latestAssessment.score || 0;
                if (stressLevel >= 7) {
                    // High stress - recommend stress reduction sessions
                    recommendations.push({
                        type: 'meditation',
                        title: 'Stress Relief Meditation',
                        duration: 10,
                        category: 'stress-reduction',
                        reason: 'Based on your recent stress levels',
                        priority: 10
                    });
                }
                else if (stressLevel >= 4) {
                    // Medium stress - recommend calming sessions
                    recommendations.push({
                        type: 'meditation',
                        title: 'Calming Meditation',
                        duration: 15,
                        category: 'calm',
                        reason: 'To help maintain balance',
                        priority: 8
                    });
                }
                else {
                    // Low stress - recommend focus or mindfulness
                    recommendations.push({
                        type: 'meditation',
                        title: 'Mindfulness Practice',
                        duration: 20,
                        category: 'mindfulness',
                        reason: 'To enhance your mindfulness practice',
                        priority: 6
                    });
                }
            }
            // 2. Recommend based on session history
            if (recentSessions.length > 0) {
                // Find most completed session type
                const sessionTypes = recentSessions.map(s => s.type);
                const mostFrequentType = this.getMostFrequent(sessionTypes);
                // Find average duration
                const avgDuration = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
                const recommendedDuration = Math.round(avgDuration / 5) * 5; // Round to nearest 5 minutes
                recommendations.push({
                    type: mostFrequentType || 'meditation',
                    title: `${this.capitalizeFirstLetter(mostFrequentType || 'meditation')} Session`,
                    duration: recommendedDuration || 15,
                    category: mostFrequentType || 'general',
                    reason: 'Based on your session history',
                    priority: 7
                });
                // Check for incomplete sessions and recommend to complete them
                const incompleteSessions = recentSessions.filter(s => s.progress < 100);
                if (incompleteSessions.length > 0) {
                    const latestIncomplete = incompleteSessions[0];
                    recommendations.push({
                        type: latestIncomplete.type || 'meditation',
                        title: latestIncomplete.title || 'Continue Your Practice',
                        duration: latestIncomplete.duration || 10,
                        category: latestIncomplete.category || 'general',
                        reason: 'Continue your previous session',
                        priority: 9,
                        sessionId: latestIncomplete._id
                    });
                }
            }
            // 3. Recommend based on time of day
            const currentHour = new Date().getHours();
            if (currentHour >= 5 && currentHour < 9) {
                // Morning
                recommendations.push({
                    type: 'meditation',
                    title: 'Morning Energizing Meditation',
                    duration: 10,
                    category: 'energy',
                    reason: 'Great way to start your day',
                    priority: currentHour >= 6 && currentHour <= 8 ? 8 : 5
                });
            }
            else if (currentHour >= 12 && currentHour < 14) {
                // Midday
                recommendations.push({
                    type: 'breathing',
                    title: 'Midday Breathing Exercise',
                    duration: 5,
                    category: 'breathing',
                    reason: 'Quick midday reset',
                    priority: 6
                });
            }
            else if (currentHour >= 21 || currentHour < 1) {
                // Evening
                recommendations.push({
                    type: 'meditation',
                    title: 'Evening Wind Down',
                    duration: 15,
                    category: 'sleep',
                    reason: 'Prepare for restful sleep',
                    priority: currentHour >= 22 ? 9 : 7
                });
            }
            // 4. Recommend based on analytics insights
            if (analytics) {
                // If user has better mood improvements with longer sessions
                if (analytics.moodImprovementByDuration &&
                    analytics.moodImprovementByDuration.longerSessions >
                        analytics.moodImprovementByDuration.shorterSessions) {
                    recommendations.push({
                        type: 'meditation',
                        title: 'Extended Meditation Practice',
                        duration: 25,
                        category: 'mindfulness',
                        reason: 'Longer sessions have improved your mood more',
                        priority: 8
                    });
                }
                // If user has better completion rate in the morning
                if (analytics.completionRateByTimeOfDay &&
                    analytics.completionRateByTimeOfDay.morning >
                        analytics.completionRateByTimeOfDay.evening) {
                    const morningHour = 7;
                    recommendations.push({
                        type: 'meditation',
                        title: 'Morning Meditation Routine',
                        duration: 15,
                        category: 'mindfulness',
                        reason: 'You complete more morning sessions',
                        priority: currentHour >= morningHour - 1 && currentHour <= morningHour + 1 ? 9 : 6,
                        scheduledTime: new Date().setHours(morningHour, 0, 0, 0)
                    });
                }
            }
            // 5. Add variety recommendations
            if (recentSessions.length > 3) {
                const recentTypes = new Set(recentSessions.slice(0, 3).map(s => s.type));
                // If user has been doing the same type of sessions, recommend something different
                if (recentTypes.size === 1) {
                    const currentType = recentSessions[0].type;
                    const alternativeType = currentType === 'meditation' ? 'breathing' :
                        currentType === 'breathing' ? 'body-scan' : 'meditation';
                    recommendations.push({
                        type: alternativeType,
                        title: `Try ${this.capitalizeFirstLetter(alternativeType)}`,
                        duration: 10,
                        category: 'variety',
                        reason: 'Add variety to your practice',
                        priority: 7
                    });
                }
            }
            // Sort recommendations by priority (highest first)
            return recommendations.sort((a, b) => b.priority - a.priority);
        });
    }
    /**
     * Get the most frequent item in an array
     * @param arr Array of items
     * @returns The most frequent item or undefined if array is empty
     */
    static getMostFrequent(arr) {
        if (arr.length === 0)
            return undefined;
        const frequency = {};
        let maxItem = undefined;
        let maxCount = 0;
        for (const item of arr) {
            const key = String(item);
            frequency[key] = (frequency[key] || 0) + 1;
            if (frequency[key] > maxCount) {
                maxCount = frequency[key];
                maxItem = item;
            }
        }
        return maxItem;
    }
    /**
     * Capitalize the first letter of a string
     * @param str String to capitalize
     * @returns Capitalized string
     */
    static capitalizeFirstLetter(str) {
        if (!str)
            return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Get recommendations based on stress level
     * @param stressLevel User's stress level (0-10)
     * @returns Array of recommended session objects
     */
    static getStressBasedRecommendations(stressLevel) {
        const recommendations = [];
        if (stressLevel >= 8) {
            // Very high stress
            recommendations.push({
                type: 'breathing',
                title: 'Emergency Stress Relief',
                duration: 5,
                category: 'stress-reduction',
                reason: 'For immediate stress relief',
                priority: 10
            });
            recommendations.push({
                type: 'meditation',
                title: 'Guided Stress Reduction',
                duration: 15,
                category: 'stress-reduction',
                reason: 'Help reduce your high stress levels',
                priority: 9
            });
        }
        else if (stressLevel >= 5) {
            // Moderate stress
            recommendations.push({
                type: 'meditation',
                title: 'Calming Meditation',
                duration: 10,
                category: 'calm',
                reason: 'Help manage your stress',
                priority: 8
            });
            recommendations.push({
                type: 'breathing',
                title: '4-7-8 Breathing Exercise',
                duration: 5,
                category: 'breathing',
                reason: 'Quick stress reduction technique',
                priority: 7
            });
        }
        else {
            // Low stress
            recommendations.push({
                type: 'meditation',
                title: 'Mindfulness Practice',
                duration: 15,
                category: 'mindfulness',
                reason: 'Maintain your calm state',
                priority: 6
            });
            recommendations.push({
                type: 'meditation',
                title: 'Gratitude Meditation',
                duration: 10,
                category: 'gratitude',
                reason: 'Enhance your positive mindset',
                priority: 5
            });
        }
        return recommendations;
    }
}
exports.RecommendationService = RecommendationService;
