import mongoose, { Schema, Document } from 'mongoose';
import { NotificationPreferences } from '../utils/validators';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: string;
  read: boolean;
  preferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['achievement', 'reminder', 'friend_request', 'group_session', 'system']
  },
  read: {
    type: Boolean,
    default: false
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'daily'
    },
    types: [{
      type: String,
      enum: ['achievement', 'reminder', 'friend_request', 'group_session', 'system']
    }],
    enabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Create indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema); 