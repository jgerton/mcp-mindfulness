import meditationRoutes from './routes/meditation.routes';
import meditationSessionRoutes from './routes/meditation-session.routes';
import friendRoutes from './routes/friend.routes';
import groupSessionRoutes from './routes/group-session.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/meditation-sessions', meditationSessionRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/group-sessions', groupSessionRoutes); 