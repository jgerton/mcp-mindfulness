# Component Testing Strategy

## Testing Hierarchy and Dependencies

### 1. Core Layer (P0)
Foundation components that other parts of the system depend on.

#### Models & Schemas
1. **User Domain**
   - `user.model.ts`
   - `user-points.model.ts`

2. **Session Domain**
   - `base-wellness-session.model.ts` (Base Class)
   - `meditation-session.model.ts`
   - `stress-management-session.model.ts`
   - `group-session.model.ts`

3. **Activity Domain**
   - `meditation.model.ts`
   - `stress.model.ts`
   - `breathing.model.ts`
   - `pmr.model.ts`

4. **Progress Domain**
   - `progress.model.ts`
   - `session-analytics.model.ts`
   - `achievement.model.ts`

5. **Social Domain**
   - `friend.model.ts`
   - `friend-request.model.ts`
   - `chat-message.model.ts`

6. **Supporting Models**
   - `mood.model.ts`
   - `stress-level.model.ts`
   - `session-status.model.ts`

### 2. Service Layer (P1)

Business logic components that depend on core layer.

- Services (Implementation order based on model dependencies)
- Validations
- Error handlers

### 3. API Layer (P2)
Components that expose functionality to clients.

#### Testing Implementation Order

1. **Controllers**
   - Write controller test first
   - Implement in this order:
     a. Basic success case
     b. Input validation
     c. Error handling
     d. Edge cases
     e. Service integration
   - Verify each test passes before moving on
   - Document assumptions and dependencies

2. **Middleware**
   - Test before implementation
   - Follow this sequence:
     a. Authentication flows
     b. Validation rules
     c. Error handling
     d. Middleware chains
     e. Edge cases
   - Avoid mocking middleware unless absolutely necessary
   - Test actual middleware behavior

3. **Routes**
   - Test after controllers and middleware
   - Implementation sequence:
     a. Route parameter validation
     b. Middleware integration
     c. Complete request flow
     d. Error responses
     e. Authorization rules
   - Test full request-response cycle
   - Verify middleware chain execution

#### Validation Process for Each Component
1. Write failing test
2. Implement minimal code to pass
3. Run test suite
4. Verify test passes
5. Add edge cases
6. Verify all tests still pass
7. Document any assumptions
8. Move to next test

#### Testing Standards
- No component is complete until all tests pass
- Each component must have both unit and integration tests
- Mock external dependencies, not internal ones
- Test actual middleware instead of bypassing
- Maintain test isolation
- Follow type-safe patterns

#### Common Test Cases
1. **Controllers**
   ```typescript
   describe('Controller', () => {
     describe('Success Cases', () => {
       it('should handle valid input')
       it('should return correct response format')
       it('should call service methods correctly')
     });

     describe('Error Cases', () => {
       it('should handle invalid input')
       it('should handle service errors')
       it('should return proper error responses')
     });

     describe('Edge Cases', () => {
       it('should handle empty input')
       it('should handle boundary values')
       it('should handle concurrent requests')
     });
   });
   ```

2. **Middleware**
   ```typescript
   describe('Middleware', () => {
     describe('Authentication', () => {
       it('should validate token')
       it('should handle missing token')
       it('should handle invalid token')
     });

     describe('Validation', () => {
       it('should validate required fields')
       it('should handle invalid data types')
       it('should sanitize input')
     });

     describe('Error Handling', () => {
       it('should catch and format errors')
       it('should preserve error context')
       it('should handle async errors')
     });
   });
   ```

3. **Routes**
   ```typescript
   describe('Routes', () => {
     describe('Request Validation', () => {
       it('should validate route parameters')
       it('should validate query parameters')
       it('should validate request body')
     });

     describe('Middleware Chain', () => {
       it('should execute middleware in order')
       it('should handle middleware errors')
       it('should pass context between middleware')
     });

     describe('Integration', () => {
       it('should handle complete request flow')
       it('should integrate with controller')
       it('should maintain request context')
     });
   });
   ```

#### Progress Tracking
- [ ] Controllers
  - [ ] User Controller
  - [ ] Session Controller
  - [ ] Activity Controller
  - [ ] Progress Controller
  - [ ] Social Controller

- [ ] Middleware
  - [ ] Authentication
  - [ ] Validation
  - [ ] Error Handling
  - [ ] Logging
  - [ ] Rate Limiting

- [ ] Routes
  - [ ] User Routes
  - [ ] Session Routes
  - [ ] Activity Routes
  - [ ] Progress Routes
  - [ ] Social Routes

### 4. Integration Layer (P3)
Components that tie everything together.

- Socket handlers
- Components
- App configuration

## Testing Implementation Order

### Phase 1: Core Layer Testing
1. Start with `user.model.ts` tests
   - Basic CRUD operations
   - Validation rules
   - Password hashing
   - Relations with other models

2. Move to session models
   - Test inheritance from base class
   - Session-specific functionality
   - State transitions
   - Validation rules

