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
exports.AchievementController = void 0;
const achievement_model_1 = require("../models/achievement.model");
const mongoose_1 = __importDefault(require("mongoose"));
class AchievementController {
    // Get user's achievements
    static getUserAchievements(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const achievements = yield achievement_model_1.Achievement.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
                return res.json(achievements);
            }
            catch (error) {
                console.error('Error getting user achievements:', error);
                return res.status(500).json({ message: 'Error fetching achievements' });
            }
        });
    }
    // Get achievement details
    static getAchievementDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { achievementId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(achievementId)) {
                    return res.status(400).json({ message: 'Invalid achievement ID' });
                }
                const achievement = yield achievement_model_1.Achievement.findById(achievementId);
                if (!achievement) {
                    return res.status(404).json({ message: 'Achievement not found' });
                }
                // Check if the achievement belongs to the user
                if (achievement.userId.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString())) {
                    return res.status(403).json({ message: 'Not authorized to view this achievement' });
                }
                return res.json(achievement);
            }
            catch (error) {
                console.error('Error getting achievement details:', error);
                return res.status(500).json({ message: 'Error fetching achievement details' });
            }
        });
    }
}
exports.AchievementController = AchievementController;
