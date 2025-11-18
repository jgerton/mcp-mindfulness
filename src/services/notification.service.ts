import { Types } from 'mongoose';
import { Notification } from '../models/notification.model';
import { NotificationPreferences } from '../utils/validators';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    return await Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { $set: { read: true } },
      { new: true }
    ).lean();
  }

  static async updatePreferences(userId: string, preferences: NotificationPreferences) {
    return await Notification.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { preferences } },
      { new: true, upsert: true }
    ).lean();
  }

  static async getUnreadCount(userId: string) {
    return await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false
    });
  }

  static async clearAll(userId: string) {
    await Notification.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  static async createNotification(userId: string, message: string, type: string) {
    return await Notification.create({
      userId: new Types.ObjectId(userId),
      message,
      type,
      read: false,
      createdAt: new Date()
    });
  }
} 