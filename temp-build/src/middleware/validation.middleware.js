"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePreferences = exports.validateAssessment = exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (schema.params) {
                req.params = yield schema.params.parseAsync(req.params);
            }
            if (schema.query) {
                req.query = yield schema.query.parseAsync(req.query);
            }
            if (schema.body) {
                req.body = yield schema.body.parseAsync(req.body);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Check for specific error types to provide better error messages
                const errorMessage = error.errors.map(e => {
                    if (e.path.includes('stressLevelBefore')) {
                        return `Invalid stress level: ${e.message}`;
                    }
                    else if (e.path.includes('completedGroups')) {
                        return `Invalid completed groups: ${e.message}`;
                    }
                    else {
                        return e.message;
                    }
                }).join(', ');
                res.status(400).json({
                    error: errorMessage
                });
            }
            else {
                next(error);
            }
        }
    });
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
