import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class BreathingPatternTestFactory extends BaseTestFactory<BreathingPattern> {
  create(overrides: Partial<BreathingPattern> = {}): BreathingPattern {
    const _id = new Types.ObjectId();
    return {
      _id,
      name: faker.lorem.words(2),
      inhale: faker.number.int({ min: 2, max: 6 }),
      hold: faker.helpers.maybe(() => faker.number.int({ min: 2, max: 8 })),
      exhale: faker.number.int({ min: 2, max: 8 }),
      postExhaleHold: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 4 })),
      cycles: faker.number.int({ min: 3, max: 10 }),
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
      baseModelName: 'BreathingPattern',
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
      modelName: 'BreathingPattern',
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

  boxBreathing(): BreathingPattern {
    return this.create({
      name: 'Box Breathing',
      inhale: 4,
      hold: 4,
      exhale: 4,
      postExhaleHold: 4,
      cycles: 4
    });
  }

  relaxedBreathing(): BreathingPattern {
    return this.create({
      name: 'Relaxed Breathing',
      inhale: 4,
      exhale: 6,
      cycles: 5
    });
  }

  batch(count: number): BreathingPattern[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class BreathingSessionTestFactory extends BaseTestFactory<BreathingSession> {
  create(overrides: Partial<BreathingSession> = {}): BreathingSession {
    const _id = new Types.ObjectId();
    const startTime = faker.date.recent();
    return {
      _id,
      userId: new Types.ObjectId().toString(),
      patternName: faker.lorem.words(2),
      startTime,
      endTime: faker.helpers.maybe(() => faker.date.between({ from: startTime, to: new Date() })),
      completedCycles: faker.number.int({ min: 0, max: 10 }),
      targetCycles: faker.number.int({ min: 5, max: 10 }),
      stressLevelBefore: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 10 })),
      stressLevelAfter: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 10 })),
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
      baseModelName: 'BreathingSession',
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
      modelName: 'BreathingSession',
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

  completed(): BreathingSession {
    const startTime = faker.date.recent();
    return this.create({
      startTime,
      endTime: faker.date.between({ from: startTime, to: new Date() }),
      completedCycles: 5,
      targetCycles: 5,
      stressLevelBefore: 7,
      stressLevelAfter: 3
    });
  }

  inProgress(): BreathingSession {
    return this.create({
      endTime: undefined,
      completedCycles: 2,
      targetCycles: 5
    });
  }

  withStressReduction(): BreathingSession {
    return this.create({
      stressLevelBefore: 8,
      stressLevelAfter: 4
    });
  }

  batch(count: number): BreathingSession[] {
    return Array.from({ length: count }, () => this.create());
  }
} 