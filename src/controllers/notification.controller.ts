import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { validateNotificationPreferences } from '../utils/validators';

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const notifications = await NotificationService.getUserNotifications(req.user._id);
      res.json(notifications);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      res.status(500).json({ message });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const notificationId = req.params.id;
      const updatedNotification = await NotificationService.markAsRead(notificationId, req.user._id);

      if (!updatedNotification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }

      res.json(updatedNotification);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      res.status(500).json({ message });
    }
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const preferences = req.body;
      if (!validateNotificationPreferences(preferences)) {
        res.status(400).json({ message: 'Invalid notification preferences' });
        return;
      }

      const updatedPreferences = await NotificationService.updatePreferences(req.user._id, preferences);
      res.json(updatedPreferences);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      res.status(500).json({ message });
    }
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const count = await NotificationService.getUnreadCount(req.user._id);
      res.json({ count });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      res.status(500).json({ message });
    }
  }

  static async clearAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await NotificationService.clearAll(req.user._id);
      res.json({ message: 'All notifications cleared' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      res.status(500).json({ message });
    }
  }
} 