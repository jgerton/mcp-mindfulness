"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDataSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for export endpoints
 */
exports.exportDataSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    format: zod_1.z.enum(['json', 'csv']).optional().default('json'),
    dataType: zod_1.z.enum(['meditation-sessions', 'stress-assessments', 'achievements', 'all']).optional()
});
