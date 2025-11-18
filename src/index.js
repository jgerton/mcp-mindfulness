"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const meditation_routes_1 = __importDefault(require("./routes/meditation.routes"));
const meditation_session_routes_1 = __importDefault(require("./routes/meditation-session.routes"));
// Load environment variables
dotenv_1.default.config();
// Configure rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// Middleware
app_1.app.use(express_1.default.json());
app_1.app.use(express_1.default.urlencoded({ extended: true }));
app_1.app.use((0, cors_1.default)());
app_1.app.use((0, helmet_1.default)());
app_1.app.use((0, morgan_1.default)('dev'));
app_1.app.use(limiter);
// Routes
app_1.app.use('/api/auth', auth_routes_1.default);
app_1.app.use('/api/meditations', meditation_routes_1.default);
app_1.app.use('/api/meditation-sessions', meditation_session_routes_1.default);
// Basic route
app_1.app.get('/', (req, res) => {
    res.json({ message: 'Welcome to MCP Mindfulness API' });
});
// MongoDB connection options
const mongooseOptions = {
    // These options help with MongoDB Atlas connection
    retryWrites: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfulness', mongooseOptions)
    .then(() => {
    console.log('Successfully connected to MongoDB');
    // Start the server
    const PORT = process.env.PORT || 3000;
    app_1.httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if we can't connect to the database
});
// Handle MongoDB connection events
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
// Properly handle application shutdown
process.on('SIGINT', async () => {
    try {
        console.log('Closing MongoDB connection...');
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed');
        console.log('Closing HTTP server...');
        (0, app_1.closeServer)();
        console.log('HTTP server closed');
        // Force exit after 5 seconds if server doesn't close gracefully
        setTimeout(() => {
            console.log('Forcing process exit after timeout');
            process.exit(1);
        }, 5000);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
// Error handling middleware
app_1.app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
