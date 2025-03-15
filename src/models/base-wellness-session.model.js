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
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseWellnessSessionSchema = exports.WellnessSessionStatus = exports.WellnessMoodState = void 0;
exports.createWellnessSessionSchema = createWellnessSessionSchema;
const mongoose_1 = require("mongoose");
var WellnessMoodState;
(function (WellnessMoodState) {
    WellnessMoodState["Stressed"] = "stressed";
    WellnessMoodState["Anxious"] = "anxious";
    WellnessMoodState["Neutral"] = "neutral";
    WellnessMoodState["Calm"] = "calm";
    WellnessMoodState["Peaceful"] = "peaceful";
    WellnessMoodState["Energized"] = "energized";
})(WellnessMoodState || (exports.WellnessMoodState = WellnessMoodState = {}));
var WellnessSessionStatus;
(function (WellnessSessionStatus) {
    WellnessSessionStatus["Active"] = "active";
    WellnessSessionStatus["Paused"] = "paused";
    WellnessSessionStatus["Completed"] = "completed";
    WellnessSessionStatus["Abandoned"] = "abandoned";
})(WellnessSessionStatus || (exports.WellnessSessionStatus = WellnessSessionStatus = {}));
const baseFields = {
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        validate: {
            validator: function (endTime) {
                return !endTime || endTime > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(WellnessSessionStatus),
        required: true,
        default: WellnessSessionStatus.Active
    },
    moodBefore: {
        type: String,
        enum: Object.values(WellnessMoodState)
    },
    moodAfter: {
        type: String,
        enum: Object.values(WellnessMoodState)
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
};
exports.baseWellnessSessionSchema = new mongoose_1.Schema(baseFields, {
    timestamps: true,
    discriminatorKey: 'sessionType'
});
// Add virtual fields
exports.baseWellnessSessionSchema.virtual('isCompleted').get(function () {
    return this.status === WellnessSessionStatus.Completed;
});
// Add instance methods
exports.baseWellnessSessionSchema.methods.processAchievements = function () {
    return __awaiter(this, void 0, void 0, function* () {
        throw new Error('Achievement processing must be implemented by session type');
    });
};
exports.baseWellnessSessionSchema.methods.getActualDuration = function () {
    if (!this.endTime) {
        return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    }
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
};
exports.baseWellnessSessionSchema.methods.complete = function (moodAfter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.canTransitionTo(WellnessSessionStatus.Completed)) {
            throw new Error(`Cannot complete session in ${this.status} status`);
        }
        this.status = WellnessSessionStatus.Completed;
        this.endTime = new Date();
        if (moodAfter) {
            this.moodAfter = moodAfter;
        }
        yield this.save();
    });
};
exports.baseWellnessSessionSchema.methods.abandon = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.canTransitionTo(WellnessSessionStatus.Abandoned)) {
            throw new Error(`Cannot abandon session in ${this.status} status`);
        }
        this.status = WellnessSessionStatus.Abandoned;
        this.endTime = new Date();
        yield this.save();
    });
};
exports.baseWellnessSessionSchema.methods.canTransitionTo = function (newStatus) {
    var _a, _b;
    const currentStatus = this.status;
    // Define valid transitions
    const validTransitions = {
        [WellnessSessionStatus.Active]: [WellnessSessionStatus.Paused, WellnessSessionStatus.Completed, WellnessSessionStatus.Abandoned],
        [WellnessSessionStatus.Paused]: [WellnessSessionStatus.Active, WellnessSessionStatus.Abandoned],
        [WellnessSessionStatus.Completed]: [], // Terminal state
        [WellnessSessionStatus.Abandoned]: [] // Terminal state
    };
    return (_b = (_a = validTransitions[currentStatus]) === null || _a === void 0 ? void 0 : _a.includes(newStatus)) !== null && _b !== void 0 ? _b : false;
};
exports.baseWellnessSessionSchema.methods.pause = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.canTransitionTo(WellnessSessionStatus.Paused)) {
            throw new Error(`Cannot pause session in ${this.status} status`);
        }
        this.status = WellnessSessionStatus.Paused;
        yield this.save();
    });
};
exports.baseWellnessSessionSchema.methods.resume = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.canTransitionTo(WellnessSessionStatus.Active)) {
            throw new Error(`Cannot resume session in ${this.status} status`);
        }
        this.status = WellnessSessionStatus.Active;
        yield this.save();
    });
};
// Add middleware
exports.baseWellnessSessionSchema.pre('validate', function (next) {
    // If session is completed, ensure endTime is set
    if (this.status === WellnessSessionStatus.Completed && !this.endTime) {
        this.endTime = new Date();
    }
    next();
});
// Helper function to create extended schemas
function createWellnessSessionSchema(additionalFields) {
    return new mongoose_1.Schema(Object.assign(Object.assign({}, baseFields), additionalFields), {
        timestamps: true
    });
}
