import { Request, Response } from 'express';
import { Model, FilterQuery } from 'mongoose';
import { BaseController } from '../core/base.controller';
import { IUser, User } from '../models/user.model';
import { HttpError } from '../errors/http-error';
import { comparePasswords, hashPassword } from '../utils/auth';
import { ErrorCodes, ErrorCategory } from '../utils/errors';

export class UserController extends BaseController<IUser> {
  constructor(userModel: Model<IUser>) {
    super(userModel);
  }

  protected async validateCreate(data: Partial<IUser>): Promise<void> {
    if (!data.email || !data.password) {
      throw new HttpError(400, 'Email and password are required');
    }
    
    if (data.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }

    if (!this.isValidEmail(data.email)) {
      throw new HttpError(400, 'Invalid email format', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        details: { field: 'email', constraint: 'format' }
      });
    }

    const existingUser = await this.model.findOne({ email: data.email });
    if (existingUser) {
      throw new HttpError(409, 'Email already registered', {
        code: ErrorCodes.DUPLICATE_ERROR,
        category: ErrorCategory.VALIDATION,
        details: { field: 'email', message: 'Email already registered' }
      });
    }
  }

  protected async validateUpdate(data: Partial<IUser>): Promise<void> {
    if (data.password && data.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        details: { field: 'password', constraint: 'complexity' }
      });
    }

    if (data.email) {
      if (!this.isValidEmail(data.email)) {
        throw new HttpError(400, 'Invalid email format', {
          code: ErrorCodes.VALIDATION_ERROR,
          category: ErrorCategory.VALIDATION,
          details: { field: 'email', constraint: 'format' }
        });
      }

      const existingUser = await this.model.findOne({ 
        email: data.email,
        _id: { $ne: data._id }
      });
      if (existingUser) {
        throw new HttpError(409, 'Email already in use', {
          code: ErrorCodes.DUPLICATE_ERROR,
          category: ErrorCategory.VALIDATION,
          details: { field: 'email', message: 'Email already in use' }
        });
      }
    }
  }

  protected buildFilterQuery(query: any): FilterQuery<IUser> {
    const filter: FilterQuery<IUser> = {};
    
    if (query.email) {
      filter.email = new RegExp(query.email, 'i');
    }
    
    if (query.role) {
      filter.role = query.role;
    }

    if (query.active !== undefined) {
      filter.active = query.active === 'true';
    }
    
    return filter;
  }

  // Custom methods
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await this.model.findOne({ email });
    if (!user) {
      throw new HttpError(401, 'Invalid credentials', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION,
        details: { message: 'Invalid email or password' }
      });
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      throw new HttpError(401, 'Invalid credentials', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION,
        details: { message: 'Invalid email or password' }
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(200).json(userWithoutPassword);
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
      throw new HttpError(400, 'Current and new password are required');
    }

    if (newPassword.length < 8) {
      throw new HttpError(400, 'New password must be at least 8 characters', {
        code: ErrorCodes.VALIDATION_ERROR,
        category: ErrorCategory.VALIDATION,
        details: { field: 'password', constraint: 'complexity' }
      });
    }

    const user = await this.model.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.NOT_FOUND,
        details: { resourceType: 'user' }
      });
    }

    const isValid = await comparePasswords(currentPassword, user.password);
    if (!isValid) {
      throw new HttpError(401, 'Current password is incorrect');
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await this.model.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.NOT_FOUND,
        details: { resourceType: 'user' }
      });
    }

    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(200).json(userWithoutPassword);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    await this.validateUpdate({ ...req.body, _id: userId });

    const updateData = req.body;
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await this.model.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(200).json(userWithoutPassword);
  }

  async getStats(req: Request, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await this.model.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Get user stats from various services
    // TODO: Implement actual stats gathering
    const stats = {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      streakDays: 0,
      lastSessionDate: null
    };

    res.status(200).json(stats);
  }

  // Override create to hash password
  async create(req: Request, res: Response): Promise<void> {
    await this.validateCreate(req.body);

    const hashedPassword = await hashPassword(req.body.password);
    const [user] = await this.model.create([{
      ...req.body,
      password: hashedPassword
    }]);

    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json(userWithoutPassword);
  }

  // Override update to handle password hashing
  async update(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    await this.validateUpdate({ ...req.body, _id: userId });

    const updateData = req.body;
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await this.model.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(200).json(userWithoutPassword);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get user stats
  static async getStats(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Here you would typically aggregate meditation sessions, achievements, etc.
      // For now, return placeholder stats
      return res.json({
        totalMeditations: 0,
        totalMinutes: 0,
        streak: 0,
        achievements: []
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      return res.status(500).json({ message: 'Error fetching user stats' });
    }
  }
} 