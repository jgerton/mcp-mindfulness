import { BaseTestDataFactory } from './mock-factories';
import { ISession } from '../../models/session.model';
import { Types } from 'mongoose';

export class SessionTestFactory extends BaseTestDataFactory<ISession> {
  defaultData(): ISession {
    return {
      _id: new Types.ObjectId().toString(),
      userId: new Types.ObjectId().toString(),
      techniqueId: new Types.ObjectId().toString(),
      startTime: new Date(),
      duration: 300, // 5 minutes in seconds
      completed: false,
      mood: {
        before: 3,
        after: null
      },
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  completed(afterMood: number = 4): ISession {
    const startTime = new Date(Date.now() - 300000); // 5 minutes ago
    return this.create({
      overrides: {
        startTime,
        completed: true,
        mood: {
          before: 3,
          after: afterMood
        }
      }
    });
  }

  inProgress(): ISession {
    return this.create({
      overrides: {
        startTime: new Date(),
        completed: false
      }
    });
  }

  withDuration(minutes: number): ISession {
    return this.create({
      overrides: {
        duration: minutes * 60
      }
    });
  }

  withNotes(notes: string): ISession {
    return this.create({
      overrides: { notes }
    });
  }

  forUserAndTechnique(userId: string, techniqueId: string): ISession {
    return this.create({
      overrides: { userId, techniqueId }
    });
  }
} 