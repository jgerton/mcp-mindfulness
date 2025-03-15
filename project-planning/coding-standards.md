# Coding Standards

[← Back to Main README](../README.md)

## What are Coding Standards?

Coding standards are a set of guidelines and best practices that ensure code consistency, readability, and maintainability across our project. They help us:
- Write clean, efficient code
- Maintain consistent style
- Prevent common errors
- Facilitate collaboration

This plan is crucial because it helps us:
- Reduce technical debt
- Improve code quality
- Speed up code reviews
- Onboard new developers efficiently

## Helpful Resources for New Team Members
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [ESLint Rules](https://eslint.org/docs/rules/)

## Related Documentation
- [Testing Standards](testing-standards.md) - Code testing requirements
- [Architecture Plan](architecture-plan.md) - Code organization
- [Work Flow](work-flow.md) - Development process
- [Frontend Interface](frontend-interface-plan.md) - UI implementation standards

## General Guidelines

- Write clean, readable, and maintainable code
- Follow DRY (Don't Repeat Yourself) principles
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## TypeScript

- Use strict type checking
- Define interfaces for data structures
- Avoid any type when possible
- Use enums for fixed values
- Leverage union types

## React Components

### Structure
```typescript
interface Props {
  // Props definition
}

export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### Best Practices
- Use functional components
- Implement proper error boundaries
- Memoize when necessary
- Keep components pure
- Use proper prop types

## Styling

### TailwindCSS
- Use utility classes
- Create components for repeated patterns
- Follow mobile-first approach
- Use CSS variables for theming

## Testing

### Unit Tests
- Test component rendering
- Test user interactions
- Test error states
- Mock external dependencies

### Integration Tests
- Test component integration
- Test API interactions
- Test routing

## Git Workflow

### Commits
- Use conventional commits
- Write meaningful commit messages
- Keep commits focused

### Branches
- main: production code
- develop: development code
- feature/*: new features
- bugfix/*: bug fixes

## Code Review

### Process
1. Create pull request
2. Add description
3. Request reviews
4. Address feedback
5. Merge when approved

### Checklist
- [ ] Code follows standards
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Builds successfully

## Additional Resources

### Internal References
- See [Document Grounding](document-grounding-plan.md) for content management standards
- Check [Learning Analytics](learning-analytics-plan.md) for data handling patterns
- Review [User Journey](user-journey-plan.md) for feature implementation guidelines

### External Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://reactjs.org/docs/hooks-rules.html)
- [TailwindCSS Guidelines](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## TypeScript Best Practices

### Type Safety

- Use strict type checking with `"strict": true` in tsconfig.json
- Avoid using `any` type whenever possible
- Use proper type guards for nullable values

```typescript
// INCORRECT: Unsafe property access
function processUser(user: any) {
  return user.name.toUpperCase(); // May crash if name is undefined
}

// CORRECT: Type-safe implementation
interface User {
  name?: string;
  id: string;
}

function processUser(user: User) {
  return user.name?.toUpperCase() || 'UNNAMED';
}
```

### Handling MongoDB ObjectId Types

```typescript
// INCORRECT: Inconsistent ID handling
function getUserById(id: string) {
  return User.findById(id);
}

// CORRECT: Consistent ID handling
function getUserById(id: string | mongoose.Types.ObjectId) {
  return User.findById(id);
}
```

### API Error Handling Standards

Consistent error handling is crucial for maintainable and testable APIs. Follow these standards for all API error responses:

#### Error Response Format

Always use a consistent error response format with an `error` property containing the error message:

```typescript
// INCORRECT: Inconsistent error response formats
res.status(400).json({ message: 'Invalid input' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).send('Server error');

// CORRECT: Consistent error response format
res.status(400).json({ error: 'Invalid input' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).json({ error: 'Internal server error' });
```

#### HTTP Status Codes

Use appropriate HTTP status codes for different error scenarios:

- `400 Bad Request`: Invalid input, validation errors
- `401 Unauthorized`: Authentication errors (missing or invalid token)
- `403 Forbidden`: Authorization errors (insufficient permissions)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate entry)
- `422 Unprocessable Entity`: Validation passed but request cannot be processed
- `500 Internal Server Error`: Server-side errors

#### Centralized Error Handling

Use a centralized error handling middleware for Express applications:

```typescript
// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// In your main app file
app.use(errorHandler);
```

#### Custom Error Classes

Create custom error classes for different types of errors:

```typescript
export class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in controllers
if (!resource) {
  throw new APIError('Resource not found', 404);
}
```

#### Async Error Handling

Use a wrapper function to handle async errors without try/catch blocks:

```typescript
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Usage in routes
router.get('/resource/:id', catchAsync(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    throw new APIError('Resource not found', 404);
  }
  res.json(resource);
}));
```

#### Validation Error Handling

Handle validation errors consistently:

```typescript
// Mongoose validation errors
if (error instanceof mongoose.Error.ValidationError) {
  const messages = Object.values(error.errors).map(err => err.message);
  return res.status(400).json({ error: messages.join(', ') });
}

// Joi/Yup validation
const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

#### MongoDB Error Handling

Handle MongoDB-specific errors:

```typescript
// Duplicate key error (code 11000)
if (error.code === 11000) {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  return res.status(409).json({ 
    error: `${field} '${value}' already exists` 
  });
}
```

### Authentication Token Structure

JWT tokens should include consistent properties to ensure proper authentication:

```typescript
// INCORRECT: Inconsistent token payload
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

// CORRECT: Consistent token payload with required fields
const token = jwt.sign(
  { 
    _id: user._id,
    username: user.username
  }, 
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Module Imports and Exports

- Use consistent import paths throughout the codebase
- Prefer named exports over default exports for better refactoring
- Organize imports by source (external, internal, relative)

```typescript
// INCORRECT: Mixed import styles
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import UserModel from './user.model';
import { validateEmail } from '../utils';

// CORRECT: Organized imports
// External dependencies
import mongoose, { Schema } from 'mongoose';

// Internal modules (using path aliases if configured)
import { validateEmail } from '@utils/validation';

// Relative imports
import { User } from './user.model';
```

### Preventing Circular Dependencies

Circular dependencies can cause module resolution issues and runtime errors:

```typescript
// INCORRECT: Circular dependency
// file1.ts
import { func2 } from './file2';
export function func1() {
  return func2();
}

// file2.ts
import { func1 } from './file1';
export function func2() {
  return func1();
}

// CORRECT: Break circular dependency with interfaces
// types.ts
export interface User {
  id: string;
  name: string;
}

// user.service.ts
import { User } from './types';
import { saveToDb } from './db.service';

export function processUser(user: User) {
  return saveToDb(user);
}

// db.service.ts
import { User } from './types';

export function saveToDb(data: User) {
  // Implementation
}
```

### Null Checking and Optional Chaining

```typescript
// INCORRECT: Unsafe property access
function getUsername(user) {
  return user.profile.username;
}

// CORRECT: Safe property access with optional chaining
function getUsername(user?: User) {
  return user?.profile?.username || 'Guest';
}
```

### Type Definitions for MongoDB Models

```typescript
// INCORRECT: Missing or incomplete type definitions
const userSchema = new Schema({
  name: String,
  email: String
});

// CORRECT: Complete type definitions
interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);
```

## Backend Standards

### API Error Handling Standards

All API error responses should follow a consistent format:

```typescript
// INCORRECT: Inconsistent error formats
app.get('/resource/:id', (req, res) => {
  if (!isValid(req.params.id)) {
    return res.status(400).send('Bad ID format');
  }
  
  if (resourceNotFound) {
    return res.status(404).json({ message: 'Not found' });
  }
  
  if (!isAuthorized) {
    return res.status(403).send({ error: 'Not authorized' });
  }
});

// CORRECT: Consistent error format
app.get('/resource/:id', (req, res) => {
  if (!isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (resourceNotFound) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Not authorized to access this resource' });
  }
});
```

Use appropriate HTTP status codes:
- 400: Bad Request (validation errors, malformed requests)
- 401: Unauthorized (authentication errors)
- 403: Forbidden (authorization errors)
- 404: Not Found (resource not found)
- 409: Conflict (resource already exists, state conflicts)
- 500: Internal Server Error (unexpected errors)

### Error Handling Best Practices

1. **Be specific with error messages**:
```typescript
// INCORRECT: Vague error message
throw new Error('Invalid input');

// CORRECT: Specific error message
throw new Error('Username must be between 3 and 20 characters');
```

2. **Use try/catch blocks for async operations**:
```typescript
// INCORRECT: No error handling
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// CORRECT: Proper error handling
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
```

3. **Create custom error classes for domain-specific errors**:
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Usage
if (!isValid) {
  throw new ValidationError('Invalid data format');
}
```

### ObjectId Validation

Always validate MongoDB ObjectIds before using them in queries to prevent errors:

```typescript
// INCORRECT: No validation before use
async function getResource(id: string) {
  return await Resource.findById(id);
}

// CORRECT: Validate ObjectId before use
import mongoose from 'mongoose';

async function getResource(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid resource ID format');
  }
  return await Resource.findById(id);
}

// CORRECT: Controller implementation with proper error response
async function getResourceController(req: Request, res: Response) {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid resource ID format' });
  }
  
  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    return res.json(resource);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
```

### Authentication Token Structure

JWT tokens should include consistent properties to ensure proper authentication:

```typescript
// INCORRECT: Inconsistent token payload
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

// CORRECT: Consistent token payload with required fields
const token = jwt.sign(
  { 
    _id: user._id,
    username: user.username
  }, 
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Module Imports and Exports

- Use consistent import paths throughout the codebase
- Prefer named exports over default exports for better refactoring
- Organize imports by source (external, internal, relative)

```typescript
// INCORRECT: Mixed import styles
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import UserModel from './user.model';
import { validateEmail } from '../utils';

// CORRECT: Organized imports
// External dependencies
import mongoose, { Schema } from 'mongoose';

// Internal modules (using path aliases if configured)
import { validateEmail } from '@utils/validation';

// Relative imports
import { User } from './user.model';
```

### Preventing Circular Dependencies

Circular dependencies can cause module resolution issues and runtime errors:

```typescript
// INCORRECT: Circular dependency
// file1.ts
import { func2 } from './file2';
export function func1() {
  return func2();
}

// file2.ts
import { func1 } from './file1';
export function func2() {
  return func1();
}

// CORRECT: Break circular dependency with interfaces
// types.ts
export interface User {
  id: string;
  name: string;
}

// user.service.ts
import { User } from './types';
import { saveToDb } from './db.service';

export function processUser(user: User) {
  return saveToDb(user);
}

// db.service.ts
import { User } from './types';

export function saveToDb(data: User) {
  // Implementation
}
```

### Null Checking and Optional Chaining

```typescript
// INCORRECT: Unsafe property access
function getUsername(user) {
  return user.profile.username;
}

// CORRECT: Safe property access with optional chaining
function getUsername(user?: User) {
  return user?.profile?.username || 'Guest';
}
```

### Type Definitions for MongoDB Models

```typescript
// INCORRECT: Missing or incomplete type definitions
const userSchema = new Schema({
  name: String,
  email: String
});

// CORRECT: Complete type definitions
interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);
```

---

*[← Back to Main README](../README.md)*