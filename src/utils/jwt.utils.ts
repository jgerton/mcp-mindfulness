import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ _id: userId, username }, JWT_SECRET, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): { _id: string; username: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string; username: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 