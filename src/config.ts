export default {
  jwtSecret: process.env.NODE_ENV === 'test' ? 'test-secret' : (process.env.JWT_SECRET || 'your-secret-key'),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness',
  port: process.env.PORT || 3000
}; 