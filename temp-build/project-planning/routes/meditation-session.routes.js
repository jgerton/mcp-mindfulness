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
const express_1 = require("express");
const meditation_session_controller_1 = __importDefault(require("../controllers/meditation-session.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const meditation_session_model_1 = require("../models/meditation-session.model");
const router = (0, express_1.Router)();
// Helper function to get the user ID of a meditation session
const getMeditationSessionUserId = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const session = yield meditation_session_model_1.MeditationSession.findById(id);
    return session ? session.userId.toString() : null;
});
// All routes require authentication
router.use(auth_middleware_1.authenticateJWT);
// Session listing and creation
router.get('/meditation-sessions', meditation_session_controller_1.default.getUserSessions);
router.post('/meditation-sessions', meditation_session_controller_1.default.createSession);
// Session statistics
router.get('/meditation-sessions/stats', meditation_session_controller_1.default.getSessionStats);
// Individual session operations
router.get('/meditation-sessions/:id', (0, auth_middleware_1.isResourceOwnerOrAdmin)(getMeditationSessionUserId), meditation_session_controller_1.default.getSessionById);
router.put('/meditation-sessions/:id', (0, auth_middleware_1.isResourceOwnerOrAdmin)(getMeditationSessionUserId), meditation_session_controller_1.default.updateSession);
router.delete('/meditation-sessions/:id', (0, auth_middleware_1.isResourceOwnerOrAdmin)(getMeditationSessionUserId), meditation_session_controller_1.default.deleteSession);
router.post('/meditation-sessions/:id/complete', (0, auth_middleware_1.isResourceOwnerOrAdmin)(getMeditationSessionUserId), meditation_session_controller_1.default.completeSession);
exports.default = router;
