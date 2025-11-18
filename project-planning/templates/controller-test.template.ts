import { Request, Response } from 'express';
import { BaseTestFactory } from '../utils/base-test-factory';
import { mockModule } from '../utils/test-setup';

/**
 * Template for controller tests
 * Replace ENTITY with your entity name (e.g., User, Post, Comment)
 * Replace IEntity with your entity interface
 */

describe('ENTITYController', () => {
  let testFactory: ENTITYTestFactory;
  let controller: ENTITYController;
  let mockReq: Partial<Request>;
  let mockRes: Response;

  beforeAll(() => {
    // Mock all dependencies from your dependency map
    entityControllerDependencies.mocks.forEach(mock => {
      mockModule(mock.target, {});
    });
  });

  beforeEach(() => {
    testFactory = new ENTITYTestFactory();
    controller = new ENTITYController();
    mockReq = testFactory.createMockRequest();
    mockRes = testFactory.createMockResponse() as unknown as Response;
    
    // Setup default mocks
    testFactory.setupModelMocks();
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create entity with valid input', async () => {
        // Arrange
        const mockEntity = testFactory.createMockEntity();
        mockReq.body = {
          // Required fields for creation
        };
        testFactory.setupModelMocks({ createResult: mockEntity });

        // Act
        await controller.create(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            // Expected fields in response
          })
        );
      });

      it('should return validation error with invalid input', async () => {
        // Arrange
        mockReq.body = {
          // Invalid or missing required fields
        };

        // Act
        await controller.create(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          code: ErrorCode.VALIDATION_ERROR,
          category: ErrorCategory.VALIDATION,
          message: expect.any(String)
        });
      });
    });

    describe('getById', () => {
      it('should return entity when found', async () => {
        // Arrange
        const mockEntity = testFactory.createMockEntity();
        mockReq.params = { id: mockEntity._id };
        testFactory.setupModelMocks({ findByIdResult: mockEntity });

        // Act
        await controller.getById(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockEntity);
      });

      it('should return not found error when entity does not exist', async () => {
        // Arrange
        mockReq.params = { id: 'non-existent-id' };
        testFactory.setupModelMocks({ findByIdResult: null });

        // Act
        await controller.getById(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          code: ErrorCode.NOT_FOUND,
          category: ErrorCategory.NOT_FOUND,
          message: expect.any(String)
        });
      });
    });

    // Add other CRUD operations following the same pattern
  });

  describe('Custom Operations', () => {
    describe('customMethod', () => {
      it('should handle successful case', async () => {
        // Arrange
        // Setup specific mocks and data for custom method

        // Act
        await controller.customMethod(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            // Expected response structure
          })
        );
      });

      it('should handle error case', async () => {
        // Arrange
        // Setup error condition

        // Act
        await controller.customMethod(mockReq as Request, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(/* expected error code */);
        expect(mockRes.json).toHaveBeenCalledWith({
          code: ErrorCode.CUSTOM_ERROR,
          category: ErrorCategory.CUSTOM,
          message: expect.any(String)
        });
      });
    });
  });
}); 