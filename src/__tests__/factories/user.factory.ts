import { faker } from '@faker-js/faker';
import { Document, Types } from 'mongoose';
import { IUser } from '../../models/user.model';

export type MockUserDocument = Document<Types.ObjectId, {}, IUser> & 
  Omit<IUser, '_id'> & {
    _id: Types.ObjectId;
    username: string;
    __v: number;
    toObject: () => IUser & { _id: string; username: string };
    toJSON: () => IUser & { _id: string; username: string };
  };

export interface UserFactoryInput {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  preferences?: {
    stressManagement?: {
      reminders?: boolean;
      frequency?: string;
      preferredTime?: string;
    };
    meditation?: {
      duration?: number;
      style?: string;
      background?: string;
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

export const mockUser = (input: UserFactoryInput = {}): MockUserDocument => {
  const _id = new Types.ObjectId(input._id || faker.database.mongodbObjectId());
  
  const defaultUser = {
    _id,
    username: input.username || faker.internet.username(),
    email: input.email || faker.internet.email(),
    password: input.password || faker.internet.password(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    __v: 0,
    preferences: {
      stressManagement: {
        reminders: input.preferences?.stressManagement?.reminders ?? true,
        frequency: input.preferences?.stressManagement?.frequency ?? 'daily',
        preferredTime: input.preferences?.stressManagement?.preferredTime ?? '09:00'
      },
      meditation: {
        duration: input.preferences?.meditation?.duration ?? 15,
        style: input.preferences?.meditation?.style ?? 'mindfulness',
        background: input.preferences?.meditation?.background ?? 'nature'
      },
      notifications: {
        email: input.preferences?.notifications?.email ?? true,
        push: input.preferences?.notifications?.push ?? true,
        sms: input.preferences?.notifications?.sms ?? false
      }
    }
  } as const;

  const mockDoc = {
    ...defaultUser,
    toObject: () => ({ ...defaultUser, _id: _id.toString() }),
    toJSON: () => ({ ...defaultUser, _id: _id.toString() }),
    save: jest.fn().mockResolvedValue(defaultUser),
    comparePassword: jest.fn().mockResolvedValue(true),
    $isDeleted: jest.fn().mockReturnValue(false),
    $isValid: jest.fn().mockReturnValue(true),
    $set: jest.fn(),
    delete: jest.fn(),
    deleteOne: jest.fn(),
    depopulate: jest.fn(),
    directModifiedPaths: jest.fn(),
    equals: jest.fn(),
    get: jest.fn(),
    init: jest.fn(),
    inspect: jest.fn(),
    invalidate: jest.fn(),
    isDirectModified: jest.fn(),
    isInit: jest.fn(),
    isModified: jest.fn(),
    isSelected: jest.fn(),
    markModified: jest.fn(),
    modifiedPaths: jest.fn(),
    populate: jest.fn(),
    populated: jest.fn(),
    remove: jest.fn(),
    set: jest.fn(),
    unmarkModified: jest.fn(),
    update: jest.fn(),
    updateOne: jest.fn(),
    validate: jest.fn(),
    validateSync: jest.fn()
  };

  return mockDoc as unknown as MockUserDocument;
}; 