import { Model } from 'mongoose';
import { BaseTestFactory } from '../../utils/base-test-factory';
import { User, IUser } from '../../../models/user.model';
import { MockAuthUtils } from '../../utils/mock-types';
import { createMockAuthUtils } from '../../utils/test-setup';

export class UserTestFactory extends BaseTestFactory<IUser> {
  protected model: Model<IUser> = User;
  private mockAuthUtils: MockAuthUtils;

  constructor() {
    super();
    this.mockAuthUtils = createMockAuthUtils();
  }

  createMockUser(data: Partial<IUser> = {}): IUser {
    return this.createMockDocument({
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      friends: [],
      achievements: [],
      ...data
    });
  }

  setupAuthMocks(options: {
    comparePasswordsResult?: boolean;
    hashPasswordResult?: string;
    generateTokenResult?: string;
  } = {}): void {
    const {
      comparePasswordsResult = true,
      hashPasswordResult = 'hashed-password',
      generateTokenResult = 'mock-token'
    } = options;

    this.mockAuthUtils.comparePasswords.mockResolvedValue(comparePasswordsResult);
    this.mockAuthUtils.hashPassword.mockResolvedValue(hashPasswordResult);
    this.mockAuthUtils.generateToken.mockReturnValue(generateTokenResult);
  }

  setupModelMocks(options: {
    findByIdResult?: IUser | null;
    findOneResult?: IUser | null;
    createResult?: IUser;
    updateResult?: { modifiedCount: number };
    deleteResult?: { deletedCount: number };
  } = {}): void {
    const mockUser = this.createMockUser();
    const {
      findByIdResult = mockUser,
      findOneResult = mockUser,
      createResult = mockUser,
      updateResult = { modifiedCount: 1 },
      deleteResult = { deletedCount: 1 }
    } = options;

    const mockModel = this.createMockModel();
    mockModel.findById.mockResolvedValue(findByIdResult);
    mockModel.findOne.mockResolvedValue(findOneResult);
    mockModel.create.mockResolvedValue(createResult);
    mockModel.updateOne.mockResolvedValue(updateResult);
    mockModel.deleteOne.mockResolvedValue(deleteResult);

    Object.assign(this.model, mockModel);
  }

  getMockAuthUtils(): MockAuthUtils {
    return this.mockAuthUtils;
  }
} 