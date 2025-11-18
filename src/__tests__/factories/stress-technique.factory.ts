import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { StressTechniqueDocument } from '../../models/stress-technique.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class StressTechniqueTestFactory extends BaseTestFactory<StressTechniqueDocument> {
  create(overrides: Partial<StressTechniqueDocument> = {}): StressTechniqueDocument {
    const _id = new Types.ObjectId();
    return {
      _id,
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement(['breathing', 'meditation', 'physical', 'cognitive', 'behavioral']),
      difficultyLevel: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
      durationMinutes: faker.number.int({ min: 1, max: 120 }),
      effectivenessRating: faker.number.int({ min: 1, max: 5 }),
      recommendedFrequency: faker.helpers.arrayElement(['daily', 'weekly', 'as-needed']),
      steps: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => faker.lorem.sentence()
      ),
      benefits: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => faker.lorem.sentence()
      ),
      tags: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => faker.word.sample()
      ),
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
      baseModelName: 'StressTechnique',
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
      modelName: 'StressTechnique',
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

  withCategory(category: 'breathing' | 'meditation' | 'physical' | 'cognitive' | 'behavioral'): StressTechniqueDocument {
    return this.create({ category });
  }

  withDifficulty(level: 'beginner' | 'intermediate' | 'advanced'): StressTechniqueDocument {
    return this.create({ difficultyLevel: level });
  }

  withDuration(minutes: number): StressTechniqueDocument {
    return this.create({ durationMinutes: minutes });
  }

  withEffectiveness(rating: number): StressTechniqueDocument {
    return this.create({ effectivenessRating: rating });
  }

  withFrequency(frequency: 'daily' | 'weekly' | 'as-needed'): StressTechniqueDocument {
    return this.create({ recommendedFrequency: frequency });
  }

  withoutOptionalFields(): StressTechniqueDocument {
    return this.create({
      steps: [],
      benefits: [],
      tags: [],
      effectivenessRating: undefined,
      recommendedFrequency: undefined
    });
  }

  withMaxArrays(): StressTechniqueDocument {
    return this.create({
      steps: Array.from({ length: 10 }, () => faker.lorem.sentence()),
      benefits: Array.from({ length: 10 }, () => faker.lorem.sentence()),
      tags: Array.from({ length: 10 }, () => faker.word.sample())
    });
  }

  batch(count: number): StressTechniqueDocument[] {
    return Array.from({ length: count }, () => this.create());
  }
} 