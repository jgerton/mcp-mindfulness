"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationSessionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_session_model_1 = require("../models/meditation-session.model");
const achievement_service_1 = require("../services/achievement.service");
/**
 * Controller for MeditationSession-related API endpoints
 */
class MeditationSessionController {
    /**
     * Get all meditation sessions for the current user
     * @route GET /api/meditation-sessions
     */
    async getUserSessions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const sessions = await meditation_session_model_1.MeditationSession.find({ userId })
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            const total = await meditation_session_model_1.MeditationSession.countDocuments({ userId });
            res.status(200).json({
                sessions,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            console.error('Error fetching meditation sessions:', error);
            res.status(500).json({ error: 'Failed to fetch meditation sessions' });
        }
    }
    /**
     * Get a specific meditation session by ID
     * @route GET /api/meditation-sessions/:id
     */
    async getSessionById(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid session ID format' });
                return;
            }
            const session = await meditation_session_model_1.MeditationSession.findById(id).lean();
            if (!session) {
                res.status(404).json({ error: 'Meditation session not found' });
                return;
            }
            // Check if the session belongs to the user
            if (session.userId.toString() !== userId.toString()) {
                res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
                return;
            }
            res.status(200).json(session);
        }
        catch (error) {
            console.error('Error fetching meditation session:', error);
            res.status(500).json({ error: 'Failed to fetch meditation session' });
        }
    }
    /**
     * Create a new meditation session
     * @route POST /api/meditation-sessions
     */
    async createSession(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            const { title, description, duration, type, guidedMeditationId, tags, mood, notes } = req.body;
            // Validate required fields
            if (!title || !duration || !type) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            // Validate session type
            const validTypes = ['guided', 'unguided', 'timed'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    error: `Invalid session type. Must be one of: ${validTypes.join(', ')}`
                });
                return;
            }
            // Validate guided meditation ID if type is guided
            if (type === 'guided' && !guidedMeditationId) {
                res.status(400).json({ error: 'Guided meditation ID is required for guided sessions' });
                return;
            }
            // Validate guided meditation ID format if provided
            if (guidedMeditationId && !mongoose_1.default.Types.ObjectId.isValid(guidedMeditationId)) {
                res.status(400).json({ error: 'Invalid guided meditation ID format' });
                return;
            }
            // Create new session
            const newSession = new meditation_session_model_1.MeditationSession({
                userId,
                title,
                description,
                duration,
                type,
                guidedMeditationId,
                tags,
                mood,
                notes,
                startTime: new Date(),
                completed: false
            });
            await newSession.save();
            res.status(201).json(newSession);
        }
        catch (error) {
            console.error('Error creating meditation session:', error);
            res.status(500).json({ error: 'Failed to create meditation session' });
        }
    }
    /**
     * Update a meditation session
     * @route PUT /api/meditation-sessions/:id
     */
    async updateSession(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid session ID format' });
                return;
            }
            // Find the session
            const session = await meditation_session_model_1.MeditationSession.findById(id);
            if (!session) {
                res.status(404).json({ error: 'Meditation session not found' });
                return;
            }
            // Check if the session belongs to the user
            if (session.userId.toString() !== userId.toString()) {
                res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
                return;
            }
            // Don't allow updating completed sessions
            if (session.completed) {
                res.status(400).json({ error: 'Cannot update a completed session' });
                return;
            }
            const { title, description, duration, tags, mood, notes } = req.body;
            // Update fields
            if (title)
                session.title = title;
            if (description !== undefined)
                session.description = description;
            if (duration)
                session.duration = duration;
            if (tags)
                session.tags = tags;
            if (mood) {
                // Handle mood correctly based on the base wellness session model
                if (mood.before)
                    session.moodBefore = mood.before;
                if (mood.after)
                    session.moodAfter = mood.after;
            }
            if (notes !== undefined)
                session.notes = notes;
            await session.save();
            res.status(200).json(session);
        }
        catch (error) {
            console.error('Error updating meditation session:', error);
            res.status(500).json({ error: 'Failed to update meditation session' });
        }
    }
    /**
     * Complete a meditation session
     * @route PUT /api/meditation-sessions/:id/complete
     */
    async completeSession(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { mood } = req.body;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid session ID format' });
                return;
            }
            // Find the session
            const session = await meditation_session_model_1.MeditationSession.findById(id);
            if (!session) {
                res.status(404).json({ error: 'Meditation session not found' });
                return;
            }
            // Check if the session belongs to the user
            if (session.userId.toString() !== userId.toString()) {
                res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
                return;
            }
            // Don't allow completing already completed sessions
            if (session.completed) {
                res.status(400).json({ error: 'Session is already completed' });
                return;
            }
            // Update mood after if provided
            if (mood) {
                // Set moodAfter property directly
                session.moodAfter = mood;
            }
            // Complete the session
            await session.completeSession();
            // Process achievements
            await achievement_service_1.AchievementService.processMeditationAchievements({
                userId: new mongoose_1.default.Types.ObjectId(userId.toString()),
                sessionId: new mongoose_1.default.Types.ObjectId(session._id.toString()),
                meditationId: session.guidedMeditationId || new mongoose_1.default.Types.ObjectId(),
                duration: session.duration || 0,
                interruptions: session.interruptions || 0,
                moodImprovement: session.moodAfter && session.moodBefore ?
                    calculateMoodImprovement(session.moodBefore, session.moodAfter) : 0
            });
            res.status(200).json(session);
        }
        catch (error) {
            console.error('Error completing meditation session:', error);
            res.status(500).json({ error: 'Failed to complete meditation session' });
        }
    }
    /**
     * Delete a meditation session
     * @route DELETE /api/meditation-sessions/:id
     */
    async deleteSession(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // Validate ObjectId format
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.status(400).json({ error: 'Invalid session ID format' });
                return;
            }
            // Find the session
            const session = await meditation_session_model_1.MeditationSession.findById(id);
            if (!session) {
                res.status(404).json({ error: 'Meditation session not found' });
                return;
            }
            // Check if the session belongs to the user
            if (session.userId.toString() !== userId.toString()) {
                res.status(403).json({ error: 'Unauthorized: Session belongs to another user' });
                return;
            }
            // Delete the session
            await meditation_session_model_1.MeditationSession.findByIdAndDelete(id);
            res.status(200).json({ message: 'Meditation session deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting meditation session:', error);
            res.status(500).json({ error: 'Failed to delete meditation session' });
        }
    }
    /**
     * Get meditation statistics for the current user
     * @route GET /api/meditation-sessions/stats
     */
    async getUserStats(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // Get total sessions
            const totalSessions = await meditation_session_model_1.MeditationSession.countDocuments({
                userId,
                completed: true
            });
            // Get total meditation time (in seconds)
            const totalTimeResult = await meditation_session_model_1.MeditationSession.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId.toString()),
                        completed: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTime: { $sum: '$duration' }
                    }
                }
            ]);
            const totalTime = totalTimeResult.length > 0 ? totalTimeResult[0].totalTime : 0;
            // Get sessions by type
            const sessionsByType = await meditation_session_model_1.MeditationSession.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId.toString()),
                        completed: true
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalTime: { $sum: '$duration' }
                    }
                }
            ]);
            // Get recent streak
            const recentSessions = await meditation_session_model_1.MeditationSession.find({
                userId,
                completed: true
            })
                .sort({ startTime: -1 })
                .limit(30)
                .lean();
            // Calculate streak
            const streak = this.calculateStreak(recentSessions);
            res.status(200).json({
                totalSessions,
                totalTime,
                totalTimeFormatted: this.formatTime(totalTime),
                sessionsByType,
                currentStreak: streak
            });
        }
        catch (error) {
            console.error('Error fetching meditation statistics:', error);
            res.status(500).json({ error: 'Failed to fetch meditation statistics' });
        }
    }
    /**
     * Helper method to calculate current streak
     * @private
     */
    calculateStreak(sessions) {
        if (sessions.length === 0)
            return 0;
        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Check if there's a session today
        const latestSession = sessions[0];
        const latestDate = new Date(latestSession.startTime);
        latestDate.setHours(0, 0, 0, 0);
        if (latestDate.getTime() !== today.getTime() &&
            latestDate.getTime() !== new Date(today.getTime() - 86400000).getTime()) {
            // No session today or yesterday, streak is broken
            return 0;
        }
        // Calculate streak by checking consecutive days
        for (let i = 0; i < sessions.length - 1; i++) {
            const currentDate = new Date(sessions[i].startTime);
            currentDate.setHours(0, 0, 0, 0);
            const prevDate = new Date(sessions[i + 1].startTime);
            prevDate.setHours(0, 0, 0, 0);
            // Check if dates are consecutive
            const diffTime = currentDate.getTime() - prevDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
                streak++;
            }
            else if (diffDays > 1) {
                // Break in streak
                break;
            }
        }
        return streak;
    }
    /**
     * Helper method to format time in seconds to human-readable format
     * @private
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        else {
            return `${minutes}m`;
        }
    }
}
exports.MeditationSessionController = MeditationSessionController;
// Helper function to calculate mood improvement
function calculateMoodImprovement(moodBefore, moodAfter) {
    const moodValues = {
        'anxious': 1,
        'stressed': 2,
        'neutral': 3,
        'calm': 4,
        'peaceful': 5
    };
    const beforeValue = moodValues[moodBefore] || 3;
    const afterValue = moodValues[moodAfter] || 3;
    return Math.max(0, afterValue - beforeValue);
}
