"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const achievement_controller_1 = require("../controllers/achievement.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Get user's achievements
router.get('/', (req, res) => {
    achievement_controller_1.AchievementController.getUserAchievements(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
// Get achievement details
router.get('/:achievementId', (req, res) => {
    achievement_controller_1.AchievementController.getAchievementDetails(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
exports.default = router;
