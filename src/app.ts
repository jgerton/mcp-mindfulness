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

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const socketManager = new SocketManager(httpServer);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/group-sessions', groupSessionRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);

export { app, httpServer }; 