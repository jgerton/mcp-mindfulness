import { IBaseWellnessSession, WellnessMoodState, WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { getTestObjectId } from '../helpers/db';

type PartialSession = Partial<IBaseWellnessSession>;

export const createTestSessionData = (overrides: PartialSession = {}): Partial<IBaseWellnessSession> => {
  const now = new Date();
  const defaultSession = {
    userId: getTestObjectId(),
    startTime: now,
    duration: 600, // 10 minutes
    status: WellnessSessionStatus.Active,
    moodBefore: WellnessMoodState.Neutral,
    moodAfter: undefined,
    notes: undefined,
    endTime: undefined
  };

  return { ...defaultSession, ...overrides };
};

export const createCompletedTestSessionData = (overrides: PartialSession = {}): Partial<IBaseWellnessSession> => {
  const now = new Date();
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
  
  return createTestSessionData({
    startTime: thirtyMinsAgo,
    endTime: now,
    status: WellnessSessionStatus.Completed,
    moodAfter: WellnessMoodState.Peaceful,
    ...overrides
  });
}; 