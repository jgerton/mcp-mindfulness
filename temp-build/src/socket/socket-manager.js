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
        this.io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
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
        }));
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);
            socket.on('join_session', (sessionId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    socket.join(sessionId);
                    yield chat_service_1.ChatService.addSystemMessage(sessionId, `${socket.username} joined the session`);
                    this.io.to(sessionId).emit('user_joined', {
                        userId: socket.userId,
                        username: socket.username
                    });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            }));
            socket.on('leave_session', (sessionId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    socket.leave(sessionId);
                    yield chat_service_1.ChatService.addSystemMessage(sessionId, `${socket.username} left the session`);
                    this.io.to(sessionId).emit('user_left', {
                        userId: socket.userId,
                        username: socket.username
                    });
                }
                catch (error) {
                    socket.emit('error', { message: error.message });
                }
            }));
            socket.on('send_message', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!socket.userId)
                        throw new Error('User not authenticated');
                    const message = yield chat_service_1.ChatService.addMessage(data.sessionId, socket.userId, data.content);
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
            }));
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
     * Close the Socket.IO server and disconnect all clients
     */
    close() {
        if (this.io) {
            console.log('Socket.IO: Disconnecting all sockets...');
            // Disconnect all sockets
            const sockets = this.io.sockets.sockets;
            sockets.forEach((socket) => {
                console.log(`Socket.IO: Disconnecting socket ${socket.id}`);
                socket.disconnect(true);
            });
            // Close the server
            console.log('Socket.IO: Closing server...');
            this.io.close();
            console.log('Socket.IO: Server closed');
        }
    }
}
exports.SocketManager = SocketManager;
