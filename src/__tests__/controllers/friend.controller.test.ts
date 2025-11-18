import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { FriendController } from '../../controllers/friend.controller';
import { FriendService } from '../../services/friend.service';
import { AchievementService } from '../../services/achievement.service';
import { FriendTestFactory, FriendRequestTestFactory } from '../factories/social.factory';

// Mock services
jest.mock('../../services/friend.service');
jest.mock('../../services/achievement.service');

describe('FriendController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: { _id: string };
  let friendTestFactory: FriendTestFactory;
  let friendRequestTestFactory: FriendRequestTestFactory;

  beforeEach(() => {
    mockUser = { _id: new Types.ObjectId().toString() };
    mockRequest = {
      user: mockUser,
      body: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    friendTestFactory = new FriendTestFactory();
    friendRequestTestFactory = new FriendRequestTestFactory();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should successfully send a friend request', async () => {
      const recipientId = new Types.ObjectId().toString();
      const mockRequest = friendRequestTestFactory.create({ recipientId });
      
      mockRequest.body = { recipientId };
      (FriendService.sendFriendRequest as jest.Mock).mockResolvedValue(mockRequest);

      await FriendController.sendFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(FriendService.sendFriendRequest).toHaveBeenCalledWith(mockUser._id, recipientId);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRequest);
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {};

      await FriendController.sendFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockRequest.body = { recipientId: new Types.ObjectId().toString() };
      (FriendService.sendFriendRequest as jest.Mock).mockRejectedValue(error);

      await FriendController.sendFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('acceptFriendRequest', () => {
    it('should successfully accept a friend request', async () => {
      const requestId = new Types.ObjectId().toString();
      const mockAcceptedRequest = friendRequestTestFactory.create({ status: 'accepted' });
      
      mockRequest.params = { requestId };
      (FriendService.acceptFriendRequest as jest.Mock).mockResolvedValue(mockAcceptedRequest);

      await FriendController.acceptFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(FriendService.acceptFriendRequest).toHaveBeenCalledWith(mockUser._id, requestId);
      expect(AchievementService.processFriendAchievements).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAcceptedRequest);
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.params = {};

      await FriendController.acceptFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockRequest.params = { requestId: new Types.ObjectId().toString() };
      (FriendService.acceptFriendRequest as jest.Mock).mockRejectedValue(error);

      await FriendController.acceptFriendRequest(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('getFriendList', () => {
    it('should successfully get friend list', async () => {
      const mockFriends = friendTestFactory.batch(3);
      (FriendService.getFriendList as jest.Mock).mockResolvedValue(mockFriends);

      await FriendController.getFriendList(mockRequest as Request, mockResponse as Response);

      expect(FriendService.getFriendList).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFriends);
    });

    it('should return 400 if user ID is missing', async () => {
      mockRequest.user = undefined;

      await FriendController.getFriendList(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (FriendService.getFriendList as jest.Mock).mockRejectedValue(error);

      await FriendController.getFriendList(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('getPendingRequests', () => {
    it('should successfully get pending requests', async () => {
      const mockPendingRequests = friendRequestTestFactory.batch(2).map(req => ({
        ...req,
        status: 'pending'
      }));
      (FriendService.getPendingRequests as jest.Mock).mockResolvedValue(mockPendingRequests);

      await FriendController.getPendingRequests(mockRequest as Request, mockResponse as Response);

      expect(FriendService.getPendingRequests).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPendingRequests);
    });

    it('should return 400 if user ID is missing', async () => {
      mockRequest.user = undefined;

      await FriendController.getPendingRequests(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (FriendService.getPendingRequests as jest.Mock).mockRejectedValue(error);

      await FriendController.getPendingRequests(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('removeFriend', () => {
    it('should successfully remove a friend', async () => {
      const friendId = new Types.ObjectId().toString();
      mockRequest.params = { friendId };
      (FriendService.removeFriend as jest.Mock).mockResolvedValue(undefined);

      await FriendController.removeFriend(mockRequest as Request, mockResponse as Response);

      expect(FriendService.removeFriend).toHaveBeenCalledWith(mockUser._id, friendId);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Friend removed' });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.params = {};

      await FriendController.removeFriend(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockRequest.params = { friendId: new Types.ObjectId().toString() };
      (FriendService.removeFriend as jest.Mock).mockRejectedValue(error);

      await FriendController.removeFriend(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
}); 