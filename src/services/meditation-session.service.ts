import mongoose from 'mongoose';
import { SessionAnalyticsService } from './session-analytics.service';
import { IMeditationSession, MeditationSession } from '../models/meditation-session.model';
import { MoodType } from '../models/session-analytics.model';
import { SessionAnalytics, ISessionAnalytics } from '../models/session-analytics.model';
import { SessionError, NotFoundError } from '../utils/errors';
import { ErrorCodes } from '../utils/error-codes';
import { WellnessSessionStatus, WellnessMoodState } from '../models/base-wellness-session.model';

export class MeditationSessionService {
  private sessionAnalyticsService: SessionAnalyticsService;

  constructor() {
    this.sessionAnalyticsService = new SessionAnalyticsService();
  }

  async startSession(userId: string, data: {
    meditationId: string;
    duration: number;
    durationCompleted?: number;
    completed: boolean;
    moodBefore?: MoodType;
    title?: string;
    type?: string;
  }): Promise<{ sessionId: string; status: string }> {
    const activeSession = await this.getActiveSession(userId);
    if (activeSession) {
      throw new SessionError(
        'Active session already exists',
        ErrorCodes.SESSION_ALREADY_EXISTS,
        { userId }
      );
    }

    const session = await MeditationSession.create({
      userId: new mongoose.Types.ObjectId(userId),
      meditationId: new mongoose.Types.ObjectId(data.meditationId),
      startTime: new Date(),
      duration: data.duration,
      durationCompleted: data.durationCompleted || 0,
      interruptions: 0,
      completed: data.completed,
      moodBefore: this.convertMoodType(data.moodBefore),
      title: data.title,
      type: data.type,
      status: WellnessSessionStatus.Active
    }) as unknown as IMeditationSession & { _id: mongoose.Types.ObjectId };

    // Initialize analytics
    await this.sessionAnalyticsService.createSessionAnalytics({
      userId: new mongoose.Types.ObjectId(userId),
      sessionId: session._id,
      meditationId: new mongoose.Types.ObjectId(data.meditationId),
      startTime: session.startTime,
      duration: data.duration,
      durationCompleted: data.durationCompleted || 0,
      completed: data.completed,
      moodBefore: data.moodBefore,
      interruptions: 0,
      maintainedStreak: false
    });

    return {
      sessionId: session._id.toString(),
      status: session.status || WellnessSessionStatus.Active
    };
  }

  async recordInterruption(sessionId: string): Promise<void> {
    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found', { sessionId });
    }

    if (session.status !== WellnessSessionStatus.Active) {
      throw new SessionError(
        'Session is not active',
        ErrorCodes.SESSION_NOT_ACTIVE,
        { sessionId, currentStatus: session.status }
      );
    }

    session.interruptions = (session.interruptions || 0) + 1;
    await session.save();

