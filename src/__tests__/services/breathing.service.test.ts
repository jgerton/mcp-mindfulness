import mongoose from 'mongoose';
import { BreathingService } from '../../services/breathing.service';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import { StressManagementService } from '../../services/stress-management.service';

// Import the global setup
import '../setup';

jest.mock('../../services/stress-management.service', () => ({
  StressManagementService: {
    recordStressChange: jest.fn()
  }
}));

describe('BreathingService', () => {
  beforeEach(async () => {
    await BreathingPattern.deleteMany({});
    await BreathingSession.deleteMany({});
    // Initialize patterns for all tests
    await BreathingService.initializeDefaultPatterns();
    jest.clearAllMocks();
  });

  describe('initializeDefaultPatterns', () => {
    it('should create default breathing patterns', async () => {
      // Patterns already initialized in beforeEach
      const patterns = await BreathingPattern.find();
      expect(patterns).toHaveLength(3);
      expect(patterns.map(p => p.name)).toContain('4-7-8');
      expect(patterns.map(p => p.name)).toContain('BOX_BREATHING');
      expect(patterns.map(p => p.name)).toContain('QUICK_BREATH');
    });

    it('should not duplicate patterns on multiple calls', async () => {
      await BreathingService.initializeDefaultPatterns();
      const patterns = await BreathingPattern.find();
      expect(patterns).toHaveLength(3);
    });
  });

  describe('startSession', () => {
    it('should create a new breathing session', async () => {
      const userId = 'test-user';
      const session = await BreathingService.startSession(userId, '4-7-8', 7);
      
      expect(session.userId).toBe(userId);
      expect(session.patternName).toBe('4-7-8');
      expect(session.stressLevelBefore).toBe(7);
      expect(session.completedCycles).toBe(0);
      expect(session.targetCycles).toBe(4);
    });

    it('should throw error for invalid pattern', async () => {
      await expect(
        BreathingService.startSession('test-user', 'INVALID_PATTERN')
      ).rejects.toThrow('Invalid breathing pattern');
    });
  });

  describe('completeSession', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await BreathingService.startSession('test-user', '4-7-8', 7);
      sessionId = (session._id as mongoose.Types.ObjectId).toString();
    });

    it('should complete a breathing session', async () => {
      const completedSession = await BreathingService.completeSession(sessionId, 4, 3);
      
      expect(completedSession.completedCycles).toBe(4);
      expect(completedSession.stressLevelAfter).toBe(3);
      expect(completedSession.endTime).toBeDefined();
    });

    it('should update stress management when stress levels are provided', async () => {
      await BreathingService.completeSession(sessionId, 4, 3);
      
      expect(StressManagementService.recordStressChange).toHaveBeenCalledWith(
        'test-user',
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should not update stress management when stress levels are missing', async () => {
      await BreathingService.completeSession(sessionId, 4);
      expect(StressManagementService.recordStressChange).not.toHaveBeenCalled();
    });

    it('should throw error for invalid session id', async () => {
      await expect(
        BreathingService.completeSession('invalid-id', 4)
      ).rejects.toThrow();
    });
  });

  describe('getUserSessions', () => {
    beforeEach(async () => {
      const userId = 'test-user';
      await BreathingService.startSession(userId, '4-7-8');
      await BreathingService.startSession(userId, 'BOX_BREATHING');
      await BreathingService.startSession(userId, 'QUICK_BREATH');
    });

    it('should return user sessions with default limit', async () => {
      const sessions = await BreathingService.getUserSessions('test-user');
      expect(sessions).toHaveLength(3);
    });

    it('should respect the limit parameter', async () => {
      const sessions = await BreathingService.getUserSessions('test-user', 2);
      expect(sessions).toHaveLength(2);
    });

    it('should return sessions in descending order by start time', async () => {
      const sessions = await BreathingService.getUserSessions('test-user');
      const startTimes = sessions.map(s => s.startTime.getTime());
      expect(startTimes).toEqual([...startTimes].sort((a, b) => b - a));
    });
  });

  describe('getEffectiveness', () => {
    const userId = 'test-user';

    beforeEach(async () => {
      // Create sessions with different patterns and stress levels
      const session1 = await BreathingService.startSession(userId, '4-7-8', 8);
      await BreathingService.completeSession((session1._id as mongoose.Types.ObjectId).toString(), 4, 4);

      const session2 = await BreathingService.startSession(userId, 'BOX_BREATHING', 7);
      await BreathingService.completeSession((session2._id as mongoose.Types.ObjectId).toString(), 4, 5);

      const session3 = await BreathingService.startSession(userId, '4-7-8', 9);
      await BreathingService.completeSession((session3._id as mongoose.Types.ObjectId).toString(), 4, 3);
    });

    it('should calculate effectiveness metrics correctly', async () => {
      const effectiveness = await BreathingService.getEffectiveness(userId);
      
      expect(effectiveness.totalSessions).toBe(3);
      expect(effectiveness.averageStressReduction).toBe(4); // (4 + 2 + 6) / 3
      expect(effectiveness.mostEffectivePattern).toBe('4-7-8'); // Average reduction: 5 vs 2
    });

    it('should return default values for user with no sessions', async () => {
      const effectiveness = await BreathingService.getEffectiveness('new-user');
      
      expect(effectiveness).toEqual({
        averageStressReduction: 0,
        totalSessions: 0,
        mostEffectivePattern: ''
      });
    });
  });
}); 