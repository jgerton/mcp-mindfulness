import mongoose from 'mongoose';
import { Friend, IFriend } from '../../models/friend.model';
import { FriendRequest, IFriendRequest } from '../../models/friend-request.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factories
interface FriendInput {
  requesterId?: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  status?: 'pending' | 'accepted' | 'blocked';
}

interface FriendRequestInput {
  requesterId?: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  status?: 'pending' | 'accepted' | 'rejected';
}

const createTestFriend = (overrides: FriendInput = {}): FriendInput => ({
  requesterId: new mongoose.Types.ObjectId(),
  recipientId: new mongoose.Types.ObjectId(),
  status: 'pending',
  ...overrides
});

const createTestFriendRequest = (overrides: FriendRequestInput = {}): FriendRequestInput => ({
  requesterId: new mongoose.Types.ObjectId(),
  recipientId: new mongoose.Types.ObjectId(),
  status: 'pending',
  ...overrides
});

describe('Friend Models', () => {
  let testFriend: FriendInput;
  let testRequest: FriendRequestInput;
  let userId1: mongoose.Types.ObjectId;
  let userId2: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    userId1 = new mongoose.Types.ObjectId();
    userId2 = new mongoose.Types.ObjectId();
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

    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
        return Promise.resolve(this);
      });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create friend relationship successfully', async () => {
      const friend = await Friend.create(testFriend);
      expect(friend.requesterId).toEqual(testFriend.requesterId);
      expect(friend.recipientId).toEqual(testFriend.recipientId);
      expect(friend.status).toBe('pending');
    });

    it('should create and accept friend request', async () => {
      const request = await FriendRequest.create(testRequest);
      expect(request.status).toBe('pending');

      request.status = 'accepted';
      await request.save();
      expect(request.status).toBe('accepted');
    });

    it('should retrieve user friends correctly', async () => {
      await Friend.create([
        { requesterId: userId1, recipientId: userId2, status: 'accepted' },
        { requesterId: new mongoose.Types.ObjectId(), recipientId: userId1, status: 'accepted' }
      ]);

      const friends = await Friend.getFriends(userId1);
      expect(friends).toHaveLength(2);
      expect(friends.every(f => f.status === 'accepted')).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const friend = new Friend({});
      const validationError = await friend.validateSync();
      expect(validationError?.errors.requesterId).toBeDefined();
      expect(validationError?.errors.recipientId).toBeDefined();

      const request = new FriendRequest({});
      const requestError = await request.validateSync();
      expect(requestError?.errors.requesterId).toBeDefined();
      expect(requestError?.errors.recipientId).toBeDefined();
    });

    it('should reject invalid status values', async () => {
      const friend = new Friend({
        ...testFriend,
        status: 'invalid' as any
      });
      const friendError = await friend.validateSync();
      expect(friendError?.errors.status).toBeDefined();

      const request = new FriendRequest({
        ...testRequest,
        status: 'invalid' as any
      });
      const requestError = await request.validateSync();
      expect(requestError?.errors.status).toBeDefined();
    });

    it('should prevent duplicate friend relationships', async () => {
      await Friend.create(testFriend);
      await expect(Friend.create(testFriend)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle self-referential requests', async () => {
      const selfRequest = new FriendRequest({
        requesterId: userId1,
        recipientId: userId1
      });
      const validationError = await selfRequest.validateSync();
      expect(validationError).toBeDefined();
    });

    it('should handle blocked status transitions', async () => {
      const friend = await Friend.create({
        ...testFriend,
        status: 'accepted'
      });

      friend.status = 'blocked';
      await friend.save();
      expect(friend.status).toBe('blocked');

      // Once blocked, should stay blocked
      friend.status = 'accepted';
      const validationError = await friend.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });

    it('should handle concurrent friend requests', async () => {
      // Create two requests in opposite directions
      await FriendRequest.create(testRequest);
      const reverseRequest = {
        requesterId: testRequest.recipientId,
        recipientId: testRequest.requesterId,
        status: 'pending'
      };
      await expect(FriendRequest.create(reverseRequest)).rejects.toThrow();
    });
  });

  describe('Friend Model', () => {
    describe('Schema Validation', () => {
      it('should validate required fields', async () => {
        const friend = new Friend({});
        const validationError = await friend.validateSync();
        
        expect(validationError?.errors.requesterId).toBeDefined();
        expect(validationError?.errors.recipientId).toBeDefined();
      });

      it('should validate status enum values', async () => {
        const friend = new Friend({
          ...createTestFriend(),
          status: 'invalid'
        });

        const validationError = await friend.validateSync();
        expect(validationError?.errors.status).toBeDefined();
      });

      it('should accept valid status values', async () => {
        const validStatuses: ('pending' | 'accepted' | 'blocked')[] = ['pending', 'accepted', 'blocked'];
        
        for (const status of validStatuses) {
          const friend = new Friend({
            ...createTestFriend(),
            status
          });
          
          const validationError = await friend.validateSync();
          expect(validationError?.errors.status).toBeUndefined();
        }
      });

      it('should validate ObjectId references', async () => {
        const friend = new Friend({
          ...createTestFriend(),
          requesterId: 'invalid',
          recipientId: 'invalid'
        });

        const validationError = await friend.validateSync();
        expect(validationError?.errors.requesterId).toBeDefined();
        expect(validationError?.errors.recipientId).toBeDefined();
      });
    });

    describe('Default Values', () => {
      it('should set default status to pending', async () => {
        const friend = await Friend.create({
          ...createTestFriend(),
          status: undefined
        });
        
        expect(friend.status).toBe('pending');
      });

      it('should set timestamps', async () => {
        const friend = await Friend.create(createTestFriend());
        
        expect(friend.createdAt).toBeDefined();
        expect(friend.updatedAt).toBeDefined();
        expect(friend.createdAt).toBeInstanceOf(Date);
        expect(friend.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('Static Methods', () => {
      it('should get user friends', async () => {
        const userId = new mongoose.Types.ObjectId();
        const friendId1 = new mongoose.Types.ObjectId();
        const friendId2 = new mongoose.Types.ObjectId();

        await Friend.create([
          { requesterId: userId, recipientId: friendId1, status: 'accepted' },
          { requesterId: friendId2, recipientId: userId, status: 'accepted' },
          { requesterId: userId, recipientId: new mongoose.Types.ObjectId(), status: 'pending' }
        ]);

        const friends = await Friend.getFriends(userId);
        expect(friends).toHaveLength(2);
        expect(friends.map(f => f.status)).toEqual(['accepted', 'accepted']);
      });

      it('should get pending requests', async () => {
        const userId = new mongoose.Types.ObjectId();
        
        await Friend.create([
          { requesterId: new mongoose.Types.ObjectId(), recipientId: userId, status: 'pending' },
          { requesterId: new mongoose.Types.ObjectId(), recipientId: userId, status: 'pending' },
          { requesterId: userId, recipientId: new mongoose.Types.ObjectId(), status: 'pending' }
        ]);

        const pendingRequests = await Friend.getPendingRequests(userId);
        expect(pendingRequests).toHaveLength(2);
      });
    });

    describe('Indexes', () => {
      it('should have unique compound index on requesterId and recipientId', async () => {
        const data = createTestFriend();
        await Friend.create(data);
        
        await expect(Friend.create(data)).rejects.toThrow();
      });
    });
  });

  describe('FriendRequest Model', () => {
    describe('Schema Validation', () => {
      it('should validate required fields', async () => {
        const request = new FriendRequest({});
        const validationError = await request.validateSync();
        
        expect(validationError?.errors.requesterId).toBeDefined();
        expect(validationError?.errors.recipientId).toBeDefined();
      });

      it('should validate status enum values', async () => {
        const request = new FriendRequest({
          ...createTestFriendRequest(),
          status: 'invalid'
        });

        const validationError = await request.validateSync();
        expect(validationError?.errors.status).toBeDefined();
      });

      it('should accept valid status values', async () => {
        const validStatuses: ('pending' | 'accepted' | 'rejected')[] = ['pending', 'accepted', 'rejected'];
        
        for (const status of validStatuses) {
          const request = new FriendRequest({
            ...createTestFriendRequest(),
            status
          });
          
          const validationError = await request.validateSync();
          expect(validationError?.errors.status).toBeUndefined();
        }
      });
    });

    describe('Default Values', () => {
      it('should set default status to pending', async () => {
        const request = await FriendRequest.create({
          ...createTestFriendRequest(),
          status: undefined
        });
        
        expect(request.status).toBe('pending');
      });

      it('should set timestamps', async () => {
        const request = await FriendRequest.create(createTestFriendRequest());
        
        expect(request.createdAt).toBeDefined();
        expect(request.updatedAt).toBeDefined();
        expect(request.createdAt).toBeInstanceOf(Date);
        expect(request.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('Virtual Fields', () => {
      it('should populate requester and recipient virtuals', async () => {
        const request = await FriendRequest.create(createTestFriendRequest());
        
        expect(request.requester).toBeDefined();
        expect(request.recipient).toBeDefined();
      });
    });

    describe('Indexes', () => {
      it('should have unique compound index on requesterId and recipientId', async () => {
        const data = createTestFriendRequest();
        await FriendRequest.create(data);
        
        await expect(FriendRequest.create(data)).rejects.toThrow();
      });
    });

    describe('Data Integrity', () => {
      it('should update timestamps on modification', async () => {
        const request = await FriendRequest.create(createTestFriendRequest());
        const originalUpdatedAt = request.updatedAt;

        await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
        request.status = 'accepted';
        await request.save();

        expect(request.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });

      it('should prevent self-referential friend requests', async () => {
        const userId = new mongoose.Types.ObjectId();
        const request = new FriendRequest({
          requesterId: userId,
          recipientId: userId
        });

        const validationError = await request.validateSync();
        expect(validationError).toBeDefined();
      });
    });
  });
}); 