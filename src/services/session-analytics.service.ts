import { SessionAnalytics, ISessionAnalytics } from '../models/session-analytics.model';
import mongoose from 'mongoose';

interface SessionHistory {
  sessions: ISessionAnalytics[];
  totalSessions: number;
  totalPages: number;
}

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  averageFocusScore: number;
  totalInterruptions: number;
}

interface MoodImprovementStats {
  totalImproved: number;
  totalSessions: number;
  improvementRate: number;
}

export class SessionAnalyticsService {
  // Create analytics entry for a new meditation session
  async createSessionAnalytics(data: Partial<ISessionAnalytics>): Promise<ISessionAnalytics> {
    const existingAnalytics = await SessionAnalytics.findOne({ 
      userId: data.userId,
      sessionId: data.sessionId 
    });

    if (existingAnalytics) {
      return await SessionAnalytics.findOneAndUpdate(
        { _id: existingAnalytics._id },
        { $set: data },
        { new: true }
      ) as ISessionAnalytics;
    }

    const analytics = new SessionAnalytics(data);
    return await analytics.save();
  }

  // Update analytics when session ends
  async updateSessionAnalytics(
    sessionId: string,
    data: Partial<ISessionAnalytics>
  ): Promise<ISessionAnalytics | null> {
    return await SessionAnalytics.findOneAndUpdate(
      { sessionId: new mongoose.Types.ObjectId(sessionId) },
      { $set: data },
      { new: true }
    );
  }

  // Get user's session history with pagination
  async getUserSessionHistory(
    userId: string,
    options: { page: number; limit: number }
  ): Promise<SessionHistory> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const [sessions, totalCount] = await Promise.all([
      SessionAnalytics.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit),
      SessionAnalytics.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    ]);

    return {
      sessions,
      totalSessions: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  // Get user's meditation stats for a time period
  async getUserStats(userId: string): Promise<UserStats> {
    const stats = await SessionAnalytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: '$durationCompleted' },
          averageFocusScore: { $avg: '$focusScore' },
          totalInterruptions: { $sum: '$interruptions' }
        }
      }
    ]);

    return stats[0] || {
      totalSessions: 0,
      totalMinutes: 0,
      averageFocusScore: 0,
      totalInterruptions: 0
    };
  }

  // Get mood improvement stats
  async getMoodImprovementStats(userId: string, startTime: Date): Promise<MoodImprovementStats> {
    const sessions = await SessionAnalytics.find({
      userId: new mongoose.Types.ObjectId(userId),
      startTime: { $gte: startTime }
    });

    const totalSessions = sessions.length;
    const totalImproved = sessions.filter(session => {
      if (!session.moodBefore || !session.moodAfter) return false;
      const moodValues = {
        anxious: 1,
        stressed: 2,
        neutral: 3,
        calm: 4,
        peaceful: 5
      };
      return moodValues[session.moodAfter as keyof typeof moodValues] > moodValues[session.moodBefore as keyof typeof moodValues];
    }).length;

    return {
      totalImproved,
      totalSessions,
      improvementRate: totalSessions > 0 ? (totalImproved / totalSessions) * 100 : 0
    };
  }

  // Find a single session analytics document
  async findOne(filter: mongoose.FilterQuery<ISessionAnalytics>): Promise<ISessionAnalytics | null> {
    return await SessionAnalytics.findOne(filter);
  }
} 