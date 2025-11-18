"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressManagementService = void 0;
var user_service_1 = require("./user.service");
var StressManagementService = /** @class */ (function () {
    function StressManagementService() {
    }
    StressManagementService.assessStressLevel = function (userId, assessment) {
        return __awaiter(this, void 0, void 0, function () {
            var stressScore, historicalData, stressLevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stressScore = this.calculateStressScore(assessment);
                        return [4 /*yield*/, this.getUserStressHistory(userId)];
                    case 1:
                        historicalData = _a.sent();
                        stressLevel = this.determineStressLevel(stressScore, historicalData);
                        // Save assessment results
                        return [4 /*yield*/, this.saveStressAssessment(userId, __assign(__assign({}, assessment), { score: stressScore, level: stressLevel, timestamp: new Date() }))];
                    case 2:
                        // Save assessment results
                        _a.sent();
                        return [2 /*return*/, stressLevel];
                }
            });
        });
    };
    StressManagementService.getRecommendations = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userPrefs, recentAssessments, currentLevel, recommendations;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, user_service_1.UserService.getUserPreferences(userId)];
                    case 1:
                        userPrefs = _b.sent();
                        return [4 /*yield*/, this.getRecentAssessments(userId)];
                    case 2:
                        recentAssessments = _b.sent();
                        currentLevel = ((_a = recentAssessments[0]) === null || _a === void 0 ? void 0 : _a.level) || 'MODERATE';
                        recommendations = this.generateRecommendations(currentLevel, userPrefs);
                        return [2 /*return*/, recommendations.map(function (rec) { return (__assign(__assign({}, rec), { technique: rec.technique // Type assertion to satisfy TypeScript
                             })); })];
                }
            });
        });
    };
    StressManagementService.recordStressChange = function (userId, stressLevelBefore, stressLevelAfter, technique) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Record the effectiveness of a technique
                // This could be used for future recommendations
                // Implementation would store this data for analytics
                console.log("User ".concat(userId, " stress change: ").concat(stressLevelBefore, " -> ").concat(stressLevelAfter, " using ").concat(technique));
                return [2 /*return*/];
            });
        });
    };
    // Private helper methods
    StressManagementService.calculateStressScore = function (assessment) {
        // Calculate weighted score based on symptoms
        var physicalWeight = 0.25;
        var emotionalWeight = 0.3;
        var behavioralWeight = 0.2;
        var cognitiveWeight = 0.25;
        return (assessment.physicalSymptoms * physicalWeight +
            assessment.emotionalSymptoms * emotionalWeight +
            assessment.behavioralSymptoms * behavioralWeight +
            assessment.cognitiveSymptoms * cognitiveWeight);
    };
    StressManagementService.determineStressLevel = function (score, history) {
        // Determine stress level based on score and history
        if (score < 3)
            return 'LOW';
        if (score < 7)
            return 'MODERATE';
        return 'HIGH';
    };
    StressManagementService.saveStressAssessment = function (userId, assessment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Save assessment to database
                // Implementation would create and save a StressAssessment document
                console.log("Saving stress assessment for user ".concat(userId, ": ").concat(JSON.stringify(assessment)));
                return [2 /*return*/];
            });
        });
    };
    StressManagementService.getUserStressHistory = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Get user's stress history from database
                // Implementation would query StressAssessment collection
                return [2 /*return*/, []];
            });
        });
    };
    StressManagementService.getRecentAssessments = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Get recent stress assessments
                // Implementation would query StressAssessment collection with time filter
                return [2 /*return*/, []];
            });
        });
    };
    StressManagementService.generateRecommendations = function (level, preferences) {
        // Generate recommendations based on stress level and user preferences
        var recommendations = [
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
    };
    return StressManagementService;
}());
exports.StressManagementService = StressManagementService;
