"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodJournalTestFactory = void 0;
const mock_factories_1 = require("./mock-factories");
const mongoose_1 = require("mongoose");
class MoodJournalTestFactory extends mock_factories_1.BaseTestDataFactory {
    defaultData() {
        return {
            _id: new mongoose_1.Types.ObjectId().toString(),
            userId: new mongoose_1.Types.ObjectId().toString(),
            date: new Date(),
            moodLevel: 3,
            emotions: ['CALM'],
            notes: 'Feeling balanced today',
            triggers: ['WORK'],
            relatedSessionId: null,
            activities: ['MEDITATION'],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    withMoodAndEmotions(moodLevel, emotions) {
        return this.create({
            overrides: {
                moodLevel,
                emotions
            }
        });
    }
    withTriggers(triggers) {
        return this.create({
            overrides: { triggers }
        });
    }
    withSession(sessionId) {
        return this.create({
            overrides: { relatedSessionId: sessionId }
        });
    }
    withActivities(activities) {
        return this.create({
            overrides: { activities }
        });
    }
    withDetailedNotes(notes) {
        return this.create({
            overrides: { notes }
        });
    }
    forDateRange(startDate, count = 7) {
        return Array.from({ length: count }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            return this.create({
                overrides: {
                    date,
                    moodLevel: (Math.floor(Math.random() * 5) + 1),
                    emotions: ['CALM', 'ANXIOUS', 'HAPPY', 'SAD', 'STRESSED']
                        .slice(0, Math.floor(Math.random() * 3) + 1)
                }
            });
        });
    }
    withStressPattern() {
        const today = new Date();
        return [
            this.create({
                overrides: {
                    date: new Date(today.setDate(today.getDate() - 2)),
                    moodLevel: 4,
                    emotions: ['CALM', 'HAPPY'],
                    triggers: ['WORK']
                }
            }),
            this.create({
                overrides: {
                    date: new Date(today.setDate(today.getDate() + 1)),
                    moodLevel: 2,
                    emotions: ['STRESSED', 'ANXIOUS'],
                    triggers: ['WORK', 'DEADLINE']
                }
            }),
            this.create({
                overrides: {
                    date: new Date(),
                    moodLevel: 3,
                    emotions: ['CALM', 'TIRED'],
                    triggers: ['WORK'],
                    activities: ['MEDITATION', 'EXERCISE']
                }
            })
        ];
    }
}
exports.MoodJournalTestFactory = MoodJournalTestFactory;
