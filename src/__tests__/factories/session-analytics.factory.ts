import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { ISessionAnalytics, MoodType } from '../../models/session-analytics.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class SessionAnalyticsTestFactory extends BaseTestFactory<ISessionAnalytics> {
  create(overrides: Partial<ISessionAnalytics> = {}): ISessionAnalytics {
    const _id = new Types.ObjectId();
    const startTime = faker.date.recent();
    const duration = faker.number.int({ min: 5, max: 60 });
    const durationCompleted = faker.number.int({ min: 0, max: duration });

    return {
      _id,
      userId: new Types.ObjectId(),
      sessionId: new Types.ObjectId(),
      meditationId: new Types.ObjectId(),
      startTime,
      endTime: faker.helpers.maybe(() => new Date(startTime.getTime() + duration * 60 * 1000)),
      duration,
      durationCompleted,
      completed: durationCompleted === duration,
      focusScore: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 })),
      moodBefore: faker.helpers.arrayElement(['anxious', 'stressed', 'neutral', 'calm', 'peaceful'] as MoodType[]),
      moodAfter: faker.helpers.maybe(() => faker.helpers.arrayElement(['anxious', 'stressed', 'neutral', 'calm', 'peaceful'] as MoodType[])),
      interruptions: faker.number.int({ min: 0, max: 5 }),
      notes: faker.helpers.maybe(() => faker.lorem.paragraph()),
      tags: faker.helpers.maybe(() => Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.word())),
      maintainedStreak: faker.datatype.boolean(),
      createdAt: startTime,
      updatedAt: startTime,
      ...overrides,
      // Mongoose document methods
      $assertPopulated: jest.fn(),
      $clearModifiedPaths: jest.fn(),
      $clone: jest.fn(),
      $getAllSubdocs: jest.fn(),
      $getPopulatedDocs: jest.fn(),
      $ignore: jest.fn(),
      $inc: jest.fn(),
      $isDefault: jest.fn(),
      $isDeleted: jest.fn(),
      $isEmpty: jest.fn(),
      $isModified: jest.fn(),
      $isSelected: jest.fn(),
      $isValid: jest.fn(),
      $locals: {},
      $markValid: jest.fn(),
      $model: jest.fn(),
      $op: null,
      $parent: jest.fn(),
      $session: jest.fn(),
      $set: jest.fn(),
      $toObject: jest.fn(),
      $where: jest.fn(),
      baseModelName: 'SessionAnalytics',
      collection: {},
      db: {},
      delete: jest.fn(),
      deleteOne: jest.fn(),
      depopulate: jest.fn(),
      directModifiedPaths: jest.fn(),
      equals: jest.fn(),
      errors: {},
      get: jest.fn(),
      getChanges: jest.fn(),
      increment: jest.fn(),
      init: jest.fn(),
      invalidate: jest.fn(),
      isDirectModified: jest.fn(),
      isDirectSelected: jest.fn(),
      isInit: jest.fn(),
      isModified: jest.fn(),
      isNew: false,
      isSelected: jest.fn(),
      markModified: jest.fn(),
      modifiedPaths: jest.fn(),
      modelName: 'SessionAnalytics',
      overwrite: jest.fn(),
      populate: jest.fn(),
      populated: jest.fn(),
      remove: jest.fn(),
      replaceOne: jest.fn(),
      save: jest.fn(),
      schema: {},
      set: jest.fn(),
      toJSON: jest.fn(),
      toObject: jest.fn(),
      unmarkModified: jest.fn(),
      update: jest.fn(),
      updateOne: jest.fn(),
      validate: jest.fn(),
      validateSync: jest.fn()
    };
  }

  completed(): ISessionAnalytics {
    const startTime = faker.date.recent();
    const duration = faker.number.int({ min: 10, max: 30 });
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + duration * 60 * 1000),
      duration,
      durationCompleted: duration,
      completed: true,
      focusScore: faker.number.int({ min: 7, max: 10 }),
      moodBefore: 'stressed',
      moodAfter: 'peaceful',
      interruptions: 0,
      maintainedStreak: true
    });
  }

  incomplete(): ISessionAnalytics {
    const startTime = faker.date.recent();
    const duration = 20;
    const durationCompleted = faker.number.int({ min: 1, max: 19 });
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + durationCompleted * 60 * 1000),
      duration,
      durationCompleted,
      completed: false,
      moodBefore: 'anxious',
      interruptions: faker.number.int({ min: 1, max: 3 }),
      maintainedStreak: false
    });
  }

  withMoodImprovement(): ISessionAnalytics {
    return this.create({
      moodBefore: 'stressed',
      moodAfter: 'peaceful',
      focusScore: faker.number.int({ min: 8, max: 10 }),
      interruptions: 0
    });
  }

  withHighFocus(): ISessionAnalytics {
    return this.create({
      focusScore: faker.number.int({ min: 9, max: 10 }),
      interruptions: 0,
      maintainedStreak: true
    });
  }

  withTags(tags: string[]): ISessionAnalytics {
    return this.create({ tags });
  }

  batch(count: number): ISessionAnalytics[] {
    return Array.from({ length: count }, () => this.create());
  }
} 