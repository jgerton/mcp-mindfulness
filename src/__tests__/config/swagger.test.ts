import { swaggerOptions, setupSwagger } from '../../config/swagger';
import { Express } from 'express';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import request from 'supertest';
import { createServer } from '../utils/test-server';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}


describe('Swagger Tests', () => {
  let context: TestContext;
  let app: Express;

  beforeAll(async () => {
    // Setup any test-wide configurations
    app = await createServer();
  });

  beforeEach(() => {
    // Initialize test context
    context = {
      mockReq: {
        params: {},
        body: {},
        query: {},
      } as Request,
      mockRes: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response,
      testFactory: new TestFactory(),
    };
    // Initialize test context
    context = {
      mockReq: {
        params: {},
        body: {},
        query: {},
      } as Request,
      mockRes: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response,
      testFactory: new TestFactory(),
    };
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
    // Clean up after each test
    jest.clearAllMocks();
    // Clean up after each test
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    
      it('should successfully process valid input', async () => {
        // Arrange
        const input = context.testFactory.createValidInput();
        context.mockReq.body = input;
        
        const expectedResult = context.testFactory.createExpectedResult();
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockResolvedValue(expectedResult);

        // Act
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);

          // Assert
          expect(context.mockRes.status).toHaveBeenCalledWith(200);
          expect(context.mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining(expectedResult)
          );
        } catch (error) {
          fail('Should not throw an error');
        }
      });
    
  });

  describe('Error Cases', () => {
    
      it('should handle invalid input error', async () => {
        // Arrange
        const invalidInput = context.testFactory.createInvalidInput();
        context.mockReq.body = invalidInput;

        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockRejectedValue({
            code: ErrorCode.INVALID_INPUT,
            category: ErrorCategory.VALIDATION,
            message: 'Invalid input provided',
          });

        // Act & Assert
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);
          fail('Should throw an error');
        } catch (error: any) {
          expect(error.code).toBe(ErrorCode.INVALID_INPUT);
          expect(error.category).toBe(ErrorCategory.VALIDATION);
          expect(context.mockRes.status).not.toHaveBeenCalled();
        }
      });
    
  });

  describe('Edge Cases', () => {
    
      it('should handle boundary conditions', async () => {
        // Arrange
        const edgeInput = context.testFactory.createEdgeCaseInput();
        context.mockReq.body = edgeInput;

        // Mock implementation with specific logic
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockImplementation(async (input) => {
            if (someEdgeCondition(input)) {
              return specialHandling(input);
            }
            return normalHandling(input);
          });

        // Act
        await controller.handleComponent(context.mockReq, context.mockRes);

        // Assert
        expect(context.mockRes.status).toHaveBeenCalledWith(200);
        expect(context.mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            // Edge case specific assertions
          })
        );
      });
    
  });
});

describe('Swagger Documentation', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createServer();
  });

  describe('Configuration', () => {
    it('should initialize Swagger documentation', async () => {
      const response = await request(app).get('/api-docs');
      expect(response.status).toBe(301); // Redirects to /api-docs/
    });

    it('should serve Swagger UI', async () => {
      const response = await request(app).get('/api-docs/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('swagger-ui');
    });

    it('should handle missing swagger dependencies gracefully', () => {
      const mockApp = {
        use: jest.fn(),
        get: jest.fn()
      } as unknown as Express;

      // Mock require to simulate missing dependencies
      jest.mock('swagger-jsdoc', () => {
        throw new Error('Module not found');
      });

      setupSwagger(mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api-docs', expect.any(Function));
    });
  });

  describe('OpenAPI Specification', () => {
    it('should serve valid OpenAPI JSON', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        openapi: '3.0.0',
        info: {
          title: 'Mindfulness API',
          version: '1.0.0'
        },
        paths: expect.any(Object)
      });
    });

    it('should include all API routes', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const paths = response.body.paths;

      // Check for essential endpoints
      expect(paths).toHaveProperty('/api/auth/register');
      expect(paths).toHaveProperty('/api/auth/login');
      expect(paths).toHaveProperty('/api/export/achievements');
      expect(paths).toHaveProperty('/api/export/meditations');
      expect(paths).toHaveProperty('/api/stress-techniques');
    });

    it('should define security schemes', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const { components } = response.body;

      expect(components.securitySchemes).toBeDefined();
      expect(components.securitySchemes.BearerAuth).toMatchObject({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      });
    });

    it('should include common schemas', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const { components } = response.body;

      expect(components.schemas).toBeDefined();
      expect(components.schemas.StressTechnique).toBeDefined();
      expect(components.schemas.StressTechnique.properties).toMatchObject({
        name: { type: 'string' },
        description: { type: 'string' },
        category: {
          type: 'string',
          enum: ['breathing', 'meditation', 'physical', 'cognitive', 'mindfulness']
        }
      });
    });
  });

  describe('Route Documentation', () => {
    it('should document authentication endpoints correctly', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const registerPath = response.body.paths['/api/auth/register'];

      expect(registerPath.post).toMatchObject({
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password']
              }
            }
          }
        }
      });
    });

    it('should document export endpoints correctly', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const achievementsPath = response.body.paths['/api/export/achievements'];

      expect(achievementsPath.get).toMatchObject({
        summary: expect.any(String),
        tags: expect.arrayContaining(['Data Export']),
        security: expect.arrayContaining([{ BearerAuth: [] }]),
        parameters: expect.arrayContaining([
          expect.objectContaining({
            name: 'format',
            schema: {
              type: 'string',
              enum: ['json', 'csv']
            }
          })
        ])
      });
    });

    it('should document stress technique endpoints correctly', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const techniquesPath = response.body.paths['/api/stress-techniques'];

      expect(techniquesPath.get).toMatchObject({
        summary: 'Get all stress management techniques',
        tags: ['Stress Management Techniques'],
        parameters: expect.arrayContaining([
          expect.objectContaining({
            name: 'page',
            schema: { type: 'integer' }
          }),
          expect.objectContaining({
            name: 'limit',
            schema: { type: 'integer' }
          })
        ])
      });
    });
  });

  describe('Documentation Quality', () => {
    it('should include examples in schema definitions', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const { components } = response.body;

      expect(components.schemas.StressTechnique.example).toBeDefined();
      expect(components.schemas.StressTechnique.example).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        category: expect.any(String),
        difficultyLevel: expect.any(String),
        durationMinutes: expect.any(Number)
      });
    });

    it('should have consistent error responses', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const paths = response.body.paths;

      // Check a sample of endpoints for consistent error responses
      const endpoints = [
        '/api/auth/register',
        '/api/export/achievements',
        '/api/stress-techniques'
      ];

      endpoints.forEach(endpoint => {
        const path = paths[endpoint];
        Object.values(path).forEach((method: any) => {
          expect(method.responses).toHaveProperty('500');
          if (method.security) {
            expect(method.responses).toHaveProperty('401');
          }
        });
      });
    });

    it('should have proper parameter descriptions', async () => {
      const response = await request(app).get('/api-docs/swagger.json');
      const paths = response.body.paths;

      // Check parameters in stress techniques endpoint
      const techniquesPath = paths['/api/stress-techniques'].get;
      techniquesPath.parameters.forEach((param: any) => {
        expect(param).toHaveProperty('description');
        expect(param.description.length).toBeGreaterThan(0);
      });
    });
  });
});