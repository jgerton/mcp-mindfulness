"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_1 = require("socket.io");
const jwt_utils_1 = require("../utils/jwt.utils");
const chat_service_1 = require("../services/chat.service");
class SocketManager {
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }
                const decoded = (0, jwt_utils_1.verifyToken)(token);
                socket.userId = decoded._id;
                socket.username = decoded.username;
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);
            socket.on('join_session', async (sessionId) => {
                try {
                    socket.join(sessionId);
                    await chat_service_1.ChatService.addSystemMessage(sessionId, `${socket.username} joined the session`);
                    this.io.to(sessionId).emit('user_joined', {
                        userId: socket.userId,
                        username: socket.username
                    });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('leave_session', async (sessionId) => {
                try {
                    socket.leave(sessionId);
                    await chat_service_1.ChatService.addSystemMessage(sessionId, `${socket.username} left the session`);
                    this.io.to(sessionId).emit('user_left', {
                        userId: socket.userId,
                        username: socket.username
                    });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('send_message', async (data) => {
                try {
                    if (!socket.userId)
                        throw new Error('User not authenticated');
                    const message = await chat_service_1.ChatService.addMessage(data.sessionId, socket.userId, data.content);
                    const messageData = {
                        content: message.content,
                        type: message.type,
                        userId: socket.userId
                    };
                    this.io.to(data.sessionId).emit('new_message', messageData);
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });
            socket.on('typing_start', (sessionId) => {
                this.io.to(sessionId).emit('typing_start', {
                    userId: socket.userId,
                    username: socket.username
                });
            });
            socket.on('typing_end', (sessionId) => {
                this.io.to(sessionId).emit('typing_end', {
                    userId: socket.userId,
                    username: socket.username
                });
            });
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.userId}`);
            });
        });
    }
    /**
     * Close all socket connections and shut down the socket server
     */
    close() {
        // Disconnect all connected sockets
        this.io.disconnectSockets();
        // Close the socket io server instance
        this.io.close();
        console.log('Socket server closed');
    }
}
exports.SocketManager = SocketManager;
