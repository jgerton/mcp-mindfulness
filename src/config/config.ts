import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100
}; 