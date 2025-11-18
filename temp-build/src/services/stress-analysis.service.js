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
exports.StressAnalysisService = void 0;
const stress_model_1 = require("../models/stress.model");
/**
 * Service for analyzing stress data and identifying patterns
 */
class StressAnalysisService {
    /**
     * Analyze stress data for a user and identify patterns
     * @param userId The user ID to analyze stress data for
     * @param startDate Optional start date for the analysis period
     * @param endDate Optional end date for the analysis period
     * @returns Analysis results including trends, patterns, and insights
     */
    static analyzeStressData(userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Set default date range if not provided (last 30 days)
                const end = endDate || new Date();
                const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                // Get stress assessments for the specified period
                const assessments = yield stress_model_1.StressAssessment.find({
                    userId,
                    timestamp: { $gte: start, $lte: end }
                }).sort({ timestamp: 1 }).lean();
                if (assessments.length === 0) {
                    return {
                        averageStressLevel: 0,
                        stressTrend: 'INSUFFICIENT_DATA',
                        commonTriggers: [],
                        commonSymptoms: [],
                        peakStressTimes: [],
                        insights: ['No stress data available for the specified period.']
                    };
                }
                // Calculate average stress level
                const averageStressLevel = this.calculateAverageStressLevel(assessments);
                // Analyze stress trend
                const stressTrend = this.analyzeStressTrend(assessments);
                // Identify common triggers
                const commonTriggers = this.identifyCommonTriggers(assessments);
                // Identify common symptoms
                const commonSymptoms = this.identifyCommonSymptoms(assessments);
                // Identify peak stress times
                const peakStressTimes = this.identifyPeakStressTimes(assessments);
                // Generate insights
                const insights = this.generateInsights(assessments, averageStressLevel, stressTrend, commonTriggers, commonSymptoms, peakStressTimes);
                return {
                    averageStressLevel,
                    stressTrend,
                    commonTriggers,
                    commonSymptoms,
                    peakStressTimes,
                    insights
                };
            }
            catch (error) {
                console.error('Error analyzing stress data:', error);
                throw error;
            }
        });
    }
    /**
     * Calculate the average stress level from a set of assessments
     * @param assessments Array of stress assessments
     * @returns Average stress level (0-10)
     */
    static calculateAverageStressLevel(assessments) {
        if (assessments.length === 0)
            return 0;
        const sum = assessments.reduce((total, assessment) => total + (assessment.score || 0), 0);
        return parseFloat((sum / assessments.length).toFixed(1));
    }
    /**
     * Analyze the trend of stress levels over time
     * @param assessments Array of stress assessments
     * @returns Trend analysis result (IMPROVING, WORSENING, STABLE, or FLUCTUATING)
     */
    static analyzeStressTrend(assessments) {
        if (assessments.length < 3)
            return 'INSUFFICIENT_DATA';
        // Split assessments into equal segments for comparison
        const segmentSize = Math.floor(assessments.length / 3);
        const firstSegment = assessments.slice(0, segmentSize);
        const middleSegment = assessments.slice(segmentSize, segmentSize * 2);
        const lastSegment = assessments.slice(segmentSize * 2);
        const firstAvg = this.calculateAverageStressLevel(firstSegment);
        const middleAvg = this.calculateAverageStressLevel(middleSegment);
        const lastAvg = this.calculateAverageStressLevel(lastSegment);
        // Calculate standard deviation to detect fluctuations
        const allScores = assessments.map(a => a.score || 0);
        const stdDev = this.calculateStandardDeviation(allScores);
        // High standard deviation indicates fluctuating stress levels
        if (stdDev > 2.5)
            return 'FLUCTUATING';
        // Compare first and last segments to determine trend
        const difference = lastAvg - firstAvg;
        if (difference <= -1)
            return 'IMPROVING';
        if (difference >= 1)
            return 'WORSENING';
        return 'STABLE';
    }
    /**
     * Calculate standard deviation of an array of numbers
     * @param values Array of numeric values
     * @returns Standard deviation
     */
    static calculateStandardDeviation(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    }
    /**
     * Identify common triggers from stress assessments
     * @param assessments Array of stress assessments
     * @param limit Maximum number of triggers to return
     * @returns Array of trigger objects with counts
     */
    static identifyCommonTriggers(assessments, limit = 5) {
        const triggerCounts = {};
        // Count occurrences of each trigger
        assessments.forEach(assessment => {
            if (Array.isArray(assessment.triggers)) {
                assessment.triggers.forEach((trigger) => {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                });
            }
        });
        // Convert to array and sort by count
        const sortedTriggers = Object.entries(triggerCounts)
            .map(([trigger, count]) => ({ trigger, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        return sortedTriggers;
    }
    /**
     * Identify common symptoms from stress assessments
     * @param assessments Array of stress assessments
     * @param limit Maximum number of symptoms to return
     * @returns Array of symptom objects with counts
     */
    static identifyCommonSymptoms(assessments, limit = 5) {
        const symptomCounts = {};
        // Count occurrences of each symptom
        assessments.forEach(assessment => {
            if (Array.isArray(assessment.symptoms)) {
                assessment.symptoms.forEach((symptom) => {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                });
            }
        });
        // Convert to array and sort by count
        const sortedSymptoms = Object.entries(symptomCounts)
            .map(([symptom, count]) => ({ symptom, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        return sortedSymptoms;
    }
    /**
     * Identify times of day when stress levels are highest
     * @param assessments Array of stress assessments
     * @param limit Maximum number of peak times to return
     * @returns Array of peak time objects with average stress levels
     */
    static identifyPeakStressTimes(assessments, limit = 3) {
        const hourlyStress = {};
        // Group stress levels by hour of day
        assessments.forEach(assessment => {
            if (assessment.timestamp && assessment.score !== undefined) {
                const hour = new Date(assessment.timestamp).getHours();
                if (!hourlyStress[hour]) {
                    hourlyStress[hour] = { total: 0, count: 0 };
                }
                hourlyStress[hour].total += assessment.score;
                hourlyStress[hour].count += 1;
            }
        });
        // Calculate average stress level for each hour
        const hourlyAverages = Object.entries(hourlyStress).map(([hour, data]) => ({
            hour: parseInt(hour),
            averageStress: parseFloat((data.total / data.count).toFixed(1)),
            assessmentCount: data.count
        }));
        // Sort by average stress level and return top results
        return hourlyAverages
            .sort((a, b) => b.averageStress - a.averageStress)
            .slice(0, limit)
            .map(item => (Object.assign(Object.assign({}, item), { timeOfDay: this.formatHourToTimeOfDay(item.hour) })));
    }
    /**
     * Format hour to time of day string
     * @param hour Hour (0-23)
     * @returns Formatted time string (e.g., "8:00 AM")
     */
    static formatHourToTimeOfDay(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    }
    /**
     * Generate insights based on stress analysis
     * @param assessments Array of stress assessments
     * @param averageStressLevel Average stress level
     * @param stressTrend Stress trend analysis
     * @param commonTriggers Common stress triggers
     * @param commonSymptoms Common stress symptoms
     * @param peakStressTimes Peak stress times
     * @returns Array of insight strings
     */
    static generateInsights(assessments, averageStressLevel, stressTrend, commonTriggers, commonSymptoms, peakStressTimes) {
        const insights = [];
        // Insight based on average stress level
        if (averageStressLevel >= 7) {
            insights.push('Your average stress level is high. Consider incorporating more stress management techniques into your daily routine.');
        }
        else if (averageStressLevel >= 4) {
            insights.push('Your stress levels are moderate. Regular mindfulness practice can help maintain balance.');
        }
        else {
            insights.push('Your stress levels are generally low. Keep up your current stress management practices.');
        }
        // Insight based on stress trend
        if (stressTrend === 'IMPROVING') {
            insights.push('Your stress levels have been improving over time. Your current strategies appear to be working well.');
        }
        else if (stressTrend === 'WORSENING') {
            insights.push('Your stress levels have been increasing over time. Consider reviewing and adjusting your stress management approach.');
        }
        else if (stressTrend === 'FLUCTUATING') {
            insights.push('Your stress levels fluctuate significantly. Try to identify patterns and prepare for high-stress periods.');
        }
        // Insight based on common triggers
        if (commonTriggers.length > 0) {
            const topTrigger = commonTriggers[0].trigger;
            insights.push(`"${topTrigger}" is your most common stress trigger. Consider developing specific strategies to address this source of stress.`);
            if (commonTriggers.length > 1) {
                const secondTrigger = commonTriggers[1].trigger;
                if (commonTriggers[0].count > commonTriggers[1].count * 2) {
                    insights.push(`"${topTrigger}" triggers stress much more frequently than other factors. Focusing on this area could significantly reduce your overall stress.`);
                }
                else {
                    insights.push(`Both "${topTrigger}" and "${secondTrigger}" are significant sources of stress for you.`);
                }
            }
        }
        // Insight based on peak stress times
        if (peakStressTimes.length > 0) {
            const peakTime = peakStressTimes[0];
            insights.push(`Your stress tends to peak around ${peakTime.timeOfDay}. Consider scheduling stress management activities before this time.`);
        }
        // Insight based on stress patterns
        const weekdayStress = this.calculateAverageStressLevelByDayType(assessments, true);
        const weekendStress = this.calculateAverageStressLevelByDayType(assessments, false);
        if (weekdayStress > weekendStress + 1.5) {
            insights.push('Your stress levels are significantly higher on weekdays compared to weekends. Work-related stress may be a key factor.');
        }
        else if (weekendStress > weekdayStress + 1.5) {
            insights.push('Your stress levels are higher on weekends than weekdays. Consider examining your weekend activities and responsibilities.');
        }
        return insights;
    }
    /**
     * Calculate average stress level by day type (weekday or weekend)
     * @param assessments Array of stress assessments
     * @param isWeekday Whether to calculate for weekdays (true) or weekends (false)
     * @returns Average stress level for the specified day type
     */
    static calculateAverageStressLevelByDayType(assessments, isWeekday) {
        const filteredAssessments = assessments.filter(assessment => {
            if (!assessment.timestamp)
                return false;
            const day = new Date(assessment.timestamp).getDay();
            // 0 = Sunday, 6 = Saturday
            const isWeekendDay = day === 0 || day === 6;
            return isWeekday ? !isWeekendDay : isWeekendDay;
        });
        return this.calculateAverageStressLevel(filteredAssessments);
    }
    /**
     * Identify potential stress triggers by correlating stress levels with reported triggers
     * @param userId The user ID to analyze
     * @param limit Maximum number of triggers to return
     * @returns Array of trigger objects with correlation scores
     */
    static identifyStressTriggers(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 5) {
            try {
                // Get all stress assessments for the user
                const assessments = yield stress_model_1.StressAssessment.find({ userId }).lean();
                if (assessments.length < 5) {
                    return [];
                }
                // Extract all unique triggers
                const allTriggers = new Set();
                assessments.forEach(assessment => {
                    if (Array.isArray(assessment.triggers)) {
                        assessment.triggers.forEach((trigger) => allTriggers.add(trigger));
                    }
                });
                // Calculate correlation between each trigger and stress level
                const triggerCorrelations = {};
                allTriggers.forEach(trigger => {
                    triggerCorrelations[trigger] = { sum: 0, count: 0 };
                    assessments.forEach(assessment => {
                        if (Array.isArray(assessment.triggers) && assessment.triggers.includes(trigger)) {
                            triggerCorrelations[trigger].sum += assessment.score || 0;
                            triggerCorrelations[trigger].count += 1;
                        }
                    });
                });
                // Calculate average stress level for each trigger
                const triggerAnalysis = Object.entries(triggerCorrelations)
                    .map(([trigger, data]) => ({
                    trigger,
                    averageStressLevel: parseFloat((data.sum / data.count).toFixed(1)),
                    occurrences: data.count
                }))
                    .filter(item => item.occurrences >= 2) // Only include triggers with sufficient data (changed from 3 to 2)
                    .sort((a, b) => b.averageStressLevel - a.averageStressLevel)
                    .slice(0, limit);
                return triggerAnalysis;
            }
            catch (error) {
                console.error('Error identifying stress triggers:', error);
                return [];
            }
        });
    }
}
exports.StressAnalysisService = StressAnalysisService;
