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
exports.StressManagementController = void 0;
var stress_management_service_1 = require("../services/stress-management.service");
var stress_model_1 = require("../models/stress.model");
var stress_analysis_service_1 = require("../services/stress-analysis.service");
var StressManagementController = /** @class */ (function () {
    function StressManagementController() {
    }
    StressManagementController.submitAssessment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, assessment, stressLevel, recommendations, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        assessment = req.body;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_management_service_1.StressManagementService.assessStressLevel(userId, assessment)];
                    case 1:
                        stressLevel = _b.sent();
                        return [4 /*yield*/, stress_management_service_1.StressManagementService.getRecommendations(userId)];
                    case 2:
                        recommendations = _b.sent();
                        res.json({
                            stressLevel: stressLevel,
                            recommendations: recommendations
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error submitting stress assessment:', error_1);
                        res.status(500).json({ error: 'Failed to submit stress assessment' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.getStressHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, _a, startDate, endDate, history_1, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_model_1.StressAssessment.find({
                                userId: userId,
                                timestamp: {
                                    $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                    $lte: endDate ? new Date(endDate) : new Date()
                                }
                            }).sort({ timestamp: -1 })];
                    case 1:
                        history_1 = _c.sent();
                        res.json(history_1);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        console.error('Error fetching stress history:', error_2);
                        res.status(500).json({ error: 'Failed to fetch stress history' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.getLatestAssessment = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, latestAssessment, recommendations, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_model_1.StressAssessment.findOne({ userId: userId })
                                .sort({ timestamp: -1 })];
                    case 1:
                        latestAssessment = _b.sent();
                        if (!latestAssessment) {
                            res.status(404).json({ error: 'No assessments found' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_management_service_1.StressManagementService.getRecommendations(userId)];
                    case 2:
                        recommendations = _b.sent();
                        res.json({
                            assessment: latestAssessment,
                            recommendations: recommendations
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error fetching latest assessment:', error_3);
                        res.status(500).json({ error: 'Failed to fetch latest assessment' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.updatePreferences = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, preferences, updatedPreferences, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        preferences = req.body;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_model_1.UserPreferences.findOneAndUpdate({ userId: userId }, __assign({}, preferences), { new: true, upsert: true })];
                    case 1:
                        updatedPreferences = _b.sent();
                        res.json(updatedPreferences);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error updating preferences:', error_4);
                        res.status(500).json({ error: 'Failed to update preferences' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.getPreferences = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, preferences, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_model_1.UserPreferences.findOne({ userId: userId })];
                    case 1:
                        preferences = _b.sent();
                        if (!preferences) {
                            res.status(404).json({ error: 'No preferences found' });
                            return [2 /*return*/];
                        }
                        res.json(preferences);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error fetching preferences:', error_5);
                        res.status(500).json({ error: 'Failed to fetch preferences' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.getStressInsights = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, insights, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stress_analysis_service_1.StressAnalysisService.analyzeStressData(userId)];
                    case 1:
                        insights = _b.sent();
                        res.json(insights);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error generating stress insights:', error_6);
                        res.status(500).json({ error: 'Failed to generate stress insights' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.getStressTriggers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, limit, triggers, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                        if (!userId) {
                            res.status(401).json({ error: 'Unauthorized' });
                            return [2 /*return*/];
                        }
                        limit = req.query.limit ? parseInt(req.query.limit) : 5;
                        return [4 /*yield*/, stress_analysis_service_1.StressAnalysisService.identifyStressTriggers(userId, limit)];
                    case 1:
                        triggers = _b.sent();
                        res.json({
                            triggers: triggers,
                            count: triggers.length,
                            message: triggers.length > 0
                                ? 'Stress triggers identified successfully'
                                : 'Insufficient data to identify stress triggers'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error identifying stress triggers:', error_7);
                        res.status(500).json({ error: 'Failed to identify stress triggers' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StressManagementController.calculateAverageStressLevel = function (assessments) {
        if (!assessments.length)
            return 0;
        return assessments.reduce(function (sum, assessment) { return sum + (assessment.score || 0); }, 0) / assessments.length;
    };
    StressManagementController.findCommonTriggers = function (assessments) {
        var triggerCount = new Map();
        assessments.forEach(function (assessment) {
            var _a;
            (_a = assessment.triggers) === null || _a === void 0 ? void 0 : _a.forEach(function (trigger) {
                triggerCount.set(trigger, (triggerCount.get(trigger) || 0) + 1);
            });
        });
        return Array.from(triggerCount.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 3)
            .map(function (_a) {
            var trigger = _a[0];
            return trigger;
        });
    };
    StressManagementController.analyzeTrend = function (assessments) {
        if (assessments.length < 2)
            return 'STABLE';
        var firstHalf = assessments.slice(0, Math.floor(assessments.length / 2));
        var secondHalf = assessments.slice(Math.floor(assessments.length / 2));
        var firstAvg = this.calculateAverageStressLevel(firstHalf);
        var secondAvg = this.calculateAverageStressLevel(secondHalf);
        if (secondAvg < firstAvg - 0.5)
            return 'IMPROVING';
        if (secondAvg > firstAvg + 0.5)
            return 'WORSENING';
        return 'STABLE';
    };
    StressManagementController.findPeakStressTimes = function (assessments) {
        var hourlyStress = new Map();
        assessments.forEach(function (assessment) {
            var hour = new Date(assessment.timestamp).getHours();
            hourlyStress.set(hour, (hourlyStress.get(hour) || 0) + (assessment.score || 0));
        });
        return Array.from(hourlyStress.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 2)
            .map(function (_a) {
            var hour = _a[0];
            return "".concat(hour, ":00");
        });
    };
    return StressManagementController;
}());
exports.StressManagementController = StressManagementController;
