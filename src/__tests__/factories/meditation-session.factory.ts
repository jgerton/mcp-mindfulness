import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IMeditationSession } from '../../models/meditation-session.model';
import { WellnessSessionStatus, WellnessMoodState } from '../../models/base-wellness-session.model';
import { BaseWellnessSessionTestFactory } from './base-wellness-session.factory';

export class MeditationSessionTestFactory extends BaseWellnessSessionTestFactory {
  create(overrides: Partial<IMeditationSession> = {}): IMeditationSession {
    const baseSession = super.create();
    return {
      ...baseSession,
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(['guided', 'unguided', 'timed']),
      guidedMeditationId: faker.helpers.maybe(() => new Types.ObjectId()),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.word.sample()),
      durationCompleted: faker.number.int({ min: 0, max: baseSession.duration }),
      interruptions: faker.number.int({ min: 0, max: 5 }),
      meditationId: faker.helpers.maybe(() => new Types.ObjectId()),
      completed: false,
      ...overrides
    } as IMeditationSession;
  }

  guided(overrides: Partial<IMeditationSession> = {}): IMeditationSession {
    return this.create({
      type: 'guided',
      guidedMeditationId: new Types.ObjectId(),
      ...overrides
    });
  }

  unguided(overrides: Partial<IMeditationSession> = {}): IMeditationSession {
    return this.create({
      type: 'unguided',
      guidedMeditationId: undefined,
      ...overrides
    });
  }

  timed(overrides: Partial<IMeditationSession> = {}): IMeditationSession {
    return this.create({
      type: 'timed',
      guidedMeditationId: undefined,
      ...overrides
    });
  }

  completed(overrides: Partial<IMeditationSession> = {}): IMeditationSession {
    const startTime = faker.date.recent();
    const duration = faker.number.int({ min: 300, max: 3600 });
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + duration * 1000),
      duration,
      durationCompleted: duration,
      status: WellnessSessionStatus.Completed,
      completed: true,
      moodAfter: faker.helpers.arrayElement(Object.values(WellnessMoodState)),
      ...overrides
    });
  }

  withInterruptions(count: number): IMeditationSession {
    return this.create({
      interruptions: count
    });
  }

  withCompletionPercentage(percentage: number): IMeditationSession {
    const duration = 1800; // 30 minutes
    return this.create({
      duration,
      durationCompleted: Math.floor(duration * (percentage / 100))
    });
  }

  withTags(tags: string[]): IMeditationSession {
    return this.create({ tags });
  }

  batch(count: number): IMeditationSession[] {
    return Array.from({ length: count }, () => this.create());
  }
} 