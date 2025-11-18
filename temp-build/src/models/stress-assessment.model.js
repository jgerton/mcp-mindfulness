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
exports.StressAssessment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema for the StressAssessment model
 */
const StressAssessmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Assessment date is required'],
        default: Date.now
    },
    stressLevel: {
        type: Number,
        required: [true, 'Stress level is required'],
        min: [1, 'Stress level must be at least 1'],
        max: [10, 'Stress level cannot exceed 10']
    },
    physicalSymptoms: {
        type: [{
                type: String,
                trim: true,
                maxlength: [50, 'Physical symptom cannot be more than 50 characters']
            }],
        validate: {
            validator: function (symptoms) {
                return symptoms.length <= 10;
            },
            message: 'Cannot have more than 10 physical symptoms'
        }
    },
    emotionalSymptoms: {
        type: [{
                type: String,
                trim: true,
                maxlength: [50, 'Emotional symptom cannot be more than 50 characters']
            }],
        validate: {
            validator: function (symptoms) {
                return symptoms.length <= 10;
            },
            message: 'Cannot have more than 10 emotional symptoms'
        }
    },
    triggers: {
        type: [{
                type: String,
                trim: true,
                maxlength: [100, 'Trigger description cannot be more than 100 characters']
            }],
        validate: {
            validator: function (triggers) {
                return triggers.length <= 5;
            },
            message: 'Cannot have more than 5 triggers'
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
StressAssessmentSchema.index({ userId: 1, date: -1 });
StressAssessmentSchema.index({ userId: 1, stressLevel: 1 });
// Virtual for stress category
StressAssessmentSchema.virtual('stressCategory').get(function () {
    if (this.stressLevel <= 3)
        return 'low';
    if (this.stressLevel <= 7)
        return 'moderate';
    return 'high';
});
// Static method to get average stress level for a user over a time period
StressAssessmentSchema.statics.getAverageStressLevel = function (userId_1, startDate_1) {
    return __awaiter(this, arguments, void 0, function* (userId, startDate, endDate = new Date()) {
        const result = yield this.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    averageStressLevel: { $avg: '$stressLevel' },
                    count: { $sum: 1 }
                }
            }
        ]);
        return result.length > 0
            ? {
                averageStressLevel: parseFloat(result[0].averageStressLevel.toFixed(1)),
                count: result[0].count
            }
            : {
                averageStressLevel: 0,
                count: 0
            };
    });
};
// Create the model
exports.StressAssessment = mongoose_1.default.model('StressAssessment', StressAssessmentSchema);
exports.default = exports.StressAssessment;
