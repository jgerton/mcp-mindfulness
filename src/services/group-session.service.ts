import mongoose from 'mongoose';
import { GroupSession, IGroupSession, IParticipant } from '../models/group-session.model';
import { FriendService } from './friend.service';
import { User } from '../models/user.model';
import { AchievementService } from './achievement.service';
import { ChatService } from './chat.service';

export class GroupSessionService {
  public static async createSession(
    hostId: string,
    meditationId: string,
    title: string,
    scheduledTime: Date,
    duration: number,
    options: {
      description?: string;
      maxParticipants?: number;
      isPrivate?: boolean;
      allowedParticipants?: string[];
    } = {}
  ): Promise<mongoose.Document<unknown, {}, IGroupSession> & IGroupSession & { _id: mongoose.Types.ObjectId }> {
    const now = new Date();
    if (scheduledTime < now) {
      throw new Error('Cannot schedule session in the past');
    }

    const session = await GroupSession.create({
      hostId: new mongoose.Types.ObjectId(hostId),
      meditationId: new mongoose.Types.ObjectId(meditationId),
      title,
      description: options.description,
      scheduledTime,
      duration,
      maxParticipants: options.maxParticipants || 10,
      isPrivate: options.isPrivate || false,
      allowedParticipants: options.allowedParticipants?.map(id => new mongoose.Types.ObjectId(id)) || [],
      participants: []
    });

    return session as mongoose.Document<unknown, {}, IGroupSession> & IGroupSession & { _id: mongoose.Types.ObjectId };
  }

  public static async joinSession(sessionId: string, userId: string): Promise<IGroupSession> {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!session.canUserJoin(userObjectId)) {
      throw new Error('Session is full');
    }

    session.participants.push({
      userId: userObjectId,
      status: 'joined',
      duration: 0,
      joinedAt: new Date(),
      sessionData: {
        durationCompleted: 0,
        startTime: new Date(),
        endTime: undefined
      }
    });

    await session.save();
    return session;
  }

  static async startSession(sessionId: string, hostId: string) {
    const session = await GroupSession.findOne({
      _id: sessionId,
      hostId,
      status: 'scheduled'
    });

    if (!session) {
      throw new Error('Session not found or cannot be started');
    }

    // Add host as participant if not already joined
    const hostParticipant = session.participants.find(p => p.userId.equals(hostId));
    if (!hostParticipant) {
      session.participants.push({
        userId: new mongoose.Types.ObjectId(hostId),
        status: 'joined',
        duration: 0,
        joinedAt: new Date(),
        sessionData: {
          durationCompleted: 0,
          startTime: new Date(),
          endTime: undefined
        }
      });
    }

    session.status = 'in_progress';
    const startTime = new Date();
    
    // Initialize session data for all participants
    for (const p of session.participants) {
      if (p.status === 'joined') {
        p.sessionData = {
          durationCompleted: 0,
          startTime: startTime,
          endTime: undefined
        };
      }
    }

    await session.save();
    return session.populate([
      { path: 'participants.userId', select: 'username' },
      { path: 'meditationId' }
    ]);
  }

  static async completeSession(sessionId: string, userId: string, sessionData: {
    durationCompleted: number;
    moodBefore?: string;
    moodAfter?: string;
  }) {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(p => 
      p.userId.equals(userId) && p.status === 'joined'
    );

    if (!participant) {
      throw new Error('Participant not found or already completed');
    }

    participant.status = 'completed';
    participant.sessionData = {
      durationCompleted: session.duration,
      startTime: new Date(),
      endTime: new Date()
    };
    participant.duration = session.duration;

    // If all participants completed or left, mark session as completed
    const activeParticipants = session.participants.filter(p => p.status === 'joined');
    if (activeParticipants.length === 0) {
      session.status = 'completed';
    }

    await session.save();

    // Process achievements for group meditation
    if (session.participants.length >= 3) {
      await AchievementService.processGroupSession(userId);
    }

    return session;
  }

  static async leaveSession(sessionId: string, userId: string) {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(p => 
      p.userId.equals(userId) && p.status === 'joined'
    );

    if (!participant) {
      throw new Error('Participant not found or already left/completed');
    }

    // Get participant's username for the message
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    participant.status = 'left';
    await session.save();

    // Add system message about participant leaving
    await ChatService.addMessage(
      sessionId,
      userId,
      `${user.username} has left the session`,
      'system'
    );

    return session;
  }

  static async cancelSession(sessionId: string, hostId: string) {
    const session = await GroupSession.findOne({
      _id: sessionId,
      hostId,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (!session) {
      throw new Error('Session not found or cannot be cancelled');
    }

    session.status = 'cancelled';
    await session.save();

    // Add system message about session cancellation
    await ChatService.addMessage(
      sessionId,
      hostId,
      'Session has been cancelled by the host',
      'system'
    );

    return session;
  }

  static async getUpcomingSessions(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const friendIds = await FriendService.getFriendList(userId)
      .then(friends => friends.map(f => 
        f.requesterId.equals(userId) ? f.recipientId : f.requesterId
      ));

    return GroupSession.find({
      scheduledTime: { $gt: new Date() },
      status: 'scheduled',
      $or: [
        { isPrivate: false },
        { hostId: { $in: [userId, ...friendIds] } },
        { allowedParticipants: userId }
      ]
    }).populate([
      { path: 'hostId', select: 'username' },
      { path: 'meditationId' },
      { path: 'participants.userId', select: 'username' }
    ]).sort({ scheduledTime: 1 });
  }

  static async getUserSessions(userId: string): Promise<IGroupSession[]> {
    const sessions = await GroupSession.find({
      $or: [
        { hostId: new mongoose.Types.ObjectId(userId) },
        { 'participants.userId': new mongoose.Types.ObjectId(userId) }
      ]
    }).populate([
      { path: 'hostId', select: 'username' },
      { path: 'meditationId' },
      { path: 'participants.userId', select: 'username' }
    ]).sort({ scheduledTime: -1 }).lean();
    
    // Convert populated ObjectIds to strings for comparison
    return sessions.map(session => ({
      ...session,
      hostId: session.hostId._id || session.hostId
    }));
  }

  static async endSession(sessionId: string, hostId: string): Promise<IGroupSession> {
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.hostId.equals(hostId)) {
      throw new Error('Only the host can end the session');
    }

    if (session.status !== 'in_progress') {
      throw new Error('Session must be in progress to end it');
    }

    session.status = 'completed';
    session.endTime = new Date();
    await session.save();

    // Add system message about session ending
    await ChatService.addSystemMessage(sessionId, 'Session ended by the host');

    return session;
  }
} 