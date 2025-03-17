import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { Meditation } from '../models/meditation.model';
import { MeditationSession, IMeditationSession } from '../models/meditation-session.model';
import { Achievement, IAchievement } from '../models/achievement.model';
import { AchievementService } from '../services/achievement.service';
import { clearTestCollection, getTestObjectId } from './helpers/db';

describe('Achievement System', () => {
  let userId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;
  let achievementService: AchievementService;

  beforeEach(async () => {
    await clearTestCollection('users');
    await clearTestCollection('meditations');
    await clearTestCollection('meditationsessions');
    await clearTestCollection('achievements');
    await clearTestCollection('userpoints');
    
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    const meditation = await Meditation.create({
      title: 'Test Meditation',
      description: 'Test Description',
      audioUrl: 'test.mp3',
      duration: 10,
      difficulty: 'beginner',
      category: 'mindfulness',
      type: 'guided'
    });
    userId = user._id;
    meditationId = meditation._id;
    achievementService = new AchievementService();
  });

  describe('Time-based Achievements', () => {
    it.skip('should award Early Bird achievement', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      const session = await MeditationSession.create({
        userId,
        meditationId,
        startTime: new Date('2024-03-12T05:00:00'),
        endTime: new Date('2024-03-12T05:10:00'),
        duration: 10,
        durationCompleted: 10,
        status: 'completed',
        interruptions: 0,
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });

      await AchievementService.processSession(session.toObject());

      const achievements = await Achievement.find({ userId, type: 'early_bird' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].completed).toBe(true);
    });
  });

  describe('Duration-based Achievements', () => {
    it.skip('should award Marathon Meditator achievement', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      const session = await MeditationSession.create({
        userId,
        meditationId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
        duration: 30,
        durationCompleted: 30,
        status: 'completed',
        interruptions: 0,
        completed: true,
        moodBefore: 'neutral',
        moodAfter: 'peaceful'
      });

      await AchievementService.processSession(session.toObject());

      const achievements = await Achievement.find({ userId, type: 'marathon_meditator' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(1);
    });
  });

  describe('Streak-based Achievements', () => {
    it.skip('should award Week Warrior achievement', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      // Create 7 consecutive daily sessions
      const now = Date.now();
      for (let i = 0; i < 7; i++) {
        const session = await MeditationSession.create({
          userId,
          meditationId,
          startTime: new Date(now - (6 - i) * 24 * 60 * 60 * 1000),
          endTime: new Date(now - (6 - i) * 24 * 60 * 60 * 1000 + 10 * 60000),
          duration: 10,
          durationCompleted: 10,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievements = await Achievement.find({ userId, type: 'week_warrior' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(7);
    });
  });

  describe('Mood-based Achievements', () => {
    it.skip('should award Mood Lifter achievement', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      // Create 10 sessions with mood improvement
      for (let i = 0; i < 10; i++) {
        const session = await MeditationSession.create({
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 10 * 60000),
          duration: 10,
          durationCompleted: 10,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'anxious',
          moodAfter: 'peaceful'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievements = await Achievement.find({ userId, type: 'mood_lifter' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(10);
    });
  });

  describe('Duration Achievements', () => {
    it.skip('should award beginner achievement for first session', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      const session = await MeditationSession.create({
        userId,
        meditationId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 10 * 60000),
        duration: 10,
        durationCompleted: 10,
        status: 'completed',
        interruptions: 0,
        completed: true,
        moodBefore: 'neutral',
        moodAfter: 'peaceful'
      });

      await AchievementService.processSession(session.toObject());

      const achievements = await Achievement.find({ userId, type: 'beginner_meditator' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(1);
    });

    it.skip('should award intermediate achievement after 10 sessions', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      // Create 10 sessions
      for (let i = 0; i < 10; i++) {
        const session = await MeditationSession.create({
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 10 * 60000),
          duration: 10,
          durationCompleted: 10,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievements = await Achievement.find({ userId, type: 'intermediate_meditator' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(10);
    });

    it.skip('should award advanced achievement after 50 sessions', async () => {
      await AchievementService.initializeAchievements(userId.toString());
      
      // Create 50 sessions
      for (let i = 0; i < 50; i++) {
        const session = await MeditationSession.create({
          userId,
          meditationId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 10 * 60000),
          duration: 10,
          durationCompleted: 10,
          status: 'completed',
          interruptions: 0,
          completed: true,
          moodBefore: 'neutral',
          moodAfter: 'peaceful'
        });

        await AchievementService.processSession(session.toObject());
      }

      const achievements = await Achievement.find({ userId, type: 'advanced_meditator' });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].progress).toBe(50);
    });

    it.skip('should not award achievements for incomplete sessions', async () => {
      // Create an incomplete session
      const session = new MeditationSession({
        userId,
        meditationId: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        duration: 600,
        durationCompleted: 300,
        interruptions: 2,
        status: 'abandoned', // Use a valid status enum value
        moodBefore: 'anxious',
        moodAfter: 'neutral'
      });
      await session.save();
      
      // Process achievements
      await session.processAchievements();
      
      // Check that no achievements were awarded
      const achievements = await Achievement.find({ userId });
      expect(achievements.filter(a => a.completed)).toHaveLength(0);
    });
  });

  describe('Points System', () => {
    it.skip('should calculate total points correctly', async () => {
      // Create achievements that award points
      const session1 = new MeditationSession({
        userId,
        meditationId: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        duration: 600,
        durationCompleted: 600,
        interruptions: 0,
        status: 'completed',
        moodBefore: 'anxious',
        moodAfter: 'calm'
      });
      await session1.save();
      await session1.processAchievements();
      
      // Check the points
      const totalPoints = await AchievementService.getUserPoints(userId.toString());
      expect(totalPoints.total).toBeGreaterThan(0); // Should have some points
    });

    it('should return 0 points for user with no achievements', async () => {
      const totalPoints = await AchievementService.getUserPoints(userId.toString());
      expect(totalPoints.total).toBe(0);
    });
  });
}); 