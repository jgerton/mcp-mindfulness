"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_session_service_1 = require("../services/meditation-session.service");
const session_analytics_service_1 = require("../services/session-analytics.service");
const meditation_service_1 = require("../services/meditation.service");
class MeditationController {
    constructor() {
        MeditationController.sessionService = new meditation_session_service_1.MeditationSessionService();
    }
    // Create a new meditation
    static async createMeditation(req, res) {
        try {
            const meditation = await meditation_service_1.MeditationService.createMeditation(req.body);
            res.status(201).json(meditation);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Get all meditations with filtering and pagination
    static async getAllMeditations(req, res) {
        try {
            const meditations = await meditation_service_1.MeditationService.getAllMeditations();
            res.json(meditations);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Get a single meditation by ID
    static async getMeditationById(req, res) {
        try {
            const meditation = await meditation_service_1.MeditationService.getMeditationById(req.params.id);
            if (!meditation) {
                return res.status(404).json({ message: 'Meditation not found' });
            }
            res.json(meditation);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Get active session
    static async getActiveSession(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const activeSession = await MeditationController.sessionService.getActiveSession(userId);
            res.json(activeSession);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Start a meditation session
    static async startSession(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const meditationId = req.params.id;
            const session = await MeditationController.sessionService.startSession(userId, {
                meditationId,
                completed: false,
                duration: 0,
                durationCompleted: 0
            });
            res.status(201).json(session);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Record interruption
    static async recordInterruption(req, res) {
        try {
            const sessionId = req.params.id;
            const session = await MeditationController.sessionService.recordInterruption(sessionId);
            res.json(session);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Complete a meditation session
    static async completeSession(req, res) {
        try {
            const sessionId = req.params.id;
            const completedSession = await MeditationController.sessionService.completeSession(sessionId, req.body);
            res.json(completedSession);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Update a meditation
    static async updateMeditation(req, res) {
        try {
            // Check for empty request body
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ message: 'No update data provided' });
            }
            // Check for invalid fields
            const allowedFields = ['title', 'description', 'duration', 'type', 'audioUrl', 'category', 'difficulty', 'tags', 'isActive'];
            const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
            if (invalidFields.length > 0) {
                return res.status(400).json({ message: 'Invalid update fields' });
            }
            const meditation = await meditation_service_1.MeditationService.updateMeditation(req.params.id, req.body);
            if (!meditation) {
                return res.status(404).json({ message: 'Meditation not found' });
            }
            res.json(meditation);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(400).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    // Delete a meditation (soft delete by setting isActive to false)
    static async deleteMeditation(req, res) {
        try {
            const result = await meditation_service_1.MeditationService.deleteMeditation(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Meditation not found' });
            }
            res.json({ message: 'Meditation deleted successfully' });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'An unexpected error occurred' });
            }
        }
    }
    static validateMeditationData(meditation) {
        const validationResults = {
            titleLength: meditation.title.length >= 3 && meditation.title.length <= 100,
            descriptionLength: meditation.description.length >= 10 && meditation.description.length <= 1000,
            durationValid: meditation.duration > 0 && meditation.duration <= 120,
            typeValid: ['guided', 'unguided', 'music'].includes(meditation.type),
            categoryValid: ['mindfulness', 'breathing', 'body_scan', 'loving_kindness', 'transcendental', 'zen', 'vipassana', 'yoga'].includes(meditation.category),
            difficultyValid: ['beginner', 'intermediate', 'advanced'].includes(meditation.difficulty),
            tagsValid: Array.isArray(meditation.tags) && meditation.tags.every(tag => typeof tag === 'string'),
            authorIdValid: meditation.authorId ? mongoose_1.default.Types.ObjectId.isValid(meditation.authorId) : true
        };
        return validationResults;
    }
}
exports.MeditationController = MeditationController;
MeditationController.sessionService = new meditation_session_service_1.MeditationSessionService();
MeditationController.meditationService = new meditation_service_1.MeditationService();
MeditationController.sessionAnalyticsService = new session_analytics_service_1.SessionAnalyticsService();
