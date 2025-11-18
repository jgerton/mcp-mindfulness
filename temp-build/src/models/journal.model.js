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
exports.Journal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const journalSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        required: true,
        enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive']
    },
    tags: [{
            type: String,
            trim: true
        }],
    meditationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Meditation'
    },
    isPrivate: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Add text index for search functionality
journalSchema.index({ title: 'text', content: 'text' });
// Add compound index for user's journals by date
journalSchema.index({ userId: 1, createdAt: -1 });
// Add index for meditation reference
journalSchema.index({ meditationId: 1 });
// Static method to get journal entries by mood
journalSchema.statics.getEntriesByMood = function (userId, mood) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ userId, mood })
            .sort({ createdAt: -1 })
            .populate('meditationId', 'title type category');
    });
};
// Static method to get journal entries by date range
journalSchema.statics.getEntriesByDateRange = function (userId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({
            userId,
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: -1 });
    });
};
exports.Journal = mongoose_1.default.model('Journal', journalSchema);
