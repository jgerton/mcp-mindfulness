import mongoose from 'mongoose';
import { ChatMessage, IChatMessage } from '../models/chat-message.model';
import { GroupSession, IGroupSession } from '../models/group-session.model';
import { User } from '../models/user.model';

export class ChatService {
  static async addMessage(
    sessionId: string,
    senderId: string,
    content: string,
    type: 'text' | 'system' = 'text'
  ): Promise<IChatMessage> {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Don't allow messages in cancelled sessions unless it's a system message
    if (session.status === 'cancelled' && type !== 'system') {
      throw new Error('Cannot send messages in a cancelled session');
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      throw new Error('User not found');
    }

    // Check if user is a participant in the session
    const participant = session.participants.find(p => p.userId.equals(senderId));
    const isParticipant = participant && participant.status === 'joined';
    if (!isParticipant && !session.hostId.equals(senderId) && type !== 'system') {
      throw new Error('User is not a participant in this session');
    }

    const message = await ChatMessage.create({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      senderId: new mongoose.Types.ObjectId(senderId),
      content,
      type
    });

    return message.populate([
      { path: 'senderId', select: 'username' }
    ]);
  }

  static async getSessionMessages(
    sessionId: string,
    options: {
      limit?: number;
      before?: Date;
    } = {}
  ): Promise<IChatMessage[]> {
    const query: any = { sessionId: new mongoose.Types.ObjectId(sessionId) };
    
    if (options.before) {
      query.createdAt = { $lt: options.before };
    }

    return ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 50)
      .populate('senderId', 'username');
  }

  static async addSystemMessage(
    sessionId: string,
    content: string
  ): Promise<IChatMessage> {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const message = await ChatMessage.create({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      senderId: session.hostId, // Use host's ID for system messages
      content,
      type: 'system'
    });

    return message;
  }

  static async getSessionParticipants(sessionId: string): Promise<IGroupSession> {
    const session = await GroupSession.findById(sessionId).populate('participants.userId', 'username');
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }
} 