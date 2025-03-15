import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../utils/test-db';
import { PMRService } from '../../services/pmr.service';
import { PMRSession, MuscleGroup } from '../../models/pmr.model';

describe('PMRService', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('getMuscleGroups', () => {
    it('should return muscle groups in correct order', async () => {
      // Create test muscle groups
      await MuscleGroup.create([
        { name: 'Hands', order: 1, description: 'Hands and fingers', durationSeconds: 30 },
        { name: 'Arms', order: 2, description: 'Biceps and forearms', durationSeconds: 30 },
        { name: 'Shoulders', order: 3, description: 'Shoulder muscles', durationSeconds: 30 }
      ]);

      const muscleGroups = await PMRService.getMuscleGroups();
      
      expect(muscleGroups).toHaveLength(3);
      expect(muscleGroups[0].name).toBe('Hands');
      expect(muscleGroups[1].name).toBe('Arms');
      expect(muscleGroups[2].name).toBe('Shoulders');
    });
  });

  describe('startSession', () => {
    it('should create a new PMR session', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const stressLevelBefore = 7;

      const session = await PMRService.startSession(userId, stressLevelBefore);
      
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.stressLevelBefore).toBe(stressLevelBefore);
      expect(session.completedGroups).toEqual([]);
    });
  });
}); 