// Set test environment
process.env.NODE_ENV = 'test';

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
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await mongoose.disconnect();
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
    // Ensure all handles are closed
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await GroupSession.deleteMany({});
    await ChatMessage.deleteMany({});

    // Create test users with unique usernames
    host = await User.create({
      username: `host_${Date.now()}`,
      email: 'host@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant1 = await User.create({
      username: `participant1_${Date.now()}`,
      email: 'participant1@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant2 = await User.create({
      username: `participant2_${Date.now()}`,
      email: 'participant2@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    // Create test session with current time
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 5); // Schedule 5 minutes from now

    const mockMeditationId = new mongoose.Types.ObjectId();
    session = await GroupSessionService.createSession(
      host._id.toString(),
      mockMeditationId.toString(),
      'Test Session',
      scheduledTime,
      15,
      { maxParticipants: 3, isPrivate: false }
    );

    // Ensure session is created
    if (!session) {
      throw new Error('Failed to create test session');
    }

    // Join the session as participant1
    await GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());

    // Connect client socket with proper error handling
    return new Promise<void>((resolve, reject) => {
      const token = generateToken(participant1._id.toString(), participant1.username);
      clientSocket = Client(`http://localhost:${port}`, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 5000);

      clientSocket.on('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      clientSocket.on('connect_error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    await User.deleteMany({});
    await GroupSession.deleteMany({});
    await ChatMessage.deleteMany({});
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
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 5000);

      clientSocket.on('connect_error', (error: Error) => {
        clearTimeout(timeout);
        done(error);
      });

      clientSocket.on('error', (error: Error) => {
        clearTimeout(timeout);
        done(error);
      });

      clientSocket.on('user_joined', (data: { userId: string; username: string }) => {
        try {
          clearTimeout(timeout);
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          done();
        } catch (error) {
          done(error as Error);
        }
      });

      clientSocket.emit('join_session', session._id.toString());
    }, 10000);

    it('should handle send_message event', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 5000);

      const cleanup = (error?: Error) => {
        clearTimeout(timeout);
        if (error) done(error);
      };

      clientSocket.on('connect_error', cleanup);
      clientSocket.on('error', cleanup);

      clientSocket.on('new_message', (message: { content: string; userId: string }) => {
        try {
          expect(message.content).toBe('Hello, world!');
          expect(message.userId).toBe(participant1._id.toString());
          cleanup();
          done();
        } catch (error) {
          cleanup(error as Error);
        }
      });

      clientSocket.emit('join_session', session._id.toString());
      
      clientSocket.on('user_joined', () => {
        clientSocket.emit('send_message', {
          sessionId: session._id.toString(),
          content: 'Hello, world!'
        });
      });
    }, 10000);

    it('should handle typing indicators', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 5000);

      const cleanup = (error?: Error) => {
        clearTimeout(timeout);
        if (error) done(error);
      };

      clientSocket.on('connect_error', cleanup);
      clientSocket.on('error', cleanup);

      let typingStartReceived = false;

      clientSocket.on('typing_start', (data: { userId: string; username: string }) => {
        try {
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          typingStartReceived = true;
          clientSocket.emit('typing_end', session._id.toString());
        } catch (error) {
          cleanup(error as Error);
        }
      });

      clientSocket.on('typing_end', (data: { userId: string; username: string }) => {
        try {
          expect(typingStartReceived).toBe(true);
          expect(data.userId).toBe(participant1._id.toString());
          expect(data.username).toBe(participant1.username);
          cleanup();
          done();
        } catch (error) {
          cleanup(error as Error);
        }
      });

      clientSocket.emit('join_session', session._id.toString());
      
      clientSocket.on('user_joined', () => {
        clientSocket.emit('typing_start', session._id.toString());
      });
    }, 10000);
  });
});