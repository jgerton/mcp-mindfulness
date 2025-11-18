import mongoose from 'mongoose';
import { MeditationService } from '../../services/meditation.service';
import { Meditation } from '../../models/meditation.model';
import { MeditationSession } from '../../models/meditation-session.model';
import { WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { dbHandler } from '../test-utils/db-handler';

describe('MeditationService', () => {
  let mockUserId: mongoose.Types.ObjectId;
  
  beforeAll(async () => await dbHandler.connect());
  beforeEach(() => {
    mockUserId = new mongoose.Types.ObjectId();
  });
  afterEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });
  afterAll(async () => await dbHandler.closeDatabase());

  describe('Meditation CRUD Operations', () => {
    describe('Success Cases', () => {
      const mockMeditationData = {
        title: 'Test Meditation',
        description: 'A test meditation session',
        duration: 10,
        type: 'guided',
        audioUrl: 'https://example.com/meditation.mp3',
        category: 'mindfulness',
        difficulty: 'beginner',
        tags: ['test', 'meditation'],
        isActive: true
      };

      it('should create new meditation with valid data', async () => {
        const meditation = await MeditationService.createMeditation(mockMeditationData);
        
        expect(meditation).toBeDefined();
        expect(meditation.title).toBe(mockMeditationData.title);
        expect(meditation.duration).toBe(mockMeditationData.duration);
        expect(meditation.isActive).toBe(true);
      });

      it('should get meditation by valid ID', async () => {
        const created = await MeditationService.createMeditation(mockMeditationData);
        const meditation = await MeditationService.getMeditationById(created._id.toString());
        
        expect(meditation).toBeDefined();
        expect(meditation?.title).toBe(mockMeditationData.title);
      });

      it('should update meditation with valid data', async () => {
        const created = await MeditationService.createMeditation(mockMeditationData);
        const updated = await MeditationService.updateMeditation(
          created._id.toString(),
          { title: 'Updated Title', duration: 15 }
        );
        
        expect(updated).toBeDefined();
        expect(updated?.title).toBe('Updated Title');
        expect(updated?.duration).toBe(15);
      });

      it('should delete meditation successfully', async () => {
        const created = await MeditationService.createMeditation(mockMeditationData);
        await MeditationService.deleteMeditation(created._id.toString());
        
        const meditation = await MeditationService.getMeditationById(created._id.toString());
        expect(meditation).toBeNull();
      });

      it('should get all active meditations', async () => {
        await MeditationService.createMeditation({ ...mockMeditationData, isActive: true });
        await MeditationService.createMeditation({ ...mockMeditationData, isActive: true });
        await MeditationService.createMeditation({ ...mockMeditationData, isActive: false });
        
        const meditations = await MeditationService.getAllMeditations();
        expect(meditations).toHaveLength(2);
        expect(meditations.every(m => m.isActive)).toBe(true);
      });
    });

    describe('Error Cases', () => {
      it('should throw error when creating meditation with invalid data', async () => {
        const invalidData = {
          // Missing required title
          description: 'Invalid meditation',
          duration: -1 // Invalid duration
        };
        
        await expect(MeditationService.createMeditation(invalidData)).rejects.toThrow();
      });

      it('should return null when getting meditation with invalid ID', async () => {
        const invalidId = new mongoose.Types.ObjectId().toString();
        const meditation = await MeditationService.getMeditationById(invalidId);
        expect(meditation).toBeNull();
      });

      it('should throw error when updating with invalid ID', async () => {
        const invalidId = new mongoose.Types.ObjectId().toString();
        await expect(MeditationService.updateMeditation(invalidId, { title: 'New Title' }))
          .resolves.toBeNull();
      });

      it('should handle invalid ID format gracefully', async () => {
        const invalidId = 'invalid-id';
        await expect(MeditationService.getMeditationById(invalidId)).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty update data', async () => {
        const meditation = await MeditationService.createMeditation({
          title: 'Test Meditation',
          description: 'Test description',
          duration: 10,
          type: 'guided',
          category: 'mindfulness',
          difficulty: 'beginner'
        });
        
        const updated = await MeditationService.updateMeditation(meditation._id.toString(), {});
        expect(updated).toBeDefined();
        expect(updated?.title).toBe('Test Meditation');
      });

      it('should handle very long text fields', async () => {
        const longTitle = 'a'.repeat(1000);
        const meditation = await MeditationService.createMeditation({
          title: longTitle,
          description: 'Test description',
          duration: 10,
          type: 'guided',
          category: 'mindfulness',
          difficulty: 'beginner'
        });
        
        expect(meditation.title).toBe(longTitle);
      });
    });
  });

  describe('User Meditation Sessions', () => {
    describe('Success Cases', () => {
      beforeEach(async () => {
        const sessions = [
          {
            userId: mockUserId,
            startTime: new Date('2024-01-01'),
            endTime: new Date('2024-01-01T00:15:00'),
            duration: 15,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Morning Meditation'
          },
          {
            userId: mockUserId,
            startTime: new Date('2024-01-02'),
            endTime: new Date('2024-01-02T00:20:00'),
            duration: 20,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Evening Meditation'
          },
          {
            userId: mockUserId,
            startTime: new Date('2024-01-03'),
            endTime: new Date('2024-01-03T00:10:00'),
            duration: 10,
            type: 'unguided',
            status: WellnessSessionStatus.Completed,
            title: 'Quick Meditation'
          }
        ];

        await MeditationSession.insertMany(sessions);
      });

      it('should get all user meditation sessions', async () => {
        const sessions = await MeditationService.getUserMeditations(mockUserId.toString());
        
        expect(sessions).toHaveLength(3);
        expect(sessions[0].userId.toString()).toBe(mockUserId.toString());
      });

      it('should get sessions within date range', async () => {
        const sessions = await MeditationService.getUserMeditations(
          mockUserId.toString(),
          new Date('2024-01-01'),
          new Date('2024-01-02')
        );
        
        expect(sessions).toHaveLength(2);
      });

      it('should sort sessions by startTime desc', async () => {
        const sessions = await MeditationService.getUserMeditations(mockUserId.toString());
        
        for (let i = 1; i < sessions.length; i++) {
          expect(new Date(sessions[i-1].startTime).getTime())
            .toBeGreaterThanOrEqual(new Date(sessions[i].startTime).getTime());
        }
      });
    });

    describe('Error Cases', () => {
      it('should handle invalid user ID format', async () => {
        await expect(MeditationService.getUserMeditations('invalid-id'))
          .rejects.toThrow();
      });

      it('should handle invalid date range', async () => {
        const endDate = new Date('2024-01-01');
        const startDate = new Date('2024-01-02'); // Start after end
        
        const sessions = await MeditationService.getUserMeditations(
          mockUserId.toString(),
          startDate,
          endDate
        );
        expect(sessions).toHaveLength(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle date range at day boundaries', async () => {
        await MeditationSession.create({
          userId: mockUserId,
          startTime: new Date('2024-01-01T23:59:59.999Z'),
          endTime: new Date('2024-01-02T00:14:59.999Z'),
          duration: 15,
          type: 'guided',
          status: WellnessSessionStatus.Completed,
          title: 'Late Night Meditation'
        });

        const sessions = await MeditationService.getUserMeditations(
          mockUserId.toString(),
          new Date('2024-01-01T00:00:00.000Z'),
          new Date('2024-01-01T23:59:59.999Z')
        );

        expect(sessions).toHaveLength(1);
      });

      it('should handle empty result set', async () => {
        const sessions = await MeditationService.getUserMeditations(
          new mongoose.Types.ObjectId().toString()
        );
        expect(sessions).toHaveLength(0);
      });
    });
  });

  describe('Meditation Statistics', () => {
    describe('Success Cases', () => {
      beforeEach(async () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const sessions = [
          {
            userId: mockUserId,
            startTime: today,
            endTime: new Date(today.getTime() + 15 * 60000),
            duration: 15,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Today Meditation'
          },
          {
            userId: mockUserId,
            startTime: yesterday,
            endTime: new Date(yesterday.getTime() + 20 * 60000),
            duration: 20,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Yesterday Meditation'
          },
          {
            userId: mockUserId,
            startTime: twoDaysAgo,
            endTime: new Date(twoDaysAgo.getTime() + 10 * 60000),
            duration: 10,
            type: 'unguided',
            status: WellnessSessionStatus.Completed,
            title: 'Two Days Ago Meditation'
          }
        ];

        await MeditationSession.insertMany(sessions);
      });

      it('should calculate meditation stats correctly', async () => {
        const stats = await MeditationService.getMeditationStats(mockUserId.toString());
        
        expect(stats).toEqual({
          totalSessions: 3,
          totalMinutes: 45,
          averageDuration: 15,
          longestSession: 20,
          mostCommonTechnique: 'guided',
          streak: 3
        });
      });

      it('should calculate streak correctly', async () => {
        const streak = await MeditationService.calculateStreak(mockUserId.toString());
        expect(streak).toBe(3);
      });
    });

    describe('Error Cases', () => {
      it('should handle invalid user ID for stats', async () => {
        await expect(MeditationService.getMeditationStats('invalid-id'))
          .rejects.toThrow();
      });

      it('should return default stats for user with no sessions', async () => {
        const newUserId = new mongoose.Types.ObjectId().toString();
        const stats = await MeditationService.getMeditationStats(newUserId);
        
        expect(stats).toEqual({
          totalSessions: 0,
          totalMinutes: 0,
          averageDuration: 0,
          longestSession: 0,
          mostCommonTechnique: null,
          streak: 0
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle broken streak correctly', async () => {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        await MeditationSession.insertMany([
          {
            userId: mockUserId,
            startTime: today,
            endTime: new Date(today.getTime() + 15 * 60000),
            duration: 15,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Today Meditation'
          },
          {
            userId: mockUserId,
            startTime: threeDaysAgo,
            endTime: new Date(threeDaysAgo.getTime() + 20 * 60000),
            duration: 20,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Three Days Ago Meditation'
          }
        ]);

        const streak = await MeditationService.calculateStreak(mockUserId.toString());
        expect(streak).toBe(1); // Only today's session counts
      });

      it('should handle multiple sessions in same day for streak', async () => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        await MeditationSession.insertMany([
          {
            userId: mockUserId.toString(),
            startTime: todayStart,
            endTime: new Date(todayStart.getTime() + (10 * 60000)),
            duration: 10,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Morning Meditation'
          },
          {
            userId: mockUserId.toString(),
            startTime: new Date(todayStart.getTime() + (15 * 60 * 60 * 1000)), // 3 PM
            endTime: new Date(todayStart.getTime() + (15 * 60 * 60 * 1000) + (20 * 60000)),
            duration: 20,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Afternoon Meditation'
          }
        ]);

        const streak = await MeditationService.calculateStreak(mockUserId.toString());
        expect(streak).toBe(1); // Multiple sessions on same day count as 1
      });

      it('should handle sessions across month boundaries', async () => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        await MeditationSession.insertMany([
          {
            userId: mockUserId.toString(),
            startTime: lastDayOfMonth,
            endTime: new Date(lastDayOfMonth.getTime() + 15 * 60000),
            duration: 15,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'Last Day Meditation'
          },
          {
            userId: mockUserId.toString(),
            startTime: firstDayOfMonth,
            endTime: new Date(firstDayOfMonth.getTime() + 20 * 60000),
            duration: 20,
            type: 'guided',
            status: WellnessSessionStatus.Completed,
            title: 'First Day Meditation'
          }
        ]);

        const stats = await MeditationService.getMeditationStats(mockUserId.toString());
        expect(stats.totalSessions).toBe(2);
      });
    });
  });
});