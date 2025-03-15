# Documentation Standards

## Purpose

This document defines the standards for creating and maintaining documentation in the MCP Mindfulness project. Following these standards ensures consistency, clarity, and usefulness of all project documentation.

## Scope

These standards apply to all documentation in the project, including:
- Planning documents
- Standards documents
- Implementation documents
- Testing documents
- Sprint documents
- Code comments
- API documentation

## General Standards

### File Format and Location

1. **File Format**: All documentation should be written in Markdown (.md) format.
2. **File Location**: Documentation should be stored in the appropriate directory based on its category:
   - Architecture documentation: `project-planning/architecture/`
   - Feature documentation: `project-planning/features/`
   - Standards documentation: `project-planning/standards/`
   - Testing documentation: `project-planning/testing/`
   - Workflow documentation: `project-planning/workflows/`
   - Sprint documentation: `project-planning/sprints/`

### Document Structure

1. **Title**: Each document should begin with a level-1 heading (`#`) that clearly states the document's purpose.
2. **Table of Contents**: Documents longer than 3 sections should include a table of contents.
3. **Sections**: Use heading levels 2-4 (`##`, `###`, `####`) to organize content hierarchically.
4. **Section IDs**: Add section IDs using `<a id="section-id"></a>` for easy linking within and between documents.

### Writing Style

1. **Clarity**: Write in clear, concise language. Avoid jargon unless necessary.
2. **Consistency**: Use consistent terminology throughout all documentation.
3. **Active Voice**: Prefer active voice over passive voice.
4. **Lists**: Use bulleted lists for unordered items and numbered lists for sequential steps.
5. **Code Examples**: Format code examples using Markdown code blocks with language specification.

## Document Types and Templates

### Planning Documents

**Purpose**: High-level planning for features, architecture, etc.

**Template**:
```markdown
# [Feature/Component] Plan

## Overview
Brief description of the feature or component.

## Goals
- Goal 1
- Goal 2

## Requirements
- Requirement 1
- Requirement 2

## Implementation Plan
1. Step 1
2. Step 2

## Timeline
- Milestone 1: [Date]
- Milestone 2: [Date]
```

### Standards Documents

**Purpose**: Define coding, testing, and documentation standards.

**Template**:
```markdown
# [Area] Standards

## Purpose
Why these standards exist.

## Scope
What these standards apply to.

## Standards
### Category 1
1. Standard 1
2. Standard 2

### Category 2
1. Standard 1
2. Standard 2

## Examples
Example implementation of standards.

## Enforcement
How these standards will be enforced.
```

### Implementation Documents

**Purpose**: Track implementation status and details.

**Template**:
```markdown
# [Feature/Component] Implementation Status

## Feature Overview
Brief description of the feature.

## Status
- [x] Component 1
- [ ] Component 2

## Dependencies
- Dependency 1
- Dependency 2

## Next Steps
1. Step 1
2. Step 2
```

### Testing Documents

**Purpose**: Document test plans, skipped tests, and test coverage.

**Template**:
```markdown
# [Feature/Component] Tests

## Test Scope
What these tests cover.

## Test Cases
### Test Category 1
- Test case 1
- Test case 2

### Test Category 2
- Test case 1
- Test case 2

## Skipped Tests
- Skipped test 1: Reason for skipping
- Skipped test 2: Reason for skipping

## Coverage Goals
- Goal 1
- Goal 2
```

### Sprint Documents

**Purpose**: Plan and review sprint activities.

**Template**:
```markdown
# Sprint [Number]

## Sprint Goals
- Goal 1
- Goal 2

## Sprint Backlog
- [ ] Task 1
- [ ] Task 2

## Sprint Planning
Details of sprint planning.

## Task Assignments
- Person 1: Task 1, Task 2
- Person 2: Task 3, Task 4

## Sprint Review Criteria
Criteria for successful sprint completion.
```

## Linking and References

1. **Internal Links**: Use relative paths for links to other documents in the repository.
2. **External Links**: Provide full URLs for external references.
3. **Code References**: When referencing code, include the file path and line numbers if applicable.
4. **Issue References**: Link to relevant issues or pull requests using their full URLs or issue numbers.

## Maintenance

1. **Regular Review**: All documentation should be reviewed at least once per quarter.
2. **Update Responsibility**: The person making significant changes to a feature is responsible for updating its documentation.
3. **Versioning**: Include a "Last Updated" date at the bottom of each document.
4. **Archiving**: Obsolete documentation should be moved to an `archive` directory rather than deleted.

## Examples

### Good Documentation Example

```markdown
# User Authentication

## Overview
This document describes the authentication system used in the MCP Mindfulness application.

## Authentication Flow
1. User submits credentials
2. System validates credentials
3. System generates JWT token
4. Token is returned to client

## Token Structure
```json
{
  "_id": "user-id",
  "username": "user-name",
  "exp": 1234567890
}
```

## Implementation Details
See `src/services/auth.service.ts` for implementation.
```

### Poor Documentation Example (What to Avoid)

```markdown
# Auth

This is about auth stuff.

The system checks if user is valid and gives token.

Token has some fields.

See code for details.
```

---

Last Updated: [DATE] 