import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt.utils';
import { ChatService } from '../services/chat.service';

interface IUserSocket extends Socket {
  userId?: string;
  username?: string;
}

export class SocketManager {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware
    this.io.use(async (socket: IUserSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        socket.userId = decoded._id;
        socket.username = decoded.username;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: IUserSocket) => {
      console.log(`User connected: ${socket.userId}`);

      socket.on('join_session', async (sessionId: string) => {
        try {
          socket.join(sessionId);
          await ChatService.addSystemMessage(
            sessionId,
            `${socket.username} joined the session`
          );
          this.io.to(sessionId).emit('user_joined', {
            userId: socket.userId,
            username: socket.username
          });
        } catch (error) {
          socket.emit('error', { message: (error as Error).message });
        }
      });

      socket.on('leave_session', async (sessionId: string) => {
        try {
          socket.leave(sessionId);
          await ChatService.addSystemMessage(
            sessionId,
            `${socket.username} left the session`
          );
          this.io.to(sessionId).emit('user_left', {
            userId: socket.userId,
            username: socket.username
          });
        } catch (error) {
          socket.emit('error', { message: (error as Error).message });
        }
      });

      socket.on('send_message', async (data: { sessionId: string; content: string }) => {
        try {
          if (!socket.userId) throw new Error('User not authenticated');
          const message = await ChatService.addMessage(
            data.sessionId,
            socket.userId,
            data.content
          );
          const messageData = {
            content: message.content,
            type: message.type,
            userId: socket.userId
          };
          this.io.to(data.sessionId).emit('new_message', messageData);
        } catch (error) {
          socket.emit('error', { message: (error as Error).message });
        }
      });

      socket.on('typing_start', (sessionId: string) => {
        this.io.to(sessionId).emit('typing_start', {
          userId: socket.userId,
          username: socket.username
        });
      });

      socket.on('typing_end', (sessionId: string) => {
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
} 