"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stress_controller_1 = require("../controllers/stress.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Stress tracking routes
router.post('/track', validation_middleware_1.validateStressTracking, stress_controller_1.StressController.trackDailyStress);
router.get('/history', stress_controller_1.StressController.getStressTrackingHistory);
router.get('/trends', stress_controller_1.StressController.getStressTrends);
router.get('/statistics', stress_controller_1.StressController.getStressStatistics);
exports.default = router;
