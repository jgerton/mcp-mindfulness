import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IMeditation } from '../../models/meditation.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class MeditationTestFactory extends BaseTestFactory<IMeditation> {
  create(overrides: Partial<IMeditation> = {}): IMeditation {
    const _id = new Types.ObjectId();
    return {
      _id,
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      duration: faker.number.int({ min: 5, max: 60 }),
      type: faker.helpers.arrayElement(['guided', 'timer', 'ambient']),
      audioUrl: faker.helpers.maybe(() => faker.internet.url()),
      category: faker.helpers.arrayElement(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']),
      difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.word.sample()),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      isActive: true,
      authorId: faker.helpers.maybe(() => new Types.ObjectId().toString()),
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
      baseModelName: 'Meditation',
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
      modelName: 'Meditation',
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

  guided(): IMeditation {
    return this.create({
      type: 'guided',
      audioUrl: faker.internet.url()
    });
  }

  timer(): IMeditation {
    return this.create({
      type: 'timer',
      audioUrl: undefined
    });
  }

  ambient(): IMeditation {
    return this.create({
      type: 'ambient',
      audioUrl: faker.internet.url()
    });
  }

  withDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): IMeditation {
    return this.create({ difficulty });
  }

  withCategory(category: 'mindfulness' | 'breathing' | 'body-scan' | 'loving-kindness' | 'other'): IMeditation {
    return this.create({ category });
  }

  inactive(): IMeditation {
    return this.create({ isActive: false });
  }

  batch(count: number): IMeditation[] {
    return Array.from({ length: count }, () => this.create());
  }
} 