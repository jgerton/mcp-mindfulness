"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const achievement_controller_1 = __importDefault(require("../controllers/achievement.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/achievements', achievement_controller_1.default.getAllAchievements);
router.get('/achievements/:id', achievement_controller_1.default.getAchievementById);
// Protected routes - require authentication
router.get('/user/achievements', auth_middleware_1.authenticateJWT, achievement_controller_1.default.getUserAchievements);
router.get('/user/achievements/completed', auth_middleware_1.authenticateJWT, achievement_controller_1.default.getCompletedAchievements);
router.get('/user/achievements/points', auth_middleware_1.authenticateJWT, achievement_controller_1.default.getUserPoints);
router.post('/user/activity', auth_middleware_1.authenticateJWT, achievement_controller_1.default.processUserActivity);
// Admin routes - require admin role
router.post('/achievements', auth_middleware_1.authenticateJWT, auth_middleware_1.isAdmin, achievement_controller_1.default.createAchievement);
router.put('/achievements/:id', auth_middleware_1.authenticateJWT, auth_middleware_1.isAdmin, achievement_controller_1.default.updateAchievement);
router.delete('/achievements/:id', auth_middleware_1.authenticateJWT, auth_middleware_1.isAdmin, achievement_controller_1.default.deleteAchievement);
exports.default = router;
