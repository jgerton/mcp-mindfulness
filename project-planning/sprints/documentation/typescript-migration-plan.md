# TypeScript Migration Plan

## Overview
This document outlines the plan for migrating remaining JavaScript (`.js`) files to TypeScript (`.ts`) in the MCP Mindfulness project. The project is already using TypeScript for core files, but there are still JavaScript files that need to be converted for consistency and type safety.

## Current Status
- Core application files (`app.ts`, `config.ts`, `index.ts`) are already in TypeScript
- Many components, controllers, services, and models still use JavaScript (`.js`) files
- The project has a mix of `.js` and `.ts` files, which can lead to confusion

## Migration Principles
1. **Incremental Migration**: Convert files gradually, focusing on one module at a time
2. **No Functionality Changes**: Migration should not change behavior, only add types
3. **Test Coverage**: Ensure tests pass before and after migration
4. **Dependency Order**: Start with files that have fewer dependencies

## Migration Process for Each File

### Step 1: Preparation
1. Identify the file to migrate
2. Ensure tests exist for the functionality
3. Run tests to confirm current behavior

### Step 2: Conversion
1. Rename the file from `.js` to `.ts`
2. Add type annotations to variables, parameters, and return types
3. Create interfaces for complex objects
4. Fix any type errors
5. Update imports/exports as needed

### Step 3: Verification
1. Run tests to ensure functionality is preserved
2. Fix any issues that arise
3. Commit the changes

## Migration Priority Order

### Phase 1: Core Utilities and Helpers
- [ ] `src/utils/*.js` files
- [ ] `src/validations/*.js` files
- [ ] `src/middleware/*.js` files

### Phase 2: Models and Data Structures
- [ ] `src/models/*.js` files

### Phase 3: Services
- [ ] `src/services/*.js` files

### Phase 4: Controllers and Routes
- [ ] `src/controllers/*.js` files
- [ ] `src/routes/*.js` files

### Phase 5: Components and UI
- [ ] `src/components/*.js` files

### Phase 6: Tests
- [ ] `src/__tests__/*.js` files

## Common Migration Challenges

### 1. Any Type Usage
When migrating, avoid using `any` type as much as possible. Instead:
- Use specific types or interfaces
- Use generics where appropriate
- Use union types for variables that can have multiple types

### 2. Third-Party Libraries
For third-party libraries without TypeScript definitions:
- Check if `@types/{library-name}` exists and install it
- Create custom type definitions if needed

### 3. Complex Object Structures
For complex objects:
- Create interfaces that describe the structure
- Use these interfaces consistently across the codebase

## Example Migration

### Before (user.service.js)
```javascript
const User = require('../models/user.model');

async function findUserById(id) {
  return User.findById(id);
}

module.exports = {
  findUserById
};
```

### After (user.service.ts)
```typescript
import { User, IUser } from '../models/user.model';
import { Types } from 'mongoose';

async function findUserById(id: string | Types.ObjectId): Promise<IUser | null> {
  return User.findById(id);
}

export {
  findUserById
};
```

## Tracking Progress
Progress will be tracked in the sprint documents, with each migrated file marked as completed. A separate task will be created for each module or group of related files to be migrated.

## Conclusion
By following this migration plan, we will gradually convert all JavaScript files to TypeScript, improving code quality, maintainability, and developer experience. The migration will be done incrementally to minimize disruption to ongoing development. 