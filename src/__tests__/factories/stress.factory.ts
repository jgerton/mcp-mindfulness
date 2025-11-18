import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IStressAssessment, IUserPreferences } from '../../models/stress.model';
import { StressLevel, TechniqueType } from '../../types/stress.types';
import { BaseTestFactory } from '../utils/mock-factories';

export class StressAssessmentTestFactory extends BaseTestFactory<IStressAssessment> {
  create(overrides: Partial<IStressAssessment> = {}): IStressAssessment {
    const _id = new Types.ObjectId();
    return {
      _id,
      userId: new Types.ObjectId().toString(),
      level: faker.helpers.arrayElement(Object.values(StressLevel)),
      timestamp: faker.date.recent(),
      physicalSymptoms: faker.number.int({ min: 0, max: 10 }),
      emotionalSymptoms: faker.number.int({ min: 0, max: 10 }),
      behavioralSymptoms: faker.number.int({ min: 0, max: 10 }),
      cognitiveSymptoms: faker.number.int({ min: 0, max: 10 }),
      score: faker.number.int({ min: 0, max: 10 }),
      triggers: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => faker.lorem.word()
      ),
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
      baseModelName: 'StressAssessment',
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
      modelName: 'StressAssessment',
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

  withLevel(level: StressLevel): IStressAssessment {
    return this.create({ level });
  }

  withHighSymptoms(): IStressAssessment {
    return this.create({
      physicalSymptoms: 8,
      emotionalSymptoms: 9,
      behavioralSymptoms: 8,
      cognitiveSymptoms: 9,
      score: 9
    });
  }

  withLowSymptoms(): IStressAssessment {
    return this.create({
      physicalSymptoms: 2,
      emotionalSymptoms: 1,
      behavioralSymptoms: 2,
      cognitiveSymptoms: 1,
      score: 1
    });
  }

  batch(count: number): IStressAssessment[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class UserPreferencesTestFactory extends BaseTestFactory<IUserPreferences> {
  create(overrides: Partial<IUserPreferences> = {}): IUserPreferences {
    const _id = new Types.ObjectId();
    return {
      _id,
      userId: new Types.ObjectId().toString(),
      preferredTechniques: faker.helpers.arrayElements(
        Object.values(TechniqueType),
        faker.number.int({ min: 1, max: 4 })
      ),
      preferredDuration: faker.number.int({ min: 1, max: 60 }),
      timePreferences: {
        reminderFrequency: faker.helpers.arrayElement(['DAILY', 'WEEKLY', 'ON_HIGH_STRESS']),
        preferredTimes: Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () => faker.date.soon().toLocaleTimeString()
        )
      },
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
      baseModelName: 'UserPreferences',
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
      modelName: 'UserPreferences',
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

  withTechniques(techniques: TechniqueType[]): IUserPreferences {
    return this.create({ preferredTechniques: techniques });
  }

  withDailyReminders(): IUserPreferences {
    return this.create({
      timePreferences: {
        reminderFrequency: 'DAILY',
        preferredTimes: ['09:00:00', '15:00:00', '20:00:00']
      }
    });
  }

  withWeeklyReminders(): IUserPreferences {
    return this.create({
      timePreferences: {
        reminderFrequency: 'WEEKLY',
        preferredTimes: ['10:00:00']
      }
    });
  }

  batch(count: number): IUserPreferences[] {
    return Array.from({ length: count }, () => this.create());
  }
} 