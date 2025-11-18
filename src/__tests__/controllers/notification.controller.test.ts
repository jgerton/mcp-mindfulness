import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { NotificationController } from '../../controllers/notification.controller';
import { NotificationService } from '../../services/notification.service';
import { AppError, ErrorCodes, ErrorCategory } from '../../utils/errors';
import { ERROR_MESSAGES, HTTP_STATUS } from '../fixtures/error-responses';
import { createMockRequestContext, createMockUserContext } from '../helpers/error-test.helpers';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

// Mock services
jest.mock('../../services/notification.service');

describe('NotificationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: { _id: string };

  beforeEach(() => {
    mockUser = { _id: new Types.ObjectId().toString() };
    mockRequest = {
      user: mockUser,
      body: {},
      params: {},
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should get all notifications for a user', async () => {
      const mockNotifications = [
        { _id: new Types.ObjectId(), userId: mockUser._id, message: 'Test notification 1' },
        { _id: new Types.ObjectId(), userId: mockUser._id, message: 'Test notification 2' }
      ];
      (NotificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      await NotificationController.getUserNotifications(mockRequest as Request, mockResponse as Response);

      expect(NotificationService.getUserNotifications).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockNotifications);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await NotificationController.getUserNotifications(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      (NotificationService.getUserNotifications as jest.Mock).mockRejectedValue(error);

      await NotificationController.getUserNotifications(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('markAsRead', () => {
    const notificationId = new Types.ObjectId().toString();

    it('should mark a notification as read', async () => {
      mockRequest.params = { id: notificationId };
      const mockUpdatedNotification = { 
        _id: notificationId, 
        userId: mockUser._id, 
        read: true 
      };
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(mockUpdatedNotification);

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response);

      expect(NotificationService.markAsRead).toHaveBeenCalledWith(notificationId, mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedNotification);
    });

    it('should return 404 if notification not found', async () => {
      mockRequest.params = { id: notificationId };
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(null);

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: notificationId };

      await NotificationController.markAsRead(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        frequency: 'daily',
        types: ['achievements', 'reminders'],
        enabled: true
      };
      mockRequest.body = preferences;
      const mockUpdatedPreferences = { ...preferences, userId: mockUser._id };
      (NotificationService.updatePreferences as jest.Mock).mockResolvedValue(mockUpdatedPreferences);

      await NotificationController.updatePreferences(mockRequest as Request, mockResponse as Response);

      expect(NotificationService.updatePreferences).toHaveBeenCalledWith(mockUser._id, preferences);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedPreferences);
    });

    it('should validate notification preferences', async () => {
      const invalidPreferences = {
        frequency: 'invalid',
        types: ['invalid']
      };
      mockRequest.body = invalidPreferences;

      await NotificationController.updatePreferences(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid notification preferences' });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await NotificationController.updatePreferences(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notification count', async () => {
      const mockCount = 5;
      (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(mockCount);

      await NotificationController.getUnreadCount(mockRequest as Request, mockResponse as Response);

      expect(NotificationService.getUnreadCount).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith({ count: mockCount });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await NotificationController.getUnreadCount(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications for a user', async () => {
      (NotificationService.clearAll as jest.Mock).mockResolvedValue({ deleted: 5 });

      await NotificationController.clearAll(mockRequest as Request, mockResponse as Response);

      expect(NotificationService.clearAll).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'All notifications cleared' });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await NotificationController.clearAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });
});