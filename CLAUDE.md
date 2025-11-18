# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The MCP Stress Management and Mindfulness Practices Platform is a comprehensive digital wellness solution built with Node.js/Express backend (TypeScript), MongoDB, and Socket.IO for real-time features. The platform seamlessly integrates stress management techniques with mindfulness practices, providing users with personalized wellness experiences.

## Essential Commands

### Development
```bash
pnpm install              # Install dependencies
pnpm dev                  # Start development server with hot reload
pnpm build                # Compile TypeScript to dist/
pnpm start                # Run production build
```

### Testing
```bash
pnpm test                 # Run test validation then Jest test suite
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Generate coverage report

# Run individual test files
npx jest path/to/test.test.ts

# Run specific test suites
npx jest --testNamePattern="suite name"

# Mobile-specific tests
pnpm test:mobile-network      # Network resilience tests
pnpm test:mobile-performance  # API performance tests
pnpm test:mobile              # Run all mobile tests
```

### Code Quality
```bash
pnpm lint                 # Run ESLint
pnpm validate-tests       # Validate test structure (runs before tests)
pnpm migrate-tests        # Migrate tests to new patterns
```

## Architecture Overview

### Layered Architecture

The codebase follows a strict layered architecture pattern:

```
Controllers (routes) → Services (business logic) → Models (data layer)
```

