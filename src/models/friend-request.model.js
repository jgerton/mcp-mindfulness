"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friendRequestSchema = new mongoose_1.default.Schema({
    requesterId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
// Virtual populate for requester and recipient
friendRequestSchema.virtual('requester', {
    ref: 'User',
    localField: 'requesterId',
    foreignField: '_id',
    justOne: true
});
friendRequestSchema.virtual('recipient', {
    ref: 'User',
    localField: 'recipientId',
    foreignField: '_id',
    justOne: true
});
// Prevent duplicate friend requests
friendRequestSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
exports.FriendRequest = mongoose_1.default.model('FriendRequest', friendRequestSchema);
