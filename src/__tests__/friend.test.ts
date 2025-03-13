import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Friend } from '../models/friend.model';
import { FriendService } from '../services/friend.service';

beforeEach(async () => {
  await User.deleteMany({});
  await Friend.deleteMany({});
});

describe('Friend System', () => {
  let user1: any;
  let user2: any;

  beforeEach(async () => {
    user1 = await User.create({
      username: 'user1',
      email: 'user1@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    user2 = await User.create({
      username: 'user2',
      email: 'user2@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });
  });

  describe('Friend Requests', () => {
    it('should send friend request successfully', async () => {
      await FriendService.sendFriendRequest(
        user1._id.toString(),
        user2._id.toString()
      );

      const request = await Friend.findOne({
        requesterId: user1._id,
        recipientId: user2._id
      });

      expect(request).toBeTruthy();
      expect(request?.requesterId.toString()).toBe(user1._id.toString());
      expect(request?.recipientId.toString()).toBe(user2._id.toString());
      expect(request?.status).toBe('pending');
    });

    it('should not allow duplicate friend requests', async () => {
      await FriendService.sendFriendRequest(
        user1._id.toString(),
        user2._id.toString()
      );

      await expect(
        FriendService.sendFriendRequest(
          user1._id.toString(),
          user2._id.toString()
        )
      ).rejects.toThrow('Friend request already exists');
    });

    it('should accept friend request successfully', async () => {
      await FriendService.sendFriendRequest(
        user1._id.toString(),
        user2._id.toString()
      );

      const request = await Friend.findOne({
        requesterId: user1._id,
        recipientId: user2._id
      });

      await FriendService.acceptFriendRequest(
        request?._id.toString() || '',
        user2._id.toString()
      );

      const acceptedRequest = await Friend.findById(request?._id);
      expect(acceptedRequest?.status).toBe('accepted');

      const user1Updated = await User.findById(user1._id);
      const user2Updated = await User.findById(user2._id);

      expect(user1Updated?.friendIds).toContainEqual(user2._id);
      expect(user2Updated?.friendIds).toContainEqual(user1._id);
    });
  });

  describe('Friend Management', () => {
    beforeEach(async () => {
      await FriendService.sendFriendRequest(
        user1._id.toString(),
        user2._id.toString()
      );

      const request = await Friend.findOne({
        requesterId: user1._id,
        recipientId: user2._id
      });

      await FriendService.acceptFriendRequest(
        request?._id.toString() || '',
        user2._id.toString()
      );
    });

    it('should get friend list correctly', async () => {
      const friendList = await FriendService.getFriendList(user1._id.toString());
      expect(friendList).toHaveLength(1);
      expect(friendList[0]._id.toString()).toBe(user2._id.toString());
    });

    it('should remove friend successfully', async () => {
      await FriendService.removeFriend(
        user1._id.toString(),
        user2._id.toString()
      );

      const user1Updated = await User.findById(user1._id);
      const user2Updated = await User.findById(user2._id);

      expect(user1Updated?.friendIds).not.toContainEqual(user2._id);
      expect(user2Updated?.friendIds).not.toContainEqual(user1._id);
    });
  });

  describe('Blocking System', () => {
    it('should block user successfully', async () => {
      await FriendService.blockUser(
        user1._id.toString(),
        user2._id.toString()
      );

      const user1Updated = await User.findById(user1._id);
      expect(user1Updated?.blockedUserIds).toContainEqual(user2._id);
    });

    it('should prevent friend requests from blocked users', async () => {
      await FriendService.blockUser(
        user1._id.toString(),
        user2._id.toString()
      );

      await expect(
        FriendService.sendFriendRequest(
          user2._id.toString(),
          user1._id.toString()
        )
      ).rejects.toThrow('Cannot send friend request to this user');
    });

    it('should unblock user successfully', async () => {
      await FriendService.blockUser(user1._id.toString(), user2._id.toString());
      await FriendService.unblockUser(user1._id.toString(), user2._id.toString());

      const user1Updated = await User.findById(user1._id);
      expect(user1Updated?.blockedUserIds).not.toContainEqual(user2._id);
    });
  });
}); 