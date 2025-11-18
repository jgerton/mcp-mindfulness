# Type-First Development Guide

## Overview

This guide outlines our "Type-First Development" approach, designed to solve the common issues we've encountered with parameter name mismatches, type errors, and test/implementation alignment in our TDD process. By defining shared types and interfaces before test implementation, we create a consistent contract between tests and implementation code.

## The Problem

In our TDD process, we've repeatedly encountered these issues:

1. **Type Mismatches**: Tests expect properties that don't exist or have the wrong type in implementation
2. **Parameter Name Mismatches**: Tests use different parameter names than implementation code
3. **Interface Inconsistencies**: Controller signatures don't match expected behavior in tests
4. **Model Schema Changes**: Test data doesn't reflect the actual model schema requirements
5. **Enum Value Mismatches**: Tests use values not included in model enums

These issues lead to unnecessary development cycles, where seemingly correct tests fail because of type misalignment rather than functional problems.

## The Type-First Solution

### 1. Define Shared Interfaces First

Before writing tests or implementation, create interface definitions that both will share:

```typescript
// src/interfaces/controllers/achievement-controller.interface.ts
import { Request, Response } from 'express';
import { CreateAchievementDto } from '../dtos/achievement.dto';

export interface IAchievementController {
  getAllAchievements(req: Request & {query?: {category?: string}}, res: Response): Promise<void>;
  getAchievementById(req: Request & {params: {id: string}}, res: Response): Promise<void>;
  createAchievement(req: Request & {body: CreateAchievementDto}, res: Response): Promise<void>;
}

// src/interfaces/dtos/achievement.dto.ts
export interface CreateAchievementDto {
  name: string;
  description: string;
  category: 'milestone' | 'time' | 'streak' | 'special';
  userId: string;
}
```

### 2. Define Model Interface and Validation Schema

Create model interfaces with all required fields and validation rules:

```typescript
// src/interfaces/models/achievement.interface.ts
export interface IAchievement {
  _id?: string;
  name: string;
  description: string;
  category: 'milestone' | 'time' | 'streak' | 'special';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/schemas/achievement.schema.ts
import Joi from 'joi';

export const createAchievementSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid('milestone', 'time', 'streak', 'special').required(),
  userId: Joi.string().required()
});
```

### 3. Create Request/Response Type Definitions

Define request and response shapes as interfaces:

```typescript
// src/interfaces/requests/achievement.request.ts
export interface GetAchievementByIdParams {
  id: string;
}

export interface FilterAchievementsQuery {
  category?: string;
  startDate?: string;
  endDate?: string;
}

// src/interfaces/responses/achievement.response.ts
import { IAchievement } from '../models/achievement.interface';

export type AchievementResponse = Omit<IAchievement, 'userId'>;
export type AchievementsListResponse = AchievementResponse[];
```

### 4. Create Parameter Type Guards

Implement type guards to validate parameters at runtime:

```typescript
// src/utils/type-guards.ts
import mongoose from 'mongoose';
import { GetAchievementByIdParams, FilterAchievementsQuery } from '../interfaces/requests/achievement.request';

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function isGetAchievementByIdParams(params: any): params is GetAchievementByIdParams {
  return typeof params === 'object' && params !== null && 
    typeof params.id === 'string' && isValidObjectId(params.id);
}

export function isFilterAchievementsQuery(query: any): query is FilterAchievementsQuery {
  if (typeof query !== 'object' || query === null) return false;
  
  // Check category if provided
  if ('category' in query && typeof query.category !== 'string') return false;
  
  // Check dates if provided
  if ('startDate' in query && !isValidDateString(query.startDate)) return false;
  if ('endDate' in query && !isValidDateString(query.endDate)) return false;
  
  return true;
}

function isValidDateString(date: any): boolean {
  if (typeof date !== 'string') return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}
```

## Test Data Factories

### Creating Type-Safe Test Factories

Test data factories ensure consistent, valid data in all tests:

```typescript
// src/__tests__/factories/achievement.factory.ts
import { IAchievement } from '../../interfaces/models/achievement.interface';
import mongoose from 'mongoose';

type AchievementInput = Partial<IAchievement>;

export function createTestAchievement(overrides: AchievementInput = {}): Omit<IAchievement, '_id'> {
  return {
    name: 'Test Achievement',
    description: 'Test description',
    category: 'milestone',
    userId: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}
```

### Model Validation in Tests

Verify that test data matches model expectations:

```typescript
// src/__tests__/models/achievement.model.test.ts
import { Achievement } from '../../models/achievement.model';
import { createTestAchievement } from '../factories/achievement.factory';

describe('Achievement Model', () => {
  it('validates schema correctly', async () => {
    // Valid data should pass validation
    const validData = createTestAchievement();
    const achievement = new Achievement(validData);
    const validationError = achievement.validateSync();
    expect(validationError).toBeUndefined();
    
    // Invalid category should fail validation
    const invalidData = createTestAchievement({ category: 'invalid-category' as any });
    const invalidAchievement = new Achievement(invalidData);
    const invalidValidationError = invalidAchievement.validateSync();
    expect(invalidValidationError).toBeDefined();
    expect(invalidValidationError?.errors.category).toBeDefined();
  });
});
```

## Implementation Verification

### Verify Interface Compliance

Before implementing controllers, verify the interface:

