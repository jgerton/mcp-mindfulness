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
exports.PMRSession = exports.MuscleGroup = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const muscleGroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
    durationSeconds: { type: Number, required: true }
});
const pmrSessionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    completedGroups: [{ type: String }],
    stressLevelBefore: { type: Number, min: 0, max: 10 },
    stressLevelAfter: { type: Number, min: 0, max: 10 },
    duration: { type: Number, required: true }
}, { timestamps: true });
exports.MuscleGroup = mongoose_1.default.model('MuscleGroup', muscleGroupSchema);
exports.PMRSession = mongoose_1.default.model('PMRSession', pmrSessionSchema);
