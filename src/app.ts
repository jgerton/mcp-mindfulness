import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { SocketManager } from './socket/socket-manager';
import authRoutes from './routes/auth.routes';
import meditationRoutes from './routes/meditation.routes';
import userRoutes from './routes/user.routes';
import achievementRoutes from './routes/achievement.routes';
import groupSessionRoutes from './routes/group-session.routes';
import friendRoutes from './routes/friend.routes';
import chatRoutes from './routes/chat.routes';
import sessionAnalyticsRoutes from './routes/session-analytics.routes';
import meditationSessionRoutes from './routes/meditation-session.routes';
import cacheStatsRoutes from './routes/cache-stats.routes';
import stressManagementRoutes from './routes/stress-management.routes';
import breathingRoutes from './routes/breathing.routes';
import pmrRoutes from './routes/pmr.routes';
import stressRoutes from './routes/stress.routes';
import exportRoutes from './routes/export.routes';
import stressTechniqueRoutes from './routes/stress-technique.routes';
import { setupSwagger } from './config/swagger';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const socketManager = new SocketManager(httpServer);

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/group-sessions', groupSessionRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', sessionAnalyticsRoutes);
app.use('/api/meditation-sessions', meditationSessionRoutes);
app.use('/api/cache-stats', cacheStatsRoutes);
app.use('/api/stress-management', stressManagementRoutes);
app.use('/api/breathing', breathingRoutes);
app.use('/api/pmr', pmrRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stress-techniques', stressTechniqueRoutes);

/**
 * Function to properly close the server and any database connections
 */
const closeServer = () => {
  httpServer.close();
  // Close any other connections if needed
  socketManager.close();
};

export { app, httpServer, closeServer }; 