3. Activity models testing
   - Core functionality
   - Integration with sessions
   - Data validation

### Phase 2: Service Layer Testing
1. User service tests
   - Authentication
   - Profile management
   - Points/achievements

2. Session service tests
   - Session creation/management
   - Activity tracking
   - Analytics

### Phase 3: API Layer Testing
1. Controller tests
   - Request handling
   - Response formatting
   - Error handling

2. Middleware tests
   - Authentication
   - Validation
   - Error handling

### Phase 4: Integration Testing
1. API route integration
2. Socket functionality
3. Full user journey scenarios

## Test Case Categories

For each component, implement tests in this order:

1. **Happy Path Tests**
   - Basic functionality
   - Expected inputs/outputs
   - Common use cases

2. **Error Cases**
   - Invalid inputs
   - Missing required fields
   - Authorization failures
   - Network errors

3. **Edge Cases**
   - Boundary conditions
   - Resource limits
   - Concurrent operations
   - Race conditions

4. **Integration Scenarios**
   - Component interactions
   - Data flow
   - State management

## Testing Standards

### Model Tests
- Validate schema definitions
- Test all model methods
- Verify indexes
- Check relationships
- Test middleware (pre/post hooks)

### Service Tests
- Mock external dependencies
- Test business logic
- Verify error handling
- Check edge cases
- Test performance constraints

### Controller Tests
- Validate request handling
- Test response formatting
- Check error responses
- Verify middleware integration
- Test route parameters

## Progress Tracking

- [ ] Phase 1: Core Layer
  - [ ] User Domain Models
  - [ ] Session Domain Models
  - [ ] Activity Domain Models
  - [ ] Progress Domain Models
  - [ ] Social Domain Models
  - [ ] Supporting Models

- [ ] Phase 2: Service Layer
  - [ ] User Services
  - [ ] Session Services
  - [ ] Activity Services
  - [ ] Social Services

- [ ] Phase 3: API Layer
  - [ ] Controllers
  - [ ] Middleware
  - [ ] Routes

- [ ] Phase 4: Integration
  - [ ] API Integration
  - [ ] Socket Integration
  - [ ] User Journeys

## Test Implementation Guidelines

1. Follow TDD approach
   - Write failing test
   - Implement functionality
   - Refactor

2. Use type-safe patterns
   - Proper interface definitions
   - Mock type matching
   - Avoid any type

3. Maintain test isolation
   - Clean setup/teardown
   - Mock external dependencies
   - Reset state between tests

