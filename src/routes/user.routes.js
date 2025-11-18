"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../models/user.model");
const router = express_1.default.Router();
const userController = new user_controller_1.UserController(user_model_1.User);
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 friendIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of friend IDs
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   description: Last login timestamp
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', (req, res) => {
    userController.getProfile(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: new_username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: new.email@example.com
 *               preferences:
 *                 type: object
 *                 description: User preferences
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 friendIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of friend IDs
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   description: Last login timestamp
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', (req, res) => {
    userController.updateProfile(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves stats and metrics for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMeditations:
 *                   type: integer
 *                   description: Total number of meditation sessions
 *                 totalMeditationTime:
 *                   type: integer
 *                   description: Total meditation time in minutes
 *                 streakDays:
 *                   type: integer
 *                   description: Current streak of consecutive days meditating
 *                 achievements:
 *                   type: integer
 *                   description: Number of achievements earned
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/stats', (req, res) => {
    userController.getStats(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
exports.default = router;
