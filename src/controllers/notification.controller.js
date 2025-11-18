"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const validators_1 = require("../utils/validators");
class NotificationController {
    static async getUserNotifications(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const notifications = await notification_service_1.NotificationService.getUserNotifications(req.user._id);
            res.json(notifications);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            res.status(500).json({ message });
        }
    }
    static async markAsRead(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const notificationId = req.params.id;
            const updatedNotification = await notification_service_1.NotificationService.markAsRead(notificationId, req.user._id);
            if (!updatedNotification) {
                res.status(404).json({ message: 'Notification not found' });
                return;
            }
            res.json(updatedNotification);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            res.status(500).json({ message });
        }
    }
    static async updatePreferences(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const preferences = req.body;
            if (!(0, validators_1.validateNotificationPreferences)(preferences)) {
                res.status(400).json({ message: 'Invalid notification preferences' });
                return;
            }
            const updatedPreferences = await notification_service_1.NotificationService.updatePreferences(req.user._id, preferences);
            res.json(updatedPreferences);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            res.status(500).json({ message });
        }
    }
    static async getUnreadCount(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const count = await notification_service_1.NotificationService.getUnreadCount(req.user._id);
            res.json({ count });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            res.status(500).json({ message });
        }
    }
    static async clearAll(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            await notification_service_1.NotificationService.clearAll(req.user._id);
            res.json({ message: 'All notifications cleared' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred';
            res.status(500).json({ message });
        }
    }
}
exports.NotificationController = NotificationController;
