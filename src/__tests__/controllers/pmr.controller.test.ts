import { Request, Response } from 'express';
import { PMRController } from '../../controllers/pmr.controller';
import { PMRService } from '../../services/pmr.service';
import { MuscleGroup, PMRSession } from '../../models/pmr.model';
import mongoose from 'mongoose';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

// Mock PMRService
jest.mock('../../services/pmr.service');

describe('PMRController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mockReq = {
      user: { _id: mockUserId },
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getMuscleGroups', () => {
    const mockMuscleGroups: MuscleGroup[] = [
      { name: 'Arms', description: 'Arm muscles', order: 1 },
      { name: 'Legs', description: 'Leg muscles', order: 2 },
    ];

    it('should return muscle groups successfully', async () => {
      (PMRService.initializeDefaultMuscleGroups as jest.Mock).mockResolvedValue(undefined);
      (PMRService.getMuscleGroups as jest.Mock).mockResolvedValue(mockMuscleGroups);

      await PMRController.getMuscleGroups(mockReq as Request, mockRes as Response);

      expect(PMRService.initializeDefaultMuscleGroups).toHaveBeenCalled();
      expect(PMRService.getMuscleGroups).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockMuscleGroups);
    });

    it('should handle errors when getting muscle groups', async () => {
      const error = new Error('Database error');
      (PMRService.initializeDefaultMuscleGroups as jest.Mock).mockRejectedValue(error);

      await PMRController.getMuscleGroups(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get muscle groups' });
    });
  });

  describe('startSession', () => {
    const mockSession: Partial<PMRSession> = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: mockUserId,
      stressLevelBefore: 7,
      startTime: new Date(),
    };

    it('should start a session successfully', async () => {
      mockReq.body = { stressLevelBefore: 7 };
      (PMRService.startSession as jest.Mock).mockResolvedValue(mockSession);

      await PMRController.startSession(mockReq as Request, mockRes as Response);

      expect(PMRService.startSession).toHaveBeenCalledWith(mockUserId, 7);
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;
      mockReq.body = { stressLevelBefore: 7 };

      await PMRController.startSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if stress level is not provided', async () => {
      mockReq.body = {};

      await PMRController.startSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Stress level is required' });
    });
  });

  describe('completeSession', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();
    const mockSession: Partial<PMRSession> = {
      _id: mockSessionId,
      userId: mockUserId,
      stressLevelBefore: 7,
      startTime: new Date(),
    };

    beforeEach(() => {
      mockReq.params = { sessionId: mockSessionId };
      mockReq.body = {
        completedGroups: ['Arms', 'Legs'],
        stressLevelAfter: 4,
      };
    });

    it('should complete a session successfully', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue({ ...mockSession, userId: mockUserId });
      (PMRService.completeSession as jest.Mock).mockResolvedValue({ ...mockSession, completed: true });

      await PMRController.completeSession(mockReq as Request, mockRes as Response);

      expect(PMRService.completeSession).toHaveBeenCalledWith(
        mockSessionId,
        ['Arms', 'Legs'],
        4
      );
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ completed: true }));
    });

    it('should return 404 if session is not found', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue(null);

      await PMRController.completeSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Session not found' });
    });

    it('should return 403 if session belongs to different user', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue({
        ...mockSession,
        userId: new mongoose.Types.ObjectId().toString(),
      });

      await PMRController.completeSession(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized access to session' });
    });
  });

  describe('updateProgress', () => {
    const mockSessionId = new mongoose.Types.ObjectId().toString();
    const mockSession: Partial<PMRSession> = {
      _id: mockSessionId,
      userId: mockUserId,
      stressLevelBefore: 7,
      startTime: new Date(),
    };

    beforeEach(() => {
      mockReq.params = { sessionId: mockSessionId };
      mockReq.body = { completedGroup: 'Arms' };
    });

    it('should update progress successfully', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue({ ...mockSession, userId: mockUserId });
      (PMRService.updateMuscleGroupProgress as jest.Mock).mockResolvedValue({
        ...mockSession,
        completedGroups: ['Arms'],
      });

      await PMRController.updateProgress(mockReq as Request, mockRes as Response);

      expect(PMRService.updateMuscleGroupProgress).toHaveBeenCalledWith(mockSessionId, 'Arms');
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ completedGroups: ['Arms'] }));
    });

    it('should return 404 if session is not found', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue(null);

      await PMRController.updateProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Session not found' });
    });

    it('should return 403 if session belongs to different user', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue({
        ...mockSession,
        userId: new mongoose.Types.ObjectId().toString(),
      });

      await PMRController.updateProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized access to session' });
    });

    it('should handle invalid muscle group error', async () => {
      (PMRService.getSessionById as jest.Mock).mockResolvedValue({ ...mockSession, userId: mockUserId });
      (PMRService.updateMuscleGroupProgress as jest.Mock).mockRejectedValue(
        new Error('Invalid muscle group: InvalidGroup')
      );

      await PMRController.updateProgress(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid muscle group: InvalidGroup' });
    });
  });

  describe('getUserSessions', () => {
    const mockSessions: Partial<PMRSession>[] = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: mockUserId,
        stressLevelBefore: 7,
        startTime: new Date(),
      },
    ];

    it('should get user sessions successfully', async () => {
      mockReq.query = { limit: '5' };
      (PMRService.getUserSessions as jest.Mock).mockResolvedValue(mockSessions);

      await PMRController.getUserSessions(mockReq as Request, mockRes as Response);

      expect(PMRService.getUserSessions).toHaveBeenCalledWith(mockUserId, 5);
      expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should use default limit if not provided', async () => {
      (PMRService.getUserSessions as jest.Mock).mockResolvedValue(mockSessions);

      await PMRController.getUserSessions(mockReq as Request, mockRes as Response);

      expect(PMRService.getUserSessions).toHaveBeenCalledWith(mockUserId, 10);
      expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await PMRController.getUserSessions(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('getEffectiveness', () => {
    const mockEffectiveness = {
      averageStressReduction: 3,
      totalSessions: 10,
      completionRate: 0.8,
    };

    it('should get effectiveness data successfully', async () => {
      (PMRService.getEffectiveness as jest.Mock).mockResolvedValue(mockEffectiveness);

      await PMRController.getEffectiveness(mockReq as Request, mockRes as Response);

      expect(PMRService.getEffectiveness).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockEffectiveness);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await PMRController.getEffectiveness(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle errors when getting effectiveness', async () => {
      const error = new Error('Database error');
      (PMRService.getEffectiveness as jest.Mock).mockRejectedValue(error);

      await PMRController.getEffectiveness(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get PMR effectiveness' });
    });
  });
});