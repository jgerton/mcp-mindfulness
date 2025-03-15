# Test Debt Resolution Plan

## Overview
This document outlines the plan to resolve the current test debt in the codebase, focusing on TypeScript errors and interface inconsistencies that are causing test failures.

## Current Issues

### 1. Achievement Service TypeScript Errors
- **File**: `/src/services/achievement.service.ts`
- **Issues**:
  - Properties like `progress`, `target`, `completed`, and `completedAt` do not exist on the `IAchievement` interface
  - Missing properties in the `IMeditationSession` interface referenced in achievement service
- **Impact**: Multiple test failures in achievement-related tests

### 2. Meditation Session Interface Mismatches
- **File**: `/src/models/meditation-session.model.ts`
- **Issues**:
  - Properties like `moodBefore`, `moodAfter`, and `durationCompleted` missing from interface
  - Inconsistency between interface and implementation
- **Impact**: Failures in meditation session tests and related services

### 3. Auth Middleware Type Conflicts
- **File**: `/src/middleware/auth.middleware.ts`
- **Issues**:
  - Conflicting type definitions between project-planning and src implementations
  - Property `user` has different types in different declarations
- **Impact**: API test failures due to type conflicts

### 4. Test Utility Type Handling
- **File**: `/src/__tests__/utils/test-utils.ts`
- **Issues**:
  - Lack of proper type assertions for error handling
  - Missing helper functions for common test patterns
- **Impact**: Repetitive code and inconsistent error handling in tests

## Resolution Steps

### Step 1: Fix Achievement Service Interface Issues
1. Update the `IAchievement` interface to include all required properties:
   ```typescript
   export interface IAchievement extends Document {
     name: string;
     description: string;
     category: string;
     criteria: {
       type: string;
       value: number;
     };
     icon: string;
     points: number;
     progress: number; // Add missing property
     target: number; // Add missing property
     completed: boolean; // Add missing property
     completedAt: Date; // Add missing property
     type: string; // Add missing property
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. Create an extended interface for Mongoose documents:
   ```typescript
   export interface IAchievementDocument extends mongoose.Document, IAchievement {
     // Additional methods or properties if needed
   }
   ```

3. Update service methods to use the extended interface

### Step 2: Fix Meditation Session Interface
1. Update the `IMeditationSession` interface to include all properties used in the codebase:
   ```typescript
   export interface IMeditationSession extends Document {
     // Existing properties
     userId: mongoose.Types.ObjectId;
     title: string;
     description?: string;
     duration: number;
     completed: boolean;
     startTime: Date;
     endTime?: Date;
     type: 'guided' | 'unguided' | 'timed';
     guidedMeditationId?: mongoose.Types.ObjectId;
     tags?: string[];
     
     // Add missing properties
     mood?: {
       before?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
       after?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
     };
     moodBefore?: string; // For backward compatibility
     moodAfter?: string; // For backward compatibility
     durationCompleted?: number;
     status?: string;
     interruptions?: number;
     meditationId?: mongoose.Types.ObjectId;
     
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
     
     // Virtual properties
     durationMinutes: number;
     completionPercentage: number;
     isStreakEligible: boolean;
     
     // Methods
     completeSession(endTime?: Date): Promise<IMeditationSession>;
     processAchievements(): Promise<void>;
   }
   ```

2. Ensure consistency between interface and implementation

### Step 3: Resolve Auth Middleware Type Conflicts
1. Standardize the user property type across all declarations:
   ```typescript
   // In auth.middleware.ts
   declare global {
     namespace Express {
       interface Request {
         user?: { _id: string; username: string };
       }
     }
   }
   ```

2. Remove or update conflicting declarations in project-planning files

### Step 4: Enhance Test Utilities
1. Create utility functions for common test patterns:
   ```typescript
   // In test-utils.ts
   
   /**
    * Type-safe error handler for testing validation errors
    */
   export async function expectValidationError<T>(
     action: () => Promise<T>,
     expectedErrorFields: string[]
   ): Promise<void> {
     let error: any;
     try {
       await action();
       fail('Expected validation error but none was thrown');
     } catch (err) {
       error = err;
     }
     
     expect(error).toBeDefined();
     expect(error.name).toBe('ValidationError');
     
     for (const field of expectedErrorFields) {
       expect(error.errors[field]).toBeDefined();
     }
   }
   
   /**
    * Type-safe document finder with proper typing
    */
   export async function findDocumentById<T extends mongoose.Document>(
     model: mongoose.Model<T>,
     id: mongoose.Types.ObjectId | string
   ): Promise<T> {
     const document = await model.findById(id);
     if (!document) {
       throw new Error(`Document not found with id: ${id}`);
     }
     return document;
   }
   ```

2. Update existing tests to use these utilities

### Step 5: Update Test Files
1. Fix type assertions in all test files:
   ```typescript
   // BEFORE
   let error;
   try {
     await model.save();
   } catch (err) {
     error = err;
   }
   
   // AFTER
   let error: any;
   try {
     await model.save();
   } catch (err) {
     error = err;
   }
   ```

2. Use proper type assertions for Mongoose documents:
   ```typescript
   // BEFORE
   const achievement = await Achievement.findById(id);
   expect(achievement.progress).toBe(expectedProgress);
   
   // AFTER
   const achievement = await Achievement.findById(id) as IAchievementDocument;
   expect(achievement.progress).toBe(expectedProgress);
   ```

## Testing Approach
1. Fix one issue at a time, starting with the most critical (achievement service)
2. Run targeted tests after each fix to verify resolution
3. Run the full test suite only after all individual fixes are confirmed
4. Document any additional issues discovered during the process

## References
- [Testing Standards](../testing-standards.md)
- [TypeScript Testing Best Practices](../testing-standards.md#typescript-testing-best-practices)
- [Mongoose TypeScript Documentation](https://mongoosejs.com/docs/typescript.html) 