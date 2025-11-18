import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { authenticateToken, authenticateUser } from '../../middleware/auth.middleware';
import * as jwtUtils from '../../utils/jwt.utils';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import { verifyToken } from '../../utils/jwt';
import { User } from '../../models/user.model';
import { HttpError } from '../../errors/http-error';
import { mockRequest, mockResponse } from '../test-utils/express-mock';
import { mockUser } from '../factories/user.factory';
import { ErrorCodes } from '../../utils/error-codes';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

// Mock dependencies
jest.mock('../../utils/jwt');
jest.mock('../../models/user.model');

describe('AuthMiddleware Tests', () => {
  let context: TestContext;
  let mockNext: jest.Mock;
  let req: Request;
  let res: Response;

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
    mockNext = jest.fn();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  afterEach(() => {
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

  describe('authenticateToken', () => {
    const mockToken = 'valid.jwt.token';
    const mockUserId = '123';
    const mockUser = {
      id: mockUserId,
      username: 'testuser'
    };

    it('should authenticate valid token and set user in request', async () => {
      // Setup
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(verifyToken).toHaveBeenCalledWith(mockToken);
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
        lastLogin: expect.any(Date)
      });
      expect(mockReq.user).toEqual({
        _id: mockUserId,
        username: mockUser.username
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle missing authorization header', async () => {
      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided',
          details: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            category: ErrorCategory.AUTHENTICATION
          }
        })
      );
    });

    it('should handle invalid token format', async () => {
      // Setup
      mockReq.headers = { authorization: 'InvalidFormat' };

      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided'
        })
      );
    });

    it('should handle token verification failure', async () => {
      // Setup
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle user not found', async () => {
      // Setup
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId });
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid token',
          details: {
            code: ErrorCodes.AUTHENTICATION_ERROR,
            category: ErrorCategory.AUTHENTICATION
          }
        })
      );
    });

    it('should handle database errors', async () => {
      // Setup
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId });
      (User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Execute
      await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});