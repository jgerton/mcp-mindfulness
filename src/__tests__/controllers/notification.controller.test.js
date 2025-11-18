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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notification_controller_1 = require("../../controllers/notification.controller");
const notification_service_1 = require("../../services/notification.service");
// Mock services
jest.mock('../../services/notification.service');
describe('NotificationController', () => {
    let mockRequest;
    let mockResponse;
    let mockUser;
    beforeEach(() => {
        mockUser = { _id: new mongoose_1.Types.ObjectId().toString() };
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
        it('should get all notifications for a user', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockNotifications = [
                { _id: new mongoose_1.Types.ObjectId(), userId: mockUser._id, message: 'Test notification 1' },
                { _id: new mongoose_1.Types.ObjectId(), userId: mockUser._id, message: 'Test notification 2' }
            ];
            notification_service_1.NotificationService.getUserNotifications.mockResolvedValue(mockNotifications);
            yield notification_controller_1.NotificationController.getUserNotifications(mockRequest, mockResponse);
            expect(notification_service_1.NotificationService.getUserNotifications).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockNotifications);
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield notification_controller_1.NotificationController.getUserNotifications(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Service error');
            notification_service_1.NotificationService.getUserNotifications.mockRejectedValue(error);
            yield notification_controller_1.NotificationController.getUserNotifications(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('markAsRead', () => {
        const notificationId = new mongoose_1.Types.ObjectId().toString();
        it('should mark a notification as read', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: notificationId };
            const mockUpdatedNotification = {
                _id: notificationId,
                userId: mockUser._id,
                read: true
            };
            notification_service_1.NotificationService.markAsRead.mockResolvedValue(mockUpdatedNotification);
            yield notification_controller_1.NotificationController.markAsRead(mockRequest, mockResponse);
            expect(notification_service_1.NotificationService.markAsRead).toHaveBeenCalledWith(notificationId, mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedNotification);
        }));
        it('should return 404 if notification not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: notificationId };
            notification_service_1.NotificationService.markAsRead.mockResolvedValue(null);
            yield notification_controller_1.NotificationController.markAsRead(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Notification not found' });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            mockRequest.params = { id: notificationId };
            yield notification_controller_1.NotificationController.markAsRead(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
    });
    describe('updatePreferences', () => {
        it('should update notification preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = {
                frequency: 'daily',
                types: ['achievements', 'reminders'],
                enabled: true
            };
            mockRequest.body = preferences;
            const mockUpdatedPreferences = Object.assign(Object.assign({}, preferences), { userId: mockUser._id });
            notification_service_1.NotificationService.updatePreferences.mockResolvedValue(mockUpdatedPreferences);
            yield notification_controller_1.NotificationController.updatePreferences(mockRequest, mockResponse);
            expect(notification_service_1.NotificationService.updatePreferences).toHaveBeenCalledWith(mockUser._id, preferences);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedPreferences);
        }));
        it('should validate notification preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPreferences = {
                frequency: 'invalid',
                types: ['invalid']
            };
            mockRequest.body = invalidPreferences;
            yield notification_controller_1.NotificationController.updatePreferences(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid notification preferences' });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield notification_controller_1.NotificationController.updatePreferences(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
    });
    describe('getUnreadCount', () => {
        it('should get unread notification count', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCount = 5;
            notification_service_1.NotificationService.getUnreadCount.mockResolvedValue(mockCount);
            yield notification_controller_1.NotificationController.getUnreadCount(mockRequest, mockResponse);
            expect(notification_service_1.NotificationService.getUnreadCount).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith({ count: mockCount });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield notification_controller_1.NotificationController.getUnreadCount(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
    });
    describe('clearAll', () => {
        it('should clear all notifications for a user', () => __awaiter(void 0, void 0, void 0, function* () {
            notification_service_1.NotificationService.clearAll.mockResolvedValue({ deleted: 5 });
            yield notification_controller_1.NotificationController.clearAll(mockRequest, mockResponse);
            expect(notification_service_1.NotificationService.clearAll).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'All notifications cleared' });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield notification_controller_1.NotificationController.clearAll(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
    });
});
