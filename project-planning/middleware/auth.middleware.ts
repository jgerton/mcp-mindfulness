import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  
  // Extract the token (Bearer token format)
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    return;
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Add the decoded user to the request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Unauthorized: Token expired' });
    } else {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user exists and has admin role
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  
  // User is admin, continue
  next();
};

/**
 * Middleware to check if user owns the resource or is an admin
 * @param getResourceUserId Function to extract the user ID from the resource
 */
export const isResourceOwnerOrAdmin = (
  getResourceUserId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user exists
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
      }
      
      // If user is admin, allow access
      if (req.user.isAdmin) {
        next();
        return;
      }
      
      // Get the resource owner's user ID
      const resourceUserId = await getResourceUserId(req);
      
      // If resource doesn't exist or doesn't have a user ID
      if (!resourceUserId) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }
      
      // Check if the authenticated user is the resource owner
      if (req.user._id.toString() !== resourceUserId.toString()) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
        return;
      }
      
      // User is the resource owner, continue
      next();
    } catch (error) {
      console.error('Error in isResourceOwnerOrAdmin middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 