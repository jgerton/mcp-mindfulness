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
    static createMeditation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const meditation = yield meditation_service_1.MeditationService.createMeditation(req.body);
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
        });
    }
    // Get all meditations with filtering and pagination
    static getAllMeditations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const meditations = yield meditation_service_1.MeditationService.getAllMeditations();
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
        });
    }
    // Get a single meditation by ID
    static getMeditationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const meditation = yield meditation_service_1.MeditationService.getMeditationById(req.params.id);
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
        });
    }
    // Get active session
    static getActiveSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const activeSession = yield MeditationController.sessionService.getActiveSession(userId);
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
        });
    }
    // Start a meditation session
    static startSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const meditationId = req.params.id;
                const session = yield MeditationController.sessionService.startSession(userId, {
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
        });
    }
    // Record interruption
    static recordInterruption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.params.id;
                const session = yield MeditationController.sessionService.recordInterruption(sessionId);
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
        });
    }
    // Complete a meditation session
    static completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.params.id;
                const completedSession = yield MeditationController.sessionService.completeSession(sessionId, req.body);
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
        });
    }
    // Update a meditation
    static updateMeditation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const meditation = yield meditation_service_1.MeditationService.updateMeditation(req.params.id, req.body);
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
        });
    }
    // Delete a meditation (soft delete by setting isActive to false)
    static deleteMeditation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield meditation_service_1.MeditationService.deleteMeditation(req.params.id);
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
        });
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
