import mongoose from 'mongoose';
import { SessionService } from '../../services/session.service';
import { BaseWellnessSession } from '../../models/base-wellness-session.model';
import { WellnessSessionStatus, WellnessMoodState } from '../../models/base-wellness-session.model';
import { dbHandler } from '../test-utils/db-handler';
import { BaseWellnessSessionTestFactory } from '../factories/base-wellness-session.factory';

jest.mock('../../models/base-wellness-session.model');

describe('SessionService', () => {
  const sessionFactory = new BaseWellnessSessionTestFactory();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('createSession', () => {
    const validSessionData = {
      userId: mockUserId,
      duration: 600,
      moodBefore: WellnessMoodState.Neutral,
      type: 'meditation'
    };

    it('should create a new session successfully', async () => {
      const mockSession = sessionFactory.create({
        userId: new mongoose.Types.ObjectId(mockUserId),
        duration: validSessionData.duration,
        moodBefore: validSessionData.moodBefore
      });

      (BaseWellnessSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.createSession(validSessionData);

      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(mockUserId);
      expect(result.status).toBe(WellnessSessionStatus.Active);
      expect(result.duration).toBe(validSessionData.duration);
      expect(result.moodBefore).toBe(validSessionData.moodBefore);
    });

    it('should throw error for invalid duration', async () => {
      const invalidData = {
        ...validSessionData,
        duration: -1
      };

      await expect(SessionService.createSession(invalidData))
        .rejects.toThrow('Duration must be positive');
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.createSession(validSessionData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();

    it('should return session by ID', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId)
      });

      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.getSession(mockSessionId);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(mockSessionId);
    });

    it('should return null for non-existent session', async () => {
      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue(null);

      const result = await SessionService.getSession(mockSessionId);

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.getSession(mockSessionId))
        .rejects.toThrow('Database error');
    });
  });

  describe('getUserSessions', () => {
    it('should return all sessions for user', async () => {
      const mockSessions = [
        sessionFactory.create({ userId: new mongoose.Types.ObjectId(mockUserId) }),
        sessionFactory.create({ userId: new mongoose.Types.ObjectId(mockUserId) })
      ];

      (BaseWellnessSession.find as jest.Mock).mockResolvedValue(mockSessions);

      const result = await SessionService.getUserSessions(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].userId.toString()).toBe(mockUserId);
      expect(result[1].userId.toString()).toBe(mockUserId);
    });

    it('should handle empty results', async () => {
      (BaseWellnessSession.find as jest.Mock).mockResolvedValue([]);

      const result = await SessionService.getUserSessions(mockUserId);

      expect(result).toHaveLength(0);
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.getUserSessions(mockUserId))
        .rejects.toThrow('Database error');
    });
  });

  describe('updateSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();

    it('should update session successfully', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId)
      });
      const updateData = {
        notes: 'Updated notes',
        moodAfter: WellnessMoodState.Peaceful
      };

      (BaseWellnessSession.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockSession,
        ...updateData
      });

      const result = await SessionService.updateSession(mockSessionId, updateData);

      expect(result.notes).toBe(updateData.notes);
      expect(result.moodAfter).toBe(updateData.moodAfter);
    });

    it('should throw error for non-existent session', async () => {
      (BaseWellnessSession.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(SessionService.updateSession(mockSessionId, { notes: 'test' }))
        .rejects.toThrow('Session not found');
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.updateSession(mockSessionId, { notes: 'test' }))
        .rejects.toThrow('Database error');
    });
  });

  describe('completeSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();

    it('should complete session successfully', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Active
      });

      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue({
        ...mockSession,
        save: jest.fn().mockResolvedValue({
          ...mockSession,
          status: WellnessSessionStatus.Completed,
          endTime: expect.any(Date)
        })
      });

      const result = await SessionService.completeSession(mockSessionId, WellnessMoodState.Peaceful);

      expect(result.status).toBe(WellnessSessionStatus.Completed);
      expect(result.moodAfter).toBe(WellnessMoodState.Peaceful);
      expect(result.endTime).toBeDefined();
    });

    it('should throw error for already completed session', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Completed
      });

      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue(mockSession);

      await expect(SessionService.completeSession(mockSessionId, WellnessMoodState.Peaceful))
        .rejects.toThrow('Session is already completed');
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.completeSession(mockSessionId, WellnessMoodState.Peaceful))
        .rejects.toThrow('Database error');
    });
  });

  describe('abandonSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();

    it('should abandon session successfully', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Active
      });

      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue({
        ...mockSession,
        save: jest.fn().mockResolvedValue({
          ...mockSession,
          status: WellnessSessionStatus.Abandoned,
          endTime: expect.any(Date)
        })
      });

      const result = await SessionService.abandonSession(mockSessionId);

      expect(result.status).toBe(WellnessSessionStatus.Abandoned);
      expect(result.endTime).toBeDefined();
    });

    it('should throw error for already completed session', async () => {
      const mockSession = sessionFactory.create({
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Completed
      });

      (BaseWellnessSession.findById as jest.Mock).mockResolvedValue(mockSession);

      await expect(SessionService.abandonSession(mockSessionId))
        .rejects.toThrow('Cannot abandon completed session');
    });

    it('should handle database errors gracefully', async () => {
      (BaseWellnessSession.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(SessionService.abandonSession(mockSessionId))
        .rejects.toThrow('Database error');
    });
  });
}); 