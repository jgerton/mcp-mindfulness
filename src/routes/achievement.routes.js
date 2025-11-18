"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const achievement_controller_1 = require("../controllers/achievement.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const achievementController = new achievement_controller_1.AchievementController();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get user achievements
 *     description: Retrieve all achievements for the authenticated user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user achievements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Achievement ID
 *                   name:
 *                     type: string
 *                     description: Achievement name
 *                   description:
 *                     type: string
 *                     description: Achievement description
 *                   category:
 *                     type: string
 *                     enum: [time, duration, streak, milestone, special]
 *                     description: Achievement category
 *                   criteria:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         description: Type of criteria
 *                       value:
 *                         type: any
 *                         description: Value of criteria
 *                   icon:
 *                     type: string
 *                     description: Icon for the achievement
 *                   points:
 *                     type: integer
 *                     description: Points awarded for this achievement
 *                   progress:
 *                     type: number
 *                     description: Current progress towards achievement
 *                   target:
 *                     type: number
 *                     description: Target value to complete achievement
 *                   completed:
 *                     type: boolean
 *                     description: Whether the achievement is completed
 *                   completedAt:
 *                     type: string
 *                     format: date-time
 *                     description: When the achievement was completed
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
    achievementController.getUserAchievements(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Get achievement details
 *     description: Retrieve detailed information about a specific achievement
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Achievement ID
 *                 name:
 *                   type: string
 *                   description: Achievement name
 *                 description:
 *                   type: string
 *                   description: Achievement description
 *                 category:
 *                   type: string
 *                   enum: [time, duration, streak, milestone, special]
 *                   description: Achievement category
 *                 criteria:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Type of criteria
 *                     value:
 *                       type: string
 *                       description: Value of criteria
 *                 icon:
 *                   type: string
 *                   description: Icon for the achievement
 *                 points:
 *                   type: integer
 *                   description: Points awarded for this achievement
 *       400:
 *         description: Invalid achievement ID format
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Achievement not found
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
    achievementController.getAchievementById(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
exports.default = router;
