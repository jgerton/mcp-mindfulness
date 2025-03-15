# Skipped Test Documentation Template

## Purpose

This template provides a standardized format for documenting skipped tests in the MCP Mindfulness project. Proper documentation of skipped tests ensures that:

1. The reason for skipping is clearly understood
2. The functionality being tested is documented
3. Requirements for implementing the test are defined
4. There is a plan for revisiting the test in the future

## Template for Test Comments

When skipping a test, add the following comment structure above the test:

```typescript
// SKIPPED: [Reason for skipping]
// Description: [Brief description of what the test is checking]
// Requirements: [What needs to be implemented before this test can be unskipped]
// Related Issue: [Link to tracking issue]
// Target Date: [Expected date when this test should be unskipped]
it.skip('should [test description]', async () => {
  // Test implementation
});
```

## Example

```typescript
// SKIPPED: Achievement system not fully implemented
// Description: Verifies that completing a meditation session awards the correct achievement
// Requirements: Achievement service needs to implement the checkAndAwardAchievements method
// Related Issue: #123 - Implement achievement system
// Target Date: End of Sprint Three
it.skip('should award achievement when meditation session is completed', async () => {
  // Create a user
  const user = await createTestUser();
  
  // Complete a meditation session
  const session = await createAndCompleteSession(user.id);
  
  // Check if achievement was awarded
  const achievements = await Achievement.find({ userId: user.id });
  expect(achievements).toHaveLength(1);
  expect(achievements[0].type).toBe('FIRST_MEDITATION');
});
```

## Common Reasons for Skipping Tests

Use one of the following standardized reasons when documenting skipped tests:

1. **Feature not yet implemented**: The feature being tested is planned but not yet implemented
2. **Dependency not available**: A dependency required for the test is not yet available
3. **API changes pending**: The API being tested is expected to change
4. **Environment limitations**: The test environment doesn't support the test
5. **Performance concerns**: The test is too slow or resource-intensive to run regularly
6. **Flaky test**: The test produces inconsistent results
7. **Design reconsideration**: The feature design is being reconsidered

## Documentation in Tracking Issues

When creating a tracking issue for skipped tests, include the following information:

1. **Test Category**: The category or feature area of the skipped tests
2. **Number of Tests**: How many tests are skipped in this category
3. **Reason Summary**: A summary of why these tests are skipped
4. **Test Locations**: File paths and line numbers for the skipped tests
5. **Implementation Requirements**: What needs to be implemented to unskip these tests
6. **Dependencies**: Any dependencies that need to be resolved
7. **Target Sprint**: The sprint in which these tests should be revisited
8. **Assigned To**: Who is responsible for implementing the missing functionality

## Example Tracking Issue

```markdown
# Achievement System Skipped Tests Tracking

## Test Category
Achievement System

## Number of Tests
25

## Reason Summary
The achievement system is partially implemented. These tests verify the awarding of achievements for various user actions, but the core achievement service functionality is not yet complete.

## Test Locations
- src/__tests__/achievement.test.ts (lines 45-120)
- src/__tests__/meditation-session.service.test.ts (lines 210-235)

## Implementation Requirements
1. Complete the achievement service implementation
2. Implement the checkAndAwardAchievements method
3. Create achievement triggers for user actions

## Dependencies
- User service
- Meditation session service
- Points system

## Target Sprint
Sprint Three

## Assigned To
@developer-name
```

## Review Process

All skipped tests should be reviewed:

1. At the end of each sprint
2. During monthly test review meetings
3. As part of the quarterly test audit

During review, decide whether to:
1. Implement the missing functionality and unskip the test
2. Keep the test skipped with updated documentation
3. Remove the test if the feature is no longer planned

## Reporting

Generate a report of all skipped tests at the end of each sprint, including:
1. Total number of skipped tests
2. Number of tests skipped per category
3. Progress on implementing skipped tests
4. Updated target dates for implementation

---

Last Updated: [DATE]

*This template is part of our [Testing Standards](../testing-standards.md) documentation.* 