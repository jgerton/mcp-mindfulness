import mongoose from 'mongoose';

export interface IFriendRequest {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate for requester and recipient
friendRequestSchema.virtual('requester', {
  ref: 'User',
  localField: 'requesterId',
  foreignField: '_id',
  justOne: true
});

friendRequestSchema.virtual('recipient', {
  ref: 'User',
  localField: 'recipientId',
  foreignField: '_id',
  justOne: true
});

// Prevent duplicate friend requests
friendRequestSchema.index(
  { requesterId: 1, recipientId: 1 },
  { unique: true }
);

export const FriendRequest = mongoose.model<IFriendRequest>(
  'FriendRequest',
  friendRequestSchema
); 