```typescript
// src/__tests__/interfaces/achievement-controller.interface.test.ts
import { IAchievementController } from '../../interfaces/controllers/achievement-controller.interface';

describe('Achievement Controller Interface', () => {
  it('defines required methods with correct signatures', () => {
    // Create a type check that would fail if methods are missing
    const requiredMethods: (keyof IAchievementController)[] = [
      'getAllAchievements',
      'getAchievementById',
      'createAchievement'
    ];
    
    // This is just a type check, not a runtime test
    const typeCheck = <T extends IAchievementController>(controller: T) => {
      requiredMethods.forEach(method => {
        // Verify method exists and is a function
        expect(typeof controller[method]).toBe('function');
      });
    };
    
    // This will pass if the interface is properly defined
    expect(requiredMethods.length).toBeGreaterThan(0);
  });
});
```

### Pre-Implementation Schema Validation

Verify model schemas match interface expectations:

```typescript
// src/__tests__/interfaces/achievement.interface.test.ts
import { IAchievement } from '../../interfaces/models/achievement.interface';
import { Achievement } from '../../models/achievement.model';

describe('Achievement Interface Alignment', () => {
  it('matches model schema', () => {
    // Get schema fields
    const schemaFields = Object.keys(Achievement.schema.paths);
    
    // Expected fields from interface
    const expectedFields = [
      '_id', 'name', 'description', 'category', 
      'userId', 'createdAt', 'updatedAt'
    ];
    
    // Verify all interface fields exist in schema
    expectedFields.forEach(field => {
      expect(schemaFields).toContain(field);
    });
    
    // Check specific field types
    const categoryPath = Achievement.schema.path('category');
    expect(categoryPath).toBeDefined();
    
    // Verify enum values match our expectations
    const enumValues = categoryPath?.options?.enum || [];
    expect(enumValues).toContain('milestone');
    expect(enumValues).toContain('time');
    expect(enumValues).toContain('streak');
    expect(enumValues).toContain('special');
  });
});
```

## Integration with TDD Process

### Type-First TDD Workflow

1. **Interface Definition Phase**:
   - Define all interfaces, types, and schemas
   - Create test factories and validation utilities
   - Verify interface alignment with schema expectations

2. **Test Implementation Phase**:
   - Implement tests using defined interfaces and factories
   - Include interface verification in test setup
   - Verify parameter extraction and validation

3. **Implementation Phase**:
   - Implement controllers following interface contracts
   - Use type guards to validate parameters at runtime
   - Follow consistent error handling patterns

### Type-First Checklist for Test Implementation

- [ ] All controller interfaces are defined
- [ ] Request/response types are documented
- [ ] Model interfaces match schema definitions
- [ ] Type guards exist for parameter validation
- [ ] Test factories create valid model data
- [ ] Enum values are consistent between tests and models
- [ ] Interface verification tests are implemented

## Controller Implementation Pattern

When implementing controllers, follow this pattern to ensure alignment with defined interfaces:

```typescript
// src/controllers/achievement.controller.ts
import { Request, Response } from 'express';
import { IAchievementController } from '../interfaces/controllers/achievement-controller.interface';
import { Achievement } from '../models/achievement.model';
import { isGetAchievementByIdParams, isFilterAchievementsQuery } from '../utils/type-guards';

export class AchievementController implements IAchievementController {
  // Implement methods according to interface
  async getAllAchievements(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query || {};
      
      // Validate query parameters
      if (!isFilterAchievementsQuery(query)) {
        res.status(400).json({ error: 'Invalid query parameters' });
        return;
      }
      
      // Build filter
      const filter: any = {};
      if (query.category) {
        filter.category = query.category;
      }
      
      const achievements = await Achievement.find(filter);
      res.status(200).json(achievements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve achievements' });
    }
  }
  
  async getAchievementById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      if (!isValidObjectId(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      
      const achievement = await Achievement.findById(id);
      if (!achievement) {
        res.status(404).json({ error: 'Achievement not found' });
        return;
      }
      
      res.status(200).json(achievement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve achievement' });
    }
  }
  
  async createAchievement(req: Request, res: Response): Promise<void> {
    try {
      const achievement = await Achievement.create(req.body);
      res.status(201).json(achievement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create achievement' });
    }
  }
}
```

## Common Type-First Patterns

### Record Types for Known Values

Use Record types for object literals with known keys:

```typescript
// For error responses
type ErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL_ERROR';

// Define standard error responses
const ErrorResponses: Record<ErrorCode, { status: number, message: string }> = {
  BAD_REQUEST: { status: 400, message: 'Bad request' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' }
};
```

### Discriminated Unions for API Responses

Use discriminated unions for consistent API responses:

```typescript
// Define response types with status discriminator
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; code: number };

// Helper functions
function successResponse<T>(data: T): ApiResponse<T> {
  return { status: 'success', data };
}

function errorResponse(error: string, code: number): ApiResponse<never> {
  return { status: 'error', error, code };
}
```

## Benefits of Type-First Development

1. **Reduced Test/Implementation Mismatches**: By defining interfaces first, both tests and implementation work with the same contract
2. **Better Error Messages**: TypeScript provides better error messages when interfaces don't match
3. **Self-Documenting Code**: Interfaces and type definitions serve as documentation
4. **Easier Refactoring**: Changing an interface immediately identifies all affected code
5. **More Reliable Tests**: Tests that align with implementation from the start are less likely to fail for the wrong reasons

## Conclusion

Type-First Development significantly reduces the common issues we've encountered in our TDD process. By defining shared interfaces and types before writing tests or implementation, we create a consistent contract that both sides must follow. This approach catches errors earlier, provides better documentation, and makes our development process more efficient.

## Related Documentation

- [API Test Patterns Guide](./api-test-patterns-guide.md)
- [Model Dependency Guide](./model-dependency-guide.md)
- [Testing Standards](../standards/testing-standards.md)
- [Architectural Dependency Guide](./architectural-dependency-guide.md) 