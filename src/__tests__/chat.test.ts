import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client } from 'socket.io-client';
import { User } from '../models/user.model';
import { GroupSession } from '../models/group-session.model';
import { ChatMessage } from '../models/chat-message.model';
import { GroupSessionService } from '../services/group-session.service';
import { ChatService } from '../services/chat.service';
import { generateToken } from '../utils/jwt.utils';
import { app, httpServer } from '../app';

describe('Chat System', () => {
  let clientSocket: any;
  let port: number;

  let host: any;
  let participant1: any;
  let participant2: any;
  let session: any;

  beforeAll(async () => {
    // Start the server
    httpServer.listen(0);
    port = (httpServer.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await GroupSession.deleteMany({});
    await ChatMessage.deleteMany({});

    // Create test users
    host = await User.create({
      username: 'host',
      email: 'host@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant1 = await User.create({
      username: 'participant1',
      email: 'participant1@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant2 = await User.create({
      username: 'participant2',
      email: 'participant2@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    // Create test session
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 1);

    const mockMeditationId = new mongoose.Types.ObjectId();
    session = await GroupSessionService.createSession(
      host._id.toString(),
      mockMeditationId.toString(),
      'Test Session',
      scheduledTime,
      15,
      { maxParticipants: 3 }
    );

    // Join the session as participant1
    await GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());

    // Connect client socket
    clientSocket = Client(`http://localhost:${port}`, {
      auth: {
        token: generateToken(participant1._id.toString(), participant1.username)
      }
    });

    await new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('REST API', () => {
    it('should get session messages', async () => {
      // Add some test messages
      await ChatService.addMessage(
        session._id.toString(),
        participant1._id.toString(),
        'Hello everyone!'
      );

      await ChatService.addMessage(
        session._id.toString(),
        host._id.toString(),
        'Welcome!'
      );

      const messages = await ChatService.getSessionMessages(session._id.toString());
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Welcome!');
      expect(messages[1].content).toBe('Hello everyone!');
    });

    it('should not allow non-participants to send messages', async () => {
      const nonParticipant = await User.create({
        username: 'nonparticipant',
        email: 'nonpart@test.com',
        password: 'password123'
      });

      await expect(
        ChatService.addMessage(
          session._id.toString(),
          nonParticipant._id.toString(),
          'Hello!'
        )
      ).rejects.toThrow('User is not a participant in this session');
    });
  });

  describe('WebSocket Events', () => {
    it('should handle join_session event', (done) => {
      // Add error handling for socket connection
      clientSocket.on('connect_error', (error: Error) => {
        done(error);
      });

      clientSocket.on('error', (error: Error) => {
        done(error);
      });

      // Listen for user_joined event before emitting join_session
      clientSocket.on('user_joined', (data: { userId: string; username: string }) => {
        try {
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          done();
        } catch (error) {
          done(error as Error);
        }
      });

      clientSocket.emit('join_session', session._id.toString());
    }, 30000);

    it('should handle send_message event', (done) => {
      // Add error handling for socket connection
      clientSocket.on('connect_error', (error: Error) => {
        done(error);
      });

      clientSocket.on('error', (error: Error) => {
        done(error);
      });

      // Listen for new_message event before sending message
      clientSocket.on('new_message', (message: { content: string; userId: string }) => {
        try {
          expect(message.content).toBe('Hello, world!');
          expect(message.userId).toBe(participant1._id.toString());
          done();
        } catch (error) {
          done(error as Error);
        }
      });

      // First join the session
      clientSocket.emit('join_session', session._id.toString());
      
      // Wait for user_joined event before sending message
      clientSocket.on('user_joined', () => {
        clientSocket.emit('send_message', {
          sessionId: session._id.toString(),
          content: 'Hello, world!'
        });
      });
    }, 30000);

    it('should handle typing indicators', (done) => {
      // Add error handling for socket connection
      clientSocket.on('connect_error', (error: Error) => {
        done(error);
      });

      clientSocket.on('error', (error: Error) => {
        done(error);
      });

      // Listen for typing_start event
      clientSocket.on('typing_start', (data: { userId: string; username: string }) => {
        try {
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          
          // After receiving typing_start, emit typing_end
          clientSocket.emit('typing_end', session._id.toString());
        } catch (error) {
          done(error as Error);
        }
      });

      // Listen for typing_end event
      clientSocket.on('typing_end', (data: { userId: string; username: string }) => {
        try {
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          done();
        } catch (error) {
          done(error as Error);
        }
      });

      // First join the session
      clientSocket.emit('join_session', session._id.toString());
      
      // Wait for user_joined event before sending typing indicator
      clientSocket.on('user_joined', () => {
        clientSocket.emit('typing_start', session._id.toString());
      });
    }, 30000);
  });
});