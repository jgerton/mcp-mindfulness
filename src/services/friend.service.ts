import mongoose from 'mongoose';
import { Friend } from '../models/friend.model';
import { User } from '../models/user.model';

export class FriendService {
  public static async sendFriendRequest(requesterId: string, recipientId: string): Promise<void> {
    const requester = await User.findById(requesterId);
    const recipient = await User.findById(recipientId);

    if (!requester || !recipient) {
      throw new Error('User not found');
    }

    if (requester.blockedUserIds.includes(recipient._id) || recipient.blockedUserIds.includes(requester._id)) {
      throw new Error('Cannot send friend request to this user');
    }

    if (requester.friendIds.includes(recipient._id)) {
      throw new Error('Users are already friends');
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { requesterId: requester._id, recipientId: recipient._id },
        { requesterId: recipient._id, recipientId: requester._id }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    await Friend.create({
      requesterId: requester._id,
      recipientId: recipient._id,
      status: 'pending'
    });
  }

  public static async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    const request = await Friend.findById(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Friend request not found');
    }

    if (request.recipientId.toString() !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    const requester = await User.findById(request.requesterId);
    const recipient = await User.findById(request.recipientId);

    if (!requester || !recipient) {
      throw new Error('User not found');
    }

    // Update friend request status
    request.status = 'accepted';
    await request.save();

    // Add users to each other's friend lists
    if (!requester.friendIds) requester.friendIds = [];
    if (!recipient.friendIds) recipient.friendIds = [];

    requester.friendIds.push(recipient._id);
    recipient.friendIds.push(requester._id);

    await requester.save();
    await recipient.save();
  }

  public static async getFriendList(userId: string): Promise<any[]> {
    const user = await User.findById(userId).populate('friendIds');
    if (!user) {
      throw new Error('User not found');
    }
    return user.friendIds || [];
  }

  public static async removeFriend(userId: string, friendId: string): Promise<void> {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    if (!user.friendIds.includes(friend._id)) {
      throw new Error('Users are not friends');
    }

    user.friendIds = user.friendIds.filter(id => !id.equals(friend._id));
    friend.friendIds = friend.friendIds.filter(id => !id.equals(user._id));

    await user.save();
    await friend.save();

    // Remove any friend requests
    await Friend.deleteMany({
      $or: [
        { requesterId: user._id, recipientId: friend._id },
        { requesterId: friend._id, recipientId: user._id }
      ]
    });
  }

  public static async blockUser(userId: string, targetUserId: string): Promise<void> {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      throw new Error('User not found');
    }

    if (!user.blockedUserIds) user.blockedUserIds = [];
    user.blockedUserIds.push(targetUser._id);

    // Remove from friends if they were friends
    if (user.friendIds.includes(targetUser._id)) {
      user.friendIds = user.friendIds.filter(id => !id.equals(targetUser._id));
      targetUser.friendIds = targetUser.friendIds.filter(id => !id.equals(user._id));
      await targetUser.save();
    }

    // Remove any friend requests
    await Friend.deleteMany({
      $or: [
        { requesterId: user._id, recipientId: targetUser._id },
        { requesterId: targetUser._id, recipientId: user._id }
      ]
    });

    await user.save();
  }

  public static async unblockUser(userId: string, targetUserId: string): Promise<void> {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      throw new Error('User not found');
    }

    user.blockedUserIds = user.blockedUserIds.filter(id => !id.equals(targetUser._id));
    await user.save();
  }

  static async getPendingRequests(userId: string) {
    return Friend.find({
      recipientId: userId,
      status: 'pending'
    }).populate('requesterId', 'username');
  }

  static async getBlockedUsers(userId: string) {
    return Friend.find({
      requesterId: userId,
      status: 'blocked'
    }).populate('recipientId', 'username');
  }

  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await Friend.findOne({
      $or: [
        { requesterId: userId1, recipientId: userId2, status: 'accepted' },
        { requesterId: userId2, recipientId: userId1, status: 'accepted' }
      ]
    });

    return !!friendship;
  }
} 