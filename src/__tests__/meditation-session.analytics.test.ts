import mongoose from 'mongoose';
import { MeditationSession } from '../models/meditation-session.model';
import { User } from '../models/user.model';
import { Meditation } from '../models/meditation.model';

interface TimeAnalysis {
  _id: {
    hour: number;
    dayOfWeek: number;
  };
  count: number;
  avgDuration: number;
  sessions: any[];
}

interface DurationTrend {
  _id: number;
  count: number;
  totalMinutes: number;
  sessions: any[];
}

describe('Meditation Session Analytics', () => {
  let user: mongoose.Document;
  let meditation: mongoose.Document;

  beforeEach(async () => {
    try {
      // Create test user
      user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        isActive: true
      });

      // Create test meditation
      meditation = await Meditation.create({
        title: 'Test Meditation',
        description: 'Test Description',
        duration: 10,
        audioUrl: 'https://example.com/audio.mp3',
        type: 'guided',
        category: 'mindfulness',
        difficulty: 'beginner',
        tags: ['test'],
        isActive: true
      });
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  describe('Time of Day Patterns', () => {
    it('should correctly group sessions by time blocks', async () => {
      try {
        // Create sessions at different times of day
        const sessions = [
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T06:00:00'), // Early Morning
            durationCompleted: 10,
            completed: true,
            moodBefore: 'neutral' as const,
            moodAfter: 'good' as const
          },
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T12:00:00'), // Afternoon
            durationCompleted: 15,
            completed: true,
            moodBefore: 'bad' as const,
            moodAfter: 'good' as const
          },
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T20:00:00'), // Night
            durationCompleted: 20,
            completed: true,
            moodBefore: 'neutral' as const,
            moodAfter: 'very_good' as const
          }
        ];

        await MeditationSession.insertMany(sessions);

        // Verify sessions were inserted
        const insertedSessions = await MeditationSession.find({ userId: user._id });
        console.log('Inserted sessions:', insertedSessions);

        const stats = await MeditationSession.aggregate([
          { $match: { userId: user._id } },
          {
            $facet: {
              timeAnalysis: [
                {
                  $group: {
                    _id: {
                      hour: { $hour: '$startTime' },
                      dayOfWeek: { $dayOfWeek: '$startTime' }
                    },
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$durationCompleted' }
                  }
                },
                {
                  $sort: { '_id.hour': 1 }
                }
              ]
            }
          }
        ]);

        console.log('Time analysis stats:', JSON.stringify(stats, null, 2));

        const timeAnalysis = stats[0].timeAnalysis as TimeAnalysis[];
        expect(timeAnalysis).toHaveLength(3);
        
        // Verify early morning session (4 AM)
        const morningSession = timeAnalysis.find(t => t._id.hour === 4);
        expect(morningSession).toBeDefined();
        expect(morningSession?.count).toBe(1);
        expect(morningSession?.avgDuration).toBe(20);

        // Verify afternoon session (2 PM)
        const afternoonSession = timeAnalysis.find(t => t._id.hour === 14);
        expect(afternoonSession).toBeDefined();
        expect(afternoonSession?.count).toBe(1);
        expect(afternoonSession?.avgDuration).toBe(10);

        // Verify evening session (8 PM)
        const eveningSession = timeAnalysis.find(t => t._id.hour === 20);
        expect(eveningSession).toBeDefined();
        expect(eveningSession?.count).toBe(1);
        expect(eveningSession?.avgDuration).toBe(15);
      } catch (error) {
        console.error('Error in time analysis test:', error);
        throw error;
      }
    }, 30000);
  });

  describe('Duration Trends', () => {
    it('should correctly analyze session duration patterns', async () => {
      try {
        // Create sessions with different durations
        const sessions = [
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T10:00:00'),
            durationCompleted: 5, // Short session
            completed: true,
            moodBefore: 'bad' as const,
            moodAfter: 'neutral' as const
          },
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T15:00:00'),
            durationCompleted: 15, // Medium session
            completed: true,
            moodBefore: 'neutral' as const,
            moodAfter: 'good' as const
          },
          {
            userId: user._id,
            meditationId: meditation._id,
            startTime: new Date('2024-03-12T20:00:00'),
            durationCompleted: 30, // Long session
            completed: true,
            moodBefore: 'neutral' as const,
            moodAfter: 'very_good' as const
          }
        ];

        await MeditationSession.insertMany(sessions);

        // Verify sessions were inserted
        const insertedSessions = await MeditationSession.find({ userId: user._id });
        console.log('Inserted sessions for duration test:', insertedSessions);

        const stats = await MeditationSession.aggregate([
          { $match: { userId: user._id } },
          {
            $facet: {
              durationTrends: [
                {
                  $bucket: {
                    groupBy: '$durationCompleted',
                    boundaries: [0, 5, 10, 15, 20, 30, 60],
                    default: '60+',
                    output: {
                      count: { $sum: 1 },
                      totalMinutes: { $sum: '$durationCompleted' }
                    }
                  }
                }
              ]
            }
          }
        ]);

        console.log('Duration trends stats:', JSON.stringify(stats, null, 2));

        const durationTrends = stats[0].durationTrends as DurationTrend[];
        expect(durationTrends).toHaveLength(3);
        
        // Verify short session bucket (5 minutes)
        const shortSessions = durationTrends.find(d => d._id === 5);
        expect(shortSessions).toBeDefined();
        expect(shortSessions?.count).toBe(1);
        expect(shortSessions?.totalMinutes).toBe(5);

        // Verify medium session bucket (15 minutes)
        const mediumSessions = durationTrends.find(d => d._id === 15);
        expect(mediumSessions).toBeDefined();
        expect(mediumSessions?.count).toBe(1);
        expect(mediumSessions?.totalMinutes).toBe(15);

        // Verify long session bucket (30 minutes)
        const longSessions = durationTrends.find(d => d._id === 30);
        expect(longSessions).toBeDefined();
        expect(longSessions?.count).toBe(1);
        expect(longSessions?.totalMinutes).toBe(30);
      } catch (error) {
        console.error('Error in duration trends test:', error);
        throw error;
      }
    }, 30000);
  });
}); 