"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../models/user.model");
const achievement_model_1 = require("../models/achievement.model");
const meditation_model_1 = require("../models/meditation.model");
const stress_assessment_model_1 = require("../models/stress-assessment.model");
class ExportService {
    /**
     * Get all user achievements
     * @param userId The user ID
     * @param options Export options (format, date range)
     */
    static async getUserAchievements(userId, options) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            const query = { userId };
            // Apply date filters if specified
            if ((options === null || options === void 0 ? void 0 : options.startDate) || (options === null || options === void 0 ? void 0 : options.endDate)) {
                query.createdAt = {};
                if (options === null || options === void 0 ? void 0 : options.startDate) {
                    query.createdAt.$gte = options.startDate;
                }
                if (options === null || options === void 0 ? void 0 : options.endDate) {
                    query.createdAt.$lte = options.endDate;
                }
            }
            const achievements = await achievement_model_1.Achievement.find(query)
                .sort({ createdAt: -1 })
                .lean();
            // If CSV format is requested, convert to CSV
            if ((options === null || options === void 0 ? void 0 : options.format) === 'csv') {
                const header = [
                    'Achievement Name,Description,Category,Points,Date Earned'
                ];
                const rows = achievements.map(achievement => {
                    return [
                        achievement.name,
                        achievement.description,
                        achievement.category,
                        achievement.points,
                        new Date(achievement.createdAt).toLocaleDateString()
                    ].join(',');
                });
                return [header, ...rows].join('\n');
            }
            return achievements;
        }
        catch (error) {
            console.error('Error in getUserAchievements:', error);
            throw error;
        }
    }
    /**
     * Get all user meditation sessions
     * @param userId The user ID
     * @param options Export options (format, date range)
     */
    static async getUserMeditations(userId, options) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            const query = { authorId: userId };
            // Apply date filters if specified
            if ((options === null || options === void 0 ? void 0 : options.startDate) || (options === null || options === void 0 ? void 0 : options.endDate)) {
                query.createdAt = {};
                if (options === null || options === void 0 ? void 0 : options.startDate) {
                    query.createdAt.$gte = options.startDate;
                }
                if (options === null || options === void 0 ? void 0 : options.endDate) {
                    query.createdAt.$lte = options.endDate;
                }
            }
            const meditations = await meditation_model_1.Meditation.find(query)
                .sort({ createdAt: -1 })
                .lean();
            // If CSV format is requested, convert to CSV
            if ((options === null || options === void 0 ? void 0 : options.format) === 'csv') {
                const header = [
                    'Date,Duration (minutes),Technique,Notes,Mood Before,Mood After'
                ];
                const rows = meditations.map(meditation => {
                    return [
                        new Date(meditation.createdAt).toLocaleDateString(),
                        meditation.duration,
                        `${meditation.title} (${meditation.category})`,
                        meditation.description || 'N/A',
                        'N/A', // Mood before - not stored in our current model
                        'N/A' // Mood after - not stored in our current model
                    ].join(',');
                });
                return [header, ...rows].join('\n');
            }
            return meditations;
        }
        catch (error) {
            console.error('Error in getUserMeditations:', error);
            throw error;
        }
    }
    /**
     * Get all user stress assessments
     * @param userId The user ID
     * @param options Export options (format, date range)
     */
    static async getUserStressAssessments(userId, options) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            const query = { userId };
            // Apply date filters if specified
            if ((options === null || options === void 0 ? void 0 : options.startDate) || (options === null || options === void 0 ? void 0 : options.endDate)) {
                query.date = {};
                if (options === null || options === void 0 ? void 0 : options.startDate) {
                    query.date.$gte = options.startDate;
                }
                if (options === null || options === void 0 ? void 0 : options.endDate) {
                    query.date.$lte = options.endDate;
                }
            }
            const assessments = await stress_assessment_model_1.StressAssessment.find(query)
                .sort({ date: -1 })
                .lean();
            // If CSV format is requested, convert to CSV
            if ((options === null || options === void 0 ? void 0 : options.format) === 'csv') {
                const header = [
                    'Date,Stress Level (1-10),Stress Factors,Physical Symptoms,Emotional State,Notes'
                ];
                const rows = assessments.map(assessment => {
                    return [
                        new Date(assessment.date).toLocaleDateString(),
                        assessment.stressLevel,
                        (assessment.triggers || []).join(', '),
                        (assessment.physicalSymptoms || []).join(', '),
                        (assessment.emotionalSymptoms || []).join(', '),
                        assessment.notes || 'N/A'
                    ].join(',');
                });
                return [header, ...rows].join('\n');
            }
            return assessments;
        }
        catch (error) {
            console.error('Error in getUserStressAssessments:', error);
            throw error;
        }
    }
    /**
     * Get comprehensive user data including profile, meditations, achievements, and stress assessments
     * @param userId The user ID
     * @param options Export options (format)
     */
    static async getUserData(userId, options) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }
            // Get user profile
            const user = await user_model_1.User.findById(userId)
                .select('-password')
                .lean();
            if (!user) {
                throw new Error('User not found');
            }
            // Get user data from all collections
            const [achievements, meditations, stressAssessments] = await Promise.all([
                this.getUserAchievements(userId),
                this.getUserMeditations(userId),
                this.getUserStressAssessments(userId)
            ]);
            const userData = {
                profile: user,
                achievements,
                meditations,
                stressAssessments
            };
            // If CSV format is requested, create a combined CSV
            if ((options === null || options === void 0 ? void 0 : options.format) === 'csv') {
                const sections = [
                    '# USER PROFILE',
                    `Username: ${user.username}`,
                    `Email: ${user.email}`,
                    `Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}`,
                    `Account Active: ${user.isActive ? 'Yes' : 'No'}`,
                    '\n# ACHIEVEMENTS',
                    await this.getUserAchievements(userId, { format: 'csv' }),
                    '\n# MEDITATION SESSIONS',
                    await this.getUserMeditations(userId, { format: 'csv' }),
                    '\n# STRESS ASSESSMENTS',
                    await this.getUserStressAssessments(userId, { format: 'csv' })
                ];
                return sections.join('\n');
            }
            return userData;
        }
        catch (error) {
            console.error('Error in getUserData:', error);
            throw error;
        }
    }
}
exports.ExportService = ExportService;
