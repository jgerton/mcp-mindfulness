"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stress_technique_controller_1 = require("../controllers/stress-technique.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const stress_technique_schema_1 = require("../schemas/stress-technique.schema");
const router = express_1.default.Router();
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
router.get('/', stress_technique_controller_1.StressTechniqueController.getAllTechniques);
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
router.get('/:id', stress_technique_controller_1.StressTechniqueController.getTechniqueById);
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
router.get('/category/:category', stress_technique_controller_1.StressTechniqueController.getTechniquesByCategory);
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
router.get('/difficulty/:level', stress_technique_controller_1.StressTechniqueController.getTechniquesByDifficulty);
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
router.get('/search', stress_technique_controller_1.StressTechniqueController.searchTechniques);
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
router.get('/recommendations', auth_middleware_1.authenticateUser, stress_technique_controller_1.StressTechniqueController.getRecommendedTechniques);
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
router.post('/', auth_middleware_1.authenticateUser, (0, validation_middleware_1.validateRequest)({ body: stress_technique_schema_1.stressTechniqueSchema }), stress_technique_controller_1.StressTechniqueController.createTechnique);
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
router.put('/:id', auth_middleware_1.authenticateUser, (0, validation_middleware_1.validateRequest)({ body: stress_technique_schema_1.stressTechniqueSchema }), stress_technique_controller_1.StressTechniqueController.updateTechnique);
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
router.delete('/:id', auth_middleware_1.authenticateUser, stress_technique_controller_1.StressTechniqueController.deleteTechnique);
exports.default = router;
