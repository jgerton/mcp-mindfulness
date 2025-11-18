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
const mongoose_1 = __importDefault(require("mongoose"));
const friend_service_1 = require("../../services/friend.service");
const friend_model_1 = require("../../models/friend.model");
const user_model_1 = require("../../models/user.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('FriendService', () => {
    let testUser1;
    let testUser2;
    let testUser3;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create test users
        testUser1 = yield user_model_1.User.create({
            username: 'testUser1',
            email: 'test1@example.com',
            password: 'password123'
        });
        testUser2 = yield user_model_1.User.create({
            username: 'testUser2',
            email: 'test2@example.com',
            password: 'password123'
        });
        testUser3 = yield user_model_1.User.create({
            username: 'testUser3',
            email: 'test3@example.com',
            password: 'password123'
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('sendFriendRequest', () => {
        it('should successfully send a friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.sendFriendRequest(testUser1.id, testUser2.id);
            const request = yield friend_model_1.Friend.findOne({
                requesterId: testUser1._id,
                recipientId: testUser2._id
            });
            expect(request).toBeDefined();
            expect(request === null || request === void 0 ? void 0 : request.status).toBe('pending');
        }));
        it('should throw error if users are already friends', () => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.friendIds = [testUser2._id];
            yield testUser1.save();
            yield expect(friend_service_1.FriendService.sendFriendRequest(testUser1.id, testUser2.id)).rejects.toThrow('Users are already friends');
        }));
        it('should throw error if request already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'pending'
            });
            yield expect(friend_service_1.FriendService.sendFriendRequest(testUser1.id, testUser2.id)).rejects.toThrow('Friend request already exists');
        }));
        it('should throw error if user is blocked', () => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.blockedUserIds = [testUser2._id];
            yield testUser1.save();
            yield expect(friend_service_1.FriendService.sendFriendRequest(testUser1.id, testUser2.id)).rejects.toThrow('Cannot send friend request to this user');
        }));
    });
    describe('acceptFriendRequest', () => {
        let friendRequest;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            friendRequest = yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'pending'
            });
        }));
        it('should successfully accept a friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.acceptFriendRequest(friendRequest.id, testUser2.id);
            const updatedRequest = yield friend_model_1.Friend.findById(friendRequest.id);
            expect(updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.status).toBe('accepted');
            const user1 = yield user_model_1.User.findById(testUser1.id);
            const user2 = yield user_model_1.User.findById(testUser2.id);
            expect(user1 === null || user1 === void 0 ? void 0 : user1.friendIds).toContainEqual(testUser2._id);
            expect(user2 === null || user2 === void 0 ? void 0 : user2.friendIds).toContainEqual(testUser1._id);
        }));
        it('should throw error if request not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            yield expect(friend_service_1.FriendService.acceptFriendRequest(fakeId.toString(), testUser2.id)).rejects.toThrow('Friend request not found');
        }));
        it('should throw error if not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(friend_service_1.FriendService.acceptFriendRequest(friendRequest.id, testUser1.id)).rejects.toThrow('Not authorized to accept this request');
        }));
    });
    describe('getFriendList', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.friendIds = [testUser2._id];
            yield testUser1.save();
        }));
        it('should return list of friends', () => __awaiter(void 0, void 0, void 0, function* () {
            const friends = yield friend_service_1.FriendService.getFriendList(testUser1.id);
            expect(friends).toHaveLength(1);
            expect(friends[0]._id).toEqual(testUser2._id);
        }));
        it('should return empty array if no friends', () => __awaiter(void 0, void 0, void 0, function* () {
            const friends = yield friend_service_1.FriendService.getFriendList(testUser3.id);
            expect(friends).toHaveLength(0);
        }));
    });
    describe('removeFriend', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.friendIds = [testUser2._id];
            testUser2.friendIds = [testUser1._id];
            yield testUser1.save();
            yield testUser2.save();
        }));
        it('should successfully remove friend', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.removeFriend(testUser1.id, testUser2.id);
            const user1 = yield user_model_1.User.findById(testUser1.id);
            const user2 = yield user_model_1.User.findById(testUser2.id);
            expect(user1 === null || user1 === void 0 ? void 0 : user1.friendIds).toHaveLength(0);
            expect(user2 === null || user2 === void 0 ? void 0 : user2.friendIds).toHaveLength(0);
        }));
        it('should throw error if users are not friends', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(friend_service_1.FriendService.removeFriend(testUser1.id, testUser3.id)).rejects.toThrow('Users are not friends');
        }));
    });
    describe('blockUser', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.friendIds = [testUser2._id];
            testUser2.friendIds = [testUser1._id];
            yield testUser1.save();
            yield testUser2.save();
        }));
        it('should successfully block user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.blockUser(testUser1.id, testUser2.id);
            const user1 = yield user_model_1.User.findById(testUser1.id);
            const user2 = yield user_model_1.User.findById(testUser2.id);
            expect(user1 === null || user1 === void 0 ? void 0 : user1.blockedUserIds).toContainEqual(testUser2._id);
            expect(user1 === null || user1 === void 0 ? void 0 : user1.friendIds).toHaveLength(0);
            expect(user2 === null || user2 === void 0 ? void 0 : user2.friendIds).toHaveLength(0);
        }));
        it('should remove existing friend requests when blocking', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create({
                requesterId: testUser2._id,
                recipientId: testUser1._id,
                status: 'pending'
            });
            yield friend_service_1.FriendService.blockUser(testUser1.id, testUser2.id);
            const requests = yield friend_model_1.Friend.find({
                $or: [
                    { requesterId: testUser1._id, recipientId: testUser2._id },
                    { requesterId: testUser2._id, recipientId: testUser1._id }
                ]
            });
            expect(requests).toHaveLength(0);
        }));
    });
    describe('unblockUser', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            testUser1.blockedUserIds = [testUser2._id];
            yield testUser1.save();
        }));
        it('should successfully unblock user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.unblockUser(testUser1.id, testUser2.id);
            const user1 = yield user_model_1.User.findById(testUser1.id);
            expect(user1 === null || user1 === void 0 ? void 0 : user1.blockedUserIds).toHaveLength(0);
        }));
    });
    describe('getPendingRequests', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'pending'
            });
        }));
        it('should return pending friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const requests = yield friend_service_1.FriendService.getPendingRequests(testUser2.id);
            expect(requests).toHaveLength(1);
            expect(requests[0].requesterId._id).toEqual(testUser1._id);
        }));
    });
    describe('getBlockedUsers', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'blocked'
            });
        }));
        it('should return blocked users', () => __awaiter(void 0, void 0, void 0, function* () {
            const blocked = yield friend_service_1.FriendService.getBlockedUsers(testUser1.id);
            expect(blocked).toHaveLength(1);
            expect(blocked[0].recipientId._id).toEqual(testUser2._id);
        }));
    });
    describe('areFriends', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'accepted'
            });
        }));
        it('should return true if users are friends', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield friend_service_1.FriendService.areFriends(testUser1.id, testUser2.id);
            expect(result).toBe(true);
        }));
        it('should return false if users are not friends', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield friend_service_1.FriendService.areFriends(testUser1.id, testUser3.id);
            expect(result).toBe(false);
        }));
    });
    describe('rejectFriendRequest', () => {
        let friendRequest;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            friendRequest = yield friend_model_1.Friend.create({
                requesterId: testUser1._id,
                recipientId: testUser2._id,
                status: 'pending'
            });
        }));
        it('should successfully reject friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_service_1.FriendService.rejectFriendRequest(testUser2.id, friendRequest.id);
            const request = yield friend_model_1.Friend.findById(friendRequest.id);
            expect(request).toBeNull();
        }));
        it('should throw error if not authorized', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(friend_service_1.FriendService.rejectFriendRequest(testUser1.id, friendRequest.id)).rejects.toThrow('Not authorized to reject this request');
        }));
        it('should throw error if request not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId();
            yield expect(friend_service_1.FriendService.rejectFriendRequest(testUser2.id, fakeId.toString())).rejects.toThrow('Friend request not found');
        }));
    });
});
