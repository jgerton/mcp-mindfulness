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
const mongoose_1 = require("mongoose");
const friend_controller_1 = require("../../controllers/friend.controller");
const friend_service_1 = require("../../services/friend.service");
const achievement_service_1 = require("../../services/achievement.service");
const social_factory_1 = require("../factories/social.factory");
// Mock services
jest.mock('../../services/friend.service');
jest.mock('../../services/achievement.service');
describe('FriendController', () => {
    let mockRequest;
    let mockResponse;
    let mockUser;
    let friendTestFactory;
    let friendRequestTestFactory;
    beforeEach(() => {
        mockUser = { _id: new mongoose_1.Types.ObjectId().toString() };
        mockRequest = {
            user: mockUser,
            body: {},
            params: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        friendTestFactory = new social_factory_1.FriendTestFactory();
        friendRequestTestFactory = new social_factory_1.FriendRequestTestFactory();
        // Clear all mocks
        jest.clearAllMocks();
    });
    describe('sendFriendRequest', () => {
        it('should successfully send a friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const recipientId = new mongoose_1.Types.ObjectId().toString();
            const mockRequest = friendRequestTestFactory.create({ recipientId });
            mockRequest.body = { recipientId };
            friend_service_1.FriendService.sendFriendRequest.mockResolvedValue(mockRequest);
            yield friend_controller_1.FriendController.sendFriendRequest(mockRequest, mockResponse);
            expect(friend_service_1.FriendService.sendFriendRequest).toHaveBeenCalledWith(mockUser._id, recipientId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockRequest);
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            yield friend_controller_1.FriendController.sendFriendRequest(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            mockRequest.body = { recipientId: new mongoose_1.Types.ObjectId().toString() };
            friend_service_1.FriendService.sendFriendRequest.mockRejectedValue(error);
            yield friend_controller_1.FriendController.sendFriendRequest(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('acceptFriendRequest', () => {
        it('should successfully accept a friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestId = new mongoose_1.Types.ObjectId().toString();
            const mockAcceptedRequest = friendRequestTestFactory.create({ status: 'accepted' });
            mockRequest.params = { requestId };
            friend_service_1.FriendService.acceptFriendRequest.mockResolvedValue(mockAcceptedRequest);
            yield friend_controller_1.FriendController.acceptFriendRequest(mockRequest, mockResponse);
            expect(friend_service_1.FriendService.acceptFriendRequest).toHaveBeenCalledWith(mockUser._id, requestId);
            expect(achievement_service_1.AchievementService.processFriendAchievements).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockAcceptedRequest);
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = {};
            yield friend_controller_1.FriendController.acceptFriendRequest(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            mockRequest.params = { requestId: new mongoose_1.Types.ObjectId().toString() };
            friend_service_1.FriendService.acceptFriendRequest.mockRejectedValue(error);
            yield friend_controller_1.FriendController.acceptFriendRequest(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('getFriendList', () => {
        it('should successfully get friend list', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFriends = friendTestFactory.batch(3);
            friend_service_1.FriendService.getFriendList.mockResolvedValue(mockFriends);
            yield friend_controller_1.FriendController.getFriendList(mockRequest, mockResponse);
            expect(friend_service_1.FriendService.getFriendList).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockFriends);
        }));
        it('should return 400 if user ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield friend_controller_1.FriendController.getFriendList(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            friend_service_1.FriendService.getFriendList.mockRejectedValue(error);
            yield friend_controller_1.FriendController.getFriendList(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('getPendingRequests', () => {
        it('should successfully get pending requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPendingRequests = friendRequestTestFactory.batch(2).map(req => (Object.assign(Object.assign({}, req), { status: 'pending' })));
            friend_service_1.FriendService.getPendingRequests.mockResolvedValue(mockPendingRequests);
            yield friend_controller_1.FriendController.getPendingRequests(mockRequest, mockResponse);
            expect(friend_service_1.FriendService.getPendingRequests).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPendingRequests);
        }));
        it('should return 400 if user ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield friend_controller_1.FriendController.getPendingRequests(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            friend_service_1.FriendService.getPendingRequests.mockRejectedValue(error);
            yield friend_controller_1.FriendController.getPendingRequests(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('removeFriend', () => {
        it('should successfully remove a friend', () => __awaiter(void 0, void 0, void 0, function* () {
            const friendId = new mongoose_1.Types.ObjectId().toString();
            mockRequest.params = { friendId };
            friend_service_1.FriendService.removeFriend.mockResolvedValue(undefined);
            yield friend_controller_1.FriendController.removeFriend(mockRequest, mockResponse);
            expect(friend_service_1.FriendService.removeFriend).toHaveBeenCalledWith(mockUser._id, friendId);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Friend removed' });
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = {};
            yield friend_controller_1.FriendController.removeFriend(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            mockRequest.params = { friendId: new mongoose_1.Types.ObjectId().toString() };
            friend_service_1.FriendService.removeFriend.mockRejectedValue(error);
            yield friend_controller_1.FriendController.removeFriend(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
});
