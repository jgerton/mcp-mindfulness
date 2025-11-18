"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendController = void 0;
const friend_service_1 = require("../services/friend.service");
const achievement_service_1 = require("../services/achievement.service");
class FriendController {
    static async sendFriendRequest(req, res) {
        var _a;
        try {
            const { recipientId } = req.body;
            const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!requesterId || !recipientId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const request = await friend_service_1.FriendService.sendFriendRequest(requesterId.toString(), recipientId);
            res.status(201).json(request);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async acceptFriendRequest(req, res) {
        var _a;
        try {
            const { requestId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !requestId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const request = await friend_service_1.FriendService.acceptFriendRequest(userId.toString(), requestId);
            // Process achievements when a friend request is accepted
            await achievement_service_1.AchievementService.processFriendAchievements(userId.toString());
            res.json(request);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async rejectFriendRequest(req, res) {
        var _a;
        try {
            const { requestId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !requestId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            await friend_service_1.FriendService.rejectFriendRequest(userId.toString(), requestId);
            res.json({ message: 'Friend request rejected' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getFriendList(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const friends = await friend_service_1.FriendService.getFriendList(userId.toString());
            res.json(friends);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getPendingRequests(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const requests = await friend_service_1.FriendService.getPendingRequests(userId.toString());
            res.json(requests);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async blockUser(req, res) {
        var _a;
        try {
            const { targetUserId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !targetUserId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const block = await friend_service_1.FriendService.blockUser(userId.toString(), targetUserId);
            res.json(block);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async unblockUser(req, res) {
        var _a;
        try {
            const { targetUserId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !targetUserId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            await friend_service_1.FriendService.unblockUser(userId.toString(), targetUserId);
            res.json({ message: 'User unblocked' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getBlockedUsers(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const blockedUsers = await friend_service_1.FriendService.getBlockedUsers(userId.toString());
            res.json(blockedUsers);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async removeFriend(req, res) {
        var _a;
        try {
            const { friendId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !friendId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            await friend_service_1.FriendService.removeFriend(userId.toString(), friendId);
            res.json({ message: 'Friend removed' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.FriendController = FriendController;
