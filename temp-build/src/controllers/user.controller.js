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
exports.UserController = void 0;
const user_model_1 = require("../models/user.model");
class UserController {
    // Get user profile
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return res.json(user);
            }
            catch (error) {
                console.error('Error getting user profile:', error);
                return res.status(500).json({ message: 'Error fetching user profile' });
            }
        });
    }
    // Update user profile
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Only allow updating certain fields
                const allowedUpdates = ['username', 'email', 'preferences'];
                const updates = Object.keys(req.body)
                    .filter(key => allowedUpdates.includes(key))
                    .reduce((obj, key) => {
                    obj[key] = req.body[key];
                    return obj;
                }, {});
                const updatedUser = yield user_model_1.User.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b._id, { $set: updates }, { new: true }).select('-password');
                return res.json(updatedUser);
            }
            catch (error) {
                console.error('Error updating user profile:', error);
                return res.status(500).json({ message: 'Error updating user profile' });
            }
        });
    }
    // Get user stats
    static getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Here you would typically aggregate meditation sessions, achievements, etc.
                // For now, return placeholder stats
                return res.json({
                    totalMeditations: 0,
                    totalMinutes: 0,
                    streak: 0,
                    achievements: []
                });
            }
            catch (error) {
                console.error('Error getting user stats:', error);
                return res.status(500).json({ message: 'Error fetching user stats' });
            }
        });
    }
}
exports.UserController = UserController;
