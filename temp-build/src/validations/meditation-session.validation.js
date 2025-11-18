"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeditationSessionsSchema = exports.completeMeditationSessionSchema = exports.updateMeditationSessionSchema = exports.createMeditationSessionSchema = void 0;
const zod_1 = require("zod");
const moodEnum = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
exports.createMeditationSessionSchema = zod_1.z.object({
    meditationId: zod_1.z.string(),
    duration: zod_1.z.number().min(0),
    durationCompleted: zod_1.z.number().min(0).optional(),
    completed: zod_1.z.boolean(),
    notes: zod_1.z.string().optional(),
    moodBefore: zod_1.z.enum(moodEnum).optional(),
    moodAfter: zod_1.z.enum(moodEnum).optional()
});
exports.updateMeditationSessionSchema = zod_1.z.object({
    duration: zod_1.z.number().min(0).optional(),
    durationCompleted: zod_1.z.number().min(0).optional(),
    completed: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
    moodBefore: zod_1.z.enum(moodEnum).optional(),
    moodAfter: zod_1.z.enum(moodEnum).optional()
});
exports.completeMeditationSessionSchema = zod_1.z.object({
    duration: zod_1.z.number().min(0),
    durationCompleted: zod_1.z.number().min(0),
    completed: zod_1.z.boolean(),
    moodAfter: zod_1.z.enum(moodEnum),
    notes: zod_1.z.string().optional()
});
exports.getMeditationSessionsSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    completed: zod_1.z.boolean().optional(),
    meditationId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['guided', 'timer', 'ambient']).optional(),
    category: zod_1.z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']).optional(),
    minDuration: zod_1.z.number().int().positive().optional(),
    maxDuration: zod_1.z.number().int().positive().optional(),
    moodBefore: zod_1.z.enum(moodEnum).optional(),
    moodAfter: zod_1.z.enum(moodEnum).optional(),
    sortBy: zod_1.z.enum(['startTime', 'duration', 'moodImprovement']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
