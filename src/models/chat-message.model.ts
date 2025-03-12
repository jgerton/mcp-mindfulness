import mongoose from 'mongoose';

export interface IChatMessage {
  sessionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'system';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

const chatMessageSchema = new mongoose.Schema<IChatMessage>(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupSession',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text'
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Create a compound index for efficient message retrieval
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });

// Add virtual field for userId
chatMessageSchema.virtual('userId').get(function() {
  return this.senderId.toString();
});

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema); 