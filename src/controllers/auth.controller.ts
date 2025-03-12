import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import bcrypt from 'bcryptjs';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        friendIds: [],
        blockedUserIds: []
      });

      // Generate token
      const token = generateToken(user._id.toString(), user.username);

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user._id.toString(), user.username);

      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
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