"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
friendSchema.statics.getFriends = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({
            $or: [
                { requesterId: userId, status: 'accepted' },
                { recipientId: userId, status: 'accepted' }
            ]
        }).populate('requesterId recipientId', 'username');
    });
};
// Static method to get pending friend requests
friendSchema.statics.getPendingRequests = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({
            recipientId: userId,
            status: 'pending'
        }).populate('requesterId', 'username');
    });
};
exports.Friend = mongoose_1.default.model('Friend', friendSchema);
