# Swagger API Documentation Guide

## Overview

This guide documents the Swagger API documentation implemented during Sprint Four. It provides information about how the documentation is set up, how to access it, and how to maintain it when adding new API endpoints.

## What is Swagger?

Swagger (OpenAPI) is a specification for documenting RESTful APIs. It provides a standardized format for describing API endpoints, request/response schemas, authentication methods, and other API details. Our implementation uses:

- **swagger-jsdoc**: For generating Swagger specifications from JSDoc comments
- **swagger-ui-express**: For serving the interactive Swagger UI

## Accessing the API Documentation

The Swagger API documentation is available at:

```
/api-docs
```

This endpoint serves an interactive UI that allows you to:
- Browse all available API endpoints
- See detailed information about request/response formats
- Test endpoints directly from the UI
- View model schemas and data types

## Documentation Structure

The Swagger documentation is organized into the following sections:

1. **Authentication**: Endpoints for user authentication and authorization
2. **Users**: User management endpoints
3. **Meditation**: Meditation session management endpoints
4. **Stress Management**: Stress tracking and management endpoints
5. **Stress Techniques**: Stress management technique endpoints
6. **Achievements**: User achievement endpoints
7. **Data Export**: Data export and download endpoints

## Implementation Details

The Swagger documentation is implemented using:

1. **Configuration**: `src/config/swagger.ts` - Central Swagger configuration
2. **Route Annotations**: JSDoc comments in route files
3. **Schema Definitions**: Reusable component schemas

### Core Configuration

The main Swagger configuration in `src/config/swagger.ts` includes:

- API information (title, version, description)
- Server configuration
- Authentication definitions
- Global tags
- Common response schemas

### Annotating Routes

Routes are documented using JSDoc comments, for example:

```typescript
/**
 * @swagger
 * /api/stress-techniques:
 *   get:
 *     summary: Get all stress management techniques
 *     tags: [Stress Management Techniques]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of stress management techniques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StressTechnique'
 */
router.get('/', stressTechniqueController.getAllTechniques);
```

## Schema Components

Reusable schema components are defined in `src/config/swagger.ts` and can be referenced in route annotations:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     StressTechnique:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         // ... other properties
 */
```

## Authentication Documentation

The API uses JWT authentication, which is documented in Swagger:

```typescript
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
```

Endpoints requiring authentication specify this in their annotations:

```typescript
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     // ... rest of the documentation
 */
```

## Mobile Considerations

The Swagger documentation includes mobile-specific information:

- Response size estimates
- Performance characteristics
- Mobile-specific parameters (e.g., field selection)
- Battery impact considerations

## Maintenance Guidelines

### Adding New Endpoints

When adding a new API endpoint:

1. Add JSDoc comments above the route definition
2. Include a summary and description
3. Assign appropriate tags for categorization
4. Document all parameters (path, query, body)
5. Document all possible response codes and formats
6. Reference schema components where applicable
7. Specify authentication requirements

### Updating Existing Documentation

When modifying an existing endpoint:

1. Update the JSDoc comments to reflect changes
2. Ensure parameter documentation is accurate
3. Update response schemas if they've changed
4. Verify the updated documentation in the Swagger UI

### Adding New Schemas

When adding a new data model:

1. Define the schema component in `src/config/swagger.ts`
2. Include all properties with types and descriptions
3. Document required properties
4. Add example values where helpful
5. Reference the schema in relevant endpoint documentation

## Testing Swagger Documentation

The Swagger documentation has test coverage to ensure accuracy:

- `src/__tests__/config/swagger.test.ts`: Tests for Swagger configuration
- Integration tests verify documentation matches implementation

## Best Practices

1. **Keep Documentation Updated**: Always update Swagger comments when changing endpoints
2. **Use Schema References**: Use `$ref` to reference reusable schemas
3. **Include Examples**: Add example values to help API consumers
4. **Document Errors**: Include all possible error responses
5. **Group Related Endpoints**: Use consistent tags to group related functionality
6. **Test Documentation**: Verify documentation is accurate and helpful

## Related Documentation

- [Mobile Integration Guide](./mobile-integration-guide.md)
- [Data Export API Guide](./data-export-guide.md)
- [Stress Technique Guide](./stress-technique-guide.md)
- [Sprint Four Implementation](../sprints/sprint-four-tasks/implement-remaining-features.md) 