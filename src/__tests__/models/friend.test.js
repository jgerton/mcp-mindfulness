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
const friend_model_1 = require("../../models/friend.model");
const friend_request_model_1 = require("../../models/friend-request.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestFriend = (overrides = {}) => (Object.assign({ requesterId: new mongoose_1.default.Types.ObjectId(), recipientId: new mongoose_1.default.Types.ObjectId(), status: 'pending' }, overrides));
const createTestFriendRequest = (overrides = {}) => (Object.assign({ requesterId: new mongoose_1.default.Types.ObjectId(), recipientId: new mongoose_1.default.Types.ObjectId(), status: 'pending' }, overrides));
describe('Friend Models', () => {
    let testFriend;
    let testRequest;
    let userId1;
    let userId2;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        userId1 = new mongoose_1.default.Types.ObjectId();
        userId2 = new mongoose_1.default.Types.ObjectId();
        testFriend = {
            requesterId: userId1,
            recipientId: userId2,
            status: 'pending'
        };
        testRequest = {
            requesterId: userId1,
            recipientId: userId2,
            status: 'pending'
        };
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create friend relationship successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const friend = yield friend_model_1.Friend.create(testFriend);
            expect(friend.requesterId).toEqual(testFriend.requesterId);
            expect(friend.recipientId).toEqual(testFriend.recipientId);
            expect(friend.status).toBe('pending');
        }));
        it('should create and accept friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(testRequest);
            expect(request.status).toBe('pending');
            request.status = 'accepted';
            yield request.save();
            expect(request.status).toBe('accepted');
        }));
        it('should retrieve user friends correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create([
                { requesterId: userId1, recipientId: userId2, status: 'accepted' },
                { requesterId: new mongoose_1.default.Types.ObjectId(), recipientId: userId1, status: 'accepted' }
            ]);
            const friends = yield friend_model_1.Friend.getFriends(userId1);
            expect(friends).toHaveLength(2);
            expect(friends.every(f => f.status === 'accepted')).toBe(true);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const friend = new friend_model_1.Friend({});
            const validationError = yield friend.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.requesterId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.recipientId).toBeDefined();
            const request = new friend_request_model_1.FriendRequest({});
            const requestError = yield request.validateSync();
            expect(requestError === null || requestError === void 0 ? void 0 : requestError.errors.requesterId).toBeDefined();
            expect(requestError === null || requestError === void 0 ? void 0 : requestError.errors.recipientId).toBeDefined();
        }));
        it('should reject invalid status values', () => __awaiter(void 0, void 0, void 0, function* () {
            const friend = new friend_model_1.Friend(Object.assign(Object.assign({}, testFriend), { status: 'invalid' }));
            const friendError = yield friend.validateSync();
            expect(friendError === null || friendError === void 0 ? void 0 : friendError.errors.status).toBeDefined();
            const request = new friend_request_model_1.FriendRequest(Object.assign(Object.assign({}, testRequest), { status: 'invalid' }));
            const requestError = yield request.validateSync();
            expect(requestError === null || requestError === void 0 ? void 0 : requestError.errors.status).toBeDefined();
        }));
        it('should prevent duplicate friend relationships', () => __awaiter(void 0, void 0, void 0, function* () {
            yield friend_model_1.Friend.create(testFriend);
            yield expect(friend_model_1.Friend.create(testFriend)).rejects.toThrow();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle self-referential requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const selfRequest = new friend_request_model_1.FriendRequest({
                requesterId: userId1,
                recipientId: userId1
            });
            const validationError = yield selfRequest.validateSync();
            expect(validationError).toBeDefined();
        }));
        it('should handle blocked status transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const friend = yield friend_model_1.Friend.create(Object.assign(Object.assign({}, testFriend), { status: 'accepted' }));
            friend.status = 'blocked';
            yield friend.save();
            expect(friend.status).toBe('blocked');
            // Once blocked, should stay blocked
            friend.status = 'accepted';
            const validationError = yield friend.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeDefined();
        }));
        it('should handle concurrent friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create two requests in opposite directions
            yield friend_request_model_1.FriendRequest.create(testRequest);
            const reverseRequest = {
                requesterId: testRequest.recipientId,
                recipientId: testRequest.requesterId,
                status: 'pending'
            };
            yield expect(friend_request_model_1.FriendRequest.create(reverseRequest)).rejects.toThrow();
        }));
    });
    describe('Friend Model', () => {
        describe('Schema Validation', () => {
            it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const friend = new friend_model_1.Friend({});
                const validationError = yield friend.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.requesterId).toBeDefined();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.recipientId).toBeDefined();
            }));
            it('should validate status enum values', () => __awaiter(void 0, void 0, void 0, function* () {
                const friend = new friend_model_1.Friend(Object.assign(Object.assign({}, createTestFriend()), { status: 'invalid' }));
                const validationError = yield friend.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeDefined();
            }));
            it('should accept valid status values', () => __awaiter(void 0, void 0, void 0, function* () {
                const validStatuses = ['pending', 'accepted', 'blocked'];
                for (const status of validStatuses) {
                    const friend = new friend_model_1.Friend(Object.assign(Object.assign({}, createTestFriend()), { status }));
                    const validationError = yield friend.validateSync();
                    expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeUndefined();
                }
            }));
            it('should validate ObjectId references', () => __awaiter(void 0, void 0, void 0, function* () {
                const friend = new friend_model_1.Friend(Object.assign(Object.assign({}, createTestFriend()), { requesterId: 'invalid', recipientId: 'invalid' }));
                const validationError = yield friend.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.requesterId).toBeDefined();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.recipientId).toBeDefined();
            }));
        });
        describe('Default Values', () => {
            it('should set default status to pending', () => __awaiter(void 0, void 0, void 0, function* () {
                const friend = yield friend_model_1.Friend.create(Object.assign(Object.assign({}, createTestFriend()), { status: undefined }));
                expect(friend.status).toBe('pending');
            }));
            it('should set timestamps', () => __awaiter(void 0, void 0, void 0, function* () {
                const friend = yield friend_model_1.Friend.create(createTestFriend());
                expect(friend.createdAt).toBeDefined();
                expect(friend.updatedAt).toBeDefined();
                expect(friend.createdAt).toBeInstanceOf(Date);
                expect(friend.updatedAt).toBeInstanceOf(Date);
            }));
        });
        describe('Static Methods', () => {
            it('should get user friends', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId();
                const friendId1 = new mongoose_1.default.Types.ObjectId();
                const friendId2 = new mongoose_1.default.Types.ObjectId();
                yield friend_model_1.Friend.create([
                    { requesterId: userId, recipientId: friendId1, status: 'accepted' },
                    { requesterId: friendId2, recipientId: userId, status: 'accepted' },
                    { requesterId: userId, recipientId: new mongoose_1.default.Types.ObjectId(), status: 'pending' }
                ]);
                const friends = yield friend_model_1.Friend.getFriends(userId);
                expect(friends).toHaveLength(2);
                expect(friends.map(f => f.status)).toEqual(['accepted', 'accepted']);
            }));
            it('should get pending requests', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId();
                yield friend_model_1.Friend.create([
                    { requesterId: new mongoose_1.default.Types.ObjectId(), recipientId: userId, status: 'pending' },
                    { requesterId: new mongoose_1.default.Types.ObjectId(), recipientId: userId, status: 'pending' },
                    { requesterId: userId, recipientId: new mongoose_1.default.Types.ObjectId(), status: 'pending' }
                ]);
                const pendingRequests = yield friend_model_1.Friend.getPendingRequests(userId);
                expect(pendingRequests).toHaveLength(2);
            }));
        });
        describe('Indexes', () => {
            it('should have unique compound index on requesterId and recipientId', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = createTestFriend();
                yield friend_model_1.Friend.create(data);
                yield expect(friend_model_1.Friend.create(data)).rejects.toThrow();
            }));
        });
    });
    describe('FriendRequest Model', () => {
        describe('Schema Validation', () => {
            it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = new friend_request_model_1.FriendRequest({});
                const validationError = yield request.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.requesterId).toBeDefined();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.recipientId).toBeDefined();
            }));
            it('should validate status enum values', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = new friend_request_model_1.FriendRequest(Object.assign(Object.assign({}, createTestFriendRequest()), { status: 'invalid' }));
                const validationError = yield request.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeDefined();
            }));
            it('should accept valid status values', () => __awaiter(void 0, void 0, void 0, function* () {
                const validStatuses = ['pending', 'accepted', 'rejected'];
                for (const status of validStatuses) {
                    const request = new friend_request_model_1.FriendRequest(Object.assign(Object.assign({}, createTestFriendRequest()), { status }));
                    const validationError = yield request.validateSync();
                    expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeUndefined();
                }
            }));
        });
        describe('Default Values', () => {
            it('should set default status to pending', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = yield friend_request_model_1.FriendRequest.create(Object.assign(Object.assign({}, createTestFriendRequest()), { status: undefined }));
                expect(request.status).toBe('pending');
            }));
            it('should set timestamps', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = yield friend_request_model_1.FriendRequest.create(createTestFriendRequest());
                expect(request.createdAt).toBeDefined();
                expect(request.updatedAt).toBeDefined();
                expect(request.createdAt).toBeInstanceOf(Date);
                expect(request.updatedAt).toBeInstanceOf(Date);
            }));
        });
        describe('Virtual Fields', () => {
            it('should populate requester and recipient virtuals', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = yield friend_request_model_1.FriendRequest.create(createTestFriendRequest());
                expect(request.requester).toBeDefined();
                expect(request.recipient).toBeDefined();
            }));
        });
        describe('Indexes', () => {
            it('should have unique compound index on requesterId and recipientId', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = createTestFriendRequest();
                yield friend_request_model_1.FriendRequest.create(data);
                yield expect(friend_request_model_1.FriendRequest.create(data)).rejects.toThrow();
            }));
        });
        describe('Data Integrity', () => {
            it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
                const request = yield friend_request_model_1.FriendRequest.create(createTestFriendRequest());
                const originalUpdatedAt = request.updatedAt;
                yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
                request.status = 'accepted';
                yield request.save();
                expect(request.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
            }));
            it('should prevent self-referential friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId();
                const request = new friend_request_model_1.FriendRequest({
                    requesterId: userId,
                    recipientId: userId
                });
                const validationError = yield request.validateSync();
                expect(validationError).toBeDefined();
            }));
        });
    });
});
