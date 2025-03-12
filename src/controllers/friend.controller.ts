import { Request, Response } from 'express';
import { FriendService } from '../services/friend.service';
import { AchievementService } from '../services/achievement.service';

export class FriendController {
  static async sendFriendRequest(req: Request, res: Response) {
    try {
      const { recipientId } = req.body;
      const requesterId = req.user?._id;

      if (!requesterId || !recipientId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const request = await FriendService.sendFriendRequest(
        requesterId.toString(),
        recipientId
      );

      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async acceptFriendRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?._id;

      if (!userId || !requestId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const request = await FriendService.acceptFriendRequest(
        userId.toString(),
        requestId
      );

      // Process achievements when a friend request is accepted
      await AchievementService.processFriendAchievements(userId.toString());

      res.json(request);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async rejectFriendRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?._id;

      if (!userId || !requestId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      await FriendService.rejectFriendRequest(userId.toString(), requestId);
      res.json({ message: 'Friend request rejected' });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getFriendList(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const friends = await FriendService.getFriendList(userId.toString());
      res.json(friends);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getPendingRequests(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const requests = await FriendService.getPendingRequests(userId.toString());
      res.json(requests);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async blockUser(req: Request, res: Response) {
    try {
      const { targetUserId } = req.params;
      const userId = req.user?._id;

      if (!userId || !targetUserId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const block = await FriendService.blockUser(
        userId.toString(),
        targetUserId
      );

      res.json(block);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async unblockUser(req: Request, res: Response) {
    try {
      const { targetUserId } = req.params;
      const userId = req.user?._id;

      if (!userId || !targetUserId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      await FriendService.unblockUser(userId.toString(), targetUserId);
      res.json({ message: 'User unblocked' });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getBlockedUsers(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const blockedUsers = await FriendService.getBlockedUsers(userId.toString());
      res.json(blockedUsers);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async removeFriend(req: Request, res: Response) {
    try {
      const { friendId } = req.params;
      const userId = req.user?._id;

      if (!userId || !friendId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      await FriendService.removeFriend(userId.toString(), friendId);
      res.json({ message: 'Friend removed' });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
} 