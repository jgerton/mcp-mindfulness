import express from 'express';
import { StressTechniqueController } from '../controllers/stress-technique.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { stressTechniqueSchema } from '../schemas/stress-technique.schema';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stress Management Techniques
 *   description: Endpoints for managing stress management techniques
 */

/**
 * @swagger
 * /api/stress-techniques:
 *   get:
 *     summary: Get all stress management techniques
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of stress management techniques
 *       500:
 *         description: Server error
 */
router.get('/', StressTechniqueController.getAllTechniques);

/**
 * @swagger
 * /api/stress-techniques/{id}:
 *   get:
 *     summary: Get a stress management technique by ID
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Technique ID
 *     responses:
 *       200:
 *         description: Technique found
 *       404:
 *         description: Technique not found
 *       500:
 *         description: Server error
 */
router.get('/:id', StressTechniqueController.getTechniqueById);

/**
 * @swagger
 * /api/stress-techniques/category/{category}:
 *   get:
 *     summary: Get stress management techniques by category
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: List of techniques in the category
 *       500:
 *         description: Server error
 */
router.get('/category/:category', StressTechniqueController.getTechniquesByCategory);

/**
 * @swagger
 * /api/stress-techniques/difficulty/{level}:
 *   get:
 *     summary: Get stress management techniques by difficulty level
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *         description: Difficulty level
 *     responses:
 *       200:
 *         description: List of techniques by difficulty
 *       500:
 *         description: Server error
 */
router.get('/difficulty/:level', StressTechniqueController.getTechniquesByDifficulty);

/**
 * @swagger
 * /api/stress-techniques/search:
 *   get:
 *     summary: Search stress management techniques
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query required
 *       500:
 *         description: Server error
 */
router.get('/search', StressTechniqueController.searchTechniques);

/**
 * @swagger
 * /api/stress-techniques/recommendations:
 *   get:
 *     summary: Get recommended stress management techniques
 *     tags: [Stress Management Techniques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended techniques
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/recommendations', authenticateUser, StressTechniqueController.getRecommendedTechniques);

/**
 * @swagger
 * /api/stress-techniques:
 *   post:
 *     summary: Create a new stress management technique
 *     tags: [Stress Management Techniques]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StressTechnique'
 *     responses:
 *       201:
 *         description: Technique created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, validateRequest({ body: stressTechniqueSchema }), StressTechniqueController.createTechnique);

/**
 * @swagger
 * /api/stress-techniques/{id}:
 *   put:
 *     summary: Update a stress management technique
 *     tags: [Stress Management Techniques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Technique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StressTechnique'
 *     responses:
 *       200:
 *         description: Technique updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Technique not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, validateRequest({ body: stressTechniqueSchema }), StressTechniqueController.updateTechnique);

/**
 * @swagger
 * /api/stress-techniques/{id}:
 *   delete:
 *     summary: Delete a stress management technique
 *     tags: [Stress Management Techniques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Technique ID
 *     responses:
 *       200:
 *         description: Technique deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Technique not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateUser, StressTechniqueController.deleteTechnique);

export default router; 