import mongoose from 'mongoose';
import { SessionAnalyticsService } from './session-analytics.service';
import { IMeditationSession, MeditationSession } from '../models/meditation-session.model';
import { MoodType } from '../models/session-analytics.model';
import { SessionAnalytics, ISessionAnalytics } from '../models/session-analytics.model';
import { NotFoundError, ValidationError, BadRequestError } from '../utils/errors';
import { ErrorCodes } from '../utils/error-codes';
import { WellnessSessionStatus, WellnessMoodState } from '../models/base-wellness-session.model';
import { Types } from 'mongoose';
import { SessionStatus } from '../types/session.types';

interface MoodMap {
  [key: string]: WellnessMoodState;
  stressed: WellnessMoodState;
  anxious: WellnessMoodState;
  neutral: WellnessMoodState;
  calm: WellnessMoodState;
  peaceful: WellnessMoodState;
  energized: WellnessMoodState;
}

const moodMap: MoodMap = {
  stressed: WellnessMoodState.Stressed,
  anxious: WellnessMoodState.Anxious,
  neutral: WellnessMoodState.Neutral,
  calm: WellnessMoodState.Calm,
  peaceful: WellnessMoodState.Peaceful,
  energized: WellnessMoodState.Energized,
};

const moodValues: Record<WellnessMoodState, number> = {
  [WellnessMoodState.Stressed]: 1,
  [WellnessMoodState.Anxious]: 2,
  [WellnessMoodState.Neutral]: 3,
  [WellnessMoodState.Calm]: 4,
  [WellnessMoodState.Peaceful]: 5,
  [WellnessMoodState.Energized]: 6,
};

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
      throw new ValidationError('Active session already exists');
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
      throw new NotFoundError('Session not found');
    }

    if (session.status !== WellnessSessionStatus.Active) {
      throw new BadRequestError('Session is not active');
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
      throw new NotFoundError('Session not found');
    }

    if (session.status !== WellnessSessionStatus.Active) {
      throw new BadRequestError('Session is not active');
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
      throw new NotFoundError('Session not found');
    }

    if (session.status === WellnessSessionStatus.Completed) {
      throw new ValidationError('Session is already completed');
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
  private convertMoodType(mood: string | undefined): WellnessMoodState | undefined {
    if (!mood) return undefined;
    return moodMap[mood.toLowerCase()];
  }

  async createSession(data: {
    userId: string | mongoose.Types.ObjectId;
    meditationId?: string | mongoose.Types.ObjectId;
    duration: number;
    type: string;
    title?: string;
    moodBefore?: MoodType;
  }): Promise<IMeditationSession> {
    const userId = typeof data.userId === 'string' ? new mongoose.Types.ObjectId(data.userId) : data.userId;
    const meditationId = data.meditationId ? 
      (typeof data.meditationId === 'string' ? new mongoose.Types.ObjectId(data.meditationId) : data.meditationId) : 
      undefined;

    const session = await MeditationSession.create({
      userId,
      meditationId,
      startTime: new Date(),
      duration: data.duration,
      type: data.type,
      title: data.title,
      moodBefore: this.convertMoodType(data.moodBefore),
      status: WellnessSessionStatus.Active
    });

    return session;
  }

  async getUserSessions(userId: string, limit: number = 10): Promise<IMeditationSession[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    return await MeditationSession.find({ userId })
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  static async createSession(data: any): Promise<IMeditationSession> {
    const service = new MeditationSessionService();
    return service.createSession(data);
  }

  static async getUserSessions(userId: string, limit: number = 10): Promise<IMeditationSession[]> {
    const service = new MeditationSessionService();
    return service.getUserSessions(userId, limit);
  }

  static async recordInterruption(sessionId: string): Promise<IMeditationSession | null> {
    const service = new MeditationSessionService();
    await service.recordInterruption(sessionId);
    return MeditationSession.findById(sessionId);
  }

  async getAllSessions(userId: string, query: any): Promise<IMeditationSession[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    // Apply filters based on query parameters
    if (query.status) {
      filter.status = query.status;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.startDate || query.endDate) {
      filter.startTime = {};
      if (query.startDate) {
        filter.startTime.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.startTime.$lte = new Date(query.endDate);
      }
    }

    // Apply sorting
    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.startTime = -1; // Default sort by start time descending
    }

    // Apply pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    return await MeditationSession.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getSessionById(sessionId: string): Promise<IMeditationSession> {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestError('Invalid session ID');
    }

    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return session;
  }

  async updateSession(sessionId: string, userId: string, data: any): Promise<IMeditationSession | null> {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestError('Invalid session ID');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    const session = await MeditationSession.findOne({
      _id: sessionId,
      userId: userId
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Update allowed fields
    if (data.duration) session.duration = data.duration;
    if (data.type) session.type = data.type;
    if (data.title) session.title = data.title;
    if (data.notes) session.notes = data.notes;
    if (data.moodBefore) session.moodBefore = this.convertMoodType(data.moodBefore);
    if (data.moodAfter) session.moodAfter = this.convertMoodType(data.moodAfter);

    await session.save();
    return session;
  }

  async getUserStats(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    const sessions = await MeditationSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: WellnessSessionStatus.Completed
    });

    if (!sessions.length) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        mostCommonType: null,
        moodImprovementRate: 0
      };
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    const averageDuration = totalMinutes / totalSessions;
    const currentStreak = await this.calculateStreak(userId);

    // Calculate completion rate
    const allSessions = await MeditationSession.find({ userId: new mongoose.Types.ObjectId(userId) });
    const completionRate = (sessions.length / allSessions.length) * 100;

    // Find most common type
    const typeCount: { [key: string]: number } = {};
    sessions.forEach(session => {
      if (session.type) {
        typeCount[session.type] = (typeCount[session.type] || 0) + 1;
      }
    });
    const mostCommonType = Object.entries(typeCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Calculate mood improvement rate
    const sessionsWithMood = sessions.filter(session => session.moodBefore && session.moodAfter);
    const improvedSessions = sessionsWithMood.filter(session => this.hasMoodImproved(session));
    const moodImprovementRate = sessionsWithMood.length > 0 
      ? (improvedSessions.length / sessionsWithMood.length) * 100 
      : 0;

    return {
      totalSessions,
      totalMinutes,
      averageDuration,
      currentStreak,
      completionRate,
      mostCommonType,
      moodImprovementRate
    };
  }

  async updateSessionStatus(sessionId: string, status: WellnessSessionStatus): Promise<IMeditationSession> {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestError('Invalid session ID');
    }

    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    session.status = status;
    await session.save();

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestError('Invalid session ID');
    }

    const session = await MeditationSession.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    await session.deleteOne();
  }

  async calculateStreak(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user ID');
    }

    const sessions = await MeditationSession.find({
      userId,
      status: WellnessSessionStatus.Completed
    })
      .sort({ startTime: -1 })
      .exec();

    if (sessions.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sessions[0].startTime);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const dayDifference = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference === 1) {
        streak++;
        currentDate = sessionDate;
      } else if (dayDifference > 1) {
        break;
      }
    }

    return streak;
  }

  private hasMoodImproved(session: IMeditationSession): boolean {
    if (!session.moodBefore || !session.moodAfter) return false;
    return moodValues[session.moodAfter] > moodValues[session.moodBefore];
  }
} 