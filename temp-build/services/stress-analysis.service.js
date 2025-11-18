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
exports.StressAnalysisService = void 0;
var stress_model_1 = require("../models/stress.model");
/**
 * Service for analyzing stress data and identifying patterns
 */
var StressAnalysisService = /** @class */ (function () {
    function StressAnalysisService() {
    }
    /**
     * Analyze stress data for a user and identify patterns
     * @param userId The user ID to analyze stress data for
     * @param startDate Optional start date for the analysis period
     * @param endDate Optional end date for the analysis period
     * @returns Analysis results including trends, patterns, and insights
     */
    StressAnalysisService.analyzeStressData = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var end, start, assessments, averageStressLevel, stressTrend, commonTriggers, commonSymptoms, peakStressTimes, insights, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        end = endDate || new Date();
                        start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, stress_model_1.StressAssessment.find({
                                userId: userId,
                                timestamp: { $gte: start, $lte: end }
                            }).sort({ timestamp: 1 }).lean()];
                    case 1:
                        assessments = _a.sent();
                        if (assessments.length === 0) {
                            return [2 /*return*/, {
                                    averageStressLevel: 0,
                                    stressTrend: 'INSUFFICIENT_DATA',
                                    commonTriggers: [],
                                    commonSymptoms: [],
                                    peakStressTimes: [],
                                    insights: ['No stress data available for the specified period.']
                                }];
                        }
                        averageStressLevel = this.calculateAverageStressLevel(assessments);
                        stressTrend = this.analyzeStressTrend(assessments);
                        commonTriggers = this.identifyCommonTriggers(assessments);
                        commonSymptoms = this.identifyCommonSymptoms(assessments);
                        peakStressTimes = this.identifyPeakStressTimes(assessments);
                        insights = this.generateInsights(assessments, averageStressLevel, stressTrend, commonTriggers, commonSymptoms, peakStressTimes);
                        return [2 /*return*/, {
                                averageStressLevel: averageStressLevel,
                                stressTrend: stressTrend,
                                commonTriggers: commonTriggers,
                                commonSymptoms: commonSymptoms,
                                peakStressTimes: peakStressTimes,
                                insights: insights
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error analyzing stress data:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate the average stress level from a set of assessments
     * @param assessments Array of stress assessments
     * @returns Average stress level (0-10)
     */
    StressAnalysisService.calculateAverageStressLevel = function (assessments) {
        if (assessments.length === 0)
            return 0;
        var sum = assessments.reduce(function (total, assessment) { return total + (assessment.score || 0); }, 0);
        return parseFloat((sum / assessments.length).toFixed(1));
    };
    /**
     * Analyze the trend of stress levels over time
     * @param assessments Array of stress assessments
     * @returns Trend analysis result (IMPROVING, WORSENING, STABLE, or FLUCTUATING)
     */
    StressAnalysisService.analyzeStressTrend = function (assessments) {
        if (assessments.length < 3)
            return 'INSUFFICIENT_DATA';
        // Split assessments into equal segments for comparison
        var segmentSize = Math.floor(assessments.length / 3);
        var firstSegment = assessments.slice(0, segmentSize);
        var middleSegment = assessments.slice(segmentSize, segmentSize * 2);
        var lastSegment = assessments.slice(segmentSize * 2);
        var firstAvg = this.calculateAverageStressLevel(firstSegment);
        var middleAvg = this.calculateAverageStressLevel(middleSegment);
        var lastAvg = this.calculateAverageStressLevel(lastSegment);
        // Calculate standard deviation to detect fluctuations
        var allScores = assessments.map(function (a) { return a.score || 0; });
        var stdDev = this.calculateStandardDeviation(allScores);
        // High standard deviation indicates fluctuating stress levels
        if (stdDev > 2.5)
            return 'FLUCTUATING';
        // Compare first and last segments to determine trend
        var difference = lastAvg - firstAvg;
        if (difference <= -1)
            return 'IMPROVING';
        if (difference >= 1)
            return 'WORSENING';
        return 'STABLE';
    };
    /**
     * Calculate standard deviation of an array of numbers
     * @param values Array of numeric values
     * @returns Standard deviation
     */
    StressAnalysisService.calculateStandardDeviation = function (values) {
        if (values.length === 0)
            return 0;
        var mean = values.reduce(function (sum, val) { return sum + val; }, 0) / values.length;
        var squareDiffs = values.map(function (value) {
            var diff = value - mean;
            return diff * diff;
        });
        var avgSquareDiff = squareDiffs.reduce(function (sum, val) { return sum + val; }, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    };
    /**
     * Identify common triggers from stress assessments
     * @param assessments Array of stress assessments
     * @param limit Maximum number of triggers to return
     * @returns Array of trigger objects with counts
     */
    StressAnalysisService.identifyCommonTriggers = function (assessments, limit) {
        if (limit === void 0) { limit = 5; }
        var triggerCounts = {};
        // Count occurrences of each trigger
        assessments.forEach(function (assessment) {
            if (Array.isArray(assessment.triggers)) {
                assessment.triggers.forEach(function (trigger) {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                });
            }
        });
        // Convert to array and sort by count
        var sortedTriggers = Object.entries(triggerCounts)
            .map(function (_a) {
            var trigger = _a[0], count = _a[1];
            return ({ trigger: trigger, count: count });
        })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, limit);
        return sortedTriggers;
    };
    /**
     * Identify common symptoms from stress assessments
     * @param assessments Array of stress assessments
     * @param limit Maximum number of symptoms to return
     * @returns Array of symptom objects with counts
     */
    StressAnalysisService.identifyCommonSymptoms = function (assessments, limit) {
        if (limit === void 0) { limit = 5; }
        var symptomCounts = {};
        // Count occurrences of each symptom
        assessments.forEach(function (assessment) {
            if (Array.isArray(assessment.symptoms)) {
                assessment.symptoms.forEach(function (symptom) {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                });
            }
        });
        // Convert to array and sort by count
        var sortedSymptoms = Object.entries(symptomCounts)
            .map(function (_a) {
            var symptom = _a[0], count = _a[1];
            return ({ symptom: symptom, count: count });
        })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, limit);
        return sortedSymptoms;
    };
    /**
     * Identify times of day when stress levels are highest
     * @param assessments Array of stress assessments
     * @param limit Maximum number of peak times to return
     * @returns Array of peak time objects with average stress levels
     */
    StressAnalysisService.identifyPeakStressTimes = function (assessments, limit) {
        var _this = this;
        if (limit === void 0) { limit = 3; }
        var hourlyStress = {};
        // Group stress levels by hour of day
        assessments.forEach(function (assessment) {
            if (assessment.timestamp && assessment.score !== undefined) {
                var hour = new Date(assessment.timestamp).getHours();
                if (!hourlyStress[hour]) {
                    hourlyStress[hour] = { total: 0, count: 0 };
                }
                hourlyStress[hour].total += assessment.score;
                hourlyStress[hour].count += 1;
            }
        });
        // Calculate average stress level for each hour
        var hourlyAverages = Object.entries(hourlyStress).map(function (_a) {
            var hour = _a[0], data = _a[1];
            return ({
                hour: parseInt(hour),
                averageStress: parseFloat((data.total / data.count).toFixed(1)),
                assessmentCount: data.count
            });
        });
        // Sort by average stress level and return top results
        return hourlyAverages
            .sort(function (a, b) { return b.averageStress - a.averageStress; })
            .slice(0, limit)
            .map(function (item) { return (__assign(__assign({}, item), { timeOfDay: _this.formatHourToTimeOfDay(item.hour) })); });
    };
    /**
     * Format hour to time of day string
     * @param hour Hour (0-23)
     * @returns Formatted time string (e.g., "8:00 AM")
     */
    StressAnalysisService.formatHourToTimeOfDay = function (hour) {
        var period = hour >= 12 ? 'PM' : 'AM';
        var displayHour = hour % 12 || 12;
        return "".concat(displayHour, ":00 ").concat(period);
    };
    /**
     * Generate insights based on stress analysis
     * @param assessments Array of stress assessments
     * @param averageStressLevel Average stress level
     * @param stressTrend Stress trend analysis
     * @param commonTriggers Common stress triggers
     * @param commonSymptoms Common stress symptoms
     * @param peakStressTimes Peak stress times
     * @returns Array of insight strings
     */
    StressAnalysisService.generateInsights = function (assessments, averageStressLevel, stressTrend, commonTriggers, commonSymptoms, peakStressTimes) {
        var insights = [];
        // Insight based on average stress level
        if (averageStressLevel >= 7) {
            insights.push('Your average stress level is high. Consider incorporating more stress management techniques into your daily routine.');
        }
        else if (averageStressLevel >= 4) {
            insights.push('Your stress levels are moderate. Regular mindfulness practice can help maintain balance.');
        }
        else {
            insights.push('Your stress levels are generally low. Keep up your current stress management practices.');
        }
        // Insight based on stress trend
        if (stressTrend === 'IMPROVING') {
            insights.push('Your stress levels have been improving over time. Your current strategies appear to be working well.');
        }
        else if (stressTrend === 'WORSENING') {
            insights.push('Your stress levels have been increasing over time. Consider reviewing and adjusting your stress management approach.');
        }
        else if (stressTrend === 'FLUCTUATING') {
            insights.push('Your stress levels fluctuate significantly. Try to identify patterns and prepare for high-stress periods.');
        }
        // Insight based on common triggers
        if (commonTriggers.length > 0) {
            var topTrigger = commonTriggers[0].trigger;
            insights.push("\"".concat(topTrigger, "\" is your most common stress trigger. Consider developing specific strategies to address this source of stress."));
            if (commonTriggers.length > 1) {
                var secondTrigger = commonTriggers[1].trigger;
                if (commonTriggers[0].count > commonTriggers[1].count * 2) {
                    insights.push("\"".concat(topTrigger, "\" triggers stress much more frequently than other factors. Focusing on this area could significantly reduce your overall stress."));
                }
                else {
                    insights.push("Both \"".concat(topTrigger, "\" and \"").concat(secondTrigger, "\" are significant sources of stress for you."));
                }
            }
        }
        // Insight based on peak stress times
        if (peakStressTimes.length > 0) {
            var peakTime = peakStressTimes[0];
            insights.push("Your stress tends to peak around ".concat(peakTime.timeOfDay, ". Consider scheduling stress management activities before this time."));
        }
        // Insight based on stress patterns
        var weekdayStress = this.calculateAverageStressLevelByDayType(assessments, true);
        var weekendStress = this.calculateAverageStressLevelByDayType(assessments, false);
        if (weekdayStress > weekendStress + 1.5) {
            insights.push('Your stress levels are significantly higher on weekdays compared to weekends. Work-related stress may be a key factor.');
        }
        else if (weekendStress > weekdayStress + 1.5) {
            insights.push('Your stress levels are higher on weekends than weekdays. Consider examining your weekend activities and responsibilities.');
        }
        return insights;
    };
    /**
     * Calculate average stress level by day type (weekday or weekend)
     * @param assessments Array of stress assessments
     * @param isWeekday Whether to calculate for weekdays (true) or weekends (false)
     * @returns Average stress level for the specified day type
     */
    StressAnalysisService.calculateAverageStressLevelByDayType = function (assessments, isWeekday) {
        var filteredAssessments = assessments.filter(function (assessment) {
            if (!assessment.timestamp)
                return false;
            var day = new Date(assessment.timestamp).getDay();
            // 0 = Sunday, 6 = Saturday
            var isWeekendDay = day === 0 || day === 6;
            return isWeekday ? !isWeekendDay : isWeekendDay;
        });
        return this.calculateAverageStressLevel(filteredAssessments);
    };
    /**
     * Identify potential stress triggers by correlating stress levels with reported triggers
     * @param userId The user ID to analyze
     * @param limit Maximum number of triggers to return
     * @returns Array of trigger objects with correlation scores
     */
    StressAnalysisService.identifyStressTriggers = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var assessments_1, allTriggers_1, triggerCorrelations_1, triggerAnalysis, error_2;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stress_model_1.StressAssessment.find({ userId: userId }).lean()];
                    case 1:
                        assessments_1 = _a.sent();
                        if (assessments_1.length < 5) {
                            return [2 /*return*/, []];
                        }
                        allTriggers_1 = new Set();
                        assessments_1.forEach(function (assessment) {
                            if (Array.isArray(assessment.triggers)) {
                                assessment.triggers.forEach(function (trigger) { return allTriggers_1.add(trigger); });
                            }
                        });
                        triggerCorrelations_1 = {};
                        allTriggers_1.forEach(function (trigger) {
                            triggerCorrelations_1[trigger] = { sum: 0, count: 0 };
                            assessments_1.forEach(function (assessment) {
                                if (Array.isArray(assessment.triggers) && assessment.triggers.includes(trigger)) {
                                    triggerCorrelations_1[trigger].sum += assessment.score || 0;
                                    triggerCorrelations_1[trigger].count += 1;
                                }
                            });
                        });
                        triggerAnalysis = Object.entries(triggerCorrelations_1)
                            .map(function (_a) {
                            var trigger = _a[0], data = _a[1];
                            return ({
                                trigger: trigger,
                                averageStressLevel: parseFloat((data.sum / data.count).toFixed(1)),
                                occurrences: data.count
                            });
                        })
                            .filter(function (item) { return item.occurrences >= 2; }) // Only include triggers with sufficient data (changed from 3 to 2)
                            .sort(function (a, b) { return b.averageStressLevel - a.averageStressLevel; })
                            .slice(0, limit);
                        return [2 /*return*/, triggerAnalysis];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error identifying stress triggers:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StressAnalysisService;
}());
exports.StressAnalysisService = StressAnalysisService;
