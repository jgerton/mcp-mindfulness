"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreathingService = void 0;
const breathing_model_1 = require("../models/breathing.model");
const stress_management_service_1 = require("./stress-management.service");
const stress_types_1 = require("../types/stress.types");
class BreathingService {
    static async initializeDefaultPatterns() {
        for (const pattern of Object.values(this.DEFAULT_PATTERNS)) {
            await breathing_model_1.BreathingPattern.findOneAndUpdate({ name: pattern.name }, pattern, { upsert: true });
        }
    }
    static async startSession(userId, patternName, stressLevelBefore) {
        const pattern = await breathing_model_1.BreathingPattern.findOne({ name: patternName });
        if (!pattern) {
            throw new Error('Invalid breathing pattern');
        }
        const session = new breathing_model_1.BreathingSession({
            userId,
            patternName,
            startTime: new Date(),
            targetCycles: pattern.cycles,
            stressLevelBefore
        });
        await session.save();
        return session;
    }
    static async getUserSessionById(sessionId) {
        return breathing_model_1.BreathingSession.findById(sessionId);
    }
    static async completeSession(sessionId, completedCycles, stressLevelAfter) {
        const session = await breathing_model_1.BreathingSession.findById(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        if (session.endTime) {
            throw new Error('Session already completed');
        }
        session.endTime = new Date();
        session.completedCycles = completedCycles;
        session.stressLevelAfter = stressLevelAfter;
        await session.save();
        // Update stress management if stress levels were recorded
        if (session.stressLevelBefore !== undefined && stressLevelAfter !== undefined) {
            await stress_management_service_1.StressManagementService.recordStressChange(session.userId, this.mapNumberToStressLevel(session.stressLevelBefore), this.mapNumberToStressLevel(stressLevelAfter), session._id.toString());
        }
        return session;
    }
    static mapNumberToStressLevel(level) {
        if (level <= 3)
            return stress_types_1.StressLevel.LOW;
        if (level <= 7)
            return stress_types_1.StressLevel.MODERATE;
        return stress_types_1.StressLevel.HIGH;
    }
    static async getPattern(name) {
        return breathing_model_1.BreathingPattern.findOne({ name });
    }
    static async getUserSessions(userId, limit = 10) {
        return breathing_model_1.BreathingSession.find({ userId })
            .sort({ startTime: -1 })
            .limit(limit);
    }
    static async getEffectiveness(userId) {
        const sessions = await breathing_model_1.BreathingSession.find({
            userId,
            stressLevelBefore: { $exists: true },
            stressLevelAfter: { $exists: true }
        });
        if (!sessions.length) {
            return {
                averageStressReduction: 0,
                totalSessions: 0,
                mostEffectivePattern: ''
            };
        }
        const patternEffectiveness = new Map();
        let totalReduction = 0;
        sessions.forEach(session => {
            const reduction = (session.stressLevelBefore || 0) - (session.stressLevelAfter || 0);
            totalReduction += reduction;
            const pattern = session.patternName;
            const current = patternEffectiveness.get(pattern) || { total: 0, count: 0 };
            patternEffectiveness.set(pattern, {
                total: current.total + reduction,
                count: current.count + 1
            });
        });
        let mostEffectivePattern = '';
        let bestAverage = 0;
        patternEffectiveness.forEach((value, pattern) => {
            const average = value.total / value.count;
            if (average > bestAverage) {
                bestAverage = average;
                mostEffectivePattern = pattern;
            }
        });
        return {
            averageStressReduction: totalReduction / sessions.length,
            totalSessions: sessions.length,
            mostEffectivePattern
        };
    }
}
exports.BreathingService = BreathingService;
BreathingService.DEFAULT_PATTERNS = {
    '4-7-8': {
        name: '4-7-8',
        inhale: 4,
        hold: 7,
        exhale: 8,
        cycles: 4
    },
    'BOX_BREATHING': {
        name: 'BOX_BREATHING',
        inhale: 4,
        hold: 4,
        exhale: 4,
        postExhaleHold: 4,
        cycles: 4
    },
    'QUICK_BREATH': {
        name: 'QUICK_BREATH',
        inhale: 2,
        exhale: 4,
        cycles: 6
    }
};
