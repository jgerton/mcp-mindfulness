import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IUser } from '../../models/user.model';
import { BaseTestFactory } from './mock-factories';

export class UserTestFactory extends BaseTestFactory<IUser> {
  create(overrides: Partial<IUser> = {}): IUser {
    const _id = new Types.ObjectId();
    return {
      _id,
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      username: faker.internet.userName(),
      friendIds: [],
      blockedUserIds: [],
      preferences: {
        stressManagement: {
          preferredCategories: ['breathing', 'meditation'],
          preferredDuration: 10,
          difficultyLevel: 'beginner'
        }
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
      $assertPopulated: jest.fn(),
      $clearModifiedPaths: jest.fn(),
      $clone: jest.fn(),
      $createModifiedPathsSnapshot: jest.fn(),
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
      baseModelName: 'User',
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
      modelName: 'User',
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

  withRole(role: string): IUser {
    return this.create({ role });
  }

  inactive(): IUser {
    return this.create({ isActive: false });
  }

  admin(): IUser {
    return this.create({
      role: 'admin',
      email: faker.internet.email(),
      username: faker.internet.userName()
    });
  }

  batch(count: number): IUser[] {
    return Array.from({ length: count }, () => this.create());
  }
} 