"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressManagementController = void 0;
const stress_management_service_1 = require("../services/stress-management.service");
const errors_1 = require("../utils/errors");
class StressManagementController {
    static async assessStressLevel(req, res) {
        try {
            const { userId } = req.params;
            const assessment = req.body;
            const stressLevel = await stress_management_service_1.StressManagementService.assessStressLevel(userId, assessment);
            res.json({ stressLevel });
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const recommendations = await stress_management_service_1.StressManagementService.getRecommendations(userId);
            res.json(recommendations);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getRecommendationsWithLevel(req, res) {
        try {
            const { userId } = req.params;
            const { level } = req.body;
            const recommendations = await stress_management_service_1.StressManagementService.getRecommendations(userId, level);
            res.json(recommendations);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async recordStressChange(req, res) {
        try {
            const { userId } = req.params;
            const { stressLevelBefore, stressLevelAfter, technique } = req.body;
            await stress_management_service_1.StressManagementService.recordStressChange(userId, stressLevelBefore, stressLevelAfter, technique);
            res.sendStatus(200);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getStressHistory(req, res) {
        try {
            const { userId } = req.params;
            const history = await stress_management_service_1.StressManagementService.getStressHistory(userId);
            res.json(history);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getStressAnalytics(req, res) {
        try {
            const { userId } = req.params;
            const analytics = await stress_management_service_1.StressManagementService.getStressAnalytics(userId);
            res.json(analytics);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getStressPatterns(req, res) {
        try {
            const { userId } = req.params;
            const patterns = await stress_management_service_1.StressManagementService.getStressPatterns(userId);
            res.json(patterns);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
    static async getPeakStressHours(req, res) {
        try {
            const { userId } = req.params;
            const peakHours = await stress_management_service_1.StressManagementService.getPeakStressHours(userId);
            res.json(peakHours);
        }
        catch (error) {
            (0, errors_1.handleError)(error, res);
        }
    }
}
exports.StressManagementController = StressManagementController;
