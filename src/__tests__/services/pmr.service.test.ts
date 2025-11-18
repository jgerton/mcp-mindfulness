import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../utils/test-db';
import { PMRService } from '../../services/pmr.service';
import { PMRSession, MuscleGroup } from '../../models/pmr.model';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import { StressManagementService } from '../../services/stress-management.service';
import { dbHandler } from '../test-utils/db-handler';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

jest.mock('../../services/stress-management.service');

describe('PMRService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  
  beforeAll(async () => await dbHandler.connect());
  afterEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });
  afterAll(async () => await dbHandler.closeDatabase());

  describe('initializeDefaultMuscleGroups', () => {
    it('should create default muscle groups', async () => {
      await PMRService.initializeDefaultMuscleGroups();
      
      const groups = await MuscleGroup.find().sort('order');
      expect(groups).toHaveLength(7); // Total default groups
      
      const firstGroup = groups[0];
      expect(firstGroup).toMatchObject({
        name: 'hands_and_forearms',
        description: 'Clench your fists and flex your forearms',
        order: 1,
        durationSeconds: 30
      });
    });

    it('should update existing groups without creating duplicates', async () => {
      await PMRService.initializeDefaultMuscleGroups();
      await PMRService.initializeDefaultMuscleGroups();
      
      const groups = await MuscleGroup.find();
      expect(groups).toHaveLength(7);
    });
  });

  describe('startSession', () => {
    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
    });

    it('should create new PMR session with stress level', async () => {
      const session = await PMRService.startSession(mockUserId, 7);
      
      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUserId);
      expect(session.stressLevelBefore).toBe(7);
      expect(session.startTime).toBeDefined();
      expect(session.endTime).toBeUndefined();
      expect(session.completedGroups).toEqual([]);
      expect(session.duration).toBe(225); // Total duration from all groups
    });

    it('should create session without stress level', async () => {
      const session = await PMRService.startSession(mockUserId);
      
      expect(session).toBeDefined();
      expect(session.stressLevelBefore).toBeUndefined();
    });
  });

  describe('completeSession', () => {
    let sessionId: string;
    const completedGroups = ['hands_and_forearms', 'biceps', 'shoulders'];

    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
      const session = await PMRService.startSession(mockUserId, 7);
      sessionId = session._id.toString();
    });

    it('should complete session successfully', async () => {
      const completedSession = await PMRService.completeSession(sessionId, completedGroups, 3);
      
      expect(completedSession.endTime).toBeDefined();
      expect(completedSession.completedGroups).toEqual(completedGroups);
      expect(completedSession.stressLevelAfter).toBe(3);
    });

    it('should call StressManagementService when stress levels are provided', async () => {
      await PMRService.completeSession(sessionId, completedGroups, 3);
      
      expect(StressManagementService.recordStressChange).toHaveBeenCalledWith(
        mockUserId,
        '7',
        '3',
        'PMR_EXERCISE'
      );
    });

    it('should throw error for non-existent session', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(
        PMRService.completeSession(nonExistentId, completedGroups)
      ).rejects.toThrow('Session not found');
    });

    it('should throw error for already completed session', async () => {
      await PMRService.completeSession(sessionId, completedGroups);
      await expect(
        PMRService.completeSession(sessionId, completedGroups)
      ).rejects.toThrow('Session already completed');
    });
  });

  describe('updateMuscleGroupProgress', () => {
    let sessionId: string;

    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
      const session = await PMRService.startSession(mockUserId);
      sessionId = session._id.toString();
    });

    it('should update progress for valid muscle group', async () => {
      const session = await PMRService.updateMuscleGroupProgress(sessionId, 'hands_and_forearms');
      expect(session.completedGroups).toContain('hands_and_forearms');
    });

    it('should throw error for invalid muscle group', async () => {
      await expect(
        PMRService.updateMuscleGroupProgress(sessionId, 'invalid_group')
      ).rejects.toThrow('Invalid muscle group name');
    });

    it('should throw error for already completed muscle group', async () => {
      await PMRService.updateMuscleGroupProgress(sessionId, 'hands_and_forearms');
      await expect(
        PMRService.updateMuscleGroupProgress(sessionId, 'hands_and_forearms')
      ).rejects.toThrow('Muscle group already completed');
    });
  });

  describe('getUserSessions', () => {
    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
      
      // Create multiple sessions
      for (let i = 0; i < 5; i++) {
        const session = await PMRService.startSession(mockUserId);
        if (i < 3) { // Complete some sessions
          await PMRService.completeSession(session._id.toString(), ['hands_and_forearms']);
        }
      }
    });

    it('should return user sessions with default limit', async () => {
      const sessions = await PMRService.getUserSessions(mockUserId);
      expect(sessions).toHaveLength(5);
      expect(sessions[0].userId).toBe(mockUserId);
    });

    it('should respect custom limit', async () => {
      const sessions = await PMRService.getUserSessions(mockUserId, 3);
      expect(sessions).toHaveLength(3);
    });

    it('should sort sessions by startTime desc', async () => {
      const sessions = await PMRService.getUserSessions(mockUserId);
      for (let i = 1; i < sessions.length; i++) {
        expect(sessions[i-1].startTime.getTime())
          .toBeGreaterThanOrEqual(sessions[i].startTime.getTime());
      }
    });
  });

  describe('getEffectiveness', () => {
    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
      
      // Create sessions with varying completion rates and stress levels
      const sessions = [
        { completedGroups: ['hands_and_forearms', 'biceps', 'shoulders'], stressLevelBefore: 8, stressLevelAfter: 4 },
        { completedGroups: ['hands_and_forearms'], stressLevelBefore: 7, stressLevelAfter: 5 },
        { completedGroups: ['hands_and_forearms', 'biceps', 'shoulders', 'face', 'chest_and_back'], stressLevelBefore: 9, stressLevelAfter: 3 }
      ];

      for (const sessionData of sessions) {
        const session = await PMRService.startSession(mockUserId, sessionData.stressLevelBefore);
        await PMRService.completeSession(
          session._id.toString(),
          sessionData.completedGroups,
          sessionData.stressLevelAfter
        );
      }
    });

    it('should calculate effectiveness metrics correctly', async () => {
      const effectiveness = await PMRService.getEffectiveness(mockUserId);
      
      expect(effectiveness.totalSessions).toBe(3);
      expect(effectiveness.averageStressReduction).toBeGreaterThan(0);
      expect(effectiveness.averageCompletionRate).toBeGreaterThan(0);
      expect(effectiveness.averageCompletionRate).toBeLessThanOrEqual(100);
    });

    it('should return default values for user with no sessions', async () => {
      const newUserId = new mongoose.Types.ObjectId().toString();
      const effectiveness = await PMRService.getEffectiveness(newUserId);
      
      expect(effectiveness).toEqual({
        averageStressReduction: 0,
        totalSessions: 0,
        averageCompletionRate: 0
      });
    });
  });

  describe('getMuscleGroups', () => {
    beforeEach(async () => {
      await PMRService.initializeDefaultMuscleGroups();
    });

    it('should return all muscle groups in correct order', async () => {
      const groups = await PMRService.getMuscleGroups();
      
      expect(groups).toHaveLength(7);
      expect(groups[0].name).toBe('hands_and_forearms');
      expect(groups[6].name).toBe('legs');
      
      // Verify order
      for (let i = 1; i < groups.length; i++) {
        expect(groups[i].order).toBeGreaterThan(groups[i-1].order);
      }
    });
  });
});