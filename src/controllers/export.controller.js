"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const export_service_1 = require("../services/export.service");
const db_utils_1 = require("../utils/db.utils");
/**
 * Controller for data export API endpoints - PLACEHOLDER IMPLEMENTATION
 */
class ExportController {
    /**
     * Export user achievements
     * @route GET /api/export/achievements
     */
    static async exportAchievements(req, res) {
        var _a;
        try {
            // Validate user authentication
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Parse query parameters
            const format = req.query.format || 'json';
            const startDate = (0, db_utils_1.parseDateParam)(req.query.startDate);
            const endDate = (0, db_utils_1.parseDateParam)(req.query.endDate);
            // Create options object
            const options = {
                format,
                startDate,
                endDate
            };
            // Get data from service
            const result = await export_service_1.ExportService.getUserAchievements(userId, options);
            // Send appropriate response based on format
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="achievements-${userId}.csv"`);
                res.status(200).send(result);
            }
            else {
                res.status(200).json({ data: result });
            }
        }
        catch (error) {
            console.error('Error in exportAchievements:', error);
            res.status(500).json({ error: 'Failed to export achievements', message: error.message });
        }
    }
    /**
     * Export user meditations
     * @route GET /api/export/meditations
     */
    static async exportMeditations(req, res) {
        var _a;
        try {
            // Validate user authentication
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Parse query parameters
            const format = req.query.format || 'json';
            const startDate = (0, db_utils_1.parseDateParam)(req.query.startDate);
            const endDate = (0, db_utils_1.parseDateParam)(req.query.endDate);
            // Create options object
            const options = {
                format,
                startDate,
                endDate
            };
            // Get data from service
            const result = await export_service_1.ExportService.getUserMeditations(userId, options);
            // Send appropriate response based on format
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="meditations-${userId}.csv"`);
                res.status(200).send(result);
            }
            else {
                res.status(200).json({ data: result });
            }
        }
        catch (error) {
            console.error('Error in exportMeditations:', error);
            res.status(500).json({ error: 'Failed to export meditations', message: error.message });
        }
    }
    /**
     * Export user stress assessments
     * @route GET /api/export/stress-levels
     */
    static async exportStressLevels(req, res) {
        var _a;
        try {
            // Validate user authentication
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Parse query parameters
            const format = req.query.format || 'json';
            const startDate = (0, db_utils_1.parseDateParam)(req.query.startDate);
            const endDate = (0, db_utils_1.parseDateParam)(req.query.endDate);
            // Create options object
            const options = {
                format,
                startDate,
                endDate
            };
            // Get data from service
            const result = await export_service_1.ExportService.getUserStressAssessments(userId, options);
            // Send appropriate response based on format
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="stress-levels-${userId}.csv"`);
                res.status(200).send(result);
            }
            else {
                res.status(200).json({ data: result });
            }
        }
        catch (error) {
            console.error('Error in exportStressLevels:', error);
            res.status(500).json({ error: 'Failed to export stress levels', message: error.message });
        }
    }
    /**
     * Export all user data
     * @route GET /api/export/user-data
     */
    static async exportUserData(req, res) {
        var _a;
        try {
            // Validate user authentication
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Parse query parameters
            const format = req.query.format || 'json';
            // Create options object
            const options = {
                format
            };
            // Get data from service
            const result = await export_service_1.ExportService.getUserData(userId, options);
            // Send appropriate response based on format
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.csv"`);
                res.status(200).send(result);
            }
            else {
                res.status(200).json({ data: result });
            }
        }
        catch (error) {
            console.error('Error in exportUserData:', error);
            res.status(500).json({ error: 'Failed to export user data', message: error.message });
        }
    }
}
exports.ExportController = ExportController;
