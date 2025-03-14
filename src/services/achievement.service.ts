import mongoose from 'mongoose';
import { Achievement } from '../models/achievement.model';
import { IMeditationSession } from '../models/meditation-session.model';
import { IGroupSession } from '../models/group-session.model';
import { Friend } from '../models/friend.model';
import { MeditationSession } from '../models/meditation-session.model';

export interface IAchievement {
  userId: mongoose.Types.ObjectId;
  type: string;
  progress: number;
  target: number;
  completedAt?: Date;
}

type AchievementType = 
  | 'early_bird'
  | 'night_owl'
  | 'marathon_meditator'
  | 'mood_lifter'
  | 'community_pillar'
  | 'group_guide'
  | 'week_warrior'
  | 'mindful_month'
  | 'social_butterfly'
  | 'beginner_meditator'
  | 'intermediate_meditator'
  | 'advanced_meditator';

export class AchievementService {
  private static readonly ACHIEVEMENT_TARGETS: Record<AchievementType | string, number> = {
    early_bird: 5,
    night_owl: 5,
    marathon_meditator: 1,
    mood_lifter: 10,
    community_pillar: 10,
    group_guide: 5,
    week_warrior: 7,
    mindful_month: 30,
    social_butterfly: 5,
    beginner_meditator: 1,
    intermediate_meditator: 10,
    advanced_meditator: 50
  };

  private static readonly ACHIEVEMENT_DETAILS: Record<AchievementType | string, { title: string; description: string; points: number }> = {
    early_bird: {
      title: 'Early Bird',
      description: 'Complete 5 meditation sessions before 9 AM',
      points: 100
    },
    night_owl: {
      title: 'Night Owl',
      description: 'Complete 5 meditation sessions after 10 PM',
      points: 100
    },
    marathon_meditator: {
      title: 'Marathon Meditator',
      description: 'Complete a meditation session of 30 minutes or longer',
      points: 150
    },
    mood_lifter: {
      title: 'Mood Lifter',
      description: 'Improve your mood in 10 meditation sessions',
      points: 200
    },
    community_pillar: {
      title: 'Community Pillar',
      description: 'Participate in 10 group meditation sessions',
      points: 300
    },
    group_guide: {
      title: 'Group Guide',
      description: 'Host 5 group meditation sessions',
      points: 250
    },
    week_warrior: {
      title: 'Week Warrior',
      description: 'Meditate for 7 consecutive days',
      points: 200
    },
    mindful_month: {
      title: 'Mindful Month',
      description: 'Meditate for 30 consecutive days',
      points: 500
    },
    social_butterfly: {
      title: 'Social Butterfly',
      description: 'Make 5 friends in the community',
      points: 150
    },
    beginner_meditator: {
      title: 'Beginner Meditator',
      description: 'Complete your first meditation session',
      points: 10
    },
    intermediate_meditator: {
      title: 'Intermediate Meditator',
      description: 'Complete 10 meditation sessions',
      points: 50
    },
    advanced_meditator: {
      title: 'Advanced Meditator',
      description: 'Complete 50 meditation sessions',
      points: 100
    }
  };

  public static async initializeAchievements(userId: string): Promise<void> {
    const achievementTypes = Object.keys(this.ACHIEVEMENT_TARGETS) as AchievementType[];
    
    for (const type of achievementTypes) {
      await Achievement.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId), type },
        {
          $setOnInsert: {
            userId: new mongoose.Types.ObjectId(userId),
            type,
            progress: 0,
            target: this.ACHIEVEMENT_TARGETS[type],
            title: this.ACHIEVEMENT_DETAILS[type].title,
            description: this.ACHIEVEMENT_DETAILS[type].description,
            points: this.ACHIEVEMENT_DETAILS[type].points,
            completed: false,
            completedAt: null
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  public static async processSession(session: IMeditationSession): Promise<void> {
    if (!session.completed) {
      return;
    }

    const startTime = new Date(session.startTime);
    const hour = startTime.getHours();

    // Early Bird (5-9 AM)
    if (hour >= 5 && hour < 9) {
      await this.completeAchievement(session.userId.toString(), 'early_bird');
    }

    // Night Owl (10 PM-2 AM)
    if (hour >= 22 || hour < 2) {
      await this.completeAchievement(session.userId.toString(), 'night_owl');
    }

    // Marathon Meditator (30+ minutes)
    if (session.duration >= 30) {
      await this.completeAchievement(session.userId.toString(), 'marathon_meditator');
    }

    // Mood Lifter (mood improvement)
    if (session.moodBefore && session.moodAfter && this.isMoodImproved(session.moodBefore, session.moodAfter)) {
      await this.completeAchievement(session.userId.toString(), 'mood_lifter');
    }

    // Week Warrior (7 consecutive days)
    await this.checkStreakAchievements(session);

    // Session count achievements
    await this.checkSessionCountAchievements(session);
  }

  public static async processGroupSession(userId: string): Promise<void> {
    await this.incrementAchievement(userId, 'community_pillar');
  }

  public static async getUserPoints(userId: string): Promise<number> {
    const achievements = await Achievement.find({ 
      userId,
      $or: [
        { completed: true },
        { progress: { $gt: 0 } }
      ]
    });
    
    return achievements.reduce((total, achievement) => {
      if (achievement.completed) {
        return total + (achievement.points || 0);
      }
      // For incomplete achievements, award partial points based on progress
      const progressRatio = achievement.progress / achievement.target;
      return total + Math.floor((achievement.points || 0) * progressRatio);
    }, 0);
  }

  private static isMoodImproved(before: string, after: string): boolean {
    const moodScale = ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'];
    return moodScale.indexOf(after) > moodScale.indexOf(before);
  }

  private static async incrementAchievement(userId: string, type: AchievementType, increment: number = 1): Promise<void> {
    const achievement = await Achievement.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type
    });

    if (!achievement) {
      return;
    }

    achievement.progress = Math.min(achievement.target, achievement.progress + increment);
    
    if (achievement.progress >= achievement.target && !achievement.completed) {
      achievement.completed = true;
      achievement.completedAt = new Date();
    }

    await achievement.save();
  }