4. Follow Mandatory Validation Requirements
   - Implement all required validations from [Testing Standards](../standards/testing-standards.md#mandatory-validation-testing-requirements)
   - Complete validation checklist before marking tests as done
   - Ensure all type safety checks are passing
   - Verify mock implementations match real service behavior

5. Test File Structure
   - Group tests by feature/functionality area
   - Within each feature group, organize by test types (success, error, edge cases)
   - Use descriptive test names that indicate the scenario being tested
   - Example structure in TypeScript:

   ```typescript
   describe('ServiceName', () => {
     describe('Feature Area (e.g., User Management)', () => {
       describe('Success Cases', () => {
         it('should successfully handle valid scenario', () => {});
       });
       
       describe('Error Cases', () => {
         it('should handle specific error condition', () => {});
       });
       
       describe('Edge Cases', () => {
         it('should handle boundary condition', () => {});
       });

       describe('Validation Cases', () => {
         it('should handle empty request body', () => {});
         it('should handle invalid fields', () => {});
         it('should validate correct types', () => {});
       });
     });
   });
   ```

   For a real-world example of this structure, see `src/__tests__/services/meditation.service.test.ts`

## Next Steps

1. Create reusable test utilities
2. Set up test data factories
3. Implement base test classes
4. Begin with user model tests 

## Practical Implementation Guide

### Test Directory Structure
```
src/__tests__/
├── api/              # API endpoint tests
├── controllers/      # Controller unit tests
├── core/            # Core functionality tests
├── factories/       # Test data factories
├── fixtures/        # Static test data
├── helpers/         # Test helper functions
├── middleware/      # Middleware tests
├── models/          # Model tests
├── mocks/          # Mock implementations
├── services/        # Service layer tests
├── setup/          # Test setup configurations
├── test-utils/     # Shared test utilities
└── templates/      # Test templates
```

### Example Test Implementations

#### 1. Model Test Example (session-analytics.model.test.ts)
```typescript
import { SessionAnalytics } from '../models/session-analytics.model';
import { dbHandler } from './test-utils/db-handler';

describe('SessionAnalytics Model', () => {
  beforeAll(async () => await dbHandler.connect());
  afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const invalidAnalytics = new SessionAnalytics({});
      const err = invalidAnalytics.validateSync();
      expect(err.errors.sessionId).toBeDefined();
    });
  });

  describe('Methods', () => {
    it('should calculate session duration', async () => {
      const analytics = new SessionAnalytics({
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T10:30:00')
      });
      expect(analytics.getDuration()).toBe(1800); // 30 minutes in seconds
    });
  });
});
```

#### 2. Service Test Example (meditation-session.service.test.ts)
```typescript
import { MeditationSessionService } from '../services/meditation-session.service';
import { mockUser, mockSession } from './factories/session.factory';

describe('MeditationSessionService', () => {
  let service: MeditationSessionService;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    service = new MeditationSessionService(mockDb);
  });

  describe('createSession', () => {
    it('should create new session with valid input', async () => {
      const user = mockUser();
      const session = mockSession();
      mockDb.create.mockResolvedValue(session);

      const result = await service.createSession(user, {
        duration: 600,
        type: 'guided'
      });

      expect(result).toEqual(session);
      expect(mockDb.create).toHaveBeenCalledWith({
        userId: user.id,
        duration: 600,
        type: 'guided'
      });
    });
  });
});
```

#### 3. Integration Test Example (session-analytics.integration.test.ts)
```typescript
import request from 'supertest';
import app from '../app';
import { dbHandler } from './test-utils/db-handler';
import { createAuthToken } from './helpers/auth';

describe('Session Analytics Integration', () => {
  let authToken;
  
  beforeAll(async () => {
    await dbHandler.connect();
    authToken = await createAuthToken(mockUser());
  });

  afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  describe('POST /api/sessions/:id/analytics', () => {
    it('should create session analytics', async () => {
      const response = await request(app)
        .post('/api/sessions/123/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          duration: 600,
          completionRate: 100
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
```

### Test Utilities

#### 1. Database Handler (db-handler.ts)
```typescript
// src/__tests__/test-utils/db-handler.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const dbHandler = {
  connect: async () => {
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  },
  clearDatabase: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  },
  closeDatabase: async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};
```

#### 2. Express Mocks (express-mock.ts)
```typescript
// src/__tests__/test-utils/express-mock.ts
import { Request, Response } from 'express';

export const mockRequest = (overrides = {}) => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides
  } as Request;
};

export const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};
```

### Test Data Factories

#### Session Factory Example (session.factory.ts)
```typescript
// src/__tests__/factories/session.factory.ts
import { User } from '../../models/user.model';
import { Session } from '../../models/session.model';

export const mockUser = (overrides = {}) => ({
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides
});

export const mockSession = (overrides = {}) => ({
  id: 'session123',
  userId: 'user123',
  duration: 600,
  type: 'guided',
  status: 'completed',
  ...overrides
});
```

### Common Testing Patterns

1. **Database Operations**
   - Always use `dbHandler` for database operations
   - Clear database between tests
   - Use separate test database

2. **Authentication/Authorization**
   - Mock JWT tokens using `createAuthToken`
   - Test both authenticated and unauthenticated states
   - Verify permission levels

3. **Request/Response Handling**
   - Use `mockRequest` and `mockResponse` for controller tests
   - Test all response status codes
   - Verify response body structure

4. **Error Handling**
   - Test both success and error paths
   - Verify error messages and codes
   - Test validation errors

5. **Async Operations**
   - Use proper async/await patterns
   - Test timeouts and race conditions
   - Handle promise rejections

## Related Documentation

### Core Standards & Guidelines
- [Testing Standards](../testing-standards.md)
- [Coding Standards](../coding-standards.md)
- [Design Patterns](../design-patterns.md)
- [Work Flow](../work-flow.md)

### Architecture & Planning
- [Architecture Plan](../architecture-plan.md)
- [Backend Feature Review](../backend-feature-review.md)
- [Frontend Interface Plan](../frontend-interface-plan.md)
- [User Journey Plan](../user-journey-plan.md)

### Implementation Guides
- [TypeScript Test Patterns Guide](../guides/typescript-test-patterns-guide.md)
- [Document Grounding Plan](../document-grounding-plan.md)
- [Learning Analytics Plan](../learning-analytics-plan.md)
- [Learning Path Management Plan](../learning-path-management-plan.md)

### Project Status & Tracking
- [Implementation Status](../implementation-status.md)
- [TODO Testing](../TODO-TESTING.md)

### Component-Specific Documentation
- **Architecture**: [/project-planning/architecture/](../architecture/)
- **Features**: [/project-planning/features/](../features/)
- **Services**: [/project-planning/services/](../services/)
- **Routes**: [/project-planning/routes/](../routes/)
- **Middleware**: [/project-planning/middleware/](../middleware/)

### Examples & Templates
- **Examples**: [/project-planning/examples/](../examples/)
- **Templates**: [/project-planning/templates/](../templates/)

### Additional Resources
- **Workflows**: [/project-planning/workflows/](../workflows/)
- **Standards**: [/project-planning/standards/](../standards/)
- **Documentation**: [/project-planning/documentation/](../documentation/)
- **Guides**: [/project-planning/guides/](../guides/) 