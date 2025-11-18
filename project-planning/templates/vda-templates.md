# VDA Templates

This document provides templates for implementing the Vertical Dependency Analysis framework at different documentation levels within the project.

## Milestone Document Template

```markdown
# Milestone: [Milestone Name]

## Overview
[Brief description of this milestone and its importance]

## Timeline
- Start Date: [Date]
- Target Completion: [Date]
- Duration: [Weeks]

## Business Value
[Clear statements of business value delivered by this milestone]

## Success Criteria
[Measurable criteria that define milestone completion]

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Path to this milestone]

### Upward Dependencies
- [Link to project goals/initiatives this milestone supports]
- Value alignment: [How this milestone aligns with business goals]
- Strategic importance: [Priority ranking and justification]

### Lateral Dependencies
- [Links to parallel milestones this interacts with]
- Shared resources: [Teams, infrastructure, or other resources shared]
- Coordination requirements: [Cross-milestone coordination needs]

### Downward Dependencies
- [Links to features/epics required for this milestone]
- Critical path items: [Items that define the critical path]
- Key deliverables: [Major components that must be delivered]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### Validation Strategy
- Pre-milestone validation gates: [List of validation points]
- Feature-level verification requirements: [What must be verified]
- Integration verification: [How cross-component integration will be verified]
- Business acceptance criteria: [Criteria for business acceptance]

## Milestone Dashboard

| Aspect | Status | Completion | Risk Level |
|--------|--------|------------|------------|
| Feature Dependencies Satisfied | [x/total] | [%] | [Risk] |
| Gap Resolution Progress | [x/total] | [%] | [Risk] |
| Integration Points Verified | [x/total] | [%] | [Risk] |
| Test Coverage | [%] | - | [Risk] |
| Documentation Complete | [%] | - | [Risk] |

## Key Deliverables
[List of major deliverables included in this milestone]

## Teams and Resources
[Teams involved and resource allocation]

## Dependencies on External Teams/Systems
[External dependencies that may impact timeline]

## Risk Analysis and Mitigation
[Key risks and mitigation strategies]

## Release Plan
[How the milestone will be released/deployed]
```

## Feature Document Template

```markdown
# Feature: [Feature Name]

## Overview
[Brief description of this feature and its purpose]

## Business Requirements
[Specific business requirements this feature addresses]

## Technical Approach
[High-level technical approach]

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Milestone] → [Epic] → [Feature]

### Milestone Alignment
- Primary Milestone: [Milestone this primarily contributes to]
- Milestone Contribution: [How this feature contributes to milestone]
- Milestone Dependencies: [What must be completed for this to meet milestone]
- Milestone Acceptance Criteria: [Validation requirements for milestone]

### Upward Dependencies
- [Link to parent epic/initiative]
- Requirements this fulfills: [Requirements from parent this satisfies]
- Success metrics inherited: [Metrics for validation]

### Lateral Dependencies
- [Links to other features this interacts with]
- Interaction points: [Specific interfaces or dependencies]
- Shared resources: [Resources this feature shares with others]

### Downward Dependencies
- [Links to tasks/components this requires]
- Requirements passed down: [Requirements tasks must satisfy]
- Key constraints: [Limitations or requirements tasks must adhere to]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### Validation Strategy
- Feature-level acceptance criteria: [Specific criteria]
- Test requirements: [Testing approach and requirements]
- Integration verification: [How integration will be verified]
- Performance requirements: [Performance expectations]

## Feature Progress

| Aspect | Status | Completion | Risk Level |
|--------|--------|------------|------------|
| Task Dependencies Satisfied | [x/total] | [%] | [Risk] |
| Gap Resolution Progress | [x/total] | [%] | [Risk] |
| Integration Points Verified | [x/total] | [%] | [Risk] |
| Test Coverage | [%] | - | [Risk] |
| Documentation Complete | [%] | - | [Risk] |

## User Stories
[User stories associated with this feature]

## Technical Components
[Technical components that will be created/modified]

## Testing Strategy
[How this feature will be tested]

## Definition of Done
[Specific criteria that define when this feature is complete]
```

