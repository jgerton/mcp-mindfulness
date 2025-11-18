import mongoose from 'mongoose';
import { BreathingService } from '../../services/breathing.service';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import { StressManagementService } from '../../services/stress-management.service';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import { dbHandler } from '../test-utils/db-handler';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

jest.mock('../../services/stress-management.service');

describe('BreathingService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  
  beforeAll(async () => await dbHandler.connect());
  afterEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });
  afterAll(async () => await dbHandler.closeDatabase());

  describe('Pattern Management', () => {
    describe('initializeDefaultPatterns', () => {
      it('should initialize all default breathing patterns', async () => {
        await BreathingService.initializeDefaultPatterns();
        
        const patterns = await BreathingPattern.find({});
        expect(patterns).toHaveLength(3); // 4-7-8, BOX_BREATHING, QUICK_BREATH
        
        const fourSevenEight = patterns.find(p => p.name === '4-7-8');
        expect(fourSevenEight).toBeDefined();
        expect(fourSevenEight).toMatchObject({
          inhale: 4,
          hold: 7,
          exhale: 8,
          cycles: 4
        });
      });

      it('should not duplicate patterns on multiple initializations', async () => {
        await BreathingService.initializeDefaultPatterns();
        await BreathingService.initializeDefaultPatterns();
        
        const patterns = await BreathingPattern.find({});
        expect(patterns).toHaveLength(3);
      });
    });

    describe('getPattern', () => {
      beforeEach(async () => {
        await BreathingService.initializeDefaultPatterns();
      });

      it('should retrieve an existing pattern', async () => {
        const pattern = await BreathingService.getPattern('BOX_BREATHING');
        expect(pattern).toBeDefined();
        expect(pattern?.name).toBe('BOX_BREATHING');
      });

      it('should return null for non-existent pattern', async () => {
        const pattern = await BreathingService.getPattern('NON_EXISTENT');
        expect(pattern).toBeNull();
      });
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      await BreathingService.initializeDefaultPatterns();
    });

    describe('startSession', () => {
      it('should create a new breathing session', async () => {
        const session = await BreathingService.startSession(mockUserId, '4-7-8', 7);
        
        expect(session).toBeDefined();
        expect(session.userId).toBe(mockUserId);
        expect(session.patternName).toBe('4-7-8');
        expect(session.startTime).toBeDefined();
        expect(session.targetCycles).toBe(4);
        expect(session.stressLevelBefore).toBe(7);
      });

      it('should throw error for invalid pattern', async () => {
        await expect(
          BreathingService.startSession(mockUserId, 'INVALID_PATTERN', 5)
        ).rejects.toThrow('Invalid breathing pattern');
      });
    });

    describe('getUserSessionById', () => {
      it('should retrieve an existing session', async () => {
        const createdSession = await BreathingService.startSession(mockUserId, '4-7-8') as BreathingSession & { _id: mongoose.Types.ObjectId };
        
        const session = await BreathingService.getUserSessionById(createdSession._id.toString()) as BreathingSession & { _id: mongoose.Types.ObjectId };
        expect(session).toBeDefined();
        expect(session._id.toString()).toBe(createdSession._id.toString());
      });

      it('should return null for non-existent session', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const session = await BreathingService.getUserSessionById(nonExistentId);
        expect(session).toBeNull();
      });
    });

    describe('completeSession', () => {
      it('should complete an existing session', async () => {
        const session = await BreathingService.startSession(mockUserId, '4-7-8', 7) as BreathingSession & { _id: mongoose.Types.ObjectId };
        
        const completedSession = await BreathingService.completeSession(
          session._id.toString(),
          4,
          3
        );

        expect(completedSession.endTime).toBeDefined();
        expect(completedSession.completedCycles).toBe(4);
        expect(completedSession.stressLevelAfter).toBe(3);
      });

      it('should throw error for non-existent session', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        await expect(
          BreathingService.completeSession(nonExistentId, 4, 3)
        ).rejects.toThrow('Session not found');
      });

      it('should throw error for already completed session', async () => {
        const session = await BreathingService.startSession(mockUserId, '4-7-8') as BreathingSession & { _id: mongoose.Types.ObjectId };
        await BreathingService.completeSession(session._id.toString(), 4, 3);

        await expect(
          BreathingService.completeSession(session._id.toString(), 4, 3)
        ).rejects.toThrow('Session already completed');
      });

      it('should update stress management when stress levels are provided', async () => {
        const mockStressService = {
          recordStressChange: jest.fn()
        };
        jest.mocked(StressManagementService).mockImplementation(() => mockStressService as any);
        
        const session = await BreathingService.startSession(mockUserId, '4-7-8', 7) as BreathingSession & { _id: mongoose.Types.ObjectId };
        await BreathingService.completeSession(session._id.toString(), 4, 3);

        expect(mockStressService.recordStressChange).toHaveBeenCalledWith(
          mockUserId,
          7,
          3,
          session._id.toString()
        );
      });
    });

    describe('getUserSessions', () => {
      it('should retrieve user sessions in descending order', async () => {
        await BreathingService.startSession(mockUserId, '4-7-8');
        await BreathingService.startSession(mockUserId, 'BOX_BREATHING');
        
        const sessions = await BreathingService.getUserSessions(mockUserId);
        expect(sessions).toHaveLength(2);
        expect(new Date(sessions[0].startTime).getTime())
          .toBeGreaterThan(new Date(sessions[1].startTime).getTime());
      });

      it('should respect the limit parameter', async () => {
        await BreathingService.startSession(mockUserId, '4-7-8');
        await BreathingService.startSession(mockUserId, 'BOX_BREATHING');
        await BreathingService.startSession(mockUserId, 'QUICK_BREATH');
        
        const sessions = await BreathingService.getUserSessions(mockUserId, 2);
        expect(sessions).toHaveLength(2);
      });
    });

    describe('getEffectiveness', () => {
      it('should calculate effectiveness metrics correctly', async () => {
        // Create and complete sessions with different patterns
        const session1 = await BreathingService.startSession(mockUserId, '4-7-8', 8) as BreathingSession & { _id: mongoose.Types.ObjectId };
        await BreathingService.completeSession(session1._id.toString(), 4, 4);

        const session2 = await BreathingService.startSession(mockUserId, 'BOX_BREATHING', 7) as BreathingSession & { _id: mongoose.Types.ObjectId };
        await BreathingService.completeSession(session2._id.toString(), 4, 2);

        const effectiveness = await BreathingService.getEffectiveness(mockUserId);
        
        expect(effectiveness.totalSessions).toBe(2);
        expect(effectiveness.averageStressReduction).toBe(4.5); // (4 + 5) / 2
        expect(effectiveness.mostEffectivePattern).toBe('BOX_BREATHING'); // Reduced by 5 vs 4
      });

      it('should return default values when no sessions exist', async () => {
        const effectiveness = await BreathingService.getEffectiveness(mockUserId);
        
        expect(effectiveness).toEqual({
          averageStressReduction: 0,
          totalSessions: 0,
          mostEffectivePattern: ''
        });
      });

      it('should only consider sessions with both stress levels recorded', async () => {
        // Session with both stress levels
        const session1 = await BreathingService.startSession(mockUserId, '4-7-8', 8) as BreathingSession & { _id: mongoose.Types.ObjectId };
        await BreathingService.completeSession(session1._id.toString(), 4, 4);

        // Session without stress levels
        await BreathingService.startSession(mockUserId, 'BOX_BREATHING');

        const effectiveness = await BreathingService.getEffectiveness(mockUserId);
        
        expect(effectiveness.totalSessions).toBe(1);
        expect(effectiveness.averageStressReduction).toBe(4); // Only from session1
        expect(effectiveness.mostEffectivePattern).toBe('4-7-8');
      });
    });
  });
});