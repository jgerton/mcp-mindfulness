import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { MuscleGroup, PMRSession } from '../../models/pmr.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class MuscleGroupTestFactory extends BaseTestFactory<MuscleGroup> {
  create(overrides: Partial<MuscleGroup> = {}): MuscleGroup {
    const _id = new Types.ObjectId();
    return {
      _id,
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      order: faker.number.int({ min: 1, max: 10 }),
      durationSeconds: faker.number.int({ min: 30, max: 120 }),
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
      baseModelName: 'MuscleGroup',
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
      modelName: 'MuscleGroup',
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

  hands(): MuscleGroup {
    return this.create({
      name: 'Hands and Forearms',
      description: 'Make a tight fist with both hands, then release',
      order: 1,
      durationSeconds: 45
    });
  }

  shoulders(): MuscleGroup {
    return this.create({
      name: 'Shoulders and Upper Back',
      description: 'Pull shoulders up toward ears, then release',
      order: 2,
      durationSeconds: 60
    });
  }

  batch(count: number): MuscleGroup[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class PMRSessionTestFactory extends BaseTestFactory<PMRSession> {
  create(overrides: Partial<PMRSession> = {}): PMRSession {
    const _id = new Types.ObjectId();
    const startTime = faker.date.recent();
    return {
      _id,
      userId: new Types.ObjectId().toString(),
      startTime,
      endTime: faker.helpers.maybe(() => faker.date.between({ from: startTime, to: new Date() })),
      completedGroups: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => faker.lorem.words(2)
      ),
      stressLevelBefore: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 10 })),
      stressLevelAfter: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 10 })),
      duration: faker.number.int({ min: 300, max: 1200 }),
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
      baseModelName: 'PMRSession',
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
      modelName: 'PMRSession',
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

  completed(): PMRSession {
    const startTime = faker.date.recent();
    return this.create({
      startTime,
      endTime: faker.date.between({ from: startTime, to: new Date() }),
      completedGroups: ['Hands and Forearms', 'Shoulders', 'Back', 'Legs'],
      stressLevelBefore: 7,
      stressLevelAfter: 3,
      duration: 900 // 15 minutes
    });
  }

  inProgress(): PMRSession {
    return this.create({
      endTime: undefined,
      completedGroups: ['Hands and Forearms', 'Shoulders'],
      stressLevelBefore: 6,
      duration: 300 // 5 minutes so far
    });
  }

  withStressReduction(): PMRSession {
    return this.create({
      stressLevelBefore: 8,
      stressLevelAfter: 4,
      duration: 600
    });
  }

  batch(count: number): PMRSession[] {
    return Array.from({ length: count }, () => this.create());
  }
} 