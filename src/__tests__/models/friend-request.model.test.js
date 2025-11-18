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
const friend_request_model_1 = require("../../models/friend-request.model");
const db_handler_1 = require("../test-utils/db-handler");
const social_factory_1 = require("../factories/social.factory");
describe('FriendRequest Model', () => {
    let friendRequestFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        friendRequestFactory = new social_factory_1.FriendRequestTestFactory();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Schema Validation', () => {
        it('should create a valid friend request', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(friendRequestFactory.pending());
            expect(request._id).toBeDefined();
            expect(request.status).toBe('pending');
            expect(request.createdAt).toBeDefined();
            expect(request.updatedAt).toBeDefined();
        }));
        it('should require requesterId and recipientId', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = new friend_request_model_1.FriendRequest({});
            const validationError = yield request.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.requesterId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.recipientId).toBeDefined();
        }));
        it('should validate status enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = new friend_request_model_1.FriendRequest(Object.assign(Object.assign({}, friendRequestFactory.create()), { status: 'invalid_status' }));
            const validationError = yield request.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeDefined();
        }));
    });
    describe('Virtual Fields', () => {
        it('should populate requester and recipient virtuals', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(friendRequestFactory.pending());
            const populatedRequest = yield request.populate(['requester', 'recipient']);
            expect(populatedRequest.requester).toBeDefined();
            expect(populatedRequest.recipient).toBeDefined();
        }));
    });
    describe('Indexes', () => {
        it('should enforce unique compound index on requesterId and recipientId', () => __awaiter(void 0, void 0, void 0, function* () {
            const requestData = friendRequestFactory.pending();
            yield friend_request_model_1.FriendRequest.create(requestData);
            yield expect(friend_request_model_1.FriendRequest.create(requestData)).rejects.toThrow();
        }));
    });
    describe('Status Transitions', () => {
        it('should handle status transitions correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(friendRequestFactory.pending());
            request.status = 'accepted';
            yield request.save();
            expect(request.status).toBe('accepted');
            request.status = 'rejected';
            yield request.save();
            expect(request.status).toBe('rejected');
        }));
        it('should not allow invalid status transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(friendRequestFactory.accepted());
            request.status = 'pending';
            const validationError = yield request.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.status).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should prevent self-referential friend requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const request = new friend_request_model_1.FriendRequest({
                requesterId: userId,
                recipientId: userId
            });
            const validationError = yield request.validateSync();
            expect(validationError).toBeDefined();
        }));
        it('should handle concurrent friend requests between users', () => __awaiter(void 0, void 0, void 0, function* () {
            const user1Id = new mongoose_1.default.Types.ObjectId();
            const user2Id = new mongoose_1.default.Types.ObjectId();
            yield friend_request_model_1.FriendRequest.create(friendRequestFactory.create({
                requesterId: user1Id,
                recipientId: user2Id
            }));
            yield expect(friend_request_model_1.FriendRequest.create(friendRequestFactory.create({
                requesterId: user2Id,
                recipientId: user1Id
            }))).rejects.toThrow();
        }));
    });
    describe('Timestamps', () => {
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const request = yield friend_request_model_1.FriendRequest.create(friendRequestFactory.pending());
            const originalUpdatedAt = request.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            request.status = 'accepted';
            yield request.save();
            expect(request.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
});
