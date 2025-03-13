import mongoose from 'mongoose';

export interface IFriend {
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const friendSchema = new mongoose.Schema<IFriend>({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique friend relationships
friendSchema.index(
  { requesterId: 1, recipientId: 1 },
  { unique: true }
);

// Add index for querying friend lists
friendSchema.index({ status: 1 });

// Static method to get user's friends
friendSchema.statics.getFriends = async function(userId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { requesterId: userId, status: 'accepted' },
      { recipientId: userId, status: 'accepted' }
    ]
  }).populate('requesterId recipientId', 'username');
};

// Static method to get pending friend requests
friendSchema.statics.getPendingRequests = async function(userId: mongoose.Types.ObjectId) {
  return this.find({
    recipientId: userId,
    status: 'pending'
  }).populate('requesterId', 'username');
};

export const Friend = mongoose.model<IFriend>('Friend', friendSchema); 