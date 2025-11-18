"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeditationsQuerySchema = exports.updateMeditationSchema = exports.createMeditationSchema = void 0;
const zod_1 = require("zod");
exports.createMeditationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    description: zod_1.z.string().min(1, 'Description is required').max(1000),
    duration: zod_1.z.number().min(1, 'Duration must be at least 1 minute'),
    type: zod_1.z.enum(['guided', 'timer', 'ambient']),
    audioUrl: zod_1.z.string().url().optional(),
    category: zod_1.z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
    authorId: zod_1.z.string().optional()
});
exports.updateMeditationSchema = exports.createMeditationSchema.partial();
exports.getMeditationsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    category: zod_1.z.enum(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']).optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    type: zod_1.z.enum(['guided', 'timer', 'ambient']).optional(),
    search: zod_1.z.string().optional()
});
