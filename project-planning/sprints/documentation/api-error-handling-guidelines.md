# API Error Handling Guidelines

## Overview

This document outlines the standardized approach to error handling in API endpoints for the MCP Mindfulness project. Consistent error handling is crucial for maintainable and testable APIs, and helps provide a better user experience.

## Purpose

The purpose of these guidelines is to:
- Ensure consistent error responses across all API endpoints
- Improve debugging and troubleshooting
- Enhance user experience with clear error messages
- Facilitate testing of error scenarios
- Maintain security by not exposing sensitive information

## Error Response Format

### Standard Format

All API error responses must follow this consistent format:

```json
{
  "error": "Descriptive error message"
}
```

### Examples

```typescript
// CORRECT: Consistent error response format
res.status(400).json({ error: 'Invalid input' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).json({ error: 'Internal server error' });

// INCORRECT: Inconsistent error formats
res.status(400).json({ message: 'Invalid input' });
res.status(404).json({ error: 'Resource not found' });
res.status(500).send('Server error');
```

## HTTP Status Codes

Use appropriate HTTP status codes for different error scenarios:

| Status Code | Description | Use Case |
|-------------|-------------|----------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Authentication errors (missing or invalid token) |
| 403 | Forbidden | Authorization errors (insufficient permissions) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate entry) |
| 422 | Unprocessable Entity | Validation passed but request cannot be processed |
| 500 | Internal Server Error | Server-side errors |

## Implementation Patterns

### Centralized Error Handling

Use a centralized error handling middleware for Express applications:

```typescript
// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error for internal tracking
  console.error(`Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// In your main app file
app.use(errorHandler);
```

### Custom Error Classes

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

### Async Error Handling

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

## Error Handling for Specific Scenarios

### Input Validation

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

### MongoDB ObjectId Validation

Always validate MongoDB ObjectIds before using them in queries:

```typescript
// Controller implementation with proper error response
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

### MongoDB Error Handling

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

### Authentication and Authorization Errors

Handle authentication and authorization errors consistently:

```typescript
// Authentication error
if (!token) {
  return res.status(401).json({ error: 'Authentication required' });
}

// Authorization error
if (resource.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: 'Not authorized to access this resource' });
}
```

## Error Logging

Implement proper error logging for all errors:

```typescript
try {
  // Operation that might fail
} catch (error) {
  // Log the error with context
  console.error('Failed to process request:', {
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    error: error.message,
    stack: error.stack
  });
  
  // Return appropriate response
  return res.status(500).json({ error: 'Internal server error' });
}
```

## Testing Error Handling

All error handling must be thoroughly tested:

```typescript
describe('Error handling', () => {
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/resources')
      .send({ /* invalid data */ })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  it('should return 404 for non-existent resource', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/resources/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
  
  it('should return 401 for missing authentication', async () => {
    const response = await request(app)
      .get('/api/resources');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
  
  it('should return 403 for unauthorized access', async () => {
    // Setup: Create resource owned by user1
    // Attempt: Access with user2's token
    
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });
});
```

## Best Practices

1. **Be specific with error messages**:
```typescript
// INCORRECT: Vague error message
throw new Error('Invalid input');

// CORRECT: Specific error message
throw new Error('Username must be between 3 and 20 characters');
```

2. **Don't expose sensitive information**:
```typescript
// INCORRECT: Exposing sensitive information
if (dbError) {
  return res.status(500).json({ error: `Database error: ${dbError.message}` });
}

// CORRECT: Safe error message
if (dbError) {
  console.error('Database error:', dbError);
  return res.status(500).json({ error: 'An error occurred while processing your request' });
}
```

3. **Use try/catch blocks for async operations**:
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

4. **Validate input data before processing**:
```typescript
// CORRECT: Validate input before processing
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  // Process valid input
});
```

## Related Documentation
- [Coding Standards](../../coding-standards.md)
- [Testing Standards](../../standards/testing-standards.md)
- [Sprint Four Plan](../sprint-four.md)

---

Last Updated: March 16, 2025 