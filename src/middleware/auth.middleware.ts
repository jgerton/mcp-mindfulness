import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { HttpError } from '../errors/http-error';
import { ErrorCodes, ErrorCategory } from '../utils/error-codes';
import config from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        username: string;
      };
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new HttpError(401, 'No token provided', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new HttpError(401, 'Invalid token', {
        code: ErrorCodes.AUTHENTICATION_ERROR,
        category: ErrorCategory.AUTHENTICATION
      });
    }

    // Update last login
    await User.findByIdAndUpdate(decoded.userId, {
      lastLogin: new Date()
    });

    req.user = { _id: (user as Document).id, username: user.username || '' };
    next();
  } catch (error) {
    next(error);
  }
}

// Export alias for backward compatibility
export const authenticateUser = authenticateToken; 