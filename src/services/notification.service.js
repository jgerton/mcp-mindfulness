"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = require("mongoose");
const notification_model_1 = require("../models/notification.model");
class NotificationService {
    static async getUserNotifications(userId) {
        return await notification_model_1.Notification.find({ userId: new mongoose_1.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean();
    }
    static async markAsRead(notificationId, userId) {
        return await notification_model_1.Notification.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(notificationId), userId: new mongoose_1.Types.ObjectId(userId) }, { $set: { read: true } }, { new: true }).lean();
    }
    static async updatePreferences(userId, preferences) {
        return await notification_model_1.Notification.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $set: { preferences } }, { new: true, upsert: true }).lean();
    }
    static async getUnreadCount(userId) {
        return await notification_model_1.Notification.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            read: false
        });
    }
    static async clearAll(userId) {
        await notification_model_1.Notification.deleteMany({ userId: new mongoose_1.Types.ObjectId(userId) });
    }
    static async createNotification(userId, message, type) {
        return await notification_model_1.Notification.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            message,
            type,
            read: false,
            createdAt: new Date()
        });
    }
}
exports.NotificationService = NotificationService;
