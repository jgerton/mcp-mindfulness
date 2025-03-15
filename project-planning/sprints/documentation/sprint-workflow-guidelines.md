# Sprint Workflow Guidelines

## Overview
This document outlines the recommended workflow for managing tasks during sprints. Following these guidelines will help maintain consistency, improve tracking, and ensure all team members are aligned on progress and next steps.

## Implementation Structure
All implementation code should be placed in the appropriate directories under `/src` and should use TypeScript (`.ts` extension):

### Core Directories
- Models: `/src/models/` - Database schemas and models
- Controllers: `/src/controllers/` - Request handlers and business logic
- Routes: `/src/routes/` - API endpoint definitions
- Services: `/src/services/` - Reusable business logic and third-party integrations
- Middleware: `/src/middleware/` - Request processing middleware
- Validations: `/src/validations/` - Input validation logic
- Utils: `/src/utils/` - Utility functions and helpers
- Socket: `/src/socket/` - WebSocket implementation
- Components: `/src/components/` - Reusable components
- Config: `/src/config/` - Configuration settings
- Tests: `/src/__tests__/` - Test files

### Core Files
- `app.ts` - Express application setup
- `config.ts` - Configuration variables
- `index.ts` - Application entry point

### TypeScript Standards
- All new code should be written in TypeScript (`.ts` files)
- JavaScript (`.js`) files in the `/src` directory should be converted to TypeScript when modified
- Compiled JavaScript output should go to a `/dist` or `/build` directory (not in `/src`)
- Use TypeScript interfaces and types for all models and data structures

Documentation and planning artifacts should remain in the `/project-planning` directory.

## Sprint Task Workflow

### 1. Task Selection Process
1. **Review Current Sprint Document**: Begin by reviewing the current sprint document to understand priorities and dependencies.
2. **Select Next Task**: Choose the next task based on:
   - Priority level (High → Medium → Low)
   - Dependencies (tasks that block other tasks should be completed first)
   - Task assignments (if specified)
   - Team member expertise and availability
3. **Identify Implementation Path**: Before starting, confirm the correct file path where the implementation should be placed (e.g., `/src/models/` for model implementations).

### 2. Task Implementation Process
1. **Implement the Task**: Complete the necessary code in the appropriate `/src` directory, or documentation in the `/project-planning` directory.
2. **Commit Changes**: Use descriptive commit messages that reference the task being completed.
3. **Update Sprint Document**: Mark the task as completed in the sprint document.
4. **Push Changes**: Push all changes, including the updated sprint document.
5. **Review Progress**: Review the sprint document to determine the next task to tackle.

### 3. Progress Tracking
After completing each significant task:

1. **Update Sprint Document**: 
   ```
   git add project-planning/sprints/sprint-[number].md
   git commit -m "Update sprint-[number].md to mark [task] as completed"
   git push
   ```

2. **Review Progress**: 
   - Check off completed tasks
   - Update progress percentages if applicable
   - Note any blockers or issues encountered

3. **Determine Next Task**:
   - Review remaining tasks
   - Consider dependencies and priorities
   - Select the next most important task

## Task Status Indicators

Use the following indicators in sprint documents:

- `[ ]` - Task not started or in progress
- `[x]` - Task completed
- `⬜` - Task not started or in progress (in priority lists)
- `✅` - Task completed (in priority lists)

## File Path Conventions

When documenting tasks in sprint documents, always include the target file path:

```
- [ ] Implement User model (`/src/models/user.model.ts`)
- [ ] Create utility function for date formatting (`/src/utils/date-formatter.ts`)
- [ ] Implement WebSocket event handler (`/src/socket/events/user-activity.ts`)
- [ ] Update testing standards (`/project-planning/standards/testing-standards.md`)
```

This ensures clarity about where implementation code should be placed versus documentation.

## Directory Usage Guidelines

Use these guidelines to determine where to place new code:

- **Models**: Database schemas, interfaces, and model methods
- **Controllers**: HTTP request handlers that use services and models
- **Routes**: API endpoint definitions that connect to controllers
- **Services**: Business logic that can be reused across controllers
- **Middleware**: Functions that process requests before they reach routes
- **Validations**: Input validation schemas and functions
- **Utils**: Helper functions, formatters, and utilities
- **Socket**: WebSocket event handlers and socket.io implementation
- **Components**: Reusable UI components (for fullstack applications)
- **Config**: Environment-specific configuration
- **Tests**: Test files that correspond to implementation files

