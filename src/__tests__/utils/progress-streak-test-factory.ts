import { BaseTestDataFactory } from './mock-factories';
import { IProgressStreak } from '../../models/progress-streak.model';
import { Types } from 'mongoose';

export class ProgressStreakTestFactory extends BaseTestDataFactory<IProgressStreak> {
  defaultData(): IProgressStreak {
    const today = new Date();
    return {
      _id: new Types.ObjectId().toString(),
      userId: new Types.ObjectId().toString(),
      currentStreak: 3,
      longestStreak: 5,
      lastSessionDate: today,
      weeklyMinutes: 120,
      monthlyMinutes: 480,
      totalMinutes: 1200,
      streakHistory: [
        { date: new Date(today.setDate(today.getDate() - 2)), minutes: 15 },
        { date: new Date(today.setDate(today.getDate() - 1)), minutes: 20 },
        { date: new Date(), minutes: 10 }
      ],
      weeklyGoal: 150,
      monthlyGoal: 600,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  withBrokenStreak(daysAgo: number = 2): IProgressStreak {
    const today = new Date();
    const lastSessionDate = new Date(today.setDate(today.getDate() - daysAgo));
    
    return this.create({
      overrides: {
        currentStreak: 0,
        lastSessionDate,
        streakHistory: [
          { date: new Date(lastSessionDate), minutes: 15 },
          { date: new Date(lastSessionDate.setDate(lastSessionDate.getDate() - 1)), minutes: 20 }
        ]
      }
    });
  }

  withLongStreak(days: number = 7): IProgressStreak {
    const today = new Date();
    const streakHistory = Array.from({ length: days }, (_, i) => ({
      date: new Date(today.setDate(today.getDate() - i)),
      minutes: 15 + Math.floor(Math.random() * 15) // 15-30 minutes per day
    })).reverse();

    const totalMinutes = streakHistory.reduce((sum, day) => sum + day.minutes, 0);
    const weeklyMinutes = streakHistory.slice(-7).reduce((sum, day) => sum + day.minutes, 0);
    const monthlyMinutes = streakHistory.slice(-30).reduce((sum, day) => sum + day.minutes, 0);

    return this.create({
      overrides: {
        currentStreak: days,
        longestStreak: days,
        streakHistory,
        totalMinutes,
        weeklyMinutes,
        monthlyMinutes,
        lastSessionDate: streakHistory[streakHistory.length - 1].date
      }
    });
  }

  withCustomGoals(weeklyMinutes: number, monthlyMinutes: number): IProgressStreak {
    return this.create({
      overrides: {
        weeklyGoal: weeklyMinutes,
        monthlyGoal: monthlyMinutes
      }
    });
  }

  withRecentSession(minutes: number): IProgressStreak {
    const streak = this.create();
    const newHistory = [...streak.streakHistory, { date: new Date(), minutes }];
    const totalMinutes = streak.totalMinutes + minutes;
    const weeklyMinutes = streak.weeklyMinutes + minutes;
    const monthlyMinutes = streak.monthlyMinutes + minutes;

    return {
      ...streak,
      currentStreak: streak.currentStreak + 1,
      longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
      streakHistory: newHistory,
      totalMinutes,
      weeklyMinutes,
      monthlyMinutes,
      lastSessionDate: new Date()
    };
  }
} 