## Task Document Template

```markdown
# Task: [Task Name]

## Overview
[Brief description of this task]

## Document State
- [ ] Pre-Implementation (Placeholder)
- [ ] In Research/Planning
- [ ] Test Plan Ready
- [ ] Tests Implemented
- [ ] Test Implementation Verified
- [ ] Implementation Ready
- [ ] In Progress
- [ ] Implementation Verified
- [ ] Completed
- [ ] Archived

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Milestone] → [Epic] → [Feature] → [Task]

### Milestone Alignment
- Primary Milestone: [Milestone this contributes to]
- Milestone Contribution: [How this task contributes to milestone]
- Task Deadline to Meet Milestone: [Deadline needed to support milestone]

### Upward Dependencies
- [Link to parent feature]
- Requirements this fulfills: [Requirements from feature this satisfies]
- Success metrics inherited: [Metrics for validation]

### Lateral Dependencies
- [Links to other tasks this interacts with]
- Interaction points: [Specific interfaces or dependencies]
- Shared resources: [Resources this task shares with others]

### Downward Dependencies
- [Links to code components this affects]
- Requirements passed down: [Requirements components must satisfy]
- Key constraints: [Limitations or requirements components must adhere to]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### Validation Strategy
- Task completion criteria: [Specific criteria]
- Test requirements: [Testing approach and requirements]
- Code review requirements: [Specific review criteria]
- Performance requirements: [Performance expectations]

## Schema Dependency Map
[Diagram or table showing schema dependencies for this task]

## Technical Implementation Details
[Technical approach for implementing this task]

## Test Plan
[Test plan for this task]

## Definition of Done
[Specific criteria that define when this task is complete]
```

## Model Dependency Template

```markdown
# Model: [Model Name]

## Overview
[Brief description of this model and its purpose]

## Schema Definition
[Schema definition or reference to code file]

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Milestone] → [Epic] → [Feature] → [Model]

### Milestone Alignment
- Primary Milestone: [Milestone this contributes to]
- Database Migration Deadline: [When schema changes must be complete]
- Downstream Dependency Lead Time: [How much notice dependent components need]

### Upward Dependencies
- [Link to parent feature]
- Requirements this fulfills: [Requirements from feature this satisfies]
- Schema constraints inherited: [Schema constraints from parent]

### Lateral Dependencies
- [Links to other models this interacts with]
- Foreign key relationships: [Specific FK relationships]
- Shared validators or middleware: [Shared code components]

### Downward Dependencies
- [Links to components that depend on this model]
- Schema contract: [The contract this model provides to dependents]
- Validation rules: [Validation rules dependents must follow]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### Schema Evolution Strategy
- Backward compatibility plan: [How changes will maintain compatibility]
- Migration strategy: [How data will be migrated during changes]
- Versioning approach: [How schema versions will be managed]

## Field Definitions

| Field | Type | Required | Default | Description | Validations | Dependencies |
|-------|------|----------|---------|-------------|-------------|--------------|
| [Field] | [Type] | [Y/N] | [Default] | [Description] | [Validations] | [Dependencies] |

## Indexing Strategy
[Indexes and their purpose]

## Query Patterns
[Common query patterns for this model]

## Testing Strategy
[How this model will be tested]
```

## Service Dependency Template