## JavaScript to TypeScript Migration

When encountering JavaScript (`.js`) files in the `/src` directory:

1. **New Features**: Always implement new features in TypeScript (`.ts`) files
2. **Modifications**: When modifying an existing `.js` file, consider converting it to TypeScript:
   - Rename the file from `.js` to `.ts`
   - Add appropriate type annotations
   - Fix any type errors
   - Update imports/exports as needed
3. **Imports**: When importing from a file that exists in both `.js` and `.ts` versions, always import from the `.ts` version

## Sprint Review Process

At the end of each sprint:

1. **Complete Final Tasks**: Finish any remaining high-priority tasks.
2. **Update Sprint Document**: Ensure all completed tasks are marked appropriately.
3. **Calculate Completion Metrics**: Determine percentage of tasks completed by category.
4. **Create Sprint Review Document**: Document achievements, challenges, and lessons learned.
5. **Plan Next Sprint**: Use insights from the current sprint to inform planning for the next sprint.

## Integration with Testing Workflow

When implementing features that have associated tests:

1. **Review Test Requirements**: Check the test tracking documents before implementation.
2. **Implement with Testing in Mind**: Write code that will satisfy the test requirements.
3. **Update Test Tracking**: After implementation, update the relevant test tracking document.
4. **Run Tests**: If possible, run the tests to verify implementation.

## Documentation Updates

When completing tasks that affect documentation:

1. **Update Related Documents**: Identify and update any documentation affected by the completed task.
2. **Cross-Reference**: Ensure consistency across all related documentation.
3. **Commit Documentation Changes**: Use separate commits for documentation updates with clear messages.

## Example Workflow

```
# Start of day
1. Review sprint-three.md to check progress and identify next tasks
2. Select highest priority incomplete task
3. Identify the correct implementation path (e.g., /src/models/ for models)
4. Implement the task in the correct location using TypeScript (.ts)
5. Commit code changes
6. Update sprint-three.md to mark task as completed
7. Commit sprint document update
8. Push changes
9. Review sprint-three.md again to select next task
10. Repeat
```

By following these guidelines, we can maintain a consistent workflow, improve visibility into sprint progress, and ensure that all team members are aligned on priorities and next steps.

## Test-Driven Development Approach

### Test Creation Guidelines

1. **Tests First Approach**
   - For new features, create test files before or alongside implementation
   - Define expected behavior through tests before writing code
   - Use tests to guide the implementation process

2. **Test Coverage Requirements**
   - All new features must have corresponding tests
   - Minimum 80% code coverage for new code
   - Both unit and integration tests should be implemented

3. **Test Types to Include**
   - **Unit Tests**: For models, services, and utility functions
   - **Integration Tests**: For API endpoints and service interactions
   - **Authentication Tests**: For protected routes and resources
   - **Validation Tests**: For input validation and error handling

4. **Test File Organization**
   - Place tests in `/src/__tests__/` directory
   - Mirror the source directory structure (e.g., `/src/__tests__/models/` for model tests)
   - Name test files with `.test.ts` suffix (e.g., `user.model.test.ts`)

5. **Test Implementation Timing**
   - Create tests during the same sprint as feature implementation
   - Update tests when modifying existing features
   - Include test tasks in sprint planning for each feature

### Test-Related Sprint Planning

When planning sprints, ensure the following test-related practices are followed:

1. **Include Test Tasks**
   - Add specific test implementation tasks for each new feature
   - Allocate time for test creation and maintenance
   - Consider test complexity when estimating task duration

2. **Test Review Process**
   - Review test coverage during code reviews
   - Ensure tests follow established patterns and standards
   - Verify that tests adequately cover edge cases and error scenarios

3. **Test Maintenance**
   - Update tests when modifying existing features
   - Refactor tests when refactoring code
   - Address flaky or failing tests promptly

4. **Test Documentation**
   - Document test approach for complex features
   - Include test setup instructions in README files
   - Document mock strategies and test data generation

By following these guidelines, we ensure that testing is an integral part of our development process, leading to more reliable and maintainable code. 