"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const participantSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['joined', 'left', 'completed'], default: 'joined' },
    duration: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    sessionData: {
        durationCompleted: { type: Number, default: 0 },
        startTime: { type: Date },
        endTime: { type: Date }
    }
});
const groupSessionSchema = new mongoose_1.default.Schema({
    hostId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    meditationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Meditation', required: true },
    title: { type: String, required: true },
    description: { type: String },
    scheduledTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    participants: [participantSchema],
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    isPrivate: { type: Boolean, default: false },
    allowedParticipants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date },
    endTime: { type: Date },
}, {
    timestamps: true
});
groupSessionSchema.methods.isFull = function () {
    const activeParticipants = this.participants.filter((p) => p.status === 'joined').length;
    return activeParticipants >= this.maxParticipants;
};
groupSessionSchema.methods.canUserJoin = function (userId) {
    var _a;
    if (this.status !== 'scheduled' && this.status !== 'in_progress')
        return false;
    if (this.participants.some((p) => p.userId.equals(userId) && p.status === 'joined'))
        return false;
    if (this.isPrivate && !((_a = this.allowedParticipants) === null || _a === void 0 ? void 0 : _a.some((id) => id.equals(userId))))
        return false;
    const activeParticipants = this.participants.filter((p) => p.status === 'joined').length;
    return activeParticipants < this.maxParticipants;
};
exports.GroupSession = mongoose_1.default.model('GroupSession', groupSessionSchema);
