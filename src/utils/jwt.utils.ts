import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ _id: userId, username }, config.jwtSecret, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): { _id: string; username: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { _id: string; username: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};