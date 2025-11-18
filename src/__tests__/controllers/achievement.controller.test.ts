import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { AchievementController } from '../../controllers/achievement.controller';
import { Types } from 'mongoose';
import { AppError, ErrorCategory, ErrorCodes } from '../../utils/errors';
import { createMockRequestContext, createMockUserContext } from '../helpers/error-test.helpers';
import { mockServiceOperation } from '../helpers/service-test.helpers';
import { ERROR_MESSAGES, HTTP_STATUS } from '../fixtures/error-responses';
import { TEST_IDS } from '../fixtures/service-errors';
import { AchievementService } from '../../services/achievement.service';
import { MOCK_ERRORS } from '../fixtures/mock-errors';
import { verifyErrorResponse, createTestErrorResponse, adaptLegacyErrorHandling } from '../helpers/error-compatibility.helpers';
import { createMockModel, createMockRequest, createMockResponse, MockModel } from '../utils/mock-factories';
import { AchievementTestFactory } from '../utils/achievement-test-factory';
import { IAchievement } from '../../models/achievement.model';
import { HttpError } from '../../errors/http-error';
import { Achievement, UserAchievement } from '../../models/achievement.model';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}


describe('AchievementController Tests', () => {
  let context: TestContext;

  beforeAll(() => {
    // Setup any test-wide configurations
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