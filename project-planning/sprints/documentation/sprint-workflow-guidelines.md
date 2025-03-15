# Sprint Workflow Guidelines

## Overview
This document outlines the recommended workflow for managing tasks during sprints. Following these guidelines will help maintain consistency, improve tracking, and ensure all team members are aligned on progress and next steps.

## Sprint Task Workflow

### 1. Task Selection Process
1. **Review Current Sprint Document**: Begin by reviewing the current sprint document to understand priorities and dependencies.
2. **Select Next Task**: Choose the next task based on:
   - Priority level (High → Medium → Low)
   - Dependencies (tasks that block other tasks should be completed first)
   - Task assignments (if specified)
   - Team member expertise and availability

### 2. Task Implementation Process
1. **Implement the Task**: Complete the necessary code, documentation, or other deliverables.
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
3. Implement the task
4. Commit code changes
5. Update sprint-three.md to mark task as completed
6. Commit sprint document update
7. Push changes
8. Review sprint-three.md again to select next task
9. Repeat
```

By following these guidelines, we can maintain a consistent workflow, improve visibility into sprint progress, and ensure that all team members are aligned on priorities and next steps. 