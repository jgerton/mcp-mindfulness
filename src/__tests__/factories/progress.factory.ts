import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IProgress } from '../../models/progress.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class ProgressTestFactory extends BaseTestFactory<IProgress> {
  create(overrides: Partial<IProgress> = {}): IProgress {
    const _id = new Types.ObjectId();
    const startTime = faker.date.recent();
    const duration = faker.number.int({ min: 5, max: 60 });
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    return {
      _id,
      userId: new Types.ObjectId().toString(),
      meditationId: new Types.ObjectId().toString(),
      duration,
      completed: true,
      mood: faker.helpers.arrayElement(['very-negative', 'negative', 'neutral', 'positive', 'very-positive']),
      notes: faker.helpers.maybe(() => faker.lorem.paragraph()),
      startTime,
      endTime,
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
      baseModelName: 'Progress',
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
      modelName: 'Progress',
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

  incomplete(): IProgress {
    return this.create({
      completed: false,
      endTime: undefined
    });
  }

  withMood(mood: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive'): IProgress {
    return this.create({ mood });
  }

  withDuration(minutes: number): IProgress {
    const startTime = faker.date.recent();
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + minutes * 60 * 1000),
      duration: minutes
    });
  }

  withNotes(notes: string): IProgress {
    return this.create({ notes });
  }

  forStreak(userId: string, daysAgo: number): IProgress {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(faker.number.int({ min: 6, max: 22 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
    
    return this.create({
      userId,
      startTime: date,
      endTime: new Date(date.getTime() + 15 * 60 * 1000), // 15 minutes session
      duration: 15,
      completed: true
    });
  }

  batch(count: number): IProgress[] {
    return Array.from({ length: count }, () => this.create());
  }
} 