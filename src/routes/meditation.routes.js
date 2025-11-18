"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const meditation_controller_1 = require("../controllers/meditation.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/meditations:
 *   get:
 *     summary: Get all meditations
 *     description: Retrieve a list of all available meditation content
 *     tags: [Meditation]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [mindfulness, breathing, body-scan, loving-kindness, other]
 *         description: Filter by meditation category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [guided, timer, ambient]
 *         description: Filter by meditation type
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by duration in minutes
 *     responses:
 *       200:
 *         description: A list of meditations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Meditation ID
 *                   title:
 *                     type: string
 *                     description: Meditation title
 *                   description:
 *                     type: string
 *                     description: Meditation description
 *                   duration:
 *                     type: integer
 *                     description: Duration in minutes
 *                   type:
 *                     type: string
 *                     enum: [guided, timer, ambient]
 *                     description: Type of meditation
 *                   category:
 *                     type: string
 *                     enum: [mindfulness, breathing, body-scan, loving-kindness, other]
 *                     description: Category of meditation
 *                   difficulty:
 *                     type: string
 *                     enum: [beginner, intermediate, advanced]
 *                     description: Difficulty level
 *                   audioUrl:
 *                     type: string
 *                     description: URL to meditation audio (if guided)
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Tags for the meditation
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
    meditation_controller_1.MeditationController.getAllMeditations(req, res);
});
/**
 * @swagger
 * /api/meditations/{id}:
 *   get:
 *     summary: Get meditation by ID
 *     description: Retrieve detailed information about a specific meditation
 *     tags: [Meditation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meditation ID
 *     responses:
 *       200:
 *         description: Detailed meditation information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Meditation ID
 *                 title:
 *                   type: string
 *                   description: Meditation title
 *                 description:
 *                   type: string
 *                   description: Meditation description
 *                 duration:
 *                   type: integer
 *                   description: Duration in minutes
 *                 type:
 *                   type: string
 *                   enum: [guided, timer, ambient]
 *                   description: Type of meditation
 *                 category:
 *                   type: string
 *                   enum: [mindfulness, breathing, body-scan, loving-kindness, other]
 *                   description: Category of meditation
 *                 difficulty:
 *                   type: string
 *                   enum: [beginner, intermediate, advanced]
 *                   description: Difficulty level
 *                 audioUrl:
 *                   type: string
 *                   description: URL to meditation audio (if guided)
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Tags for the meditation
 *       404:
 *         description: Meditation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
    meditation_controller_1.MeditationController.getMeditationById(req, res);
});
/**
 * @swagger
 * /api/meditations:
 *   post:
 *     summary: Create new meditation
 *     description: Create a new meditation (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - duration
 *               - type
 *               - category
 *               - difficulty
 *             properties:
 *               title:
 *                 type: string
 *                 description: Meditation title
 *               description:
 *                 type: string
 *                 description: Meditation description
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 minimum: 1
 *               type:
 *                 type: string
 *                 enum: [guided, timer, ambient]
 *                 description: Type of meditation
 *               category:
 *                 type: string
 *                 enum: [mindfulness, breathing, body-scan, loving-kindness, other]
 *                 description: Category of meditation
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 description: Difficulty level
 *               audioUrl:
 *                 type: string
 *                 description: URL to meditation audio (if guided)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the meditation
 *     responses:
 *       201:
 *         description: Meditation created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.createMeditation(req, res);
});
/**
 * @swagger
 * /api/meditations/{id}:
 *   put:
 *     summary: Update meditation
 *     description: Update an existing meditation (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meditation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Meditation title
 *               description:
 *                 type: string
 *                 description: Meditation description
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 minimum: 1
 *               type:
 *                 type: string
 *                 enum: [guided, timer, ambient]
 *                 description: Type of meditation
 *               category:
 *                 type: string
 *                 enum: [mindfulness, breathing, body-scan, loving-kindness, other]
 *                 description: Category of meditation
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 description: Difficulty level
 *               audioUrl:
 *                 type: string
 *                 description: URL to meditation audio (if guided)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the meditation
 *     responses:
 *       200:
 *         description: Meditation updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Meditation not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.updateMeditation(req, res);
});
/**
 * @swagger
 * /api/meditations/{id}:
 *   delete:
 *     summary: Delete meditation
 *     description: Delete an existing meditation (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meditation ID
 *     responses:
 *       200:
 *         description: Meditation deleted successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Meditation not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.deleteMeditation(req, res);
});
/**
 * @swagger
 * /api/meditations/{id}/start:
 *   post:
 *     summary: Start meditation session
 *     description: Start a new meditation session (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meditation ID
 *     responses:
 *       200:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: Session ID
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   description: Session start time
 *                 meditation:
 *                   type: object
 *                   description: Meditation details
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Meditation not found
 *       500:
 *         description: Server error
 */
router.post('/:id/start', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.startSession(req, res);
});
/**
 * @swagger
 * /api/meditations/{id}/complete:
 *   post:
 *     summary: Complete meditation session
 *     description: Complete an active meditation session (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meditation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [calm, focused, relaxed, tired, neutral, anxious]
 *                 description: User's mood after completing the session
 *               notes:
 *                 type: string
 *                 description: User's notes about the session
 *     responses:
 *       200:
 *         description: Session completed successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Active session not found
 *       500:
 *         description: Server error
 */
router.post('/:id/complete', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.completeSession(req, res);
});
/**
 * @swagger
 * /api/meditations/session/active:
 *   get:
 *     summary: Get active session
 *     description: Get the user's currently active meditation session (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Session ID
 *                 userId:
 *                   type: string
 *                   description: User ID
 *                 meditationId:
 *                   type: string
 *                   description: Meditation ID
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   description: Session start time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   description: Session end time (null if active)
 *                 completed:
 *                   type: boolean
 *                   description: Whether the session is completed
 *                 interruptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       time:
 *                         type: string
 *                         format: date-time
 *                         description: Time of interruption
 *                       reason:
 *                         type: string
 *                         description: Reason for interruption
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: No active session found
 *       500:
 *         description: Server error
 */
router.get('/session/active', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.getActiveSession(req, res);
});
/**
 * @swagger
 * /api/meditations/session/{id}/interrupt:
 *   post:
 *     summary: Record interruption
 *     description: Record an interruption during an active meditation session (requires authentication)
 *     tags: [Meditation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for the interruption
 *     responses:
 *       200:
 *         description: Interruption recorded successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post('/session/:id/interrupt', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.recordInterruption(req, res);
});
exports.default = router;
