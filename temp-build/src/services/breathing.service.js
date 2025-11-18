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
exports.BreathingService = void 0;
const breathing_model_1 = require("../models/breathing.model");
const stress_management_service_1 = require("./stress-management.service");
class BreathingService {
    static initializeDefaultPatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const pattern of Object.values(this.DEFAULT_PATTERNS)) {
                yield breathing_model_1.BreathingPattern.findOneAndUpdate({ name: pattern.name }, pattern, { upsert: true });
            }
        });
    }
    static startSession(userId, patternName, stressLevelBefore) {
        return __awaiter(this, void 0, void 0, function* () {
            const pattern = yield breathing_model_1.BreathingPattern.findOne({ name: patternName });
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
            yield session.save();
            return session;
        });
    }
    static getUserSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return breathing_model_1.BreathingSession.findById(sessionId);
        });
    }
    static completeSession(sessionId, completedCycles, stressLevelAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield breathing_model_1.BreathingSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            if (session.endTime) {
                throw new Error('Session already completed');
            }
            session.endTime = new Date();
            session.completedCycles = completedCycles;
            session.stressLevelAfter = stressLevelAfter;
            yield session.save();
            // Update stress management if stress levels were recorded
            if (session.stressLevelBefore !== undefined && stressLevelAfter !== undefined) {
                yield stress_management_service_1.StressManagementService.recordStressChange(session.userId, session.stressLevelBefore.toString(), stressLevelAfter.toString(), session._id.toString());
            }
            return session;
        });
    }
    static getPattern(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return breathing_model_1.BreathingPattern.findOne({ name });
        });
    }
    static getUserSessions(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            return breathing_model_1.BreathingSession.find({ userId })
                .sort({ startTime: -1 })
                .limit(limit);
        });
    }
    static getEffectiveness(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield breathing_model_1.BreathingSession.find({
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
        });
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
