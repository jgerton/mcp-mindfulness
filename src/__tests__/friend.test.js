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
const user_model_1 = require("../models/user.model");
const friend_model_1 = require("../models/friend.model");
const friend_service_1 = require("../services/friend.service");
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.User.deleteMany({});
    yield friend_model_1.Friend.deleteMany({});
}));
describe('Friend System', () => {
    let user1;
    let user2;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        user1 = yield user_model_1.User.create({
            username: 'user1',
            email: 'user1@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        user2 = yield user_model_1.User.create({
            username: 'user2',
            email: 'user2@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
    }));
    describe('Friend Requests', () => {
        it('should send friend request successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.sendFriendRequest(user1._id.toString(), user2._id.toString());
            const request = yield friend_model_1.Friend.findOne({
                requesterId: user1._id,
                recipientId: user2._id
            });
            expect(request).toBeTruthy();
            expect(request === null || request === void 0 ? void 0 : request.requesterId.toString()).toBe(user1._id.toString());
            expect(request === null || request === void 0 ? void 0 : request.recipientId.toString()).toBe(user2._id.toString());
            expect(request === null || request === void 0 ? void 0 : request.status).toBe('pending');
        }));
        it('should not allow duplicate friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.sendFriendRequest(user1._id.toString(), user2._id.toString());
            yield expect(friend_service_1.FriendService.sendFriendRequest(user1._id.toString(), user2._id.toString())).rejects.toThrow('Friend request already exists');
        }));
        it('should accept friend request successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.sendFriendRequest(user1._id.toString(), user2._id.toString());
            const request = yield friend_model_1.Friend.findOne({
                requesterId: user1._id,
                recipientId: user2._id
            });
            yield friend_service_1.FriendService.acceptFriendRequest((request === null || request === void 0 ? void 0 : request._id.toString()) || '', user2._id.toString());
            const acceptedRequest = yield friend_model_1.Friend.findById(request === null || request === void 0 ? void 0 : request._id);
            expect(acceptedRequest === null || acceptedRequest === void 0 ? void 0 : acceptedRequest.status).toBe('accepted');
            const user1Updated = yield user_model_1.User.findById(user1._id);
            const user2Updated = yield user_model_1.User.findById(user2._id);
            expect(user1Updated === null || user1Updated === void 0 ? void 0 : user1Updated.friendIds).toContainEqual(user2._id);
            expect(user2Updated === null || user2Updated === void 0 ? void 0 : user2Updated.friendIds).toContainEqual(user1._id);
        }));
    });
    describe('Friend Management', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.sendFriendRequest(user1._id.toString(), user2._id.toString());
            const request = yield friend_model_1.Friend.findOne({
                requesterId: user1._id,
                recipientId: user2._id
            });
            yield friend_service_1.FriendService.acceptFriendRequest((request === null || request === void 0 ? void 0 : request._id.toString()) || '', user2._id.toString());
        }));
        it('should get friend list correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const friendList = yield friend_service_1.FriendService.getFriendList(user1._id.toString());
            expect(friendList).toHaveLength(1);
            expect(friendList[0]._id.toString()).toBe(user2._id.toString());
        }));
        it('should remove friend successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.removeFriend(user1._id.toString(), user2._id.toString());
            const user1Updated = yield user_model_1.User.findById(user1._id);
            const user2Updated = yield user_model_1.User.findById(user2._id);
            expect(user1Updated === null || user1Updated === void 0 ? void 0 : user1Updated.friendIds).not.toContainEqual(user2._id);
            expect(user2Updated === null || user2Updated === void 0 ? void 0 : user2Updated.friendIds).not.toContainEqual(user1._id);
        }));
    });
    describe('Blocking System', () => {
        it('should block user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.blockUser(user1._id.toString(), user2._id.toString());
            const user1Updated = yield user_model_1.User.findById(user1._id);
            expect(user1Updated === null || user1Updated === void 0 ? void 0 : user1Updated.blockedUserIds).toContainEqual(user2._id);
        }));
        it('should prevent friend requests from blocked users', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.blockUser(user1._id.toString(), user2._id.toString());
            yield expect(friend_service_1.FriendService.sendFriendRequest(user2._id.toString(), user1._id.toString())).rejects.toThrow('Cannot send friend request to this user');
        }));
        it('should unblock user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.blockUser(user1._id.toString(), user2._id.toString());
            yield friend_service_1.FriendService.unblockUser(user1._id.toString(), user2._id.toString());
            const user1Updated = yield user_model_1.User.findById(user1._id);
            expect(user1Updated === null || user1Updated === void 0 ? void 0 : user1Updated.blockedUserIds).not.toContainEqual(user2._id);
        }));
    });
});
