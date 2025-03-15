"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const breathing_controller_1 = require("../controllers/breathing.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Validation schemas
const startSessionSchema = {
    body: zod_1.z.object({
        patternName: zod_1.z.string(),
        stressLevelBefore: zod_1.z.number().min(0).max(10).optional()
    })
};
const completeSessionSchema = {
    body: zod_1.z.object({
        completedCycles: zod_1.z.number().min(0),
        stressLevelAfter: zod_1.z.number().min(0).max(10).optional()
    })
};
// Routes
router.get('/patterns/:name', breathing_controller_1.BreathingController.getPatterns);
router.post('/session', (0, validation_middleware_1.validateRequest)(startSessionSchema), breathing_controller_1.BreathingController.startSession);
router.put('/session/:sessionId/complete', (0, validation_middleware_1.validateRequest)(completeSessionSchema), breathing_controller_1.BreathingController.completeSession);
router.get('/sessions', breathing_controller_1.BreathingController.getUserSessions);
router.get('/effectiveness', breathing_controller_1.BreathingController.getEffectiveness);
exports.default = router;
