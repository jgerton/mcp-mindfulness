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
const mongoose_1 = __importStar(require("mongoose"));
const stressTechniqueSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['breathing', 'meditation', 'mindfulness', 'physical', 'relaxation', 'visualization'],
            message: '{VALUE} is not a valid category'
        },
        trim: true
    },
    difficultyLevel: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: {
            values: ['beginner', 'intermediate', 'advanced'],
            message: '{VALUE} is not a valid difficulty level'
        },
        trim: true
    },
    durationMinutes: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [120, 'Duration must be at most 120 minutes']
    },
    steps: {
        type: [String],
        default: []
    },
    benefits: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    effectivenessRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5'],
        default: 3
    },
    recommendedFrequency: {
        type: String,
        enum: {
            values: ['daily', 'weekly', 'as-needed'],
            message: '{VALUE} is not a valid frequency'
        },
        default: 'as-needed'
    }
}, {
    timestamps: true
});
// Add indexes for common queries
stressTechniqueSchema.index({ category: 1 });
stressTechniqueSchema.index({ difficultyLevel: 1 });
stressTechniqueSchema.index({ tags: 1 });
stressTechniqueSchema.index({ name: 'text', description: 'text', tags: 'text' });
const StressTechnique = mongoose_1.default.model('StressTechnique', stressTechniqueSchema);
exports.default = StressTechnique;
