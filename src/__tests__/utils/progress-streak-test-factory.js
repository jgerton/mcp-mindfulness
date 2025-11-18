"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressStreakTestFactory = void 0;
const mock_factories_1 = require("./mock-factories");
const mongoose_1 = require("mongoose");
class ProgressStreakTestFactory extends mock_factories_1.BaseTestDataFactory {
    defaultData() {
        const today = new Date();
        return {
            _id: new mongoose_1.Types.ObjectId().toString(),
            userId: new mongoose_1.Types.ObjectId().toString(),
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
    withBrokenStreak(daysAgo = 2) {
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
    withLongStreak(days = 7) {
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
    withCustomGoals(weeklyMinutes, monthlyMinutes) {
        return this.create({
            overrides: {
                weeklyGoal: weeklyMinutes,
                monthlyGoal: monthlyMinutes
            }
        });
    }
    withRecentSession(minutes) {
        const streak = this.create();
        const newHistory = [...streak.streakHistory, { date: new Date(), minutes }];
        const totalMinutes = streak.totalMinutes + minutes;
        const weeklyMinutes = streak.weeklyMinutes + minutes;
        const monthlyMinutes = streak.monthlyMinutes + minutes;
        return Object.assign(Object.assign({}, streak), { currentStreak: streak.currentStreak + 1, longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1), streakHistory: newHistory, totalMinutes,
            weeklyMinutes,
            monthlyMinutes, lastSessionDate: new Date() });
    }
}
exports.ProgressStreakTestFactory = ProgressStreakTestFactory;
