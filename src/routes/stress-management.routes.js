"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stress_management_controller_1 = require("../controllers/stress-management.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Assessment routes
router.post('/:userId/assess', validation_middleware_1.validateAssessment, stress_management_controller_1.StressManagementController.assessStressLevel);
router.get('/:userId/recommendations', stress_management_controller_1.StressManagementController.getRecommendations);
router.post('/:userId/recommendations', stress_management_controller_1.StressManagementController.getRecommendationsWithLevel);
router.post('/:userId/record-change', stress_management_controller_1.StressManagementController.recordStressChange);
// Analytics routes
router.get('/:userId/history', stress_management_controller_1.StressManagementController.getStressHistory);
router.get('/:userId/analytics', stress_management_controller_1.StressManagementController.getStressAnalytics);
router.get('/:userId/patterns', stress_management_controller_1.StressManagementController.getStressPatterns);
router.get('/:userId/peak-hours', stress_management_controller_1.StressManagementController.getPeakStressHours);
exports.default = router;
