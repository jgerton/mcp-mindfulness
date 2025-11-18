"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeServer = exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_manager_1 = require("./socket/socket-manager");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const meditation_routes_1 = __importDefault(require("./routes/meditation.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const achievement_routes_1 = __importDefault(require("./routes/achievement.routes"));
const group_session_routes_1 = __importDefault(require("./routes/group-session.routes"));
const friend_routes_1 = __importDefault(require("./routes/friend.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const session_analytics_routes_1 = __importDefault(require("./routes/session-analytics.routes"));
const meditation_session_routes_1 = __importDefault(require("./routes/meditation-session.routes"));
const cache_stats_routes_1 = __importDefault(require("./routes/cache-stats.routes"));
const stress_management_routes_1 = __importDefault(require("./routes/stress-management.routes"));
const breathing_routes_1 = __importDefault(require("./routes/breathing.routes"));
const pmr_routes_1 = __importDefault(require("./routes/pmr.routes"));
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Initialize Socket.IO only if not in test mode
const isTestMode = process.env.NODE_ENV === 'test';
let socketManager = null;
if (!isTestMode) {
    socketManager = new socket_manager_1.SocketManager(httpServer);
    console.log('Socket.IO initialized in normal mode');
}
else {
    console.log('Socket.IO disabled in test mode');
}
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/meditations', meditation_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/achievements', achievement_routes_1.default);
app.use('/api/group-sessions', group_session_routes_1.default);
app.use('/api/friends', friend_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/analytics', session_analytics_routes_1.default);
app.use('/api/meditation-sessions', meditation_session_routes_1.default);
app.use('/api/cache-stats', cache_stats_routes_1.default);
app.use('/api/stress-management', stress_management_routes_1.default);
app.use('/api/breathing', breathing_routes_1.default);
app.use('/api/pmr', pmr_routes_1.default);
// Function to close server and connections for testing
const closeServer = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        console.log('Closing HTTP server and socket connections...');
        // First close the HTTP server
        httpServer.close(() => {
            console.log('HTTP server closed');
            // Then close any socket connections
            if (socketManager) {
                console.log('Closing socket connections...');
                socketManager.close();
                console.log('Socket connections closed');
            }
            // Resolve the promise after all connections are closed
            console.log('All connections closed');
            resolve();
        });
    });
});
exports.closeServer = closeServer;
