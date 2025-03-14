import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { SessionAnalytics } from '../../models/session-analytics.model';
import type { MoodType } from '../../models/session-analytics.model';

export const createTestUser = () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const authToken = jwt.sign({ id: userId }, config.jwtSecret);
  return { userId, authToken };
};

export const createTestSession = async (
  userId: string,
  options: {
    completed?: boolean;
    focusScore?: number;
    moodBefore?: MoodType;
    moodAfter?: MoodType;
    duration?: number;
    startTime?: Date;
  } = {}
) => {
  const {
    completed = true,
    focusScore = 90,
    moodBefore = 'neutral',
    moodAfter = 'peaceful',
    duration = 15,
    startTime = new Date()
  } = options;

  const session = new SessionAnalytics({
    userId: new mongoose.Types.ObjectId(userId),
    sessionId: new mongoose.Types.ObjectId(),
    meditationId: new mongoose.Types.ObjectId(),
    startTime,
    endTime: new Date(startTime.getTime() + duration * 60000),
    duration,
    completed,
    focusScore,
    moodBefore,
    moodAfter,
    interruptions: 0,
    maintainedStreak: completed
  });

  await session.save();
  return session;
};

export const createTestSessions = async (
  userId: string,
  count: number,
  baseOptions: {
    completed?: boolean;
    focusScore?: number;
    moodBefore?: string;
    moodAfter?: string;
    duration?: number;
  } = {}
) => {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const startTime = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const session = await createTestSession(userId, {
      ...baseOptions,
      startTime
    });
    sessions.push(session);
  }
  return sessions;
};

export const clearDatabase = async () => {
  await SessionAnalytics.deleteMany({});
};

export const setupTestDB = () => {
  afterEach(async () => {
    await clearDatabase();
  });
}; 