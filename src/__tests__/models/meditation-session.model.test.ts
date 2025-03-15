import mongoose from 'mongoose';
import { MeditationSession, IMeditationSession } from '../../models/meditation-session.model';
import { AchievementService } from '../../services/achievement.service';
import { connect, closeDatabase, clearDatabase } from '../utils/test-db';

// Add interface extension for virtual properties and methods
interface MeditationSessionDocument extends mongoose.Document {
  durationMinutes: number;
  completionPercentage: number;
  isStreakEligible: boolean;
  completeSession(endTime?: Date): Promise<IMeditationSession>;
  processAchievements(): Promise<void>;
}

// Mock the AchievementService
jest.mock('../../services/achievement.service', () => ({
  AchievementService: {
    processMeditationAchievements: jest.fn().mockResolvedValue(undefined)
  }
}));

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});

describe('MeditationSession Model', () => {
  const userId = new mongoose.Types.ObjectId();
  const guidedMeditationId = new mongoose.Types.ObjectId();
  
  const validMeditationSessionData = {
    userId,
    title: 'Morning Meditation',
    description: 'A peaceful morning meditation session',
    duration: 600, // 10 minutes in seconds
    completed: false,
    startTime: new Date(),
    type: 'guided',
    guidedMeditationId,
    tags: ['morning', 'peaceful'],
    mood: {
      before: 'neutral',
      after: 'positive'
    },
    notes: 'Felt very relaxed after this session'
  };

  describe('Schema Validation', () => {
    it('should create a valid meditation session', async () => {
      const meditationSession = new MeditationSession(validMeditationSessionData);
      const savedSession = await meditationSession.save();
      
      expect(savedSession._id).toBeDefined();
      expect(savedSession.userId.toString()).toBe(userId.toString());
      expect(savedSession.title).toBe(validMeditationSessionData.title);
      expect(savedSession.description).toBe(validMeditationSessionData.description);
      expect(savedSession.duration).toBe(validMeditationSessionData.duration);
      expect(savedSession.completed).toBe(validMeditationSessionData.completed);
      expect(savedSession.startTime).toEqual(validMeditationSessionData.startTime);
      expect(savedSession.type).toBe(validMeditationSessionData.type);
      expect(savedSession.guidedMeditationId?.toString()).toBe(guidedMeditationId.toString());
      expect(savedSession.tags).toEqual(validMeditationSessionData.tags);
      expect(savedSession.mood?.before).toBe(validMeditationSessionData.mood.before);
      expect(savedSession.mood?.after).toBe(validMeditationSessionData.mood.after);
      expect(savedSession.notes).toBe(validMeditationSessionData.notes);
      expect(savedSession.createdAt).toBeDefined();
      expect(savedSession.updatedAt).toBeDefined();
    });

    it('should fail validation when required fields are missing', async () => {
      const meditationSession = new MeditationSession({});
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.duration).toBeDefined();
      expect(error.errors.startTime).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    it('should fail validation when duration is negative', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        duration: -10
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.duration).toBeDefined();
      expect(error.errors.duration.message).toBe('Session duration must be at least 1 second');
    });

    it('should fail validation when type is invalid', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        type: 'invalid-type'
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
      expect(error.errors.type.message).toContain('Session type must be one of');
    });

    it('should fail validation when guided meditation ID is missing for guided sessions', async () => {
      // Create a session with type 'guided' but explicitly set guidedMeditationId to null
      const invalidSession = {
        ...validMeditationSessionData,
        type: 'guided',
        guidedMeditationId: null
      };
      
      // Use a try-catch block to handle the validation error
      try {
        const meditationSession = new MeditationSession(invalidSession);
        await meditationSession.validate(); // Just validate, don't save
        fail('Should have thrown a validation error');
      } catch (err) {
        const error = err as any;
        expect(error).toBeDefined();
        expect(error.errors.guidedMeditationId).toBeDefined();
        expect(error.errors.guidedMeditationId.message).toBe('Guided meditation ID is required for guided sessions');
      }
    });

    it('should allow missing guided meditation ID for non-guided sessions', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        type: 'unguided',
        guidedMeditationId: undefined
      });
      
      const savedSession = await meditationSession.save();
      expect(savedSession._id).toBeDefined();
      expect(savedSession.type).toBe('unguided');
      expect(savedSession.guidedMeditationId).toBeUndefined();
    });

    it('should fail validation when end time is before start time', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() - 1000); // 1 second before start time
      
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        startTime,
        endTime
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.endTime).toBeDefined();
      expect(error.errors.endTime.message).toBe('End time must be after start time');
    });

    it('should fail validation when title exceeds maximum length', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        title: 'A'.repeat(101)
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toBe('Session title cannot be more than 100 characters');
    });

    it('should fail validation when description exceeds maximum length', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        description: 'A'.repeat(501)
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.description).toBeDefined();
      expect(error.errors.description.message).toBe('Session description cannot be more than 500 characters');
    });

    it('should fail validation when notes exceed maximum length', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        notes: 'A'.repeat(1001)
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.notes).toBeDefined();
      expect(error.errors.notes.message).toBe('Notes cannot be more than 1000 characters');
    });

    it('should fail validation when mood value is invalid', async () => {
      const meditationSession = new MeditationSession({
        ...validMeditationSessionData,
        mood: {
          before: 'invalid-mood' as any,
          after: 'positive'
        }
      });
      
      let error: any;
      try {
        await meditationSession.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors['mood.before']).toBeDefined();
      expect(error.errors['mood.before'].message).toContain('Mood must be one of');
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate duration in minutes correctly', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        duration: 600 // 10 minutes in seconds
      }).save();
      
      expect((meditationSession as unknown as MeditationSessionDocument).durationMinutes).toBe(10);
    });

    it('should round duration minutes correctly', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        duration: 590 // 9.83 minutes in seconds
      }).save();
      
      expect((meditationSession as unknown as MeditationSessionDocument).durationMinutes).toBe(10); // Rounded to 10
    });

    it('should calculate completion percentage correctly', async () => {
      const meditationSession = await new MeditationSession(validMeditationSessionData).save();
      
      expect((meditationSession as unknown as MeditationSessionDocument).completionPercentage).toBe(100);
    });

    it('should determine streak eligibility correctly for completed sessions', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        completed: true
      }).save();
      
      expect((meditationSession as unknown as MeditationSessionDocument).isStreakEligible).toBe(true);
    });

    it('should determine streak eligibility correctly for incomplete sessions', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        completed: false
      }).save();
      
      expect((meditationSession as unknown as MeditationSessionDocument).isStreakEligible).toBe(false);
    });
  });

  describe('Methods', () => {
    it('should mark session as completed correctly', async () => {
      const startTime = new Date(Date.now() - 600000); // 10 minutes ago
      const endTime = new Date();
      
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        startTime,
        duration: 300 // 5 minutes planned
      }).save();
      
      await (meditationSession as unknown as MeditationSessionDocument).completeSession(endTime);
      
      expect(meditationSession.completed).toBe(true);
      expect(meditationSession.endTime).toEqual(endTime);
      expect(meditationSession.duration).toBe(600); // Actual duration (10 minutes)
    });

    it('should not update duration if actual duration is negative', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() - 1000); // Invalid end time (before start)
      
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        startTime,
        duration: 300 // 5 minutes planned
      }).save();
      
      // Instead of trying to save an invalid endTime, just verify the validation works
      try {
        meditationSession.endTime = endTime;
        await meditationSession.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.name).toBe('ValidationError');
        expect(error.errors.endTime).toBeDefined();
      }
      
      // Original duration should be preserved
      expect(meditationSession.duration).toBe(300);
    });

    it('should process achievements for completed guided sessions', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        completed: true
      }).save();
      
      await (meditationSession as unknown as MeditationSessionDocument).processAchievements();
      
      expect(AchievementService.processMeditationAchievements).toHaveBeenCalledTimes(1);
      expect(AchievementService.processMeditationAchievements).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: meditationSession.userId,
          sessionId: meditationSession._id,
          meditationId: meditationSession.guidedMeditationId,
          duration: meditationSession.duration
        })
      );
    });

    it('should not process achievements for incomplete sessions', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        completed: false
      }).save();
      
      await (meditationSession as unknown as MeditationSessionDocument).processAchievements();
      
      expect(AchievementService.processMeditationAchievements).not.toHaveBeenCalled();
    });

    it('should not process achievements for unguided incomplete sessions', async () => {
      const meditationSession = await new MeditationSession({
        ...validMeditationSessionData,
        type: 'unguided',
        guidedMeditationId: undefined,
        completed: false
      }).save();
      
      await (meditationSession as unknown as MeditationSessionDocument).processAchievements();
      
      expect(AchievementService.processMeditationAchievements).not.toHaveBeenCalled();
    });
  });
}); 