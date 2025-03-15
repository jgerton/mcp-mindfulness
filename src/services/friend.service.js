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
exports.FriendService = void 0;
const friend_model_1 = require("../models/friend.model");
const user_model_1 = require("../models/user.model");
class FriendService {
    static sendFriendRequest(requesterId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requester = yield user_model_1.User.findById(requesterId);
            const recipient = yield user_model_1.User.findById(recipientId);
            if (!requester || !recipient) {
                throw new Error('User not found');
            }
            if (requester.blockedUserIds.includes(recipient._id) || recipient.blockedUserIds.includes(requester._id)) {
                throw new Error('Cannot send friend request to this user');
            }
            if (requester.friendIds.includes(recipient._id)) {
                throw new Error('Users are already friends');
            }
            const existingRequest = yield friend_model_1.Friend.findOne({
                $or: [
                    { requesterId: requester._id, recipientId: recipient._id },
                    { requesterId: recipient._id, recipientId: requester._id }
                ],
                status: 'pending'
            });
            if (existingRequest) {
                throw new Error('Friend request already exists');
            }
            yield friend_model_1.Friend.create({
                requesterId: requester._id,
                recipientId: recipient._id,
                status: 'pending'
            });
        });
    }
    static acceptFriendRequest(requestId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield friend_model_1.Friend.findById(requestId);
            if (!request || request.status !== 'pending') {
                throw new Error('Friend request not found');
            }
            if (request.recipientId.toString() !== userId) {
                throw new Error('Not authorized to accept this request');
            }
            const requester = yield user_model_1.User.findById(request.requesterId);
            const recipient = yield user_model_1.User.findById(request.recipientId);
            if (!requester || !recipient) {
                throw new Error('User not found');
            }
            // Update friend request status
            request.status = 'accepted';
            yield request.save();
            // Add users to each other's friend lists
            if (!requester.friendIds)
                requester.friendIds = [];
            if (!recipient.friendIds)
                recipient.friendIds = [];
            requester.friendIds.push(recipient._id);
            recipient.friendIds.push(requester._id);
            yield requester.save();
            yield recipient.save();
        });
    }
    static getFriendList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId).populate('friendIds');
            if (!user) {
                throw new Error('User not found');
            }
            return user.friendIds || [];
        });
    }
    static removeFriend(userId, friendId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            const friend = yield user_model_1.User.findById(friendId);
            if (!user || !friend) {
                throw new Error('User not found');
            }
            if (!user.friendIds.includes(friend._id)) {
                throw new Error('Users are not friends');
            }
            user.friendIds = user.friendIds.filter(id => !id.equals(friend._id));
            friend.friendIds = friend.friendIds.filter(id => !id.equals(user._id));
            yield user.save();
            yield friend.save();
            // Remove any friend requests
            yield friend_model_1.Friend.deleteMany({
                $or: [
                    { requesterId: user._id, recipientId: friend._id },
                    { requesterId: friend._id, recipientId: user._id }
                ]
            });
        });
    }
    static blockUser(userId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            const targetUser = yield user_model_1.User.findById(targetUserId);
            if (!user || !targetUser) {
                throw new Error('User not found');
            }
            if (!user.blockedUserIds)
                user.blockedUserIds = [];
            user.blockedUserIds.push(targetUser._id);
            // Remove from friends if they were friends
            if (user.friendIds.includes(targetUser._id)) {
                user.friendIds = user.friendIds.filter(id => !id.equals(targetUser._id));
                targetUser.friendIds = targetUser.friendIds.filter(id => !id.equals(user._id));
                yield targetUser.save();
            }
            // Remove any friend requests
            yield friend_model_1.Friend.deleteMany({
                $or: [
                    { requesterId: user._id, recipientId: targetUser._id },
                    { requesterId: targetUser._id, recipientId: user._id }
                ]
            });
            yield user.save();
        });
    }
    static unblockUser(userId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            const targetUser = yield user_model_1.User.findById(targetUserId);
            if (!user || !targetUser) {
                throw new Error('User not found');
            }
            user.blockedUserIds = user.blockedUserIds.filter(id => !id.equals(targetUser._id));
            yield user.save();
        });
    }
    static getPendingRequests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return friend_model_1.Friend.find({
                recipientId: userId,
                status: 'pending'
            }).populate('requesterId', 'username');
        });
    }
    static getBlockedUsers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return friend_model_1.Friend.find({
                requesterId: userId,
                status: 'blocked'
            }).populate('recipientId', 'username');
        });
    }
    static areFriends(userId1, userId2) {
        return __awaiter(this, void 0, void 0, function* () {
            const friendship = yield friend_model_1.Friend.findOne({
                $or: [
                    { requesterId: userId1, recipientId: userId2, status: 'accepted' },
                    { requesterId: userId2, recipientId: userId1, status: 'accepted' }
                ]
            });
            return !!friendship;
        });
    }
    static rejectFriendRequest(userId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield friend_model_1.Friend.findById(requestId);
            if (!request || request.status !== 'pending') {
                throw new Error('Friend request not found');
            }
            if (request.recipientId.toString() !== userId) {
                throw new Error('Not authorized to reject this request');
            }
            yield friend_model_1.Friend.findByIdAndDelete(requestId);
        });
    }
}
exports.FriendService = FriendService;
