import express from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/export/achievements:
 *   get:
 *     summary: Export user achievements
 *     description: Exports the authenticated user's achievements in JSON or CSV format
 *     tags: [Data Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         required: false
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter achievements from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter achievements until this date (ISO format)
 *     responses:
 *       200:
 *         description: Achievements exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Achievement'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error during export
 */
router.get('/achievements', authenticateToken, ExportController.exportAchievements);

/**
 * @swagger
 * /api/export/meditations:
 *   get:
 *     summary: Export user meditation sessions
 *     description: Exports the authenticated user's meditation sessions in JSON or CSV format
 *     tags: [Data Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         required: false
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter meditations from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter meditations until this date (ISO format)
 *     responses:
 *       200:
 *         description: Meditation sessions exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meditation'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error during export
 */
router.get('/meditations', authenticateToken, ExportController.exportMeditations);

/**
 * @swagger
 * /api/export/stress-levels:
 *   get:
 *     summary: Export user stress assessments
 *     description: Exports the authenticated user's stress assessments in JSON or CSV format
 *     tags: [Data Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         required: false
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter stress assessments from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter stress assessments until this date (ISO format)
 *     responses:
 *       200:
 *         description: Stress assessments exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StressAssessment'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error during export
 */
router.get('/stress-levels', authenticateToken, ExportController.exportStressLevels);

/**
 * @swagger
 * /api/export/user-data:
 *   get:
 *     summary: Export all user data
 *     description: Exports all data for the authenticated user in JSON or CSV format, including profile, achievements, meditations, and stress assessments
 *     tags: [Data Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         required: false
 *         default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: User data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       $ref: '#/components/schemas/User'
 *                     achievements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Achievement'
 *                     meditations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meditation'
 *                     stressAssessments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StressAssessment'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error during export
 */
router.get('/user-data', authenticateToken, ExportController.exportUserData);

export default router; 