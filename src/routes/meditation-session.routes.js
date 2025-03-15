"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../middleware/validation.middleware");
const meditation_session_controller_1 = require("../controllers/meditation-session.controller");
const meditation_session_validation_1 = require("../validations/meditation-session.validation");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const meditationSessionController = new meditation_session_controller_1.MeditationSessionController();
router.post('/', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)({ body: meditation_session_validation_1.createMeditationSessionSchema }), (req, res) => meditationSessionController.startSession(req, res));
router.get('/', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)({ query: meditation_session_validation_1.getMeditationSessionsSchema }), (req, res) => meditationSessionController.getAll(req, res));
router.get('/:id', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)({ params: zod_1.z.object({ id: zod_1.z.string() }) }), (req, res) => meditationSessionController.getById(req, res));
router.patch('/:id', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: meditation_session_validation_1.updateMeditationSessionSchema
}), (req, res) => meditationSessionController.update(req, res));
router.get('/stats', auth_middleware_1.authenticateToken, (req, res) => meditationSessionController.getStats(req, res));
router.post('/start', auth_middleware_1.authenticateToken, (req, res) => meditationSessionController.startSession(req, res));
router.post('/:sessionId/complete', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)({
    params: zod_1.z.object({ sessionId: zod_1.z.string() }),
    body: meditation_session_validation_1.completeMeditationSessionSchema
}), (req, res) => meditationSessionController.completeSession(req, res));
router.get('/active', auth_middleware_1.authenticateToken, (req, res) => meditationSessionController.getActiveSession(req, res));
exports.default = router;
