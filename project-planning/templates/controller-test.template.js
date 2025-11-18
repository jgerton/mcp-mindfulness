"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_setup_1 = require("../utils/test-setup");
/**
 * Template for controller tests
 * Replace ENTITY with your entity name (e.g., User, Post, Comment)
 * Replace IEntity with your entity interface
 */
describe('ENTITYController', () => {
    let testFactory;
    let controller;
    let mockReq;
    let mockRes;
    beforeAll(() => {
        // Mock all dependencies from your dependency map
        entityControllerDependencies.mocks.forEach(mock => {
            (0, test_setup_1.mockModule)(mock.target, {});
        });
    });
    beforeEach(() => {
        testFactory = new ENTITYTestFactory();
        controller = new ENTITYController();
        mockReq = testFactory.createMockRequest();
        mockRes = testFactory.createMockResponse();
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
                await controller.create(mockReq, mockRes);
                // Assert
                expect(mockRes.status).toHaveBeenCalledWith(201);
                expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                // Expected fields in response
                }));
            });
            it('should return validation error with invalid input', async () => {
                // Arrange
                mockReq.body = {
                // Invalid or missing required fields
                };
                // Act
                await controller.create(mockReq, mockRes);
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
                await controller.getById(mockReq, mockRes);
                // Assert
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith(mockEntity);
            });
            it('should return not found error when entity does not exist', async () => {
                // Arrange
                mockReq.params = { id: 'non-existent-id' };
                testFactory.setupModelMocks({ findByIdResult: null });
                // Act
                await controller.getById(mockReq, mockRes);
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
                await controller.customMethod(mockReq, mockRes);
                // Assert
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                // Expected response structure
                }));
            });
            it('should handle error case', async () => {
                // Arrange
                // Setup error condition
                // Act
                await controller.customMethod(mockReq, mockRes);
                // Assert
                expect(mockRes.status).toHaveBeenCalledWith( /* expected error code */);
                expect(mockRes.json).toHaveBeenCalledWith({
                    code: ErrorCode.CUSTOM_ERROR,
                    category: ErrorCategory.CUSTOM,
                    message: expect.any(String)
                });
            });
        });
    });
});
