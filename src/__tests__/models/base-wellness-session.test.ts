import mongoose from 'mongoose';
import { 
  IBaseWellnessSession, 
  WellnessMoodState, 
  WellnessSessionStatus,
  baseWellnessSessionSchema 
} from '../../models/base-wellness-session.model';
import { createTestSessionData, createCompletedTestSessionData } from '../factories/session.factory';

describe('BaseWellnessSession', () => {
  const TestSession = mongoose.model<IBaseWellnessSession>(
    'TestSession',
    baseWellnessSessionSchema
  );

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const db = mongoose.connection.db;
      if (db) {
        try {
          await db.collection('testsessions').deleteMany({});
        } catch (error) {
          // Collection might not exist, ignore error
        }
      }
    }
  });

  describe('Schema Validation', () => {
    it('should require all mandatory fields', async () => {
      const session = new TestSession({});
      
      let error;
      try {
        await session.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect((error as any).errors.userId).toBeDefined();
      expect((error as any).errors.startTime).toBeDefined();
      expect((error as any).errors.duration).toBeDefined();
    });

    it('should accept valid mood states', async () => {
      const session = new TestSession(createTestSessionData());
      const error = await session.validate().catch(e => e);
      expect(error).toBeUndefined();
    });

    it('should reject invalid mood states', async () => {
      const session = new TestSession(createTestSessionData({
        moodBefore: 'invalid_mood' as WellnessMoodState
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect(error.errors.moodBefore).toBeDefined();
    });

    it('should reject invalid session', async () => {
      const session = new TestSession(createTestSessionData({
        userId: 'invalid_id' as any,
        startTime: 'invalid_date' as any,
        endTime: 'invalid_date' as any,
        duration: -1,
        status: 'invalid_status' as WellnessSessionStatus
      }));

      try {
        await session.save();
        fail('Should have thrown validation error');
      } catch (err) {
        const error = err as mongoose.Error.ValidationError;
        expect((error as any).errors.userId).toBeDefined();
        expect((error as any).errors.startTime).toBeDefined();
        expect((error as any).errors.duration).toBeDefined();
        expect((error as any).errors.status).toBeDefined();
      }
    });
  });

  describe('Status Management', () => {
    it('should handle valid status transitions', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();
      
      session.status = WellnessSessionStatus.Completed;
      const error = await session.validate().catch(e => e);
      expect(error).toBeUndefined();
    });

    it('should reject invalid status values', async () => {
      const session = new TestSession(createTestSessionData({
        status: 'invalid_status' as WellnessSessionStatus
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();
      
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });

    it('should update updatedAt on changes', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();
      const originalUpdatedAt = session.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));
      session.notes = 'Updated notes';
      await session.save();

      expect(session.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Type Safety', () => {
    it('should enforce ObjectId type for userId', async () => {
      const session = new TestSession(createTestSessionData({
        userId: 'invalid_id' as any
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect((error as any).errors.userId).toBeDefined();
    });

    it('should enforce Date type for startTime and endTime', async () => {
      const session = new TestSession(createTestSessionData({
        startTime: 'invalid_date' as any,
        endTime: 'invalid_date' as any
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect((error as any).errors.startTime).toBeDefined();
      expect((error as any).errors.endTime).toBeDefined();
    });
  });

  describe('Achievement Processing', () => {
    it('should throw error when processAchievements is not implemented', async () => {
      const session = new TestSession(createTestSessionData());
      await expect(session.processAchievements()).rejects.toThrow(
        'Achievement processing must be implemented by session type'
      );
    });
  });

  // New edge cases
  describe('Edge Cases', () => {
    it('should reject negative duration', async () => {
      const session = new TestSession(createTestSessionData({
        duration: -1
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect((error as any).errors.duration).toBeDefined();
    });

    it('should reject endTime before startTime', async () => {
      const now = new Date();
      const session = new TestSession(createTestSessionData({
        startTime: now,
        endTime: new Date(now.getTime() - 1000) // 1 second before
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect((error as any).errors.endTime).toBeDefined();
    });

    it('should enforce notes length limit', async () => {
      const session = new TestSession(createTestSessionData({
        notes: 'a'.repeat(1001) // Assuming 1000 char limit
      }));

      const error = await session.validate().catch(e => e);
      expect(error).toBeDefined();
      expect((error as any).errors.notes).toBeDefined();
    });
  });

  // Add new test suites after existing ones
  describe('Status Transitions', () => {
    it('should allow transition from Active to Paused', async () => {
      const session = new TestSession(createTestSessionData());
      expect(session.canTransitionTo(WellnessSessionStatus.Paused)).toBe(true);
    });

    it('should allow transition from Active to Completed', async () => {
      const session = new TestSession(createTestSessionData());
      expect(session.canTransitionTo(WellnessSessionStatus.Completed)).toBe(true);
    });

    it('should allow transition from Active to Abandoned', async () => {
      const session = new TestSession(createTestSessionData());
      expect(session.canTransitionTo(WellnessSessionStatus.Abandoned)).toBe(true);
    });

    it('should allow transition from Paused to Active', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Paused
      }));
      expect(session.canTransitionTo(WellnessSessionStatus.Active)).toBe(true);
    });

    it('should not allow transition from Completed to any status', async () => {
      const session = new TestSession(createCompletedTestSessionData());
      expect(session.canTransitionTo(WellnessSessionStatus.Active)).toBe(false);
      expect(session.canTransitionTo(WellnessSessionStatus.Paused)).toBe(false);
      expect(session.canTransitionTo(WellnessSessionStatus.Abandoned)).toBe(false);
    });

    it('should not allow transition from Abandoned to any status', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Abandoned
      }));
      expect(session.canTransitionTo(WellnessSessionStatus.Active)).toBe(false);
      expect(session.canTransitionTo(WellnessSessionStatus.Paused)).toBe(false);
      expect(session.canTransitionTo(WellnessSessionStatus.Completed)).toBe(false);
    });
  });

  describe('Pause and Resume', () => {
    it('should pause an active session', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();

      await session.pause();
      expect(session.status).toBe(WellnessSessionStatus.Paused);
    });

    it('should resume a paused session', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Paused
      }));
      await session.save();

      await session.resume();
      expect(session.status).toBe(WellnessSessionStatus.Active);
    });

    it('should not pause a completed session', async () => {
      const session = new TestSession(createCompletedTestSessionData());
      await session.save();

      await expect(session.pause()).rejects.toThrow('Cannot pause session in completed status');
    });

    it('should not resume an active session', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();

      await expect(session.resume()).rejects.toThrow('Cannot resume session in active status');
    });

    it('should not resume an abandoned session', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Abandoned
      }));
      await session.save();

      await expect(session.resume()).rejects.toThrow('Cannot resume session in abandoned status');
    });
  });

  describe('Session Completion and Abandonment', () => {
    it('should complete an active session', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();

      await session.complete(WellnessMoodState.Peaceful);
      expect(session.status).toBe(WellnessSessionStatus.Completed);
      expect(session.moodAfter).toBe(WellnessMoodState.Peaceful);
      expect(session.endTime).toBeDefined();
    });

    it('should not complete a paused session', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Paused
      }));
      await session.save();

      await expect(session.complete()).rejects.toThrow(
        `Cannot complete session in ${WellnessSessionStatus.Paused} status`
      );
    });

    it('should abandon an active session', async () => {
      const session = new TestSession(createTestSessionData());
      await session.save();

      await session.abandon();
      expect(session.status).toBe(WellnessSessionStatus.Abandoned);
      expect(session.endTime).toBeDefined();
    });

    it('should abandon a paused session', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Paused
      }));
      await session.save();

      await session.abandon();
      expect(session.status).toBe(WellnessSessionStatus.Abandoned);
      expect(session.endTime).toBeDefined();
    });

    it('should not complete an abandoned session', async () => {
      const session = new TestSession(createTestSessionData({
        status: WellnessSessionStatus.Abandoned
      }));
      await session.save();

      await expect(session.complete()).rejects.toThrow('Cannot complete session in abandoned status');
    });

    it('should not abandon a completed session', async () => {
      const session = new TestSession(createCompletedTestSessionData());
      await session.save();

      await expect(session.abandon()).rejects.toThrow('Cannot abandon session in completed status');
    });
  });
}); 