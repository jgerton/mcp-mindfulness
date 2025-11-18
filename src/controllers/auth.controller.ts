import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { IUser } from '../models/user.model';
import { HttpError } from '../errors/http-error';
import { ErrorCodes, ErrorCategory } from '../utils/error-codes';
import { comparePasswords, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/jwt';

export class AuthController {
  constructor(private userModel: Model<IUser>) {}

  async register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new HttpError(400, 'Username, email and password are required', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION
      });
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new HttpError(409, 'Email already registered', {
        code: ErrorCodes.DUPLICATE_ERROR,
        category: ErrorCategory.VALIDATION
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword
    });

    const token = generateToken((user as Document).id, username);
    res.status(201).json({ token });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION
      });
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpError(401, 'Invalid credentials', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION
      });
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      throw new HttpError(401, 'Invalid credentials', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION
      });
    }

    const token = generateToken((user as Document).id, user.username || '');
    res.status(200).json({ token });
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Generate new token
      const token = generateToken(user._id.toString(), user.username);

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
} 