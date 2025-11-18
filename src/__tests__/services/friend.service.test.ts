import mongoose from 'mongoose';
import { FriendService } from '../../services/friend.service';
import { Friend } from '../../models/friend.model';
import { User } from '../../models/user.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

describe('FriendService', () => {
  let testUser1: any;
  let testUser2: any;
  let testUser3: any;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    // Create test users
    testUser1 = await User.create({
      username: 'testUser1',
      email: 'test1@example.com',
      password: 'password123'
    });
    testUser2 = await User.create({
      username: 'testUser2',
      email: 'test2@example.com',
      password: 'password123'
    });
    testUser3 = await User.create({
      username: 'testUser3',
      email: 'test3@example.com',
      password: 'password123'
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('sendFriendRequest', () => {
    it('should successfully send a friend request', async () => {
      await FriendService.sendFriendRequest(testUser1.id, testUser2.id);
      
      const request = await Friend.findOne({
        requesterId: testUser1._id,
        recipientId: testUser2._id
      });
      
      expect(request).toBeDefined();
      expect(request?.status).toBe('pending');
    });

    it('should throw error if users are already friends', async () => {
      testUser1.friendIds = [testUser2._id];
      await testUser1.save();

      await expect(
        FriendService.sendFriendRequest(testUser1.id, testUser2.id)
      ).rejects.toThrow('Users are already friends');
    });

    it('should throw error if request already exists', async () => {
      await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'pending'
      });

      await expect(
        FriendService.sendFriendRequest(testUser1.id, testUser2.id)
      ).rejects.toThrow('Friend request already exists');
    });

    it('should throw error if user is blocked', async () => {
      testUser1.blockedUserIds = [testUser2._id];
      await testUser1.save();

      await expect(
        FriendService.sendFriendRequest(testUser1.id, testUser2.id)
      ).rejects.toThrow('Cannot send friend request to this user');
    });
  });

  describe('acceptFriendRequest', () => {
    let friendRequest: any;

    beforeEach(async () => {
      friendRequest = await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'pending'
      });
    });

    it('should successfully accept a friend request', async () => {
      await FriendService.acceptFriendRequest(friendRequest.id, testUser2.id);

      const updatedRequest = await Friend.findById(friendRequest.id);
      expect(updatedRequest?.status).toBe('accepted');

      const user1 = await User.findById(testUser1.id);
      const user2 = await User.findById(testUser2.id);

      expect(user1?.friendIds).toContainEqual(testUser2._id);
      expect(user2?.friendIds).toContainEqual(testUser1._id);
    });

    it('should throw error if request not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        FriendService.acceptFriendRequest(fakeId.toString(), testUser2.id)
      ).rejects.toThrow('Friend request not found');
    });

    it('should throw error if not authorized', async () => {
      await expect(
        FriendService.acceptFriendRequest(friendRequest.id, testUser1.id)
      ).rejects.toThrow('Not authorized to accept this request');
    });
  });

  describe('getFriendList', () => {
    beforeEach(async () => {
      testUser1.friendIds = [testUser2._id];
      await testUser1.save();
    });

    it('should return list of friends', async () => {
      const friends = await FriendService.getFriendList(testUser1.id);
      expect(friends).toHaveLength(1);
      expect(friends[0]._id).toEqual(testUser2._id);
    });

    it('should return empty array if no friends', async () => {
      const friends = await FriendService.getFriendList(testUser3.id);
      expect(friends).toHaveLength(0);
    });
  });

  describe('removeFriend', () => {
    beforeEach(async () => {
      testUser1.friendIds = [testUser2._id];
      testUser2.friendIds = [testUser1._id];
      await testUser1.save();
      await testUser2.save();
    });

    it('should successfully remove friend', async () => {
      await FriendService.removeFriend(testUser1.id, testUser2.id);

      const user1 = await User.findById(testUser1.id);
      const user2 = await User.findById(testUser2.id);

      expect(user1?.friendIds).toHaveLength(0);
      expect(user2?.friendIds).toHaveLength(0);
    });

    it('should throw error if users are not friends', async () => {
      await expect(
        FriendService.removeFriend(testUser1.id, testUser3.id)
      ).rejects.toThrow('Users are not friends');
    });
  });

  describe('blockUser', () => {
    beforeEach(async () => {
      testUser1.friendIds = [testUser2._id];
      testUser2.friendIds = [testUser1._id];
      await testUser1.save();
      await testUser2.save();
    });

    it('should successfully block user', async () => {
      await FriendService.blockUser(testUser1.id, testUser2.id);

      const user1 = await User.findById(testUser1.id);
      const user2 = await User.findById(testUser2.id);

      expect(user1?.blockedUserIds).toContainEqual(testUser2._id);
      expect(user1?.friendIds).toHaveLength(0);
      expect(user2?.friendIds).toHaveLength(0);
    });

    it('should remove existing friend requests when blocking', async () => {
      await Friend.create({
        requesterId: testUser2._id,
        recipientId: testUser1._id,
        status: 'pending'
      });

      await FriendService.blockUser(testUser1.id, testUser2.id);

      const requests = await Friend.find({
        $or: [
          { requesterId: testUser1._id, recipientId: testUser2._id },
          { requesterId: testUser2._id, recipientId: testUser1._id }
        ]
      });

      expect(requests).toHaveLength(0);
    });
  });

  describe('unblockUser', () => {
    beforeEach(async () => {
      testUser1.blockedUserIds = [testUser2._id];
      await testUser1.save();
    });

    it('should successfully unblock user', async () => {
      await FriendService.unblockUser(testUser1.id, testUser2.id);

      const user1 = await User.findById(testUser1.id);
      expect(user1?.blockedUserIds).toHaveLength(0);
    });
  });

  describe('getPendingRequests', () => {
    beforeEach(async () => {
      await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'pending'
      });
    });

    it('should return pending friend requests', async () => {
      const requests = await FriendService.getPendingRequests(testUser2.id);
      expect(requests).toHaveLength(1);
      expect(requests[0].requesterId._id).toEqual(testUser1._id);
    });
  });

  describe('getBlockedUsers', () => {
    beforeEach(async () => {
      await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'blocked'
      });
    });

    it('should return blocked users', async () => {
      const blocked = await FriendService.getBlockedUsers(testUser1.id);
      expect(blocked).toHaveLength(1);
      expect(blocked[0].recipientId._id).toEqual(testUser2._id);
    });
  });

  describe('areFriends', () => {
    beforeEach(async () => {
      await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'accepted'
      });
    });

    it('should return true if users are friends', async () => {
      const result = await FriendService.areFriends(testUser1.id, testUser2.id);
      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      const result = await FriendService.areFriends(testUser1.id, testUser3.id);
      expect(result).toBe(false);
    });
  });

  describe('rejectFriendRequest', () => {
    let friendRequest: any;

    beforeEach(async () => {
      friendRequest = await Friend.create({
        requesterId: testUser1._id,
        recipientId: testUser2._id,
        status: 'pending'
      });
    });

    it('should successfully reject friend request', async () => {
      await FriendService.rejectFriendRequest(testUser2.id, friendRequest.id);
      const request = await Friend.findById(friendRequest.id);
      expect(request).toBeNull();
    });

    it('should throw error if not authorized', async () => {
      await expect(
        FriendService.rejectFriendRequest(testUser1.id, friendRequest.id)
      ).rejects.toThrow('Not authorized to reject this request');
    });

    it('should throw error if request not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        FriendService.rejectFriendRequest(testUser2.id, fakeId.toString())
      ).rejects.toThrow('Friend request not found');
    });
  });
}); 