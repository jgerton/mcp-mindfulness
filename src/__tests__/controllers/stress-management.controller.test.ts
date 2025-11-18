import { Request, Response } from 'express';
import { StressManagementController } from '../../controllers/stress-management.controller';
import { StressManagementService } from '../../services/stress-management.service';
import { StressAnalysisService } from '../../services/stress-analysis.service';
import { StressAssessment, UserPreferences } from '../../models/stress.model';
import { StressLevel } from '../../types/stress.types';
import { Types } from 'mongoose';
import { createTestContext, ModelMock } from '../mocks';
import { TestContext } from '../mocks/utils/test-utils';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

jest.mock('../../services/stress-management.service');
jest.mock('../../services/stress-analysis.service');

describe('StressManagementController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  
  beforeEach(() => {
    mockReq = {
      params: { userId: 'user123' },
      body: {},
      query: {},
      user: { _id: 'user123' }
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('assessStressLevel', () => {
    const mockAssessment = {
      level: 'HIGH' as StressLevel,
      symptoms: ['headache', 'tension'],
      triggers: ['work', 'deadlines']
    };

    it('should successfully assess stress level', async () => {
      mockReq.body = mockAssessment;
      jest.spyOn(StressManagementService, 'assessStressLevel')
        .mockResolvedValue('HIGH');

      await StressManagementController.assessStressLevel(mockReq as Request, mockRes as Response);

      expect(StressManagementService.assessStressLevel)
        .toHaveBeenCalledWith(mockReq.params.userId, mockAssessment);
      expect(mockRes.json).toHaveBeenCalledWith({ stressLevel: 'HIGH' });
    });

    it('should handle errors during assessment', async () => {
      const error = new Error('Assessment failed');
      jest.spyOn(StressManagementService, 'assessStressLevel')
        .mockRejectedValue(error);

      await StressManagementController.assessStressLevel(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Assessment failed' });
    });

    it('should handle invalid assessment data', async () => {
      mockReq.body = { level: 'INVALID_LEVEL' };
      const error = new Error('Invalid stress level');
      jest.spyOn(StressManagementService, 'assessStressLevel')
        .mockRejectedValue(error);

      await StressManagementController.assessStressLevel(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
    });

    it('should handle missing user ID', async () => {
      mockReq.params = {};
      await StressManagementController.assessStressLevel(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User ID is required' });
    });
  });

  describe('getRecommendations', () => {
    const mockRecommendations = ['Take breaks', 'Deep breathing', 'Exercise'];

    it('should return recommendations successfully', async () => {
      jest.spyOn(StressManagementService, 'getRecommendations')
        .mockResolvedValue(mockRecommendations);

      await StressManagementController.getRecommendations(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getRecommendations)
        .toHaveBeenCalledWith(mockReq.params.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it('should handle errors when fetching recommendations', async () => {
      const error = new Error('Failed to fetch recommendations');
      jest.spyOn(StressManagementService, 'getRecommendations')
        .mockRejectedValue(error);

      await StressManagementController.getRecommendations(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch recommendations' });
    });

    it('should handle empty recommendations', async () => {
      jest.spyOn(StressManagementService, 'getRecommendations')
        .mockResolvedValue([]);

      await StressManagementController.getRecommendations(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getRecommendationsWithLevel', () => {
    const mockLevel: StressLevel = 'HIGH';
    const mockRecommendations = ['Immediate break', 'Contact support', 'Relaxation techniques'];

    it('should return level-specific recommendations', async () => {
      mockReq.body = { level: mockLevel };
      jest.spyOn(StressManagementService, 'getRecommendations')
        .mockResolvedValue(mockRecommendations);

      await StressManagementController.getRecommendationsWithLevel(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getRecommendations)
        .toHaveBeenCalledWith(mockReq.params.userId, mockLevel);
      expect(mockRes.json).toHaveBeenCalledWith(mockRecommendations);
    });

    it('should handle invalid stress level', async () => {
      mockReq.body = { level: 'INVALID' };
      await StressManagementController.getRecommendationsWithLevel(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
    });
  });

  describe('recordStressChange', () => {
    const mockStressChange = {
      stressLevelBefore: 'HIGH' as StressLevel,
      stressLevelAfter: 'MEDIUM' as StressLevel,
      technique: 'deep-breathing'
    };

    it('should record stress level change successfully', async () => {
      mockReq.body = mockStressChange;
      jest.spyOn(StressManagementService, 'recordStressChange')
        .mockResolvedValue(undefined);

      await StressManagementController.recordStressChange(mockReq as Request, mockRes as Response);

      expect(StressManagementService.recordStressChange)
        .toHaveBeenCalledWith(
          mockReq.params.userId,
          mockStressChange.stressLevelBefore,
          mockStressChange.stressLevelAfter,
          mockStressChange.technique
        );
      expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should handle invalid stress levels', async () => {
      mockReq.body = {
        stressLevelBefore: 'INVALID',
        stressLevelAfter: 'HIGH',
        technique: 'deep-breathing'
      };

      await StressManagementController.recordStressChange(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
    });

    it('should handle missing technique', async () => {
      mockReq.body = {
        stressLevelBefore: 'HIGH',
        stressLevelAfter: 'MEDIUM'
      };

      await StressManagementController.recordStressChange(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Technique is required' });
    });
  });

  describe('getStressHistory', () => {
    const mockHistory = [
      { date: new Date(), level: 'HIGH', triggers: ['work'] },
      { date: new Date(), level: 'MEDIUM', triggers: ['personal'] }
    ];

    it('should return stress history successfully', async () => {
      jest.spyOn(StressManagementService, 'getStressHistory')
        .mockResolvedValue(mockHistory);

      await StressManagementController.getStressHistory(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getStressHistory)
        .toHaveBeenCalledWith(mockReq.params.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockHistory);
    });

    it('should handle empty history', async () => {
      jest.spyOn(StressManagementService, 'getStressHistory')
        .mockResolvedValue([]);

      await StressManagementController.getStressHistory(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle date range filters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      mockReq.query = { startDate, endDate };

      jest.spyOn(StressManagementService, 'getStressHistory')
        .mockResolvedValue(mockHistory);

      await StressManagementController.getStressHistory(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getStressHistory)
        .toHaveBeenCalledWith(mockReq.params.userId, { startDate, endDate });
    });
  });

  describe('getStressAnalytics', () => {
    const mockAnalytics = {
      averageLevel: 'MEDIUM',
      commonTriggers: ['work', 'health'],
      trendAnalysis: 'improving'
    };

    it('should return stress analytics successfully', async () => {
      jest.spyOn(StressManagementService, 'getStressAnalytics')
        .mockResolvedValue(mockAnalytics);

      await StressManagementController.getStressAnalytics(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getStressAnalytics)
        .toHaveBeenCalledWith(mockReq.params.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockAnalytics);
    });

    it('should handle insufficient data', async () => {
      jest.spyOn(StressManagementService, 'getStressAnalytics')
        .mockResolvedValue(null);

      await StressManagementController.getStressAnalytics(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient data for analysis' });
    });
  });

  describe('getStressPatterns', () => {
    const mockPatterns = {
      dailyPattern: 'highest in mornings',
      weeklyPattern: 'peaks on Mondays',
      monthlyPattern: 'consistent throughout'
    };

    it('should return stress patterns successfully', async () => {
      jest.spyOn(StressManagementService, 'getStressPatterns')
        .mockResolvedValue(mockPatterns);

      await StressManagementController.getStressPatterns(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getStressPatterns)
        .toHaveBeenCalledWith(mockReq.params.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockPatterns);
    });

    it('should handle no patterns found', async () => {
      jest.spyOn(StressManagementService, 'getStressPatterns')
        .mockResolvedValue(null);

      await StressManagementController.getStressPatterns(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No stress patterns found' });
    });
  });

  describe('getPeakStressHours', () => {
    const mockPeakHours = ['09:00', '17:00'];

    it('should return peak stress hours successfully', async () => {
      jest.spyOn(StressManagementService, 'getPeakStressHours')
        .mockResolvedValue(mockPeakHours);

      await StressManagementController.getPeakStressHours(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getPeakStressHours)
        .toHaveBeenCalledWith(mockReq.params.userId);
      expect(mockRes.json).toHaveBeenCalledWith(mockPeakHours);
    });

    it('should handle no peak hours found', async () => {
      jest.spyOn(StressManagementService, 'getPeakStressHours')
        .mockResolvedValue([]);

      await StressManagementController.getPeakStressHours(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No peak stress hours found' });
    });

    it('should handle time range filters', async () => {
      mockReq.query = { startTime: '09:00', endTime: '17:00' };
      jest.spyOn(StressManagementService, 'getPeakStressHours')
        .mockResolvedValue(mockPeakHours);

      await StressManagementController.getPeakStressHours(mockReq as Request, mockRes as Response);

      expect(StressManagementService.getPeakStressHours)
        .toHaveBeenCalledWith(mockReq.params.userId, { startTime: '09:00', endTime: '17:00' });
    });
  });
});