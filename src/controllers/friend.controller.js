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
exports.FriendController = void 0;
const friend_service_1 = require("../services/friend.service");
const achievement_service_1 = require("../services/achievement.service");
class FriendController {
    static sendFriendRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { recipientId } = req.body;
                const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!requesterId || !recipientId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const request = yield friend_service_1.FriendService.sendFriendRequest(requesterId.toString(), recipientId);
                res.status(201).json(request);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static acceptFriendRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { requestId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !requestId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const request = yield friend_service_1.FriendService.acceptFriendRequest(userId.toString(), requestId);
                // Process achievements when a friend request is accepted
                yield achievement_service_1.AchievementService.processFriendAchievements(userId.toString());
                res.json(request);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static rejectFriendRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { requestId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !requestId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                yield friend_service_1.FriendService.rejectFriendRequest(userId.toString(), requestId);
                res.json({ message: 'Friend request rejected' });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getFriendList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                const friends = yield friend_service_1.FriendService.getFriendList(userId.toString());
                res.json(friends);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getPendingRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                const requests = yield friend_service_1.FriendService.getPendingRequests(userId.toString());
                res.json(requests);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { targetUserId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !targetUserId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const block = yield friend_service_1.FriendService.blockUser(userId.toString(), targetUserId);
                res.json(block);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static unblockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { targetUserId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !targetUserId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                yield friend_service_1.FriendService.unblockUser(userId.toString(), targetUserId);
                res.json({ message: 'User unblocked' });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getBlockedUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                const blockedUsers = yield friend_service_1.FriendService.getBlockedUsers(userId.toString());
                res.json(blockedUsers);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static removeFriend(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { friendId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !friendId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                yield friend_service_1.FriendService.removeFriend(userId.toString(), friendId);
                res.json({ message: 'Friend removed' });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.FriendController = FriendController;
