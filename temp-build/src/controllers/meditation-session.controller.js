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
exports.MeditationSessionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_session_model_1 = require("../models/meditation-session.model");
/**
 * Controller for MeditationSession-related API endpoints
 */
class MeditationSessionController {
    /**
     * Get all meditation sessions for the current user
     */
    getUserSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Check if user is authenticated
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const sessions = yield meditation_session_model_1.MeditationSession.find({ userId });
                res.status(200).json(sessions);
            }
            catch (error) {
                console.error('Error fetching meditation sessions:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });
    }
    /**
     * Get a meditation session by ID
     */
    getSessionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Check if user is authenticated
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid session ID format' });
                    return;
                }
                const session = yield meditation_session_model_1.MeditationSession.findById(id);
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                // Check if the session belongs to the user
                if (session.userId.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'Forbidden: User does not own this session' });
                    return;
                }
                res.status(200).json(session);
            }
            catch (error) {
                console.error('Error fetching meditation session:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });
    }
    /**
     * Create a new meditation session
     */
    createSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const { duration, type } = req.body;
                // Validate required fields
                if (!duration || !type) {
                    res.status(400).json({ error: 'Duration and type are required' });
                    return;
                }
                // Create new session
                const session = yield meditation_session_model_1.MeditationSession.create(Object.assign(Object.assign({ userId: req.user._id }, req.body), { completed: false }));
                res.status(201).json(session);
            }
            catch (error) {
                console.error('Error creating meditation session:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });
    }
    /**
     * Update a meditation session
     * @route PUT /api/meditation-sessions/:id
     */
    updateSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const session = yield meditation_session_model_1.MeditationSession.findById(id);
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
                if (mood)
                    session.mood = mood;
                if (notes !== undefined)
                    session.notes = notes;
                yield session.save();
                res.status(200).json(session);
            }
            catch (error) {
                console.error('Error updating meditation session:', error);
                res.status(500).json({ error: 'Failed to update meditation session' });
            }
        });
    }
    /**
     * Complete a meditation session
     */
    completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const { id } = req.params;
                const { durationCompleted, moodAfter, interruptions } = req.body;
                // Validate session ID
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid session ID format' });
                    return;
                }
                // Find session
                const session = yield meditation_session_model_1.MeditationSession.findById(id);
                // Check if session exists
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                // Check if user owns the session
                if (session.userId.toString() !== req.user._id.toString()) {
                    res.status(403).json({ error: 'Forbidden: User does not own this session' });
                    return;
                }
                // Check if session is already completed
                if (session.completed) {
                    res.status(400).json({ error: 'Session already completed' });
                    return;
                }
                // Complete the session
                yield session.completeSession();
                // Update additional fields
                if (durationCompleted)
                    session.durationCompleted = durationCompleted;
                if (moodAfter)
                    session.moodAfter = moodAfter;
                if (interruptions)
                    session.interruptions = interruptions;
                yield session.save();
                res.status(200).json(session);
            }
            catch (error) {
                console.error('Error completing meditation session:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });
    }
    /**
     * Delete a meditation session
     * @route DELETE /api/meditation-sessions/:id
     */
    deleteSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const session = yield meditation_session_model_1.MeditationSession.findById(id);
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
                yield meditation_session_model_1.MeditationSession.findByIdAndDelete(id);
                res.status(200).json({ message: 'Meditation session deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting meditation session:', error);
                res.status(500).json({ error: 'Failed to delete meditation session' });
            }
        });
    }
    /**
     * Get meditation statistics for the current user
     * @route GET /api/meditation-sessions/stats
     */
    getUserStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                // Get total sessions
                const totalSessions = yield meditation_session_model_1.MeditationSession.countDocuments({
                    userId,
                    completed: true
                });
                // Get total meditation time (in seconds)
                const totalTimeResult = yield meditation_session_model_1.MeditationSession.aggregate([
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
                const sessionsByType = yield meditation_session_model_1.MeditationSession.aggregate([
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
                const recentSessions = yield meditation_session_model_1.MeditationSession.find({
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
        });
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
    /**
     * Add feedback to a completed meditation session
     *
     * This method allows users to add feedback to their completed meditation sessions.
     * Feedback includes a rating (1-5), comments, and suggestions for improvements.
     *
     * Validation:
     * - User must be authenticated
     * - Session ID must be valid
     * - Feedback data must be provided
     * - Rating must be between 1 and 5
     * - Session must exist
     * - User must own the session
     * - Session must be completed
     * - Session must not already have feedback
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    addSessionFeedback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                    return;
                }
                const { id } = req.params;
                const { rating, comments, improvements } = req.body;
                // Validate session ID
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid session ID format' });
                    return;
                }
                // Validate feedback data
                if (!rating && !comments && !improvements) {
                    res.status(400).json({ error: 'Feedback is required' });
                    return;
                }
                // Validate rating if provided
                if (rating !== undefined && (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
                    res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
                    return;
                }
                // Find session
                const session = yield meditation_session_model_1.MeditationSession.findById(id);
                // Check if session exists
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                // Check if user owns the session
                if (session.userId.toString() !== req.user._id.toString()) {
                    res.status(403).json({ error: 'Forbidden: User does not own this session' });
                    return;
                }
                // Check if session is completed
                if (!session.completed) {
                    res.status(400).json({ error: 'Cannot add feedback to incomplete session' });
                    return;
                }
                // Check if feedback already exists
                if (session.feedback) {
                    res.status(400).json({ error: 'Feedback already exists for this session' });
                    return;
                }
                // Add feedback to session
                session.feedback = {
                    rating: Number(rating),
                    comments,
                    improvements
                };
                yield session.save();
                res.status(200).json(session);
            }
            catch (error) {
                console.error('Error adding feedback to session:', error);
                res.status(500).json({ error: 'Server error' });
            }
        });
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