  private static async completeAchievement(userId: string, type: AchievementType): Promise<void> {
    const achievement = await Achievement.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type
    });

    if (!achievement || achievement.completed) {
      return;
    }

    achievement.progress = achievement.target;
    achievement.completed = true;
    achievement.completedAt = new Date();
    await achievement.save();
  }

  public static async processFriendAchievements(userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Count accepted friend requests
    const friendCount = await Friend.countDocuments({
      $or: [
        { requesterId: userObjectId, status: 'accepted' },
        { recipientId: userObjectId, status: 'accepted' }
      ]
    });

    // Get or create the social butterfly achievement
    let achievement = await Achievement.findOne({
      userId: userObjectId,
      type: 'social_butterfly'
    });

    if (!achievement) {
      achievement = new Achievement({
        userId: userObjectId,
        type: 'social_butterfly',
        progress: 0,
        target: this.ACHIEVEMENT_TARGETS.social_butterfly
      });
    }

    // Update progress
    achievement.progress = friendCount;

    // Check if achievement is completed
    if (achievement.progress >= achievement.target && !achievement.completedAt) {
      achievement.completedAt = new Date();
    }

    await achievement.save();
  }

  static async checkDurationAchievements(session: IMeditationSession): Promise<void> {
    if ((session.durationCompleted ?? 0) >= 30) {
      await AchievementService.completeAchievement(session.userId.toString(), 'marathon_meditator');
    }
  }

  private static async checkSessionCountAchievements(session: IMeditationSession): Promise<void> {
    const userId = session.userId.toString();
    const sessionCount = await MeditationSession.countDocuments({
      userId: session.userId,
      completed: true
    });

    // Beginner achievement (first session)
    if (sessionCount === 1) {
      await this.completeAchievement(userId, 'beginner_meditator');
    }

    // Intermediate achievement (10 sessions)
    if (sessionCount >= 10) {
      await this.completeAchievement(userId, 'intermediate_meditator');
    }

    // Advanced achievement (50 sessions)
    if (sessionCount >= 50) {
      await this.completeAchievement(userId, 'advanced_meditator');
    }
  }

  private static async checkStreakAchievements(session: IMeditationSession): Promise<void> {
    const userId = session.userId.toString();
    const today = new Date(session.startTime);
    today.setHours(0, 0, 0, 0);

    // Get all completed sessions for the user in the last 30 days
    const sessions = await MeditationSession.find({
      userId: session.userId,
      completed: true,
      startTime: { $gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ startTime: 1 });

    // Group sessions by date
    const sessionsByDate = new Map<string, boolean>();
    sessions.forEach(s => {
      const date = new Date(s.startTime);
      date.setHours(0, 0, 0, 0);
      sessionsByDate.set(date.toISOString(), true);
    });

    // Find the earliest session date
    const earliestSession = sessions[0];
    if (!earliestSession) return;

    const startDate = new Date(earliestSession.startTime);
    startDate.setHours(0, 0, 0, 0);

    // Calculate current streak by looking forward from the earliest date
    let streak = 0;
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      
      if (sessionsByDate.has(date.toISOString())) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Update Week Warrior achievement
    const weekWarrior = await Achievement.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'week_warrior'
    });

    if (weekWarrior && !weekWarrior.completed) {
      weekWarrior.progress = streak;
      if (streak >= weekWarrior.target) {
        weekWarrior.completed = true;
        weekWarrior.completedAt = new Date();
      }
      await weekWarrior.save();
    }

    // Update Mindful Month achievement
    const mindfulMonth = await Achievement.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'mindful_month'
    });

    if (mindfulMonth && !mindfulMonth.completed) {
      mindfulMonth.progress = streak;
      if (streak >= mindfulMonth.target) {
        mindfulMonth.completed = true;
        mindfulMonth.completedAt = new Date();
      }
      await mindfulMonth.save();
    }
  }
}