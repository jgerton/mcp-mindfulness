"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferences = exports.StressAssessmentLegacy = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const stress_types_1 = require("../types/stress.types");
const stressAssessmentSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['LOW', 'MODERATE', 'HIGH'],
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    physicalSymptoms: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    emotionalSymptoms: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    behavioralSymptoms: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    cognitiveSymptoms: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    },
    triggers: [{
            type: String
        }]
}, {
    timestamps: true
});
const userPreferencesSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    preferredTechniques: [{
            type: String,
            enum: Object.values(stress_types_1.TechniqueType),
            required: true
        }],
    preferredDuration: {
        type: Number,
        min: 1,
        max: 60,
        default: 15
    },
    timePreferences: {
        reminderFrequency: {
            type: String,
            enum: ['DAILY', 'WEEKLY', 'ON_HIGH_STRESS'],
            default: 'DAILY'
        },
        preferredTimes: [{
                type: String
            }]
    }
}, {
    timestamps: true
});
exports.StressAssessmentLegacy = mongoose_1.default.models.StressAssessmentLegacy || mongoose_1.default.model('StressAssessmentLegacy', stressAssessmentSchema);
exports.UserPreferences = mongoose_1.default.models.UserPreferences || mongoose_1.default.model('UserPreferences', userPreferencesSchema);
