import { Request, Response } from 'express';
import { BreathingController } from '../../controllers/breathing.controller';
import { BreathingService } from '../../services/breathing.service';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import mongoose from 'mongoose';

// Mock the BreathingService
jest.mock('../../services/breathing.service');

const mockResponse = () => {
  const res: Partial<Response> = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  return res as Response;
};

const mockRequest = (data: any = {}): Partial<Request> => ({
  user: { _id: 'test-user', username: 'testuser' },
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
});

describe('BreathingController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const db = mongoose.connection.db;
      if (db) {
        try {
          await db.collection('breathingpatterns').deleteMany({});
          await db.collection('breathingsessions').deleteMany({});
        } catch (error) {
          // Collections might not exist, ignore error
        }
      }
    }
    await BreathingService.initializeDefaultPatterns();
  });

  describe('getPatterns', () => {
    it('should return breathing pattern when found', async () => {
      const mockPattern = {
        name: '4-7-8',
        inhale: 4,
        hold: 7,
        exhale: 8
      };
      
      mockRequest.params = { name: '4-7-8' };
      
      BreathingService.getPattern = jest.fn().mockResolvedValue(mockPattern);
      BreathingService.initializeDefaultPatterns = jest.fn().mockResolvedValue(undefined);
      
      await BreathingController.getPatterns(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockPattern);
    });

    it('should return null when pattern not found', async () => {
      mockRequest.params = { name: 'non-existent-pattern' };
      
      BreathingService.getPattern = jest.fn().mockResolvedValue(null);
      BreathingService.initializeDefaultPatterns = jest.fn().mockResolvedValue(undefined);
      
      await BreathingController.getPatterns(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Breathing pattern not found' });
    });
  });

  describe('startSession', () => {
    it('should return 500 for invalid pattern', async () => {
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.body = { patternName: 'INVALID_PATTERN' };
      
      BreathingService.getPattern = jest.fn().mockResolvedValue(null);
      
      await BreathingController.startSession(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid pattern' });
    });

    it('should create new session with valid data', async () => {
      const mockSession = {
        _id: 'test-session-id',
        userId: 'test-user',
        patternName: '4-7-8',
        startTime: new Date()
      };
      
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.body = { patternName: '4-7-8', stressLevelBefore: 7 };
      
      BreathingService.getPattern = jest.fn().mockResolvedValue({
        name: '4-7-8',
        inhale: 4,
        hold: 7,
        exhale: 8
      });
      BreathingService.startSession = jest.fn().mockResolvedValue(mockSession);
      
      await BreathingController.startSession(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 401 when user not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { patternName: '4-7-8', stressLevelBefore: 7 };
      
      await BreathingController.startSession(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('completeSession', () => {
    it('should complete session with valid data', async () => {
      const mockSession = {
        _id: 'test-session-id',
        userId: 'test-user',
        patternName: '4-7-8',
        completedCycles: 4,
        stressLevelAfter: 3,
        endTime: new Date()
      };
      
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.params = { sessionId: 'test-session-id' };
      mockRequest.body = { completedCycles: 4, stressLevelAfter: 3 };
      
      // Mock mongoose.Types.ObjectId.isValid to return true
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      
      BreathingService.getUserSessionById = jest.fn().mockResolvedValue({
        _id: 'test-session-id',
        userId: {
          toString: () => 'test-user'
        },
        toString: () => 'test-user'
      });
      BreathingService.completeSession = jest.fn().mockResolvedValue(mockSession);
      
      await BreathingController.completeSession(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 500 for invalid session id', async () => {
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.params = { sessionId: 'invalid-id' };
      mockRequest.body = { completedCycles: 4, stressLevelAfter: 3 };
      
      // Mock mongoose.Types.ObjectId.isValid to return false
      jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
      
      await BreathingController.completeSession(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid session ID' });
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions with default limit', async () => {
      const mockSessions = [
        { _id: 'session1', patternName: '4-7-8' },
        { _id: 'session2', patternName: 'BOX_BREATHING' }
      ];
      
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.query = {};
      
      BreathingService.getUserSessions = jest.fn().mockResolvedValue(mockSessions);
      
      await BreathingController.getUserSessions(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockSessions);
      expect(BreathingService.getUserSessions).toHaveBeenCalledWith('test-user', 10);
    });

    it('should respect limit parameter', async () => {
      const mockSessions = [
        { _id: 'session1', patternName: '4-7-8' },
        { _id: 'session2', patternName: 'BOX_BREATHING' }
      ];
      
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      mockRequest.query = { limit: '2' };
      
      BreathingService.getUserSessions = jest.fn().mockResolvedValue(mockSessions);
      
      await BreathingController.getUserSessions(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockSessions);
      expect(BreathingService.getUserSessions).toHaveBeenCalledWith('test-user', 2);
    });

    it('should return 401 when user not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.query = {};
      
      await BreathingController.getUserSessions(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('getEffectiveness', () => {
    it('should return effectiveness metrics', async () => {
      const mockEffectiveness = {
        averageStressReduction: 3.5,
        totalSessions: 10,
        mostEffectivePattern: '4-7-8'
      };
      
      mockRequest.user = { _id: 'test-user', username: 'testuser' };
      
      BreathingService.getEffectiveness = jest.fn().mockResolvedValue(mockEffectiveness);
      
      await BreathingController.getEffectiveness(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.json).toHaveBeenCalledWith(mockEffectiveness);
    });

    it('should return 401 when user not authenticated', async () => {
      mockRequest.user = undefined;
      
      await BreathingController.getEffectiveness(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
}); 