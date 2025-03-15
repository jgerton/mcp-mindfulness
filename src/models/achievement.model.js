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
exports.ACHIEVEMENT_CONFIGS = exports.Achievement = exports.AchievementType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AchievementType;
(function (AchievementType) {
    AchievementType["EARLY_BIRD"] = "early_bird";
    AchievementType["NIGHT_OWL"] = "night_owl";
    AchievementType["CONSISTENCY_MASTER"] = "consistency_master";
    AchievementType["MARATHON_MEDITATOR"] = "marathon_meditator";
    AchievementType["QUICK_ZEN"] = "quick_zen";
    AchievementType["BALANCED_PRACTICE"] = "balanced_practice";
    AchievementType["WEEK_WARRIOR"] = "week_warrior";
    AchievementType["MONTHLY_MASTER"] = "monthly_master";
    AchievementType["ZEN_MASTER"] = "zen_master";
    AchievementType["MOOD_LIFTER"] = "mood_lifter";
    AchievementType["ZEN_STATE"] = "zen_state";
    AchievementType["EMOTIONAL_GROWTH"] = "emotional_growth";
    AchievementType["SOCIAL_BUTTERFLY"] = "social_butterfly";
    AchievementType["GROUP_GUIDE"] = "group_guide";
    AchievementType["COMMUNITY_PILLAR"] = "community_pillar";
    AchievementType["SYNCHRONIZED_SOULS"] = "synchronized_souls";
    AchievementType["MEDITATION_CIRCLE"] = "meditation_circle";
    AchievementType["FRIEND_ZEN"] = "friend_zen";
    AchievementType["GROUP_STREAK"] = "group_streak";
    AchievementType["MINDFUL_MENTOR"] = "mindful_mentor";
    AchievementType["HARMONY_SEEKER"] = "harmony_seeker";
    AchievementType["ZEN_NETWORK"] = "zen_network";
    // Additional types used in tests
    AchievementType["BEGINNER_MEDITATOR"] = "beginner_meditator";
    AchievementType["INTERMEDIATE_MEDITATOR"] = "intermediate_meditator";
    AchievementType["ADVANCED_MEDITATOR"] = "advanced_meditator";
    AchievementType["MINDFUL_MONTH"] = "mindful_month";
})(AchievementType || (exports.AchievementType = AchievementType = {}));
const achievementSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    progress: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    target: {
        type: Number,
        required: true,
        min: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Create compound index for efficient querying
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });
// Add virtual for progress percentage
achievementSchema.virtual('progressPercentage').get(function () {
    return Math.round((this.progress / this.target) * 100);
});
exports.Achievement = mongoose_1.default.model('Achievement', achievementSchema);
// Achievement configurations
exports.ACHIEVEMENT_CONFIGS = {
    early_bird: { maxProgress: 5, points: 100 },
    night_owl: { maxProgress: 5, points: 100 },
    consistency_master: { maxProgress: 7, points: 150 },
    marathon_meditator: { maxProgress: 1, points: 200 },
    quick_zen: { maxProgress: 10, points: 100 },
    balanced_practice: { maxProgress: 3, points: 150 },
    week_warrior: { maxProgress: 7, points: 200 },
    monthly_master: { maxProgress: 30, points: 500 },
    zen_master: { maxProgress: 100, points: 1000 },
    mood_lifter: { maxProgress: 10, points: 150 },
    zen_state: { maxProgress: 5, points: 200 },
    emotional_growth: { maxProgress: 20, points: 300 },
    social_butterfly: { maxProgress: 10, points: 200 },
    group_guide: { maxProgress: 5, points: 300 },
    community_pillar: { maxProgress: 20, points: 400 },
    synchronized_souls: { maxProgress: 3, points: 250 },
    meditation_circle: { maxProgress: 1, points: 150 },
    friend_zen: { maxProgress: 5, points: 200 },
    group_streak: { maxProgress: 7, points: 350 },
    mindful_mentor: { maxProgress: 10, points: 400 },
    harmony_seeker: { maxProgress: 15, points: 300 },
    zen_network: { maxProgress: 30, points: 500 }
};