**Key principles:**
- Controllers handle HTTP concerns, validation, and error responses
- Services contain all business logic and coordinate between models
- Models define schemas, validation rules, and database operations
- Never skip layers (e.g., don't call models directly from controllers)

### Directory Structure

```
src/
├── controllers/       # HTTP request handlers, use services
├── services/          # Business logic, coordinates models
├── models/            # Mongoose schemas and data validation
├── routes/            # Express route definitions
├── middleware/        # Auth, validation, error handling
├── utils/            # Error codes, helpers, logging
├── config/           # Swagger, environment config
├── socket/           # WebSocket/Socket.IO management
└── __tests__/        # All test files
    ├── api/          # API integration tests
    ├── controllers/  # Controller unit tests
    ├── services/     # Service unit tests
    ├── models/       # Model validation tests
    ├── middleware/   # Middleware tests
    ├── factories/    # Test data factories
    └── helpers/      # Test utilities
```

### Core Patterns

#### 1. Wellness Session Inheritance
The platform uses base classes for wellness activities:
- `BaseWellnessSession` - Abstract parent for all wellness sessions
- Specific implementations: `MeditationSession`, `BreathingSession`, `PMRSession`, `StressManagementSession`
- Shared fields: `userId`, `startTime`, `endTime`, `duration`, `status`

#### 2. Error Handling System
All errors use structured error classes with categories and codes:

```typescript
// Error categories
VALIDATION   // User input errors
SECURITY     // Auth/authorization errors
BUSINESS     // Business logic violations
TECHNICAL    // System/infrastructure errors

// Usage
throw new AppError(
  'User not found',
  ErrorCodes.NOT_FOUND,
  ErrorCategory.BUSINESS
);
```

**Important:** The standardized error middleware (`error-handler.middleware.ts`) provides consistent JSON responses with error codes, categories, user messages, and retry indicators.

#### 3. Authentication Flow
- JWT-based authentication
- `auth.middleware.ts` validates tokens and attaches user to `req.user`
- Protected routes require authentication middleware
- Test files mock auth middleware to bypass token validation

## Test-Driven Development (TDD)

**Critical:** This project follows strict TDD practices from `.cursor/rules/test-driven-development.mdc`.

### Before Writing Code
1. Understand the full scope of changes needed
2. Create comprehensive test cases FIRST
3. Verify your plan before implementation
4. Ask questions if scope is unclear

### Test Organization

**Test Categories:**
- `*.test.ts` - Unit tests (models, services, controllers)
- `*.integration.test.ts` - Integration tests (full request flows)
- `*.api.test.ts` - API endpoint tests (in `__tests__/api/`)

### Testing Patterns

#### MongoDB Connection Best Practices
The project has evolved specific patterns for MongoDB testing after resolving timeout issues:

**Use Direct Controller Testing (Preferred):**
```typescript
// Mock Express req/res objects
const mockReq = {
  user: { _id: userId },
  params: { id: resourceId },
  body: { ...data }
} as Request;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

// Call controller directly
await controller.getResource(mockReq, mockRes);
```

**Benefits:**
- No HTTP server overhead
- No network delays
- No WebSocket/middleware conflicts
- Faster execution (5-10s vs 30-60s)

**Setup/Teardown Pattern:**
```typescript
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

beforeEach(async () => {
  // Clear collections between tests
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
```

#### Test Factory Pattern
Use factory functions from `src/__tests__/factories/` to create test data:

```typescript
import { createMeditationSession } from '../factories/meditation-session.factory';

const session = await createMeditationSession({
  userId,
  duration: 600,
  status: 'completed'
});
```

#### Error Testing Pattern
Tests should verify the structured error response format:

```typescript
expect(mockRes.status).toHaveBeenCalledWith(404);
expect(mockRes.json).toHaveBeenCalledWith({
  error: {
    code: ErrorCodes.NOT_FOUND,
    category: ErrorCategory.BUSINESS,
    message: expect.any(String),
    userMessage: expect.any(String),
    retryable: false
  }
});
```

### Common Test Issues

**MongoDB Connection Timeouts:**
- Use direct controller testing instead of supertest/HTTP
- Mock authentication middleware
- Clear database between tests
- See `project-planning/guides/mongodb-connection-guide.md`

**Test Isolation:**
- Each test should be independent
- Use factories to create fresh data
- Clear all collections in `beforeEach`

## Critical Documentation

The project maintains extensive planning documentation. Key references:

### Process Documentation
- `project-planning/guides/vertical-dependency-analysis-framework.md` - VDA framework for dependency tracking
- `project-planning/standards/testing-standards.md` - Comprehensive testing guidelines
- `project-planning/standards/coding-standards.md` - Code style and patterns
- `project-planning/workflow/work-flow.md` - Development process

### Technical Guides
- `project-planning/guides/mongodb-connection-guide.md` - MongoDB testing patterns (critical for test writing)
- `project-planning/guides/swagger-documentation-guide.md` - API documentation standards
- `project-planning/guides/mobile-integration-guide.md` - Mobile optimization patterns

### Architecture References
- `.cursor/rules/architecture-plan.mdc` - Links to all architecture docs
- `project-planning/architecture/backend-architecture.md` - Backend structure
- `project-planning/guides/model-dependency-guide.md` - Data model relationships

## Key Implementation Details

### Stress Management Features
- **Stress Techniques API** (`/api/stress-techniques`): Evidence-based techniques with AI-powered recommendations
- **Stress Assessments** (`/api/stress-management`): Track stress levels over time
- Techniques categorized: breathing, physical, mental, social, lifestyle
- Recommendations based on stress level and available time

### Data Export System
- **Export API** (`/api/export`): User data export in JSON/CSV formats
- Supports date range filtering
- Categories: meditation, stress, achievements, user profile
- Privacy-focused with field-level permissions

### Real-time Features
- Socket.IO for group sessions and chat
- `SocketManager` class handles all WebSocket connections
- Proper cleanup required in tests (`socketManager.close()`)

### Achievement System
- Point-based system tracking user progress
- Multiple achievement types: meditation streaks, technique mastery, milestones
- Service layer handles complex point calculations

## Environment Setup

Required environment variables:
```bash
NODE_ENV=development|test|production
MONGODB_URI=mongodb://localhost:27017/mindfulness
JWT_SECRET=your-secret-key
PORT=3000
```

For tests, these are set automatically in `src/__tests__/setup.ts`.

## Vertical Dependency Analysis (VDA)

When implementing features, consider the VDA framework:
1. Map dependencies vertically: Business Goal → Feature → Component → Code
2. Document upward dependencies (what this needs)
3. Document lateral dependencies (what this interacts with)
4. Document downward dependencies (what depends on this)
5. Check the gap registry for known issues: `project-planning/tracking/gap-registry.md`

## Mobile Integration Considerations

The platform is optimized for mobile with:
- Network resilience for intermittent connections
- Payload size optimization
- Battery impact considerations
- Reduced timeout values for mobile endpoints

Test mobile-specific behaviors with the mobile test suite before deploying mobile-facing features.

## Important Notes

- **Always run tests before committing**: `pnpm test`
- **Follow TDD**: Write tests first, implementation second
- **Use error classes**: Never throw raw strings, always use `AppError` or specific error classes
- **Mock authentication in tests**: Use mock middleware to bypass JWT validation
- **Clear database between tests**: Ensure test isolation
- **Document skipped tests**: Use the template in `project-planning/testing/test-documentation-template.md`
