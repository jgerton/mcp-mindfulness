import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IBaseWellnessSession, WellnessMoodState, WellnessSessionStatus } from '../../models/base-wellness-session.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class BaseWellnessSessionTestFactory extends BaseTestFactory<IBaseWellnessSession> {
  create(overrides: Partial<IBaseWellnessSession> = {}): IBaseWellnessSession {
    const startTime = faker.date.recent();
    const _id = new Types.ObjectId();
    
    return {
      _id,
      userId: new Types.ObjectId(),
      startTime,
      duration: faker.number.int({ min: 300, max: 3600 }), // 5-60 minutes
      status: WellnessSessionStatus.Active,
      moodBefore: faker.helpers.arrayElement(Object.values(WellnessMoodState)),
      moodAfter: faker.helpers.arrayElement(Object.values(WellnessMoodState)),
      notes: faker.lorem.paragraph(),
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
      baseModelName: 'BaseWellnessSession',
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
      modelName: 'BaseWellnessSession',
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

  withStatus(status: WellnessSessionStatus): IBaseWellnessSession {
    return this.create({ status });
  }

  withMood(moodBefore?: WellnessMoodState, moodAfter?: WellnessMoodState): IBaseWellnessSession {
    return this.create({ moodBefore, moodAfter });
  }

  withDuration(duration: number): IBaseWellnessSession {
    return this.create({ duration });
  }

  withEndTime(endTime: Date): IBaseWellnessSession {
    return this.create({ endTime });
  }

  completed(moodAfter?: WellnessMoodState): IBaseWellnessSession {
    const startTime = faker.date.recent();
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + 600000), // 10 minutes later
      status: WellnessSessionStatus.Completed,
      moodAfter
    });
  }

  paused(): IBaseWellnessSession {
    return this.create({
      status: WellnessSessionStatus.Paused
    });
  }

  abandoned(): IBaseWellnessSession {
    return this.create({
      status: WellnessSessionStatus.Abandoned
    });
  }

  batch(count: number): IBaseWellnessSession[] {
    return Array.from({ length: count }, () => this.create());
  }
} 