import mongoose from 'mongoose';
import { Achievement } from '../models/achievement.model';
import { IMeditationSession } from '../models/meditation-session.model';

export class AchievementService {
  static async initializeAchievements(userId: mongoose.Types.ObjectId | string) {
    const achievements = [
      {
        userId,
        type: 'early_bird',
        title: 'Early Bird',
        description: 'Complete 5 meditation sessions before 8 AM',
        points: 50,
        progress: 0,
        completed: false
      },
      {
        userId,
        type: 'night_owl',
        title: 'Night Owl',
        description: 'Complete 5 meditation sessions after 10 PM',
        points: 50,
        progress: 0,
        completed: false
      },
      {
        userId,
        type: 'marathon_meditator',
        title: 'Marathon Meditator',
        description: 'Complete a meditation session longer than 30 minutes',
        points: 100,
        progress: 0,
        completed: false
      },
      {
        userId,
        type: 'week_warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day meditation streak',
        points: 150,
        progress: 0,
        completed: false
      },
      {
        userId,
        type: 'zen_master',
        title: 'Zen Master',
        description: 'Maintain a 30-day meditation streak',
        points: 500,
        progress: 0,
        completed: false
      },
      {
        userId,
        type: 'mood_lifter',
        title: 'Mood Lifter',
        description: 'Improve your mood in 10 meditation sessions',
        points: 200,
        progress: 0,
        completed: false
      }
    ];

    await Achievement.insertMany(achievements);
  }

  static async processSession(session: IMeditationSession) {
    if (!session.completed) return;

    const userId = typeof session.userId === 'string' ? session.userId : session.userId.toString();

    await Promise.all([
      this.processTimeBasedAchievements(session),
      this.processDurationAchievements(session),
      this.processStreakAchievements(session),
      this.processMoodAchievements(session)
    ]);
  }

  private static async processTimeBasedAchievements(session: IMeditationSession) {
    const hour = session.startTime.getHours();
    const userId = typeof session.userId === 'string' ? session.userId : session.userId.toString();

    if (hour < 8) {
      await this.incrementAchievement(userId, 'early_bird', 5);
    } else if (hour >= 22) {
      await this.incrementAchievement(userId, 'night_owl', 5);
    }
  }

  private static async processDurationAchievements(session: IMeditationSession) {
    const userId = typeof session.userId === 'string' ? session.userId : session.userId.toString();

    if (session.durationCompleted >= 30) {
      await this.completeAchievement(userId, 'marathon_meditator');
    }
  }

  private static async processStreakAchievements(session: IMeditationSession) {
    const streakDay = session.streakDay || 0;
    const userId = typeof session.userId === 'string' ? session.userId : session.userId.toString();

    if (streakDay >= 7) {
      await this.completeAchievement(userId, 'week_warrior');
    }
    if (streakDay >= 30) {
      await this.completeAchievement(userId, 'zen_master');
    }
    if (streakDay >= 100) {
      await this.completeAchievement(userId, 'enlightened_one');
    }
  }

  private static async processMoodAchievements(session: IMeditationSession) {
    const moodBefore = session.moodBefore;
    const moodAfter = session.moodAfter;
    const userId = typeof session.userId === 'string' ? session.userId : session.userId.toString();

    if (moodBefore && moodAfter) {
      const moodValues = {
        'very_bad': 1,
        'bad': 2,
        'neutral': 3,
        'good': 4,
        'very_good': 5
      };

      if (moodValues[moodAfter] > moodValues[moodBefore]) {
        await this.incrementAchievement(userId, 'mood_lifter', 10);
      }
    }
  }

  private static async incrementAchievement(userId: mongoose.Types.ObjectId | string, type: string, maxProgress: number) {
    const achievement = await Achievement.findOne({ userId, type });
    if (achievement && !achievement.completed) {
      achievement.progress += 1;
      if (achievement.progress >= maxProgress) {
        achievement.completed = true;
      }
      await achievement.save();
    }
  }

  private static async completeAchievement(userId: mongoose.Types.ObjectId | string, type: string) {
    const achievement = await Achievement.findOne({ userId, type });
    if (achievement && !achievement.completed) {
      achievement.completed = true;
      achievement.progress = 1;
      await achievement.save();
    }
  }

  static async getUserPoints(userId: mongoose.Types.ObjectId | string): Promise<number> {
    const achievements = await Achievement.find({ userId, completed: true });
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }
} 