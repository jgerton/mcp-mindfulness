import { DependencyMap } from '../../utils/types';

export const userControllerDependencies: DependencyMap = {
  imports: [
    {
      path: '../utils/auth',
      module: 'comparePasswords',
      usage: ['login', 'updatePassword']
    },
    {
      path: '../utils/auth',
      module: 'hashPassword',
      usage: ['create', 'updatePassword']
    },
    {
      path: '../utils/auth',
      module: 'generateToken',
      usage: ['login']
    },
    {
      path: '../models/user.model',
      module: 'User',
      usage: ['all methods']
    },
    {
      path: '../core/errors',
      module: 'HttpError',
      usage: ['error handling in all methods']
    }
  ],
  types: [
    {
      name: 'IUser',
      source: '../models/user.model',
      properties: ['_id', 'email', 'password', 'name', 'friends', 'achievements']
    },
    {
      name: 'ErrorCode',
      source: '../core/errors',
      properties: ['INVALID_CREDENTIALS', 'USER_NOT_FOUND', 'DUPLICATE_EMAIL']
    },
    {
      name: 'ErrorCategory',
      source: '../core/errors',
      properties: ['AUTH', 'VALIDATION', 'NOT_FOUND']
    }
  ],
  mocks: [
    {
      target: '../utils/auth',
      requirements: ['comparePasswords', 'hashPassword', 'generateToken'],
      type: 'function'
    },
    {
      target: '../models/user.model',
      requirements: ['find', 'findById', 'findOne', 'create', 'updateOne', 'deleteOne'],
      type: 'class'
    }
  ]
}; 