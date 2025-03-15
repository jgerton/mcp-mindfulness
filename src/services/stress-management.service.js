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
exports.StressManagementService = void 0;
const user_service_1 = require("./user.service");
class StressManagementService {
    static assessStressLevel(userId, assessment) {
        return __awaiter(this, void 0, void 0, function* () {
            // Calculate stress score based on assessment answers
            const stressScore = this.calculateStressScore(assessment);
            // Get user's historical stress data
            const historicalData = yield this.getUserStressHistory(userId);
            // Determine stress level category
            const stressLevel = this.determineStressLevel(stressScore, historicalData);
            // Save assessment results
            yield this.saveStressAssessment(userId, Object.assign(Object.assign({}, assessment), { score: stressScore, level: stressLevel, timestamp: new Date() }));
            return stressLevel;
        });
    }
    static getRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userPrefs = yield user_service_1.UserService.getUserPreferences(userId);
            const recentAssessments = yield this.getRecentAssessments(userId);
            const currentLevel = ((_a = recentAssessments[0]) === null || _a === void 0 ? void 0 : _a.level) || 'MODERATE';
            // Get recommendations based on stress level and preferences
            const recommendations = this.generateRecommendations(currentLevel, userPrefs);
            return recommendations.map(rec => (Object.assign(Object.assign({}, rec), { technique: rec.technique // Type assertion to satisfy TypeScript
             })));
        });
    }
    static recordStressChange(userId, stressLevelBefore, stressLevelAfter, technique) {
        return __awaiter(this, void 0, void 0, function* () {
            // Record the effectiveness of a technique
            // This could be used for future recommendations
            // Implementation would store this data for analytics
            console.log(`User ${userId} stress change: ${stressLevelBefore} -> ${stressLevelAfter} using ${technique}`);
        });
    }
    // Private helper methods
    static calculateStressScore(assessment) {
        // Calculate weighted score based on symptoms
        const physicalWeight = 0.25;
        const emotionalWeight = 0.3;
        const behavioralWeight = 0.2;
        const cognitiveWeight = 0.25;
        return (assessment.physicalSymptoms * physicalWeight +
            assessment.emotionalSymptoms * emotionalWeight +
            assessment.behavioralSymptoms * behavioralWeight +
            assessment.cognitiveSymptoms * cognitiveWeight);
    }
    static determineStressLevel(score, history) {
        // Determine stress level based on score and history
        if (score < 3)
            return 'LOW';
        if (score < 7)
            return 'MODERATE';
        return 'HIGH';
    }
    static saveStressAssessment(userId, assessment) {
        return __awaiter(this, void 0, void 0, function* () {
            // Save assessment to database
            // Implementation would create and save a StressAssessment document
            console.log(`Saving stress assessment for user ${userId}: ${JSON.stringify(assessment)}`);
        });
    }
    static getUserStressHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get user's stress history from database
            // Implementation would query StressAssessment collection
            return [];
        });
    }
    static getRecentAssessments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get recent stress assessments
            // Implementation would query StressAssessment collection with time filter
            return [];
        });
    }
    static generateRecommendations(level, preferences) {
        // Generate recommendations based on stress level and user preferences
        const recommendations = [
            {
                duration: 5,
                technique: "4-7-8 Breathing",
                type: "BREATHING",
                title: "Calming Breath Exercise",
                description: "A simple breathing technique to reduce anxiety"
            },
            {
                duration: 10,
                technique: "Body Scan",
                type: "MEDITATION",
                title: "Body Awareness Meditation",
                description: "A meditation focusing on body sensations"
            },
            {
                duration: 15,
                technique: "Progressive Muscle Relaxation",
                type: "PHYSICAL",
                title: "Tension Release",
                description: "Systematically tense and relax muscle groups"
            },
            {
                duration: 2,
                technique: "5-4-3-2-1 Grounding",
                type: "QUICK_RELIEF",
                title: "Sensory Grounding",
                description: "Use your senses to ground yourself in the present moment"
            }
        ];
        return recommendations;
    }
}
exports.StressManagementService = StressManagementService;
