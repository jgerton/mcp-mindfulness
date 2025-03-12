import mongoose from 'mongoose';
import { Achievement } from '../models/achievement.model';
import { IMeditationSession } from '../models/meditation-session.model';
import { IGroupSession } from '../models/group-session.model';

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
  | 'mindful_month';

export class AchievementService {
  private static readonly ACHIEVEMENT_TARGETS: Record<AchievementType, number> = {
    early_bird: 5,
    night_owl: 5,
    marathon_meditator: 1,
    mood_lifter: 10,
    community_pillar: 10,
    group_guide: 5,
    week_warrior: 7,
    mindful_month: 30
  };

  private static readonly ACHIEVEMENT_DETAILS: Record<AchievementType, { title: string; description: string; points: number }> = {
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
      description: 'Complete 10 group meditation sessions',
      points: 200
    },
    group_guide: {
      title: 'Group Guide',
      description: 'Guide 5 group meditation sessions',
      points: 150
    },
    week_warrior: {
      title: 'Week Warrior',
      description: 'Complete meditation sessions for 7 consecutive days',
      points: 300
    },
    mindful_month: {
      title: 'Mindful Month',
      description: 'Complete meditation sessions for 30 consecutive days',
      points: 500
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
    const startTime = new Date(session.startTime);
    const hour = startTime.getHours();

    // Early Bird (5-9 AM)
    if (hour >= 5 && hour < 9) {
      await this.incrementAchievement(session.userId.toString(), 'early_bird', 1);
    }

    // Night Owl (10 PM-2 AM)
    if (hour >= 22 || hour < 2) {
      await this.incrementAchievement(session.userId.toString(), 'night_owl', 1);
    }

    // Marathon Meditator (30+ minutes)
    if (session.durationCompleted >= 30) {
      await this.completeAchievement(session.userId.toString(), 'marathon_meditator');
    }

    // Mood Lifter (mood improvement)
    if (session.moodBefore && session.moodAfter && this.isMoodImproved(session.moodBefore, session.moodAfter)) {
      await this.incrementAchievement(session.userId.toString(), 'mood_lifter', 1);
    }

    // Week Warrior (7 consecutive days)
    if (session.completed) {
      await this.incrementAchievement(session.userId.toString(), 'week_warrior', 1);
    }
  }

  public static async processGroupSession(userId: string): Promise<void> {
    await this.incrementAchievement(userId, 'community_pillar');
  }

  public static async getUserPoints(userId: string): Promise<number> {
    const achievements = await Achievement.find({ 
      userId, 
      completed: true,
      completedAt: { $ne: null } 
    });
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }

  private static isMoodImproved(before: string, after: string): boolean {
    const moodScale = ['terrible', 'bad', 'neutral', 'good', 'excellent'];
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
}