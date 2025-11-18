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
const supertest_1 = __importDefault(require("supertest"));
const test_server_1 = require("../utils/test-server");
const friend_controller_1 = require("../../controllers/friend.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/friend.controller');
describe('Friend Routes', () => {
    let app;
    let authToken;
    const mockUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
    };
    const mockFriend = {
        id: 'friend123',
        username: 'frienduser',
        email: 'friend@example.com'
    };
    const mockRequest = {
        id: 'request123',
        senderId: mockUser.id,
        receiverId: mockFriend.id,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, test_server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /requests/send/:userId', () => {
        it('should send friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.sendFriendRequest.mockImplementation((req, res) => {
                res.status(201).json(mockRequest);
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/friends/requests/send/${mockFriend.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockRequest);
        }));
        it('should handle already sent request', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.sendFriendRequest.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Friend request already sent' });
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/friends/requests/send/${mockFriend.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should handle self friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/friends/requests/send/${mockUser.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /requests', () => {
        it('should get pending friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequests = [mockRequest];
            friend_controller_1.FriendController.getPendingRequests.mockImplementation((req, res) => {
                res.status(200).json({ requests: mockRequests });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/friends/requests')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.requests).toEqual(mockRequests);
        }));
        it('should handle no pending requests', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.getPendingRequests.mockImplementation((req, res) => {
                res.status(200).json({ requests: [] });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/friends/requests')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.requests).toHaveLength(0);
        }));
    });
    describe('PUT /requests/:requestId/accept', () => {
        it('should accept friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const acceptedRequest = Object.assign(Object.assign({}, mockRequest), { status: 'accepted' });
            friend_controller_1.FriendController.acceptFriendRequest.mockImplementation((req, res) => {
                res.status(200).json(acceptedRequest);
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/friends/requests/${mockRequest.id}/accept`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('accepted');
        }));
        it('should handle non-existent request', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.acceptFriendRequest.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Friend request not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/friends/requests/nonexistent/accept')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('PUT /requests/:requestId/reject', () => {
        it('should reject friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const rejectedRequest = Object.assign(Object.assign({}, mockRequest), { status: 'rejected' });
            friend_controller_1.FriendController.rejectFriendRequest.mockImplementation((req, res) => {
                res.status(200).json(rejectedRequest);
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/friends/requests/${mockRequest.id}/reject`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('rejected');
        }));
        it('should handle already processed request', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.rejectFriendRequest.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Request already processed' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/friends/requests/${mockRequest.id}/reject`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /list', () => {
        it('should get friend list', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFriends = [mockFriend];
            friend_controller_1.FriendController.getFriendList.mockImplementation((req, res) => {
                res.status(200).json({ friends: mockFriends });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/friends/list')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(mockFriends);
        }));
        it('should handle empty friend list', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.getFriendList.mockImplementation((req, res) => {
                res.status(200).json({ friends: [] });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/friends/list')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.friends).toHaveLength(0);
        }));
    });
    describe('DELETE /remove/:friendId', () => {
        it('should remove friend', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.removeFriend.mockImplementation((req, res) => {
                res.sendStatus(204);
            });
            const response = yield (0, supertest_1.default)(app)
                .delete(`/api/friends/remove/${mockFriend.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(204);
        }));
        it('should handle non-existent friend', () => __awaiter(void 0, void 0, void 0, function* () {
            friend_controller_1.FriendController.removeFriend.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Friend not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/friends/remove/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
