import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { MeditationSession, IMeditationSession } from '../models/meditation-session.model';
import { Achievement, IAchievement } from '../models/achievement.model';
import { AchievementService } from '../services/achievement.service';

describe('Achievement System', () => {
  let user: IUser & { _id: mongoose.Types.ObjectId };
  let meditation: mongoose.Document & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    try {
      // Create test user
      const createdUser = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        isActive: true
      });
      user = createdUser as IUser & { _id: mongoose.Types.ObjectId };

      // Create test meditation
      const createdMeditation = await Meditation.create({
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
      meditation = createdMeditation as mongoose.Document & { _id: mongoose.Types.ObjectId };

      // Initialize achievements for user
      await AchievementService.initializeAchievements(user._id.toString());
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  describe('Time-based Achievements', () => {
    it('should award Early Bird achievement', async () => {
      // Create 5 early morning sessions
      for (let i = 0; i < 5; i++) {
        const session = await MeditationSession.create({
          userId: user._id,
          meditationId: meditation._id,
          startTime: new Date(`2024-03-${12 + i}T07:00:00`), // 7 AM
          durationCompleted: 10,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'good'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievement = await Achievement.findOne({
        userId: user._id,
        type: 'early_bird'
      });

      expect(achievement).toBeDefined();
      expect(achievement?.completed).toBe(true);
      expect(achievement?.progress).toBe(5);
    });
  });

  describe('Duration-based Achievements', () => {
    it('should award Marathon Meditator achievement', async () => {
      const session = await MeditationSession.create({
        userId: user._id,
        meditationId: meditation._id,
        startTime: new Date(),
        durationCompleted: 35, // > 30 minutes
        completed: true,
        moodBefore: 'neutral',
        moodAfter: 'good'
      });

      await AchievementService.processSession(session.toObject());

      const achievement = await Achievement.findOne({
        userId: user._id,
        type: 'marathon_meditator'
      });

      expect(achievement).toBeDefined();
      expect(achievement?.completed).toBe(true);
      expect(achievement?.progress).toBe(1);
    });
  });

  describe('Streak-based Achievements', () => {
    it('should award Week Warrior achievement', async () => {
      // Create 7 consecutive daily sessions
      for (let i = 0; i < 7; i++) {
        const session = await MeditationSession.create({
          userId: user._id,
          meditationId: meditation._id,
          startTime: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), // Past 7 days
          durationCompleted: 10,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'good',
          streakDay: i + 1,
          maintainedStreak: true
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievement = await Achievement.findOne({
        userId: user._id,
        type: 'week_warrior'
      });

      expect(achievement).toBeDefined();
      expect(achievement?.completed).toBe(true);
    });
  });

  describe('Mood-based Achievements', () => {
    it('should award Mood Lifter achievement', async () => {
      // Create 10 sessions with mood improvement
      for (let i = 0; i < 10; i++) {
        const session = await MeditationSession.create({
          userId: user._id,
          meditationId: meditation._id,
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          durationCompleted: 10,
          completed: true,
          moodBefore: 'bad',
          moodAfter: 'good'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievement = await Achievement.findOne({
        userId: user._id,
        type: 'mood_lifter'
      });

      expect(achievement).toBeDefined();
      expect(achievement?.completed).toBe(true);
      expect(achievement?.progress).toBe(10);
    });
  });

  describe('Points System', () => {
    it('should correctly calculate total points', async () => {
      // Complete multiple achievements
      const session = await MeditationSession.create({
        userId: user._id,
        meditationId: meditation._id,
        startTime: new Date('2024-03-12T07:00:00'), // Early Bird
        durationCompleted: 35, // Marathon Meditator
        completed: true,
        moodBefore: 'bad',
        moodAfter: 'very_good' // Zen State
      });

      await AchievementService.processSession(session.toObject());

      const points = await AchievementService.getUserPoints(user._id.toString());
      expect(points).toBeGreaterThan(0);
    });
  });
}); 