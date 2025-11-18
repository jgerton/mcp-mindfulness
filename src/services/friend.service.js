"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendService = void 0;
const friend_model_1 = require("../models/friend.model");
const user_model_1 = require("../models/user.model");
class FriendService {
    static async sendFriendRequest(requesterId, recipientId) {
        var _a, _b, _c;
        const requester = await user_model_1.User.findById(requesterId);
        const recipient = await user_model_1.User.findById(recipientId);
        if (!requester || !recipient) {
            throw new Error('User not found');
        }
        const recipientObjectId = recipient._id;
        const requesterObjectId = requester._id;
        if (((_a = requester.blockedUserIds) === null || _a === void 0 ? void 0 : _a.some(id => id.equals(recipientObjectId))) ||
            ((_b = recipient.blockedUserIds) === null || _b === void 0 ? void 0 : _b.some(id => id.equals(requesterObjectId)))) {
            throw new Error('Cannot send friend request to this user');
        }
        if ((_c = requester.friendIds) === null || _c === void 0 ? void 0 : _c.some(id => id.equals(recipientObjectId))) {
            throw new Error('Users are already friends');
        }
        const existingRequest = await friend_model_1.Friend.findOne({
            $or: [
                { requesterId: requester._id, recipientId: recipient._id },
                { requesterId: recipient._id, recipientId: requester._id }
            ],
            status: 'pending'
        });
        if (existingRequest) {
            throw new Error('Friend request already exists');
        }
        await friend_model_1.Friend.create({
            requesterId: requester._id,
            recipientId: recipient._id,
            status: 'pending'
        });
    }
    static async acceptFriendRequest(requestId, userId) {
        const request = await friend_model_1.Friend.findById(requestId);
        if (!request || request.status !== 'pending') {
            throw new Error('Friend request not found');
        }
        if (request.recipientId.toString() !== userId) {
            throw new Error('Not authorized to accept this request');
        }
        const requester = await user_model_1.User.findById(request.requesterId);
        const recipient = await user_model_1.User.findById(request.recipientId);
        if (!requester || !recipient) {
            throw new Error('User not found');
        }
        // Update friend request status
        request.status = 'accepted';
        await request.save();
        // Add users to each other's friend lists
        if (!requester.friendIds)
            requester.friendIds = [];
        if (!recipient.friendIds)
            recipient.friendIds = [];
        const recipientObjectId = recipient._id;
        const requesterObjectId = requester._id;
        requester.friendIds.push(recipientObjectId);
        recipient.friendIds.push(requesterObjectId);
        await requester.save();
        await recipient.save();
    }
    static async getFriendList(userId) {
        const user = await user_model_1.User.findById(userId).populate('friendIds');
        if (!user) {
            throw new Error('User not found');
        }
        return user.friendIds || [];
    }
    static async removeFriend(userId, friendId) {
        var _a;
        const user = await user_model_1.User.findById(userId);
        const friend = await user_model_1.User.findById(friendId);
        if (!user || !friend) {
            throw new Error('User not found');
        }
        const friendObjectId = friend._id;
        const userObjectId = user._id;
        if (!((_a = user.friendIds) === null || _a === void 0 ? void 0 : _a.some(id => id.equals(friendObjectId)))) {
            throw new Error('Users are not friends');
        }
        if (user.friendIds) {
            user.friendIds = user.friendIds.filter(id => !id.equals(friendObjectId));
        }
        if (friend.friendIds) {
            friend.friendIds = friend.friendIds.filter(id => !id.equals(userObjectId));
        }
        await user.save();
        await friend.save();
        // Remove any friend requests
        await friend_model_1.Friend.deleteMany({
            $or: [
                { requesterId: user._id, recipientId: friend._id },
                { requesterId: friend._id, recipientId: user._id }
            ]
        });
    }
    static async blockUser(userId, targetUserId) {
        var _a;
        const user = await user_model_1.User.findById(userId);
        const targetUser = await user_model_1.User.findById(targetUserId);
        if (!user || !targetUser) {
            throw new Error('User not found');
        }
        const targetUserObjectId = targetUser._id;
        const userObjectId = user._id;
        if (!user.blockedUserIds)
            user.blockedUserIds = [];
        user.blockedUserIds.push(targetUserObjectId);
        // Remove from friends if they were friends
        if ((_a = user.friendIds) === null || _a === void 0 ? void 0 : _a.some(id => id.equals(targetUserObjectId))) {
            if (user.friendIds) {
                user.friendIds = user.friendIds.filter(id => !id.equals(targetUserObjectId));
            }
            if (targetUser.friendIds) {
                targetUser.friendIds = targetUser.friendIds.filter(id => !id.equals(userObjectId));
            }
            await targetUser.save();
        }
        // Remove any friend requests
        await friend_model_1.Friend.deleteMany({
            $or: [
                { requesterId: user._id, recipientId: targetUser._id },
                { requesterId: targetUser._id, recipientId: user._id }
            ]
        });
        await user.save();
    }
    static async unblockUser(userId, targetUserId) {
        const user = await user_model_1.User.findById(userId);
        const targetUser = await user_model_1.User.findById(targetUserId);
        if (!user || !targetUser) {
            throw new Error('User not found');
        }
        const targetUserObjectId = targetUser._id;
        if (user.blockedUserIds) {
            user.blockedUserIds = user.blockedUserIds.filter(id => !id.equals(targetUserObjectId));
        }
        await user.save();
    }
    static async getPendingRequests(userId) {
        return friend_model_1.Friend.find({
            recipientId: userId,
            status: 'pending'
        }).populate('requesterId', 'username');
    }
    static async getBlockedUsers(userId) {
        return friend_model_1.Friend.find({
            requesterId: userId,
            status: 'blocked'
        }).populate('recipientId', 'username');
    }
    static async areFriends(userId1, userId2) {
        const friendship = await friend_model_1.Friend.findOne({
            $or: [
                { requesterId: userId1, recipientId: userId2, status: 'accepted' },
                { requesterId: userId2, recipientId: userId1, status: 'accepted' }
            ]
        });
        return !!friendship;
    }
    static async rejectFriendRequest(userId, requestId) {
        const request = await friend_model_1.Friend.findById(requestId);
        if (!request || request.status !== 'pending') {
            throw new Error('Friend request not found');
        }
        if (request.recipientId.toString() !== userId) {
            throw new Error('Not authorized to reject this request');
        }
        await friend_model_1.Friend.findByIdAndDelete(requestId);
    }
}
exports.FriendService = FriendService;
