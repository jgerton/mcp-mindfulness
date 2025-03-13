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
import { app } from '../app';

describe('Chat Integration with Group Sessions', () => {
  let httpServer: any;
  let ioServer: Server;
  let hostSocket: any;
  let participant1Socket: any;
  let participant2Socket: any;
  let port: number;

  let host: any;
  let participant1: any;
  let participant2: any;
  let session: any;

  beforeAll(async () => {
    httpServer = createServer(app);
    ioServer = new Server(httpServer);
    httpServer.listen(0);
    port = (httpServer.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await new Promise<void>((resolve) => {
      ioServer.close(() => {
        httpServer.close(() => {
          resolve();
        });
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
      password: 'password123'
    });

    participant1 = await User.create({
      username: 'participant1',
      email: 'participant1@test.com',
      password: 'password123'
    });

    participant2 = await User.create({
      username: 'participant2',
      email: 'participant2@test.com',
      password: 'password123'
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

    // Connect sockets
    hostSocket = Client(`http://localhost:${port}`, {
      auth: { token: generateToken(host._id.toString(), host.username) }
    });

    participant1Socket = Client(`http://localhost:${port}`, {
      auth: { token: generateToken(participant1._id.toString(), participant1.username) }
    });

    participant2Socket = Client(`http://localhost:${port}`, {
      auth: { token: generateToken(participant2._id.toString(), participant2.username) }
    });

    // Wait for all sockets to connect
    await Promise.all([
      new Promise<void>((resolve) => hostSocket.on('connect', resolve)),
      new Promise<void>((resolve) => participant1Socket.on('connect', resolve)),
      new Promise<void>((resolve) => participant2Socket.on('connect', resolve))
    ]);
  });

  afterEach(async () => {
    [hostSocket, participant1Socket, participant2Socket].forEach(socket => {
      if (socket.connected) socket.disconnect();
    });
  });

  describe('Session Lifecycle Integration', () => {
    it('should handle chat messages during session lifecycle', async () => {
      // Join session
      await GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
      await GroupSessionService.joinSession(session._id.toString(), participant2._id.toString());

      // Emit join events
      hostSocket.emit('join_session', session._id.toString());
      participant1Socket.emit('join_session', session._id.toString());
      participant2Socket.emit('join_session', session._id.toString());

      // Wait for join messages
      await new Promise(resolve => setTimeout(resolve, 100));

      // Start session
      await GroupSessionService.startSession(session._id.toString(), host._id.toString());

      // Send messages during session
      await ChatService.addMessage(
        session._id.toString(),
        host._id.toString(),
        'Welcome to the meditation session!'
      );

      await ChatService.addMessage(
        session._id.toString(),
        participant1._id.toString(),
        'Thank you for hosting!'
      );

      // Verify messages
      const messages = await ChatService.getSessionMessages(session._id.toString());
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Thank you for hosting!');
      expect(messages[1].content).toBe('Welcome to the meditation session!');

      // End session
      await GroupSessionService.endSession(session._id.toString(), host._id.toString());

      // Verify system message about session ending
      const allMessages = await ChatService.getSessionMessages(session._id.toString());
      const lastMessage = allMessages[0];
      expect(lastMessage.type).toBe('system');
      expect(lastMessage.content).toContain('Session ended');
    });

    it('should handle participant leaving during session', async () => {
      // Join session
      await GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
      await GroupSessionService.joinSession(session._id.toString(), participant2._id.toString());

      // Start session
      await GroupSessionService.startSession(session._id.toString(), host._id.toString());

      // Participant leaves
      await GroupSessionService.leaveSession(session._id.toString(), participant1._id.toString());

      // Verify leave message
      const messages = await ChatService.getSessionMessages(session._id.toString());
      const leaveMessage = messages.find(m => 
        m.type === 'system' && 
        m.content.includes('participant1') && 
        m.content.includes('left the session')
      );
      expect(leaveMessage).toBeTruthy();

      // Verify participant can't send messages after leaving
      await expect(
        ChatService.addMessage(
          session._id.toString(),
          participant1._id.toString(),
          'Can I still chat?'
        )
      ).rejects.toThrow('User is not a participant in this session');
    });

    it('should handle session cancellation', async () => {
      // Join session
      await GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
      
      // Send some messages
      await ChatService.addMessage(
        session._id.toString(),
        host._id.toString(),
        'Session will start soon!'
      );

      // Cancel session
      await GroupSessionService.cancelSession(session._id.toString(), host._id.toString());

      // Verify cancellation message
      const messages = await ChatService.getSessionMessages(session._id.toString());
      const cancelMessage = messages.find(m => 
        m.type === 'system' && 
        m.content.includes('cancelled')
      );
      expect(cancelMessage).toBeTruthy();

      // Verify no new messages can be sent
      await expect(
        ChatService.addMessage(
          session._id.toString(),
          participant1._id.toString(),
          'Hello?'
        )
      ).rejects.toThrow('Cannot send messages in a cancelled session');
    });
  });
}); 