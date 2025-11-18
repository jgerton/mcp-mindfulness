"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    friendIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    blockedUserIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    preferences: {
        type: Object,
        default: {
            stressManagement: {
                preferredCategories: ['breathing', 'meditation'],
                preferredDuration: 10,
                difficultyLevel: 'beginner'
            }
        }
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual fields for friends and blocked users
userSchema.virtual('friends').get(function () {
    return this.friendIds;
});
userSchema.virtual('blockedUsers').get(function () {
    return this.blockedUserIds;
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.User = (0, mongoose_1.model)('User', userSchema);