    await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
      interruptions: session.interruptions
    });
  }

  async endSession(
    sessionId: string,
    moodAfter: MoodType,
    notes?: string
  ): Promise<void> {
    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== WellnessSessionStatus.Active) {
      throw new Error('Session is not active');
    }

    const endTime = new Date();
    const durationCompleted = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000);

    session.status = WellnessSessionStatus.Completed;
    session.endTime = endTime;
    session.durationCompleted = durationCompleted;
    await session.save();

    const focusScore = this.calculateFocusScore(session);

    await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
      endTime,
      moodAfter,
      notes,
      completed: true,
      focusScore,
      durationCompleted
    });
  }

  async getActiveSession(userId: string): Promise<IMeditationSession | null> {
    return MeditationSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: WellnessSessionStatus.Active
    });
  }

  private calculateFocusScore(session: IMeditationSession): number {
    const baseScore = 100;
    const interruptionPenalty = 5;
    const score = baseScore - (session.interruptions || 0) * interruptionPenalty;
    return Math.max(0, Math.min(100, score));
  }

  async completeSession(sessionId: string, data: {
    duration: number;
    durationCompleted: number;
    completed: boolean;
    moodAfter: MoodType;
    focusScore?: number;
    moodBefore?: MoodType;
    interruptions?: number;
    notes?: string;
    tags?: string[];
  }): Promise<IMeditationSession> {
    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found', { sessionId });
    }

    if (session.status === WellnessSessionStatus.Completed) {
      throw new SessionError(
        'Session is already completed',
        ErrorCodes.SESSION_ALREADY_COMPLETED,
        { sessionId }
      );
    }

    const endTime = new Date();
    const focusScore = this.calculateFocusScore(session);

    session.endTime = endTime;
    session.status = WellnessSessionStatus.Completed;
    session.completed = data.completed;
    session.duration = data.duration;
    session.durationCompleted = data.durationCompleted;
    session.moodAfter = this.convertMoodType(data.moodAfter);
    session.interruptions = data.interruptions || session.interruptions;
    session.notes = data.notes;

    await session.save();

    // Update analytics
    await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
      endTime,
      duration: data.duration,
      durationCompleted: data.durationCompleted,
      moodBefore: data.moodBefore,
      moodAfter: data.moodAfter,
      interruptions: session.interruptions,
      notes: data.notes,
      completed: data.completed,
      focusScore
    });

    return session;
  }

  // Helper method to convert between mood types
  private convertMoodType(mood?: MoodType): WellnessMoodState | undefined {
    if (!mood) return undefined;
    
    const moodMap: Record<MoodType, WellnessMoodState> = {
      'anxious': WellnessMoodState.Anxious,
      'stressed': WellnessMoodState.Stressed,
      'neutral': WellnessMoodState.Neutral,
      'calm': WellnessMoodState.Calm,
      'peaceful': WellnessMoodState.Peaceful
    };
    
    return moodMap[mood];
  }

  // Add these methods to fix the test failures
  async createSession(data: {
    userId: mongoose.Types.ObjectId;
    duration: number;
    type: string;
    title?: string;
  }): Promise<IMeditationSession> {
    const session = await MeditationSession.create({
      userId: data.userId,
      title: data.title || 'Meditation Session',
      type: data.type,
      startTime: new Date(),
      duration: data.duration,
      durationCompleted: 0,
      status: WellnessSessionStatus.Active,
      interruptions: 0,
      completed: false,
      // Add any other required fields
    });
    
    return session;
  }

  async getUserSessions(userId: mongoose.Types.ObjectId): Promise<IMeditationSession[]> {
    return MeditationSession.find({ userId });
  }

  static async recordInterruption(sessionId: string): Promise<IMeditationSession | null> {
    const session = await MeditationSession.findById(sessionId) as IMeditationSession & mongoose.Document;
    if (!session) return null;

    session.interruptions = (session.interruptions || 0) + 1;
    await session.save();

    await SessionAnalytics.findOneAndUpdate(
      { sessionId: session._id },
      { $inc: { interruptions: 1 } }
    );

    return session;
  }

  async getAllSessions(userId: string, query: any): Promise<IMeditationSession[]> {
    const filter: any = {
      userId: new mongoose.Types.ObjectId(userId)
    };

    if (query.completed !== undefined) {
      filter.completed = query.completed;
    }

    if (query.meditationId) {
      filter.meditationId = new mongoose.Types.ObjectId(query.meditationId);
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.startDate) {
      filter.startTime = { $gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      filter.endTime = { $lte: new Date(query.endDate) };
    }

    if (query.minDuration) {
      filter.duration = { $gte: query.minDuration };
    }

    if (query.maxDuration) {
      filter.duration = { ...filter.duration, $lte: query.maxDuration };
    }

    if (query.moodBefore) {
      filter.moodBefore = query.moodBefore;
    }

    if (query.moodAfter) {
      filter.moodAfter = query.moodAfter;
    }

    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.startTime = -1; // Default sort by start time descending
    }

    return MeditationSession.find(filter).sort(sort).limit(query.limit || 50);
  }

  async getSessionById(sessionId: string, userId: string): Promise<IMeditationSession | null> {
    return MeditationSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });
  }

  async updateSession(sessionId: string, userId: string, data: any): Promise<IMeditationSession | null> {
    const session = await MeditationSession.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: new mongoose.Types.ObjectId(userId)
      },
      { $set: data },
      { new: true }
    );

    if (!session) {
      return null;
    }

    // Update analytics if session is completed
    if (data.completed) {
      await SessionAnalytics.findOneAndUpdate(
        { sessionId: new mongoose.Types.ObjectId(sessionId) },
        { $set: data }
      );
    }

    return session;
  }

  async getUserStats(userId: string): Promise<any> {
    const totalSessions = await MeditationSession.countDocuments({
      userId: new mongoose.Types.ObjectId(userId)
    });

    const completedSessions = await MeditationSession.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    const totalDuration = await MeditationSession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completed: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' }
        }
      }
    ]);

    const averageDuration = await MeditationSession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completed: true
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$duration' }
        }
      }
    ]);

    return {
      totalSessions,
      completedSessions,
      totalDuration: totalDuration[0]?.total || 0,
      averageDuration: averageDuration[0]?.average || 0
    };
  }
} 