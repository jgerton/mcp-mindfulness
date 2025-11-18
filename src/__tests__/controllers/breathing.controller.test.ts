import { Request, Response } from 'express';
import { BreathingController } from '../../controllers/breathing.controller';
import { BreathingService } from '../../services/breathing.service';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
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

jest.mock('../../services/breathing.service');

describe('BreathingController', () => {
  let mockReq: Request;
  let mockRes: Response;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSessionId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mockReq = TestFactory.createMockRequest();
    mockRes = TestFactory.createMockResponse();
    jest.clearAllMocks();
    (BreathingService.initializeDefaultPatterns as jest.Mock).mockResolvedValue(undefined);
    (BreathingService.getPattern as jest.Mock).mockResolvedValue(null);
    (BreathingService.startSession as jest.Mock).mockResolvedValue(TestFactory.createBreathingSession());
    (BreathingService.completeSession as jest.Mock).mockResolvedValue(TestFactory.createBreathingSession({ endTime: new Date() }));
    (BreathingService.getUserSessions as jest.Mock).mockResolvedValue([]);
    (BreathingService.getEffectiveness as jest.Mock).mockResolvedValue({
      averageStressReduction: 0,
      totalSessions: 0,
      mostEffectivePattern: ''
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatterns', () => {
    it('should return pattern when found', async () => {
      const mockPattern = TestFactory.createBreathingPattern();
      (BreathingService.getPattern as jest.Mock).mockResolvedValue(mockPattern);

      mockReq.params = { name: '4-7-8' };
      await BreathingController.getPatterns(mockReq, mockRes);

      expect(BreathingService.initializeDefaultPatterns).toHaveBeenCalled();
      expect(BreathingService.getPattern).toHaveBeenCalledWith('4-7-8');
      expect(mockRes.json).toHaveBeenCalledWith(mockPattern);
    });

    it('should return 404 when pattern not found', async () => {
      (BreathingService.getPattern as jest.Mock).mockResolvedValue(null);

      mockReq.params = { name: 'non-existent' };
      await BreathingController.getPatterns(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Breathing pattern not found' });
    });

    it('should handle errors gracefully', async () => {
      (BreathingService.getPattern as jest.Mock).mockRejectedValue(new Error('Database error'));

      await BreathingController.getPatterns(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Breathing pattern not found' });
    });
  });

  describe('startSession', () => {
    beforeEach(() => {
      mockReq.user = { _id: mockUserId, username: 'testuser' };
    });

    it('should create new session successfully', async () => {
      const mockSession = TestFactory.createBreathingSession();
      (BreathingService.startSession as jest.Mock).mockResolvedValue(mockSession);

      mockReq.body = { patternName: '4-7-8', stressLevelBefore: 7 };
      await BreathingController.startSession(mockReq, mockRes);

      expect(BreathingService.startSession).toHaveBeenCalledWith(
        mockUserId,
        '4-7-8',
        7
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should handle unauthorized requests', async () => {
      mockReq.user = undefined;
      await BreathingController.startSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle invalid pattern errors', async () => {
      (BreathingService.startSession as jest.Mock).mockRejectedValue(new Error('Invalid pattern'));

      mockReq.body = { patternName: 'invalid' };
      await BreathingController.startSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid pattern' });
    });
  });

  describe('completeSession', () => {
    beforeEach(() => {
      mockReq.user = { _id: mockUserId, username: 'testuser' };
      mockReq.params = { sessionId: mockSessionId };
    });

    it('should complete session successfully', async () => {
      const mockSession = TestFactory.createBreathingSession({ endTime: new Date() });
      (BreathingService.completeSession as jest.Mock).mockResolvedValue(mockSession);

      mockReq.body = { completedCycles: 4, stressLevelAfter: 3 };
      await BreathingController.completeSession(mockReq, mockRes);

      expect(BreathingService.completeSession).toHaveBeenCalledWith(
        mockSessionId,
        4,
        3
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockSession);
    });

    it('should handle unauthorized requests', async () => {
      mockReq.user = undefined;
      await BreathingController.completeSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle session not found', async () => {
      (BreathingService.completeSession as jest.Mock).mockRejectedValue(new Error('Session not found'));

      await BreathingController.completeSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Session not found' });
    });

    it('should handle already completed sessions', async () => {
      (BreathingService.completeSession as jest.Mock).mockRejectedValue(new Error('Session already completed'));

      await BreathingController.completeSession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Session already completed' });
    });
  });

  describe('getUserSessions', () => {
    beforeEach(() => {
      mockReq.user = { _id: mockUserId, username: 'testuser' };
    });

    it('should return user sessions successfully', async () => {
      const mockSessions = [
        TestFactory.createBreathingSession(),
        TestFactory.createBreathingSession()
      ];
      (BreathingService.getUserSessions as jest.Mock).mockResolvedValue(mockSessions);

      await BreathingController.getUserSessions(mockReq, mockRes);

      expect(BreathingService.getUserSessions).toHaveBeenCalledWith(mockUserId, 10);
      expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should handle unauthorized requests', async () => {
      mockReq.user = undefined;
      await BreathingController.getUserSessions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should respect limit parameter', async () => {
      mockReq.query = { limit: '5' };
      await BreathingController.getUserSessions(mockReq, mockRes);

      expect(BreathingService.getUserSessions).toHaveBeenCalledWith(mockUserId, 5);
    });
  });

  describe('getEffectiveness', () => {
    beforeEach(() => {
      mockReq.user = { _id: mockUserId, username: 'testuser' };
    });

    it('should return effectiveness metrics successfully', async () => {
      const mockEffectiveness = {
        averageStressReduction: 4.5,
        totalSessions: 2,
        mostEffectivePattern: 'BOX_BREATHING'
      };
      (BreathingService.getEffectiveness as jest.Mock).mockResolvedValue(mockEffectiveness);

      await BreathingController.getEffectiveness(mockReq, mockRes);

      expect(BreathingService.getEffectiveness).toHaveBeenCalledWith(mockUserId);
      expect(mockRes.json).toHaveBeenCalledWith(mockEffectiveness);
    });

    it('should handle unauthorized requests', async () => {
      mockReq.user = undefined;
      await BreathingController.getEffectiveness(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle service errors gracefully', async () => {
      (BreathingService.getEffectiveness as jest.Mock).mockRejectedValue(new Error('Database error'));

      await BreathingController.getEffectiveness(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get breathing effectiveness' });
    });
  });
});