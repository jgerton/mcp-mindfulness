import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration options
 */
export const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MCP Mindfulness API',
      version: '1.0.0',
      description: 'MCP Mindfulness API documentation',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error type or code'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              description: 'Email address'
            }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Achievement ID'
            },
            name: {
              type: 'string',
              description: 'Achievement name'
            },
            description: {
              type: 'string',
              description: 'Achievement description'
            },
            category: {
              type: 'string',
              enum: ['time', 'duration', 'streak', 'milestone', 'special'],
              description: 'Achievement category'
            }
          }
        },
        StressTracking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Tracking ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            level: {
              type: 'integer',
              description: 'Stress level (1-10)'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Recording date and time'
            }
          }
        }
      },
      parameters: {
        pageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1
          },
          description: 'Page number for pagination'
        },
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: 'Number of items per page'
        },
        formatParam: {
          in: 'query',
          name: 'format',
          schema: {
            type: 'string',
            enum: ['json', 'csv'],
            default: 'json'
          },
          description: 'Response format'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'API endpoints for user authentication',
      },
      {
        name: 'Users',
        description: 'API endpoints for user management',
      },
      {
        name: 'Meditation',
        description: 'API endpoints for meditation sessions',
      },
      {
        name: 'Stress Management',
        description: 'API endpoints for stress management',
      },
      {
        name: 'Achievements',
        description: 'API endpoints for user achievements',
      },
      {
        name: 'Data Export',
        description: 'API endpoints for exporting user data',
      },
      {
        name: 'Stress Management Techniques',
        description: 'API endpoints for stress management techniques',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

/**
 * Configure Swagger API documentation
 */
export const setupSwagger = (app: Express): void => {
  // Generate Swagger specification
  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MCP Mindfulness API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none', // 'list', 'full', or 'none'
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  }));

  // Expose a route to get the Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation initialized at /api-docs');
};