```markdown
# Service: [Service Name]

## Overview
[Brief description of this service and its purpose]

## Responsibilities
[Key responsibilities of this service]

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Milestone] → [Epic] → [Feature] → [Service]

### Milestone Alignment
- Primary Milestone: [Milestone this contributes to]
- Milestone Contribution: [How this service contributes to milestone]
- Service Availability Deadline: [When service must be available]

### Upward Dependencies
- [Link to parent feature]
- Requirements this fulfills: [Requirements from feature this satisfies]
- Service contract inherited: [Service contract from parent]

### Lateral Dependencies
- [Links to other services this interacts with]
- Service calls: [Specific service calls]
- Shared resources: [Resources this service shares with others]

### Downward Dependencies
- [Links to models/utilities this service uses]
- Model requirements: [What models must provide]
- Utility requirements: [What utilities must provide]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### API Contract
- Endpoints: [Endpoints provided]
- Input validation: [Validation requirements]
- Response format: [Expected response format]
- Error handling: [Error handling approach]

## Method Definitions

| Method | Purpose | Parameters | Return | Exceptions | Dependencies |
|--------|---------|------------|--------|------------|--------------|
| [Method] | [Purpose] | [Params] | [Return] | [Exceptions] | [Dependencies] |

## Performance Requirements
[Performance expectations for this service]

## Error Handling
[Error handling approach]

## Testing Strategy
[How this service will be tested]
```

## Controller Dependency Template

```markdown
# Controller: [Controller Name]

## Overview
[Brief description of this controller and its purpose]

## Responsibilities
[Key responsibilities of this controller]

## Vertical Dependency Analysis

### Position in Project Hierarchy
Project Goal → [Milestone] → [Epic] → [Feature] → [Controller]

### Milestone Alignment
- Primary Milestone: [Milestone this contributes to]
- API Availability Deadline: [When API must be available]
- Documentation Requirements: [Documentation needed for milestone]

### Upward Dependencies
- [Link to parent feature]
- Requirements this fulfills: [Requirements from feature this satisfies]
- API contract inherited: [API contract from parent]

### Lateral Dependencies
- [Links to other controllers this interacts with]
- Shared middleware: [Middleware shared with other controllers]
- Common response patterns: [Shared response patterns]

### Downward Dependencies
- [Links to services this controller uses]
- Service requirements: [What services must provide]
- Error handling requirements: [How services should report errors]

### Gap Analysis
| Level | Gap Type | Description | Impact | Resolution Path | Status |
|-------|----------|------------|---------|----------------|--------|
| [Level] | [Type] | [Description] | [Impact] | [Resolution] | [Status] |

### API Documentation
- Routes: [Routes provided]
- Authentication requirements: [Auth requirements]
- Request validation: [Validation approach]
- Response format: [Expected response format]
- Error responses: [Error response format]

## Route Definitions

| Route | Method | Purpose | Request Body | Response | Status Codes | Dependencies |
|-------|--------|---------|--------------|----------|--------------|--------------|
| [Route] | [Method] | [Purpose] | [Body] | [Response] | [Status Codes] | [Dependencies] |

## Middleware Chain
[Middleware used by this controller]

## Error Handling
[Error handling approach]

## Testing Strategy
[How this controller will be tested]
```

## How to Apply These Templates

1. **Choose the appropriate template** based on the documentation level
2. **Copy the template** into your document
3. **Complete all sections** with relevant information
4. **Update the Gap Analysis** section with any identified gaps
5. **Link to dependent documents** in the appropriate sections
6. **Update regularly** as the project evolves

## Tips for Effective VDA Implementation

1. **Be specific about dependencies** - Vague dependencies are difficult to validate
2. **Include verification criteria** - Every dependency should have clear verification criteria
3. **Maintain bidirectional links** - Ensure parent and child documents link to each other
4. **Update Gap Analysis regularly** - The Gap Analysis section should be a living document
5. **Validate milestone alignment** - Regularly check that components align with milestone goals
6. **Use automation where possible** - Tools can help validate cross-document references
7. **Include VDA in reviews** - Make VDA part of document review processes

## Related Documentation

- [Vertical Dependency Analysis Framework](../guides/vertical-dependency-analysis-framework.md)
- [Model Dependency Guide](../guides/model-dependency-guide.md)
- [Architectural Dependency Guide](../guides/architectural-dependency-guide.md)
- [Milestone Planning Guide](../guides/milestone-planning-guide.md)
- [Gap Registry](../tracking/gap-registry.md) 