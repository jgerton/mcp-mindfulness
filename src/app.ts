import meditationRoutes from './routes/meditation.routes';
import meditationSessionRoutes from './routes/meditation-session.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/meditation-sessions', meditationSessionRoutes); 