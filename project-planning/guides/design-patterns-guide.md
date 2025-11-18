# Design Patterns Guide

## Overview

This guide documents the core design patterns used in the MCP Mindfulness project. These patterns are chosen to promote code reusability, maintainability, and testability while reducing duplication across the codebase.

## Core Design Patterns

### 1. Base Controller Pattern

The `BaseController` provides standardized CRUD operations and error handling for all controllers.

```typescript
abstract class BaseController<T extends Document> {
  protected model: Model<T>;
  
  constructor(model: Model<T>) {
    this.model = model;
  }
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.model.find();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve items' });
    }
  }
  
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve item' });
    }
  }
  
  // Additional CRUD methods...
}
```

#### Usage Example:

```typescript
class AchievementController extends BaseController<IAchievement> {
  constructor() {
    super(Achievement);
  }
  
  // Add achievement-specific methods here
}
```

### 2. Service Layer Pattern

The `BaseService` abstracts database operations and business logic.

```typescript
abstract class BaseService<T extends Document> {
  protected model: Model<T>;
  
  constructor(model: Model<T>) {
    this.model = model;
  }
  
  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter);
  }
  
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }
  
  // Additional data access methods...
}
```

#### Usage Example:

```typescript
class AchievementService extends BaseService<IAchievement> {
  constructor() {
    super(Achievement);
  }
  
  // Add achievement-specific business logic here
}
```

### 3. Route Registration Factory

Standardizes route configuration and middleware application.

```typescript
interface ControllerRouteMap {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: (req: Request, res: Response) => Promise<void>;
  middleware?: RequestHandler[];
}

function registerRoutes(router: Router, controller: any, routes: ControllerRouteMap[]): void {
  routes.forEach(route => {
    const { path, method, handler, middleware = [] } = route;
    router[method](path, ...middleware, handler.bind(controller));
  });
}
```

#### Usage Example:

```typescript
const achievementRoutes: ControllerRouteMap[] = [
  {
    path: '/',
    method: 'get',
    handler: achievementController.getAll,
    middleware: [authenticateUser]
  },
  // Additional routes...
];

registerRoutes(router, achievementController, achievementRoutes);
```

### 4. Test Utility Composition

Modular test utilities through composition.

```typescript
// Database utilities
const dbTestUtils = {
  connect: async () => { /* ... */ },
  disconnect: async () => { /* ... */ },
  clearDatabase: async () => { /* ... */ }
};

// Request utilities
const requestTestUtils = {
  createAuthenticatedRequest: (app: Express, user: IUser) => { /* ... */ },
  createAuthToken: (user: IUser) => { /* ... */ }
};

// Combined utilities
const testUtils = {
  db: dbTestUtils,
  request: requestTestUtils
};
```

#### Usage Example:

```typescript
describe('Achievement API', () => {
  const { db, request } = testUtils;
  
  beforeAll(async () => {
    await db.connect();
    app = await request.createTestApp();
  });
  
  afterAll(async () => {
    await db.disconnect();
  });
  
  // Test cases...
});
```

## Implementation Guidelines

### 1. Base Class Usage

- Always extend base classes for new controllers and services
- Override base methods only when necessary
- Document any deviations from base patterns
- Keep base classes focused and cohesive

### 2. Error Handling

- Use centralized error handling through base classes
- Maintain consistent error response format
- Implement proper error propagation
- Add appropriate logging

### 3. Type Safety

- Use TypeScript generics with base classes
- Define clear interfaces for models
- Implement proper type guards
- Maintain strict type checking

### 4. Testing Considerations

- Create tests for base classes first
- Test overridden methods thoroughly
- Use test utility composition
- Maintain test isolation

## Migration Strategy

When migrating existing code to use these patterns:

1. Start with a single component as proof of concept
2. Verify all tests pass after migration
3. Document any issues or lessons learned
4. Gradually migrate related components
5. Update documentation with examples

## Best Practices

1. **Inheritance**
   - Keep inheritance chains shallow
   - Use composition over inheritance when possible
   - Document inheritance relationships
   - Maintain LSP (Liskov Substitution Principle)

2. **Composition**
   - Create small, focused components
   - Use dependency injection
   - Maintain loose coupling
   - Document component relationships

3. **Testing**
   - Test base classes thoroughly
   - Verify inherited behavior
   - Use test utility composition
   - Maintain test isolation

## Related Documentation

- [Architectural Dependency Guide](./architectural-dependency-guide.md)
- [Test Composition Pattern Guide](./test-composition-pattern-guide.md)
- [Model Dependency Guide](./model-dependency-guide.md) 