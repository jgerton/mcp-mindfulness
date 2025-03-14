import mongoose from 'mongoose';
import { MeditationSession } from '../models/meditation-session.model';
import { User } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { connectDB, disconnectDB, clearDB } from './helpers/db.helper';

interface TimeAnalysis {
  _id: { hour: number };
  count: number;
  avgDuration: number;
}

interface DurationTrend {
  _id: string;
  count: number;
  totalMinutes: number;
}

describe('Meditation Session Analytics', () => {
  let userId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    userId = new mongoose.Types.ObjectId();
    meditationId = new mongoose.Types.ObjectId();
  });

  describe('Time of Day Patterns', () => {
    it('should correctly group sessions by time blocks', async () => {
      // Create sessions at different times
      await MeditationSession.create([
        {
          userId,
          meditationId,
          startTime: new Date('2024-03-12T06:00:00'),
          endTime: new Date('2024-03-12T06:15:00'),
          duration: 15,
          durationCompleted: 15,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        },
        {
          userId,
          meditationId,
          startTime: new Date('2024-03-12T12:00:00'),
          endTime: new Date('2024-03-12T12:20:00'),
          duration: 20,
          durationCompleted: 20,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'anxious',
          moodAfter: 'calm'
        },
        {
          userId,
          meditationId,
          startTime: new Date('2024-03-12T18:00:00'),
          endTime: new Date('2024-03-12T18:30:00'),
          duration: 30,
          durationCompleted: 30,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'stressed',
          moodAfter: 'calm'
        }
      ]);

      const timeBlockPipeline = [
        { $match: { userId } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: [{ $hour: '$startTime' }, 12] }, then: 'morning' },
                  { case: { $lt: [{ $hour: '$startTime' }, 18] }, then: 'afternoon' },
                  { case: { $lt: [{ $hour: '$startTime' }, 24] }, then: 'evening' }
                ],
                default: 'night'
              }
            },
            count: { $sum: 1 }
          }
        }
      ];

      const results = await MeditationSession.aggregate(timeBlockPipeline);
      expect(results).toHaveLength(3);

      const morning = results.find(r => r._id === 'morning');
      expect(morning.count).toBe(1);

      const afternoon = results.find(r => r._id === 'afternoon');
      expect(afternoon.count).toBe(1);

      const evening = results.find(r => r._id === 'evening');
      expect(evening.count).toBe(1);
    });
  });

  describe('Duration Trends', () => {
    it('should correctly analyze session duration patterns', async () => {
      // Create sessions with different durations
      await MeditationSession.create([
        {
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 5 * 60000),
          duration: 5,
          durationCompleted: 5,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        },
        {
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 15 * 60000),
          duration: 15,
          durationCompleted: 15,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'stressed',
          moodAfter: 'calm'
        },
        {
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 20 * 60000),
          duration: 20,
          durationCompleted: 20,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        },
        {
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 30 * 60000),
          duration: 30,
          durationCompleted: 30,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'stressed',
          moodAfter: 'calm'
        }
      ]);

      const durationPipeline = [
        { $match: { userId } },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ['$duration', 10] }, then: 'short' },
                  { case: { $lte: ['$duration', 20] }, then: 'medium' },
                  { case: { $gt: ['$duration', 20] }, then: 'long' }
                ],
                default: 'unknown'
              }
            },
            count: { $sum: 1 },
            totalMinutes: { $sum: '$duration' }
          }
        }
      ];

      const results = await MeditationSession.aggregate(durationPipeline);
      expect(results).toHaveLength(3);
      
      const short = results.find(r => r._id === 'short');
      expect(short.count).toBe(1);
      expect(short.totalMinutes).toBe(5);

      const medium = results.find(r => r._id === 'medium');
      expect(medium.count).toBe(2);
      expect(medium.totalMinutes).toBe(35);

      const long = results.find(r => r._id === 'long');
      expect(long.count).toBe(1);
      expect(long.totalMinutes).toBe(30);
    });
  });
}); 