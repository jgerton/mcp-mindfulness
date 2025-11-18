import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { 
  IAchievement, 
  IUserAchievement,
  AchievementCategory,
  AchievementType 
} from '../../models/achievement.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class AchievementTestFactory extends BaseTestFactory<IAchievement> {
  create(overrides: Partial<IAchievement> = {}): IAchievement {
    const _id = new Types.ObjectId();
    const createdAt = faker.date.recent();

    return {
      _id,
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      category: faker.helpers.arrayElement(Object.values(AchievementCategory)),
      criteria: faker.lorem.sentence(),
      icon: faker.system.fileName(),
      points: faker.number.int({ min: 10, max: 100 }),
      progress: faker.number.int({ min: 0, max: 100 }),
      target: faker.number.int({ min: 100, max: 1000 }),
      completed: faker.datatype.boolean(),
      completedAt: faker.helpers.maybe(() => faker.date.recent()),
      type: faker.helpers.arrayElement(Object.values(AchievementType)),
      userId: new Types.ObjectId(),
      createdAt,
      updatedAt: createdAt,
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
      baseModelName: 'Achievement',
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
      modelName: 'Achievement',
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

  completed(): IAchievement {
    const completedAt = faker.date.recent();
    return this.create({
      completed: true,
      completedAt,
      progress: 100
    });
  }

  inProgress(progress: number = faker.number.int({ min: 1, max: 99 })): IAchievement {
    return this.create({
      completed: false,
      completedAt: undefined,
      progress
    });
  }

  meditation(): IAchievement {
    return this.create({
      category: AchievementCategory.MEDITATION,
      type: AchievementType.DURATION,
      name: 'Meditation Master',
      description: 'Complete 100 hours of meditation',
      target: 6000, // 100 hours in minutes
    });
  }

  streak(): IAchievement {
    return this.create({
      category: AchievementCategory.CONSISTENCY,
      type: AchievementType.STREAK,
      name: 'Streak Master',
      description: 'Maintain a 30-day meditation streak',
      target: 30,
    });
  }

  batch(count: number): IAchievement[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class UserAchievementTestFactory extends BaseTestFactory<IUserAchievement> {
  create(overrides: Partial<IUserAchievement> = {}): IUserAchievement {
    const _id = new Types.ObjectId();
    const createdAt = faker.date.recent();

    return {
      _id,
      userId: new Types.ObjectId(),
      achievementId: new Types.ObjectId(),
      progress: faker.number.int({ min: 0, max: 100 }),
      isCompleted: faker.datatype.boolean(),
      dateEarned: faker.helpers.maybe(() => faker.date.recent()),
      createdAt,
      updatedAt: createdAt,
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
      baseModelName: 'UserAchievement',
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
      modelName: 'UserAchievement',
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

  completed(): IUserAchievement {
    return this.create({
      progress: 100,
      isCompleted: true,
      dateEarned: faker.date.recent()
    });
  }

  inProgress(progress: number = faker.number.int({ min: 1, max: 99 })): IUserAchievement {
    return this.create({
      progress,
      isCompleted: false,
      dateEarned: undefined
    });
  }

  forUser(userId: Types.ObjectId): IUserAchievement {
    return this.create({ userId });
  }

  forAchievement(achievementId: Types.ObjectId): IUserAchievement {
    return this.create({ achievementId });
  }

  batch(count: number): IUserAchievement[] {
    return Array.from({ length: count }, () => this.create());
  }
} 