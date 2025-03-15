# Backend Feature Review & Integration Plan

## Current Backend Features

### Authentication & User Management
- ✅ Basic auth system
- ✅ User profiles
- 🔄 Can be extended for:
  - Stress assessment preferences
  - Combined progress tracking
  - Wellness goals for both practices

#### Authentication Token Structure Requirements
- All authentication tokens must include:
  - `_id`: The user's MongoDB ObjectId
  - `username`: The user's username
- Tokens should have an appropriate expiration time (e.g., 1 hour)
- Example token payload:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "username": "user123",
  "iat": 1624276550,
  "exp": 1624280150
}
```

#### Authorization Requirements for Resource Access
- All endpoints that access user-specific resources must:
  - Verify the user is authenticated
  - Verify the user owns the requested resource
  - Return 403 Forbidden if the user attempts to access another user's resources
- Example authorization check:
```typescript
// In controller
if (session.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Session Management
- ✅ Meditation session tracking
- 🆕 Needed: Stress management session tracking
- 🔄 Unified session interface for:
  - Duration tracking
  - Progress metrics
  - User feedback
  - Effectiveness rating

### Analytics & Tracking
- ✅ Basic progress tracking
- 🆕 Needed: 
  - Stress level assessments
  - Trigger identification
  - Pattern recognition
  - Combined wellness metrics

### Data Models

#### Current Models
- Users
- Meditation Sessions
- Progress Tracking

#### Needed Models
1. Stress Assessment
```typescript
interface StressAssessment {
  userId: string;
  timestamp: Date;
  stressLevel: number; // 1-10
  triggers: string[];
  physicalSymptoms: string[];
  emotionalState: string[];
  notes: string;
}
```

2. Stress Management Session
```typescript
interface StressManagementSession {
  userId: string;
  timestamp: Date;
  technique: string;
  duration: number;
  effectivenessRating: number;
  preStressLevel: number;
  postStressLevel: number;
  notes: string;
}
```

3. Wellness Profile
```typescript
interface WellnessProfile {
  userId: string;
  stressBaseline: number;
  commonTriggers: string[];
  preferredTechniques: {
    meditation: string[];
    stressManagement: string[];
  };
  goals: {
    meditation: string[];
    stressManagement: string[];
  };
}
```

### API Endpoints

#### Existing Endpoints
- /api/auth/*
- /api/meditation/sessions
- /api/users/progress

#### Required Endpoints
1. Stress Assessment
- POST /api/stress/assessment
- GET /api/stress/assessment/history
- GET /api/stress/assessment/trends

2. Stress Management
- POST /api/stress/sessions
- GET /api/stress/sessions/history
- GET /api/stress/techniques
- GET /api/stress/recommendations

3. Combined Wellness
- GET /api/wellness/profile
- PUT /api/wellness/goals
- GET /api/wellness/progress
- GET /api/wellness/insights

## Integration Points

### Shared Infrastructure
1. Authentication & Authorization
   - Shared JWT authentication middleware
   - Consistent token structure
   - Resource ownership verification
2. Session tracking base classes
3. Analytics infrastructure
4. Notification system
5. Progress tracking utilities
6. Error handling middleware with consistent response format

### Separate Concerns
1. Specific technique implementations
2. Assessment algorithms
3. Recommendation engines
4. Progress metrics

### Reusable Components
1. Time tracking
2. Session management
3. Progress visualization
4. Goal tracking
5. Notification handling

## Next Steps

1. Immediate Tasks
   - Create stress assessment models
   - Implement basic stress tracking endpoints
   - Add stress management session handling

2. Integration Tasks
   - Unify progress tracking
   - Implement combined wellness profile
   - Create shared analytics pipeline

3. Enhancement Tasks
   - Add stress pattern recognition
   - Implement recommendation system
   - Create combined progress insights

## Questions to Consider

1. How do we balance user experience between both features?
2. Should stress and meditation sessions be tracked separately or unified?
3. How do we handle overlapping wellness goals?
4. What metrics best represent combined progress?

## API Standards

### Error Response Format
All API error responses must follow a consistent format:
- Use an `error` property for the error message
- Include appropriate HTTP status codes
- Example error response:
```json
{
  "error": "Resource not found"
}
```

### Common Error Status Codes
- 400: Bad Request (validation errors, malformed requests)
- 401: Unauthorized (authentication errors)
- 403: Forbidden (authorization errors)
- 404: Not Found (resource not found)
- 409: Conflict (resource already exists, state conflicts)
- 500: Internal Server Error (unexpected errors)

### Validation Requirements
- All user inputs must be validated
- MongoDB ObjectIds must be validated before use
- Validation errors should return 400 Bad Request with specific error messages

---

*This document will be updated as we implement and refine features.* 