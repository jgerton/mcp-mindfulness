"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friend = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friendSchema = new mongoose_1.default.Schema({
    requesterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    }
}, {
    timestamps: true
});
// Ensure unique friend relationships
friendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
// Add index for querying friend lists
friendSchema.index({ status: 1 });
// Static method to get user's friends
friendSchema.statics.getFriends = async function (userId) {
    return this.find({
        $or: [
            { requesterId: userId, status: 'accepted' },
            { recipientId: userId, status: 'accepted' }
        ]
    }).populate('requesterId recipientId', 'username');
};
// Static method to get pending friend requests
friendSchema.statics.getPendingRequests = async function (userId) {
    return this.find({
        recipientId: userId,
        status: 'pending'
    }).populate('requesterId', 'username');
};
exports.Friend = mongoose_1.default.model('Friend', friendSchema);
