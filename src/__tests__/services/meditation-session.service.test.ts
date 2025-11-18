import mongoose from 'mongoose';
import { MeditationSessionService } from '../../services/meditation-session.service';
import { MeditationSession } from '../../models/meditation-session.model';
import { SessionAnalyticsService } from '../../services/session-analytics.service';
import { WellnessSessionStatus, WellnessMoodState } from '../../models/base-wellness-session.model';
import { MoodType } from '../../models/session-analytics.model';
import { dbHandler } from '../test-utils/db-handler';

jest.mock('../../models/meditation-session.model');
jest.mock('../../services/session-analytics.service');

describe('MeditationSessionService', () => {
  let meditationSessionService: MeditationSessionService;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockMeditationId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    meditationSessionService = new MeditationSessionService();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('startSession', () => {
    const validSessionData = {
      meditationId: mockMeditationId,
      duration: 600,
      durationCompleted: 0,
      completed: false,
      moodBefore: 'calm' as MoodType,
      title: 'Morning Meditation',
      type: 'guided'
    };

    it('should start a new session successfully', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(mockUserId),
        status: WellnessSessionStatus.Active,
        ...validSessionData
      };

      (MeditationSession.create as jest.Mock).mockResolvedValue(mockSession);
      (MeditationSession.findOne as jest.Mock).mockResolvedValue(null);

      const result = await meditationSessionService.startSession(mockUserId, validSessionData);

      expect(result).toEqual({
        sessionId: mockSession._id.toString(),
        status: WellnessSessionStatus.Active
      });
      expect(SessionAnalyticsService.prototype.createSessionAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(mongoose.Types.ObjectId),
          sessionId: mockSession._id,
          meditationId: expect.any(mongoose.Types.ObjectId),
          startTime: expect.any(Date),
          duration: validSessionData.duration
        })
      );
    });

    it('should throw error if active session exists', async () => {
      (MeditationSession.findOne as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        status: WellnessSessionStatus.Active
      });

      await expect(meditationSessionService.startSession(mockUserId, validSessionData))
        .rejects.toThrow('Active session already exists');
    });

    it('should handle database errors gracefully', async () => {
      (MeditationSession.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(meditationSessionService.startSession(mockUserId, validSessionData))
        .rejects.toThrow('Database error');
    });
  });

  describe('endSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();
    const mockEndData = {
      moodAfter: 'peaceful' as MoodType,
      notes: 'Great session'
    };

    it('should end session successfully', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Active,
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        save: jest.fn()
      };

      (MeditationSession.findById as jest.Mock).mockResolvedValue(mockSession);
      mockSession.save.mockResolvedValue({
        ...mockSession,
        status: WellnessSessionStatus.Completed,
        endTime: expect.any(Date)
      });

      await meditationSessionService.endSession(
        mockSessionId,
        mockEndData.moodAfter,
        mockEndData.notes
      );

      expect(mockSession.status).toBe(WellnessSessionStatus.Completed);
      expect(mockSession.endTime).toBeDefined();
      expect(SessionAnalyticsService.prototype.updateSessionAnalytics).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          endTime: expect.any(Date),
          moodAfter: mockEndData.moodAfter,
          notes: mockEndData.notes,
          completed: true
        })
      );
    });

    it('should throw error for non-existent session', async () => {
      (MeditationSession.findById as jest.Mock).mockResolvedValue(null);

      await expect(meditationSessionService.endSession(
        mockSessionId,
        mockEndData.moodAfter,
        mockEndData.notes
      )).rejects.toThrow('Session not found');
    });

    it('should throw error for non-active session', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Completed
      };

      (MeditationSession.findById as jest.Mock).mockResolvedValue(mockSession);

      await expect(meditationSessionService.endSession(
        mockSessionId,
        mockEndData.moodAfter,
        mockEndData.notes
      )).rejects.toThrow('Session is not active');
    });
  });

  describe('completeSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();
    const mockCompleteData = {
      duration: 600,
      durationCompleted: 550,
      completed: true,
      moodAfter: 'peaceful' as MoodType,
      moodBefore: 'neutral' as MoodType,
      interruptions: 2,
      notes: 'Completed with minor interruptions',
      tags: ['morning', 'guided']
    };

    it('should complete session successfully', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Active,
        interruptions: 0,
        save: jest.fn()
      };

      (MeditationSession.findById as jest.Mock).mockResolvedValue(mockSession);
      mockSession.save.mockResolvedValue({
        ...mockSession,
        ...mockCompleteData,
        status: WellnessSessionStatus.Completed,
        endTime: expect.any(Date)
      });

      const result = await meditationSessionService.completeSession(mockSessionId, mockCompleteData);

      expect(result.status).toBe(WellnessSessionStatus.Completed);
      expect(result.durationCompleted).toBe(mockCompleteData.durationCompleted);
      expect(result.interruptions).toBe(mockCompleteData.interruptions);
      expect(SessionAnalyticsService.prototype.updateSessionAnalytics).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining(mockCompleteData)
      );
    });

    it('should throw error for already completed session', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(mockSessionId),
        status: WellnessSessionStatus.Completed
      };

      (MeditationSession.findById as jest.Mock).mockResolvedValue(mockSession);

      await expect(meditationSessionService.completeSession(mockSessionId, mockCompleteData))
        .rejects.toThrow('Session is already completed');
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if exists', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(mockUserId),
        status: WellnessSessionStatus.Active
      };

      (MeditationSession.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await meditationSessionService.getActiveSession(mockUserId);

      expect(result).toBeDefined();
      expect(result.status).toBe(WellnessSessionStatus.Active);
      expect(result.userId.toString()).toBe(mockUserId);
    });

    it('should return null if no active session exists', async () => {
      (MeditationSession.findOne as jest.Mock).mockResolvedValue(null);

      const result = await meditationSessionService.getActiveSession(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('createSession', () => {
    const validCreateData = {
      userId: mockUserId,
      meditationId: mockMeditationId,
      duration: 600,
      type: 'guided',
      title: 'Morning Meditation',
      moodBefore: 'calm' as MoodType
    };

    it('should create a new session successfully', async () => {
      const mockSession = {
        _id: new mongoose.Types.ObjectId(),
        ...validCreateData,
        status: WellnessSessionStatus.Active,
        startTime: expect.any(Date)
      };

      (MeditationSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await meditationSessionService.createSession(validCreateData);

      expect(result).toBeDefined();
      expect(result.status).toBe(WellnessSessionStatus.Active);
      expect(result.type).toBe(validCreateData.type);
      expect(result.duration).toBe(validCreateData.duration);
    });

    it('should create session without optional meditationId', async () => {
      const { meditationId, ...dataWithoutMeditationId } = validCreateData;
      const mockSession = {
        _id: new mongoose.Types.ObjectId(),
        ...dataWithoutMeditationId,
        status: WellnessSessionStatus.Active,
        startTime: expect.any(Date)
      };

      (MeditationSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await meditationSessionService.createSession(dataWithoutMeditationId);

      expect(result).toBeDefined();
      expect(result.meditationId).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      (MeditationSession.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(meditationSessionService.createSession(validCreateData))
        .rejects.toThrow('Database error');
    });
  });
});