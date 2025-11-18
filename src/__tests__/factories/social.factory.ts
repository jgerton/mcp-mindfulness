import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { IFriend } from '../../models/friend.model';
import { IFriendRequest } from '../../models/friend-request.model';
import { IChatMessage } from '../../models/chat-message.model';
import { BaseTestFactory } from '../utils/mock-factories';

export class FriendTestFactory extends BaseTestFactory<IFriend> {
  create(overrides: Partial<IFriend> = {}): IFriend {
    const _id = new Types.ObjectId();
    const createdAt = faker.date.recent();

    return {
      _id,
      requesterId: new Types.ObjectId(),
      recipientId: new Types.ObjectId(),
      status: faker.helpers.arrayElement(['pending', 'accepted', 'blocked']),
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
      baseModelName: 'Friend',
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
      modelName: 'Friend',
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

  accepted(): IFriend {
    return this.create({
      status: 'accepted'
    });
  }

  pending(): IFriend {
    return this.create({
      status: 'pending'
    });
  }

  blocked(): IFriend {
    return this.create({
      status: 'blocked'
    });
  }

  between(requesterId: Types.ObjectId, recipientId: Types.ObjectId): IFriend {
    return this.create({
      requesterId,
      recipientId
    });
  }

  batch(count: number): IFriend[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class FriendRequestTestFactory extends BaseTestFactory<IFriendRequest> {
  create(overrides: Partial<IFriendRequest> = {}): IFriendRequest {
    const _id = new Types.ObjectId();
    const createdAt = faker.date.recent();
    const requesterId = new Types.ObjectId();
    const recipientId = new Types.ObjectId();

    return {
      _id,
      requesterId,
      recipientId,
      requester: requesterId,
      recipient: recipientId,
      status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected']),
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
      baseModelName: 'FriendRequest',
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
      modelName: 'FriendRequest',
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

  pending(): IFriendRequest {
    return this.create({
      status: 'pending'
    });
  }

  accepted(): IFriendRequest {
    return this.create({
      status: 'accepted'
    });
  }

  rejected(): IFriendRequest {
    return this.create({
      status: 'rejected'
    });
  }

  from(requesterId: Types.ObjectId): IFriendRequest {
    return this.create({
      requesterId,
      requester: requesterId
    });
  }

  to(recipientId: Types.ObjectId): IFriendRequest {
    return this.create({
      recipientId,
      recipient: recipientId
    });
  }

  batch(count: number): IFriendRequest[] {
    return Array.from({ length: count }, () => this.create());
  }
}

export class ChatMessageTestFactory extends BaseTestFactory<IChatMessage> {
  create(overrides: Partial<IChatMessage> = {}): IChatMessage {
    const _id = new Types.ObjectId();
    const createdAt = faker.date.recent();
    const senderId = new Types.ObjectId();

    return {
      _id,
      sessionId: new Types.ObjectId(),
      senderId,
      content: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['text', 'system']),
      createdAt,
      updatedAt: createdAt,
      userId: senderId.toString(),
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
      baseModelName: 'ChatMessage',
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
      modelName: 'ChatMessage',
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

  text(): IChatMessage {
    return this.create({
      type: 'text',
      content: faker.lorem.sentence()
    });
  }

  system(): IChatMessage {
    return this.create({
      type: 'system',
      content: faker.lorem.sentence()
    });
  }

  fromUser(senderId: Types.ObjectId): IChatMessage {
    return this.create({
      senderId,
      userId: senderId.toString()
    });
  }

  inSession(sessionId: Types.ObjectId): IChatMessage {
    return this.create({
      sessionId
    });
  }

  withContent(content: string): IChatMessage {
    return this.create({
      content
    });
  }

  batch(count: number): IChatMessage[] {
    return Array.from({ length: count }, () => this.create());
  }
} 