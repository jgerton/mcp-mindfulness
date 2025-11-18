import { BaseTestDataFactory } from './mock-factories';
import { IMoodJournal } from '../../models/mood-journal.model';
import { Types } from 'mongoose';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EmotionTag = 'CALM' | 'ANXIOUS' | 'HAPPY' | 'SAD' | 'STRESSED' | 'ENERGETIC' | 'TIRED';

export class MoodJournalTestFactory extends BaseTestDataFactory<IMoodJournal> {
  defaultData(): IMoodJournal {
    return {
      _id: new Types.ObjectId().toString(),
      userId: new Types.ObjectId().toString(),
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

  withMoodAndEmotions(moodLevel: MoodLevel, emotions: EmotionTag[]): IMoodJournal {
    return this.create({
      overrides: {
        moodLevel,
        emotions
      }
    });
  }

  withTriggers(triggers: string[]): IMoodJournal {
    return this.create({
      overrides: { triggers }
    });
  }

  withSession(sessionId: string): IMoodJournal {
    return this.create({
      overrides: { relatedSessionId: sessionId }
    });
  }

  withActivities(activities: string[]): IMoodJournal {
    return this.create({
      overrides: { activities }
    });
  }

  withDetailedNotes(notes: string): IMoodJournal {
    return this.create({
      overrides: { notes }
    });
  }

  forDateRange(startDate: Date, count: number = 7): IMoodJournal[] {
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      return this.create({
        overrides: {
          date,
          moodLevel: (Math.floor(Math.random() * 5) + 1) as MoodLevel,
          emotions: ['CALM', 'ANXIOUS', 'HAPPY', 'SAD', 'STRESSED']
            .slice(0, Math.floor(Math.random() * 3) + 1) as EmotionTag[]
        }
      });
    });
  }

  withStressPattern(): IMoodJournal[] {
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