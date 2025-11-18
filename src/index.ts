import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app, httpServer, closeServer } from './app';

// Import routes
import authRoutes from './routes/auth.routes';
import meditationRoutes from './routes/meditation.routes';
import meditationSessionRoutes from './routes/meditation-session.routes';

// Load environment variables
dotenv.config();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/meditation-sessions', meditationSessionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MCP Mindfulness API' });
});

// MongoDB connection options
const mongooseOptions = {
  // These options help with MongoDB Atlas connection
  retryWrites: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
} as mongoose.ConnectOptions;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness', mongooseOptions)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if we can't connect to the database
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Properly handle application shutdown
process.on('SIGINT', async () => {
  try {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('Closing HTTP server...');
    closeServer();
    console.log('HTTP server closed');
    
    // Force exit after 5 seconds if server doesn't close gracefully
    setTimeout(() => {
      console.log('Forcing process exit after timeout');
      process.exit(1);
    }, 5000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
}); 