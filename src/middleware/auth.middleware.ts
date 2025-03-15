import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { User } from '../models/user.model';
import config from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; username: string };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = { _id: decoded._id, username: decoded.username };
    
    if (process.env.NODE_ENV === 'test') {
      next();
      return;
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = { _id: user._id.toString(), username: user.username };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}; 

// Export alias for backward compatibility
export const authenticateUser = authenticateToken; 