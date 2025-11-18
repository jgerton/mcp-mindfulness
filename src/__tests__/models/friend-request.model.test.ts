import mongoose from 'mongoose';
import { FriendRequest, IFriendRequest } from '../../models/friend-request.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { FriendRequestTestFactory } from '../factories/social.factory';

describe('FriendRequest Model', () => {
  let friendRequestFactory: FriendRequestTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    friendRequestFactory = new FriendRequestTestFactory();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Schema Validation', () => {
    it('should create a valid friend request', async () => {
      const request = await FriendRequest.create(friendRequestFactory.pending());
      expect(request._id).toBeDefined();
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeDefined();
      expect(request.updatedAt).toBeDefined();
    });

    it('should require requesterId and recipientId', async () => {
      const request = new FriendRequest({});
      const validationError = await request.validateSync();
      
      expect(validationError?.errors.requesterId).toBeDefined();
      expect(validationError?.errors.recipientId).toBeDefined();
    });

    it('should validate status enum values', async () => {
      const request = new FriendRequest({
        ...friendRequestFactory.create(),
        status: 'invalid_status'
      });

      const validationError = await request.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should populate requester and recipient virtuals', async () => {
      const request = await FriendRequest.create(friendRequestFactory.pending());
      
      const populatedRequest = await request.populate(['requester', 'recipient']);
      expect(populatedRequest.requester).toBeDefined();
      expect(populatedRequest.recipient).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should enforce unique compound index on requesterId and recipientId', async () => {
      const requestData = friendRequestFactory.pending();
      await FriendRequest.create(requestData);
      
      await expect(FriendRequest.create(requestData)).rejects.toThrow();
    });
  });

  describe('Status Transitions', () => {
    it('should handle status transitions correctly', async () => {
      const request = await FriendRequest.create(friendRequestFactory.pending());
      
      request.status = 'accepted';
      await request.save();
      expect(request.status).toBe('accepted');

      request.status = 'rejected';
      await request.save();
      expect(request.status).toBe('rejected');
    });

    it('should not allow invalid status transitions', async () => {
      const request = await FriendRequest.create(friendRequestFactory.accepted());
      
      request.status = 'pending';
      const validationError = await request.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should prevent self-referential friend requests', async () => {
      const userId = new mongoose.Types.ObjectId();
      const request = new FriendRequest({
        requesterId: userId,
        recipientId: userId
      });

      const validationError = await request.validateSync();
      expect(validationError).toBeDefined();
    });

    it('should handle concurrent friend requests between users', async () => {
      const user1Id = new mongoose.Types.ObjectId();
      const user2Id = new mongoose.Types.ObjectId();

      await FriendRequest.create(friendRequestFactory.create({
        requesterId: user1Id,
        recipientId: user2Id
      }));

      await expect(FriendRequest.create(friendRequestFactory.create({
        requesterId: user2Id,
        recipientId: user1Id
      }))).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should update timestamps on modification', async () => {
      const request = await FriendRequest.create(friendRequestFactory.pending());
      const originalUpdatedAt = request.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      request.status = 'accepted';
      await request.save();

      expect(request.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
}); 