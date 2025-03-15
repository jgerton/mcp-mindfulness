# Test Documentation Template for Skipped Tests

## Overview
This template provides a standardized format for documenting skipped tests in our codebase. Use this template when adding comments to skipped tests to ensure consistency and clarity.

## Template

```javascript
/**
 * @skipped
 * @reason [REASON FOR SKIPPING - Choose one of the following or add custom reason]:
 *   - Feature not yet implemented
 *   - Dependent feature in development
 *   - Environment limitations
 *   - Performance concerns
 *   - Flaky test
 *   - Deprecated functionality
 * 
 * @description
 * [BRIEF DESCRIPTION OF WHAT THIS TEST IS CHECKING]
 * 
 * @functionality
 * [WHAT FEATURE/FUNCTIONALITY THIS TEST COVERS]
 * 
 * @implementation-requirements
 * - [REQUIREMENT 1]
 * - [REQUIREMENT 2]
 * - [REQUIREMENT N]
 * 
 * @related-issues
 * - [LINK TO RELATED ISSUE/TICKET]
 * 
 * @target-completion
 * [EXPECTED SPRINT/DATE WHEN THIS TEST SHOULD BE UNSKIPPED]
 */
it.skip('should [test description]', () => {
  // Test implementation
});
```

## Example Usage

### Achievement System Test Example

```javascript
/**
 * @skipped
 * @reason Feature not yet implemented
 * 
 * @description
 * Tests that a user receives the "First Meditation" achievement after completing
 * their first meditation session.
 * 
 * @functionality
 * Achievement System - First-time achievements
 * 
 * @implementation-requirements
 * - Achievement model must be implemented
 * - Achievement service must include tracking for first-time events
 * - Meditation session completion must trigger achievement check
 * 
 * @related-issues
 * - https://github.com/org/repo/issues/123
 * 
 * @target-completion
 * Sprint 3 (Q2 2023)
 */
it.skip('should award "First Meditation" achievement after completing first session', async () => {
  // Test implementation
});
```

### Meditation Session Test Example

```javascript
/**
 * @skipped
 * @reason Dependent feature in development
 * 
 * @description
 * Verifies that meditation sessions correctly calculate and store duration statistics.
 * 
 * @functionality
 * Meditation Session - Statistics tracking
 * 
 * @implementation-requirements
 * - MeditationSession model must include duration field
 * - Statistics service must be implemented
 * - Session completion must update user statistics
 * 
 * @related-issues
 * - https://github.com/org/repo/issues/456
 * 
 * @target-completion
 * Sprint 2 (Q1 2023)
 */
it.skip('should update user statistics after meditation session completion', async () => {
  // Test implementation
});
```

## Best Practices

1. **Be specific about the reason**: Clearly explain why the test is skipped
2. **Detail implementation requirements**: List all requirements needed before the test can be unskipped
3. **Link to related issues**: Always include references to relevant tickets/issues
4. **Set a target date**: Provide an estimated timeframe for when the test should be revisited
5. **Keep descriptions concise**: Focus on what's being tested, not how it's tested
6. **Update regularly**: Review skipped tests quarterly and update documentation as needed

## Review Process

Skipped tests should be reviewed during:
1. Sprint planning - to identify tests that can be unskipped in the upcoming sprint
2. Feature implementation - to ensure tests are unskipped when features are completed
3. Quarterly test reviews - as part of regular maintenance

---

*This template is part of our [Testing Standards](../testing-standards.md) documentation.* 