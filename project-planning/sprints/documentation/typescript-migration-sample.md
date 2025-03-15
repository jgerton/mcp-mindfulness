# TypeScript Migration Sample

This document provides a detailed example of migrating a JavaScript file to TypeScript in the MCP Mindfulness project.

## Sample Migration: User Service

We'll walk through the process of migrating a hypothetical `user.service.js` file to TypeScript.

### Step 1: Original JavaScript File

```javascript
// src/services/user.service.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
  }
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get users by query
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.find(filter)
    .sort(options.sortBy)
    .skip(options.skip)
    .limit(options.limit);
  
  const count = await User.countDocuments(filter);
  
  return {
    users,
    count
  };
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

module.exports = {
  getUserById,
  queryUsers,
  updateUserById
};
```

### Step 2: Create TypeScript Interfaces

First, we need to create interfaces for the data structures used in the service:

```typescript
// src/interfaces/user.interface.ts
import { Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

export interface QueryOptions {
  sortBy?: string;
  skip?: number;
  limit?: number;
}

export interface QueryResult {
  users: IUser[];
  count: number;
}
```

### Step 3: Migrate the Service to TypeScript

Now, we'll convert the JavaScript file to TypeScript:

```typescript
// src/services/user.service.ts
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { IUser, QueryOptions, QueryResult } from '../interfaces/user.interface';

/**
 * Get user by id
 * @param {string} id - User id
 * @returns {Promise<IUser>} - Found user
 */
export const getUserById = async (id: string): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
  }
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get users by query
 * @param {Object} filter - Mongoose filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>} - Query result
 */
export const queryUsers = async (
  filter: Record<string, any>,
  options: QueryOptions
): Promise<QueryResult> => {
  const users = await User.find(filter)
    .sort(options.sortBy)
    .skip(options.skip || 0)
    .limit(options.limit || 10);
  
  const count = await User.countDocuments(filter);
  
  return {
    users,
    count
  };
};

/**
 * Update user by id
 * @param {string} userId - User id
 * @param {Object} updateBody - User update body
 * @returns {Promise<IUser>} - Updated user
 */
export const updateUserById = async (
  userId: string,
  updateBody: Partial<IUser>
): Promise<IUser> => {
  const user = await getUserById(userId);
  
  Object.assign(user, updateBody);
  await user.save();
  return user;
};
```

### Step 4: Update the Model Import

Ensure the User model is also updated to TypeScript:

```typescript
// src/models/user.model.ts
import mongoose from 'mongoose';
import { IUser, IUserModel } from '../interfaces/user.interface';

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      private: true,
    },
    name: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add static methods
userSchema.statics.isEmailTaken = async function (
  email: string, 
  excludeUserId?: string
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
```

### Step 5: Update the ApiError Import

Ensure the ApiError utility is also updated to TypeScript:

```typescript
// src/utils/ApiError.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

## Key Changes Made

1. **Import/Export Syntax**: Changed from CommonJS (`require`/`module.exports`) to ES Modules (`import`/`export`)
2. **Type Annotations**: Added types to function parameters and return values
3. **Interfaces**: Created interfaces for data structures
4. **Default Values**: Added default values for optional parameters
5. **Documentation**: Updated JSDoc comments to include TypeScript types

## Benefits of Migration

1. **Type Safety**: Catch type-related errors at compile time
2. **Better IDE Support**: Improved autocompletion and intellisense
3. **Self-Documenting Code**: Types serve as documentation
4. **Refactoring Support**: Easier to refactor with type checking

## Testing After Migration

After migration, run the tests to ensure functionality is preserved:

```bash
npm test -- --testPathPattern=user.service
```

## Conclusion

This example demonstrates the process of migrating a JavaScript file to TypeScript. The key is to add appropriate type annotations while maintaining the same functionality. The migration process should be done incrementally, with thorough testing after each file is migrated. 