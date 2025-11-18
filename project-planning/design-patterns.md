# MCP Mindfulness Application Design Patterns

This document outlines the design patterns and architectural approaches used in the MCP Mindfulness application. It serves as a reference for maintaining consistency across the codebase and guiding future development.

## Table of Contents

1. [Controller-Service Architecture](#controller-service-architecture)
2. [API Route Design](#api-route-design)
3. [Error Handling](#error-handling)
4. [Authentication and Authorization](#authentication-and-authorization)
5. [Data Model Patterns](#data-model-patterns)
6. [Testing Approach](#testing-approach)

## Controller-Service Architecture

The application follows a layered architecture with clear separation of concerns:

### Controllers

Controllers are responsible for:
- Handling HTTP requests and responses
- Parameter validation and sanitization
- Authentication and authorization checks
- Delegating business logic to services
- Formatting responses
- Error handling and status codes

**Controller Naming Convention**: 
- FeatureController (e.g., `MeditationController`, `UserController`)

**Controller Method Naming Convention**:
- `create<Entity>`: Creates a new resource
- `get<Entity>`: Retrieves a specific resource
- `getAll<Entities>`: Retrieves multiple resources
- `update<Entity>`: Updates an existing resource
- `delete<Entity>`: Deletes a resource
- `export<Entities>`: Exports resource data in various formats

**Example Controller Structure**:

```typescript
export class ExportController {
  // GET /api/export/achievements
  static async exportAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Authentication check
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // 2. Parameter validation
      const { format, startDate, endDate } = validateExportParams(req.query);
      
      // 3. Service call
      const achievements = await AchievementService.getUserAchievements(userId, startDate, endDate);
      
      // 4. Response formatting
      if (format === 'csv') {
        return sendCsvResponse(res, achievements, 'achievements', userId);
      } else {
        res.status(200).json({ data: achievements });
      }
    } catch (error) {
      // 5. Error handling
      handleControllerError(error, res, 'Failed to export achievements');
    }
  }
}
```

### Services

Services are responsible for:
- Implementing business logic
- Data access through models
- Data transformation and processing
- Cross-cutting concerns (logging, caching, etc.)
- Domain-specific validation

**Service Naming Convention**:
- FeatureService (e.g., `MeditationService`, `UserService`)

**Service Method Naming Convention**:
- `create<Entity>`: Creates a new entity
- `get<Entity>ById`: Retrieves an entity by ID
- `getUser<Entities>`: Retrieves user-specific entities
- `update<Entity>`: Updates an entity
- `delete<Entity>`: Deletes an entity
- `calculate<Metric>`: Computes derived data

**Example Service Structure**:

```typescript
export class AchievementService {
  static async getUserAchievements(
    userId: string | mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<IAchievement[]> {
    try {
      // 1. Parameter validation/conversion
      const userObjId = convertToObjectId(userId);
      
      // 2. Build query
      const query: any = { userId: userObjId };
      if (startDate || endDate) {
        query.dateEarned = {};
        if (startDate) query.dateEarned.$gte = startDate;
        if (endDate) query.dateEarned.$lte = endDate;
      }
      
      // 3. Execute query with proper error handling
      const achievements = await Achievement.find(query)
        .sort({ dateEarned: -1 })
        .lean();
        
      // 4. Transform data if needed
      return achievements.map(formatAchievement);
    } catch (error) {
      // 5. Error handling with context
      throw new ServiceError('Failed to retrieve user achievements', error);
    }
  }
}
```

## API Route Design

API routes follow RESTful principles with a consistent URL structure:

### Route URL Structure

- `/api/<resource>` - Collection routes (GET, POST)
- `/api/<resource>/:id` - Instance routes (GET, PUT, DELETE)
- `/api/<resource>/:id/<subresource>` - Related resources

### HTTP Methods

- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update resources (full replacement)
- `PATCH`: Partial updates
- `DELETE`: Remove resources

### Route Registration

Routes are defined in dedicated route files and registered in `app.ts`:

```typescript
// src/routes/export.routes.ts
import express from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Define routes with authentication middleware
router.get('/achievements', authenticate, ExportController.exportAchievements);
router.get('/meditations', authenticate, ExportController.exportMeditations);

export default router;

// src/app.ts
import exportRoutes from './routes/export.routes';
// ...
app.use('/api/export', exportRoutes);
```

### Swagger Documentation

Routes should include Swagger documentation for API discoverability:

```typescript
/**
 * @swagger
 * /api/export/achievements:
 *   get:
 *     summary: Export user achievements
 *     tags: [Data Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         required: true
 *         description: Export format
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
router.get('/achievements', authenticate, ExportController.exportAchievements);
```

## Error Handling

The application uses a consistent error handling approach:

### Error Types

- `ValidationError`: For request validation issues
- `AuthenticationError`: For authentication failures
- `AuthorizationError`: For permission issues
- `NotFoundError`: For resource not found
- `ServiceError`: For business logic or data access issues
- `APIError`: Base class for API-related errors

### Controller Error Handling

Controllers should use try-catch blocks and format errors consistently:

```typescript
try {
  // Controller logic
} catch (error) {
  console.error(`Error in ${methodName}:`, error);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details
    });
  }
  
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Resource not found',
      details: error.message
    });
  }
  
  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
}
```

### Service Error Handling

Services should use typed errors and provide context:

```typescript
try {
  // Service logic
} catch (error) {
  throw new ServiceError(
    'Failed to retrieve user achievements',
    error,
    { userId, startDate, endDate }
  );
}
```

## Authentication and Authorization

### Authentication

- Uses JWT tokens for stateless authentication
- Tokens include user ID and roles
- Authentication middleware validates tokens before route handlers

```typescript
// src/middleware/auth.middleware.ts
export const authenticate = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};
```

### Authorization

- Role-based access control for restricted operations
- Resource ownership verification for user-specific data
- Permission middleware for granular control

```typescript
export const requireAdmin = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user?.roles?.includes('admin')) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }
  next();
};
```

## Data Model Patterns

### Model Structure

- Mongoose schemas for data validation
- TypeScript interfaces for type safety
- Index definitions for query optimization
- Virtuals for computed properties
- Pre/post hooks for validation and transforms

```typescript
// Interface for type safety
export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  dateEarned: Date;
  points: number;
}

// Schema for validation and MongoDB structure
const AchievementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Additional fields...
}, { timestamps: true });

// Indexes for query optimization
AchievementSchema.index({ userId: 1, dateEarned: -1 });

// Export the model
export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
```

## Testing Approach

### Test Types

- Unit tests for services and utilities
- Integration tests for controllers
- API tests for routes
- MongoDB tests with proper connection management

### Testing Best Practices

- Mock external dependencies
- Use test database for integration tests
- Clean up after tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('ExportController', () => {
  describe('exportAchievements', () => {
    // Setup/teardown
    beforeAll(async () => {
      await connectToTestDB();
    });
    
    afterAll(async () => {
      await disconnectFromTestDB();
    });
    
    afterEach(() => {
      jest.clearAllMocks();
    });
    
    // Test cases
    it('should return user achievements in JSON format', async () => {
      // Arrange
      const mockUser = { _id: new mongoose.Types.ObjectId() };
      const mockReq = mockRequest({ user: mockUser, query: { format: 'json' } });
      const mockRes = mockResponse();
      const serviceGetSpy = jest.spyOn(AchievementService, 'getUserAchievements')
        .mockResolvedValue([{ name: 'Test Achievement' }]);
      
      // Act
      await ExportController.exportAchievements(mockReq, mockRes);
      
      // Assert
      expect(serviceGetSpy).toHaveBeenCalledWith(mockUser._id, undefined, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [{ name: 'Test Achievement' }] });
    });
    
    // More test cases...
  });
});
```

This document will be continuously updated as design patterns evolve and new patterns are established. 