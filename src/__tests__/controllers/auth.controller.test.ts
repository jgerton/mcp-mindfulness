import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { AuthController } from '../../controllers/auth.controller';
import { IUser } from '../../models/user.model';
import { HttpError } from '../../errors/http-error';
import { ErrorCodes } from '../../utils/error-codes';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt';
import { mockRequest, mockResponse } from '../test-utils/express-mock';
import { mockUser } from '../factories/user.factory';

jest.mock('../../utils/auth');
jest.mock('../../utils/jwt');

describe('AuthController', () => {
  let authController: AuthController;
  let mockUserModel: jest.Mocked<Model<IUser>>;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    } as any;

    authController = new AuthController(mockUserModel);
    req = mockRequest() as Request;
    res = mockResponse() as Response;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      // Setup
      req.body = validRegisterData;
      const hashedPassword = 'hashedPassword123';
      const createdUser = mockUser({ ...validRegisterData, password: hashedPassword });
      const token = 'jwt.token.here';

      (authUtils.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(createdUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(token);

      // Execute
      await authController.register(req, res);

      // Verify
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: validRegisterData.email });
      expect(authUtils.hashPassword).toHaveBeenCalledWith(validRegisterData.password);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: validRegisterData.username,
        email: validRegisterData.email,
        password: hashedPassword
      });
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(createdUser.id, validRegisterData.username);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should throw error when required fields are missing', async () => {
      // Setup
      req.body = { username: 'testuser' };

      // Execute & Verify
      await expect(authController.register(req, res)).rejects.toThrow(HttpError);
      await expect(authController.register(req, res)).rejects.toMatchObject({
        statusCode: 400,
        code: ErrorCodes.VALIDATION_ERROR
      });
    });

    it('should throw error when email is already registered', async () => {
      // Setup
      req.body = validRegisterData;
      mockUserModel.findOne.mockResolvedValue(mockUser());

      // Execute & Verify
      await expect(authController.register(req, res)).rejects.toThrow(HttpError);
      await expect(authController.register(req, res)).rejects.toMatchObject({
        statusCode: 409,
        code: ErrorCodes.DUPLICATE_ERROR
      });
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login a user', async () => {
      // Setup
      req.body = validLoginData;
      const user = mockUser({ email: validLoginData.email });
      const token = 'jwt.token.here';

      mockUserModel.findOne.mockResolvedValue(user);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(token);

      // Execute
      await authController.login(req, res);

      // Verify
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: validLoginData.email });
      expect(authUtils.comparePasswords).toHaveBeenCalledWith(validLoginData.password, user.password);
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(user.id, user.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should throw error when required fields are missing', async () => {
      // Setup
      req.body = { email: 'test@example.com' };

      // Execute & Verify
      await expect(authController.login(req, res)).rejects.toThrow(HttpError);
      await expect(authController.login(req, res)).rejects.toMatchObject({
        statusCode: 400,
        code: ErrorCodes.VALIDATION_ERROR
      });
    });

    it('should throw error when user is not found', async () => {
      // Setup
      req.body = validLoginData;
      mockUserModel.findOne.mockResolvedValue(null);

      // Execute & Verify
      await expect(authController.login(req, res)).rejects.toThrow(HttpError);
      await expect(authController.login(req, res)).rejects.toMatchObject({
        statusCode: 401,
        code: ErrorCodes.AUTHENTICATION_ERROR
      });
    });

    it('should throw error when password is incorrect', async () => {
      // Setup
      req.body = validLoginData;
      const user = mockUser({ email: validLoginData.email });
      mockUserModel.findOne.mockResolvedValue(user);
      (authUtils.comparePasswords as jest.Mock).mockResolvedValue(false);

      // Execute & Verify
      await expect(authController.login(req, res)).rejects.toThrow(HttpError);
      await expect(authController.login(req, res)).rejects.toMatchObject({
        statusCode: 401,
        code: ErrorCodes.AUTHENTICATION_ERROR
      });
    });
  });

  describe('refreshToken', () => {
    it('should generate new token for authenticated user', async () => {
      // Setup
      const user = mockUser();
      req.user = {
        _id: user._id.toString(),
        username: user.username || user.email
      };
      const token = 'new.jwt.token';
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(token);

      // Execute
      await AuthController.refreshToken(req, res);

      // Verify
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(user._id.toString(), user.username);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Setup
      req.user = undefined;

      // Execute
      await AuthController.refreshToken(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should handle errors gracefully', async () => {
      // Setup
      const user = mockUser();
      req.user = {
        _id: user._id.toString(),
        username: user.username || user.email
      };
      const error = new Error('Token generation failed');
      (jwtUtils.generateToken as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Execute
      await AuthController.refreshToken(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
}); 