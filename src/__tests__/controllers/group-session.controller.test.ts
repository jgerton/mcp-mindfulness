import { Request, Response } from 'express';
import { GroupSessionController } from '../../controllers/group-session.controller';
import { GroupSessionService } from '../../services/group-session.service';
import { Types } from 'mongoose';

jest.mock('../../services/group-session.service');

describe('GroupSessionController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockUserId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockReq = {
      user: { _id: mockUserId },
      params: {},
      body: {},
      query: {}
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    const mockSessionData = {
      meditationId: new Types.ObjectId().toString(),
      title: 'Morning Meditation',
      scheduledTime: new Date().toISOString(),
      duration: 30,
      description: 'Group meditation session',
      maxParticipants: 10,
      isPrivate: false,
      allowedParticipants: []
    };

    it('should create a session successfully', async () => {
      mockReq.body = mockSessionData;
      const mockSession = { ...mockSessionData, _id: new Types.ObjectId().toString() };
      jest.spyOn(GroupSessionService, 'createSession').mockResolvedValue(mockSession);

      await GroupSessionController.createSession(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.createSession).toHaveBeenCalledWith(
        mockUserId,
        mockSessionData.meditationId,
        mockSessionData.title,
        expect.any(Date),
        mockSessionData.duration,
        {
          description: mockSessionData.description,
          maxParticipants: mockSessionData.maxParticipants,
          isPrivate: mockSessionData.isPrivate,
          allowedParticipants: mockSessionData.allowedParticipants
        }
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.body = { title: 'Incomplete Session' };

      await GroupSessionController.createSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should handle service errors', async () => {
      mockReq.body = mockSessionData;
      const error = new Error('Service error');
      jest.spyOn(GroupSessionService, 'createSession').mockRejectedValue(error);

      await GroupSessionController.createSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('joinSession', () => {
    const sessionId = new Types.ObjectId().toString();

    it('should join session successfully', async () => {
      mockReq.params = { sessionId };
      const mockSession = { _id: sessionId, participants: [mockUserId] };
      jest.spyOn(GroupSessionService, 'joinSession').mockResolvedValue(mockSession);

      await GroupSessionController.joinSession(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.joinSession).toHaveBeenCalledWith(sessionId, mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.user = undefined;

      await GroupSessionController.joinSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('startSession', () => {
    const sessionId = new Types.ObjectId().toString();

    it('should start session successfully', async () => {
      mockReq.params = { sessionId };
      const mockSession = { _id: sessionId, status: 'in-progress' };
      jest.spyOn(GroupSessionService, 'startSession').mockResolvedValue(mockSession);

      await GroupSessionController.startSession(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.startSession).toHaveBeenCalledWith(sessionId, mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.params = {};

      await GroupSessionController.startSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('completeSession', () => {
    const sessionId = new Types.ObjectId().toString();
    const completionData = {
      durationCompleted: 25,
      moodBefore: 'calm',
      moodAfter: 'relaxed'
    };

    it('should complete session successfully', async () => {
      mockReq.params = { sessionId };
      mockReq.body = completionData;
      const mockSession = { _id: sessionId, status: 'completed' };
      jest.spyOn(GroupSessionService, 'completeSession').mockResolvedValue(mockSession);

      await GroupSessionController.completeSession(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.completeSession).toHaveBeenCalledWith(
        sessionId,
        mockUserId,
        completionData
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.params = { sessionId };
      mockReq.body = {};

      await GroupSessionController.completeSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('cancelSession', () => {
    const sessionId = new Types.ObjectId().toString();

    it('should cancel session successfully', async () => {
      mockReq.params = { sessionId };
      const mockSession = { _id: sessionId, status: 'cancelled' };
      jest.spyOn(GroupSessionService, 'cancelSession').mockResolvedValue(mockSession);

      await GroupSessionController.cancelSession(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.cancelSession).toHaveBeenCalledWith(sessionId, mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.params = {};

      await GroupSessionController.cancelSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('getUpcomingSessions', () => {
    it('should get upcoming sessions successfully', async () => {
      const mockSessions = [
        { _id: new Types.ObjectId().toString(), title: 'Upcoming Session 1' },
        { _id: new Types.ObjectId().toString(), title: 'Upcoming Session 2' }
      ];
      jest.spyOn(GroupSessionService, 'getUpcomingSessions').mockResolvedValue(mockSessions);

      await GroupSessionController.getUpcomingSessions(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.getUpcomingSessions).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should return 400 when user is not authenticated', async () => {
      mockReq.user = undefined;

      await GroupSessionController.getUpcomingSessions(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });
  });

  describe('getUserSessions', () => {
    it('should get user sessions successfully', async () => {
      const mockSessions = [
        { _id: new Types.ObjectId().toString(), title: 'Past Session 1' },
        { _id: new Types.ObjectId().toString(), title: 'Past Session 2' }
      ];
      jest.spyOn(GroupSessionService, 'getUserSessions').mockResolvedValue(mockSessions);

      await GroupSessionController.getUserSessions(mockReq as Request, mockRes as Response);

      expect(GroupSessionService.getUserSessions).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should return 400 when user is not authenticated', async () => {
      mockReq.user = undefined;

      await GroupSessionController.getUserSessions(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User ID is required' });
    });
  });
}); 