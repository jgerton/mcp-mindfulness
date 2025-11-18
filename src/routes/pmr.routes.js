"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pmr_controller_1 = require("../controllers/pmr.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Validation schemas
const startSessionSchema = {
    body: zod_1.z.object({
        stressLevelBefore: zod_1.z.number().min(0).max(10).optional()
    })
};
const completeSessionSchema = {
    body: zod_1.z.object({
        completedGroups: zod_1.z.array(zod_1.z.string()),
        stressLevelAfter: zod_1.z.number().min(0).max(10).optional()
    })
};
const updateProgressSchema = {
    body: zod_1.z.object({
        completedGroup: zod_1.z.string()
    })
};
// Routes
router.get('/muscle-groups', pmr_controller_1.PMRController.getMuscleGroups);
router.post('/session', (0, validation_middleware_1.validateRequest)(startSessionSchema), pmr_controller_1.PMRController.startSession);
router.put('/session/:sessionId/complete', (0, validation_middleware_1.validateRequest)(completeSessionSchema), pmr_controller_1.PMRController.completeSession);
router.put('/session/:sessionId/progress', (0, validation_middleware_1.validateRequest)(updateProgressSchema), pmr_controller_1.PMRController.updateProgress);
router.get('/sessions', pmr_controller_1.PMRController.getUserSessions);
router.get('/effectiveness', pmr_controller_1.PMRController.getEffectiveness);
exports.default = router;
