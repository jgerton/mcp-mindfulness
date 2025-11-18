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
exports.StressLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema for the StressLog model
 */
const StressLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Log date is required'],
        default: Date.now
    },
    level: {
        type: Number,
        required: [true, 'Stress level is required'],
        min: [1, 'Stress level must be at least 1'],
        max: [10, 'Stress level cannot exceed 10']
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
    symptoms: {
        type: [{
                type: String,
                trim: true,
                maxlength: [100, 'Symptom description cannot be more than 100 characters']
            }],
        validate: {
            validator: function (symptoms) {
                return symptoms.length <= 10;
            },
            message: 'Cannot have more than 10 symptoms'
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
StressLogSchema.index({ userId: 1, date: -1 });
StressLogSchema.index({ userId: 1, level: 1 });
// Create the model
exports.StressLog = mongoose_1.default.model('StressLog', StressLogSchema);
exports.default = exports.StressLog;
