"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStressTracking = exports.validatePreferences = exports.validateAssessment = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            if (schema.body) {
                if ('parse' in schema.body) {
                    // Zod schema
                    req.body = await schema.body.parseAsync(req.body);
                }
                else {
                    // Joi schema
                    const { error, value } = schema.body.validate(req.body);
                    if (error) {
                        throw new errors_1.ValidationError(error.details[0].message);
                    }
                    req.body = value;
                }
            }
            if (schema.query) {
                if ('parse' in schema.query) {
                    // Zod schema
                    req.query = await schema.query.parseAsync(req.query);
                }
                else {
                    // Joi schema
                    const { error, value } = schema.query.validate(req.query);
                    if (error) {
                        throw new errors_1.ValidationError(error.details[0].message);
                    }
                    req.query = value;
                }
            }
            if (schema.params) {
                if ('parse' in schema.params) {
                    // Zod schema
                    req.params = await schema.params.parseAsync(req.params);
                }
                else {
                    // Joi schema
                    const { error, value } = schema.params.validate(req.params);
                    if (error) {
                        throw new errors_1.ValidationError(error.details[0].message);
                    }
                    req.params = value;
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(new errors_1.ValidationError(error.errors[0].message));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
const validateAssessment = (req, res, next) => {
    const { physicalSymptoms, emotionalSymptoms, behavioralSymptoms, cognitiveSymptoms } = req.body;
    // Validate required fields
    if (!physicalSymptoms || !emotionalSymptoms || !behavioralSymptoms || !cognitiveSymptoms) {
        res.status(400).json({ error: 'All symptom fields are required' });
        return;
    }
    // Validate score ranges (0-10)
    const symptoms = [physicalSymptoms, emotionalSymptoms, behavioralSymptoms, cognitiveSymptoms];
    if (!symptoms.every(score => score >= 0 && score <= 10)) {
        res.status(400).json({ error: 'Symptom scores must be between 0 and 10' });
        return;
    }
    next();
};
exports.validateAssessment = validateAssessment;
const validatePreferences = (req, res, next) => {
    const { preferredTechniques, preferredDuration, timePreferences } = req.body;
    // Validate preferred techniques
    if (preferredTechniques) {
        const validTechniques = [
            '4-7-8', 'BOX_BREATHING', 'ALTERNATE_NOSTRIL',
            'GUIDED', 'MINDFULNESS', 'BODY_SCAN',
            'PROGRESSIVE_RELAXATION', 'STRETCHING', 'WALKING',
            'GROUNDING', 'VISUALIZATION', 'QUICK_BREATH'
        ];
        if (!Array.isArray(preferredTechniques) ||
            !preferredTechniques.every(tech => validTechniques.includes(tech))) {
            res.status(400).json({ error: 'Invalid preferred techniques' });
            return;
        }
    }
    // Validate preferred duration
    if (preferredDuration !== undefined && (typeof preferredDuration !== 'number' ||
        preferredDuration < 1 ||
        preferredDuration > 60)) {
        res.status(400).json({ error: 'Preferred duration must be between 1 and 60 minutes' });
        return;
    }
    // Validate time preferences
    if (timePreferences) {
        const { reminderFrequency } = timePreferences;
        if (reminderFrequency && !['DAILY', 'WEEKLY', 'ON_HIGH_STRESS'].includes(reminderFrequency)) {
            res.status(400).json({ error: 'Invalid reminder frequency' });
            return;
        }
    }
    next();
};
exports.validatePreferences = validatePreferences;
const validateStressTracking = (req, res, next) => {
    const { level, notes, triggers, symptoms } = req.body;
    // Validate stress level (required)
    if (typeof level !== 'number' || level < 0 || level > 10) {
        res.status(400).json({ error: 'Stress level must be a number between 0 and 10' });
        return;
    }
    // Validate notes (optional)
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
        res.status(400).json({ error: 'Notes must be a string with maximum 500 characters' });
        return;
    }
    // Validate triggers (optional)
    if (triggers !== undefined && (!Array.isArray(triggers) ||
        !triggers.every(item => typeof item === 'string'))) {
        res.status(400).json({ error: 'Triggers must be an array of strings' });
        return;
    }
    // Validate symptoms (optional)
    if (symptoms !== undefined && (!Array.isArray(symptoms) ||
        !symptoms.every(item => typeof item === 'string'))) {
        res.status(400).json({ error: 'Symptoms must be an array of strings' });
        return;
    }
    next();
};
exports.validateStressTracking = validateStressTracking;
