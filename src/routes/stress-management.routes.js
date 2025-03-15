"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stress_management_controller_1 = require("../controllers/stress-management.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Assessment routes
router.post('/assessment', validation_middleware_1.validateAssessment, stress_management_controller_1.StressManagementController.submitAssessment);
router.get('/assessment/history', stress_management_controller_1.StressManagementController.getStressHistory);
router.get('/assessment/latest', stress_management_controller_1.StressManagementController.getLatestAssessment);
// Preferences routes
router.put('/preferences', validation_middleware_1.validatePreferences, stress_management_controller_1.StressManagementController.updatePreferences);
router.get('/preferences', stress_management_controller_1.StressManagementController.getPreferences);
// Insights route
router.get('/insights', stress_management_controller_1.StressManagementController.getStressInsights);
exports.default = router;
