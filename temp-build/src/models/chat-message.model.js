"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatMessageSchema = new mongoose_1.default.Schema({
    sessionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'GroupSession',
        required: true
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'system'],
        default: 'text'
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
// Create a compound index for efficient message retrieval
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
// Add virtual field for userId
chatMessageSchema.virtual('userId').get(function () {
    return this.senderId.toString();
});
exports.ChatMessage = mongoose_1.default.model('ChatMessage', chatMessageSchema);
