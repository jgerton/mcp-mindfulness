import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     StressTechnique:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - difficultyLevel
 *         - durationMinutes
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the stress management technique
 *         description:
 *           type: string
 *           description: Detailed description of the technique
 *         category:
 *           type: string
 *           enum: [breathing, meditation, physical, cognitive, mindfulness]
 *           description: Category of the technique
 *         difficultyLevel:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level of the technique
 *         durationMinutes:
 *           type: number
 *           description: Estimated duration in minutes
 *         steps:
 *           type: array
 *           items:
 *             type: string
 *           description: Step-by-step instructions
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: Benefits of the technique
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorizing the technique
 *         effectivenessRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating of effectiveness (1-5)
 *         recommendedFrequency:
 *           type: string
 *           description: Recommended usage frequency
 *       example:
 *         name: '4-7-8 Breathing Technique'
 *         description: 'A simple breathing exercise to help reduce stress and anxiety'
 *         category: 'breathing'
 *         difficultyLevel: 'beginner'
 *         durationMinutes: 5
 *         steps: ['Find a comfortable position', 'Exhale completely through your mouth', 'Close your mouth and inhale through your nose for 4 seconds', 'Hold your breath for 7 seconds', 'Exhale completely through your mouth for 8 seconds', 'Repeat the cycle 3-4 times']
 *         benefits: ['Reduces anxiety', 'Helps fall asleep faster', 'Manages stress response', 'Improves focus']
 *         tags: ['breathing', 'sleep', 'anxiety', 'beginners']
 *         effectivenessRating: 4.5
 *         recommendedFrequency: 'Twice daily'
 */

export const stressTechniqueSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Name should be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should have no more than {#limit} characters',
      'any.required': 'Name is required'
    }),
  
  description: Joi.string().min(20).max(1000).required()
    .messages({
      'string.base': 'Description should be a string',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description should have at least {#limit} characters',
      'string.max': 'Description should have no more than {#limit} characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string().valid('breathing', 'meditation', 'physical', 'cognitive', 'mindfulness').required()
    .messages({
      'string.base': 'Category should be a string',
      'string.empty': 'Category cannot be empty',
      'any.only': 'Category must be one of: breathing, meditation, physical, cognitive, mindfulness',
      'any.required': 'Category is required'
    }),
  
  difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').required()
    .messages({
      'string.base': 'Difficulty level should be a string',
      'string.empty': 'Difficulty level cannot be empty',
      'any.only': 'Difficulty level must be one of: beginner, intermediate, advanced',
      'any.required': 'Difficulty level is required'
    }),
  
  durationMinutes: Joi.number().min(1).max(120).required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least {#limit} minute',
      'number.max': 'Duration must not exceed {#limit} minutes',
      'any.required': 'Duration is required'
    }),
  
  steps: Joi.array().items(Joi.string().min(5).max(200))
    .messages({
      'array.base': 'Steps must be an array',
      'string.min': 'Each step should have at least {#limit} characters',
      'string.max': 'Each step should have no more than {#limit} characters'
    }),
  
  benefits: Joi.array().items(Joi.string().min(3).max(100))
    .messages({
      'array.base': 'Benefits must be an array',
      'string.min': 'Each benefit should have at least {#limit} characters',
      'string.max': 'Each benefit should have no more than {#limit} characters'
    }),
  
  tags: Joi.array().items(Joi.string().min(2).max(30))
    .messages({
      'array.base': 'Tags must be an array',
      'string.min': 'Each tag should have at least {#limit} characters',
      'string.max': 'Each tag should have no more than {#limit} characters'
    }),
  
  effectivenessRating: Joi.number().min(1).max(5)
    .messages({
      'number.base': 'Effectiveness rating must be a number',
      'number.min': 'Effectiveness rating must be at least {#limit}',
      'number.max': 'Effectiveness rating must not exceed {#limit}'
    }),
  
  recommendedFrequency: Joi.string().max(100)
    .messages({
      'string.base': 'Recommended frequency should be a string',
      'string.max': 'Recommended frequency should have no more than {#limit} characters'
    })
}); 