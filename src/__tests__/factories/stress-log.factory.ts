import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IStressLog } from '../../models/stress-log.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class StressLogTestFactory extends BaseTestFactory<IStressLog> {
  create(overrides: Partial<IStressLog> = {}): IStressLog {
    const _id = new Types.ObjectId();
    return {
      _id,
      userId: new Types.ObjectId(),
      level: faker.number.int({ min: 1, max: 10 }),
      triggers: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => faker.word.sample()
      ),
      symptoms: Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        () => faker.word.sample()
      ),
      notes: faker.lorem.paragraph(),
      date: faker.date.recent(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
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
      baseModelName: 'StressLog',
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
      modelName: 'StressLog',
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

  withLevel(level: number): IStressLog {
    return this.create({ level });
  }

  withMaxTriggers(): IStressLog {
    return this.create({
      triggers: Array.from({ length: 5 }, () => faker.word.sample())
    });
  }

  withMaxSymptoms(): IStressLog {
    return this.create({
      symptoms: Array.from({ length: 10 }, () => faker.word.sample())
    });
  }

  withLongNotes(): IStressLog {
    return this.create({
      notes: faker.lorem.paragraphs(10)
    });
  }

  withoutOptionalFields(): IStressLog {
    return this.create({
      triggers: [],
      symptoms: [],
      notes: undefined
    });
  }

  batch(count: number): IStressLog[] {
    return Array.from({ length: count }, () => this.create());
  }
} 