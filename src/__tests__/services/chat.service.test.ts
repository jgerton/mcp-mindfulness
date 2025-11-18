import mongoose from 'mongoose';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat-message.model';
import { GroupSession } from '../../models/group-session.model';
import { User } from '../../models/user.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { UserTestFactory } from '../factories/user.factory';

describe('ChatService', () => {
  let userFactory: UserTestFactory;
  let sessionId: mongoose.Types.ObjectId;
  let hostId: mongoose.Types.ObjectId;
  let participantId: mongoose.Types.ObjectId;
  let nonParticipantId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    userFactory = new UserTestFactory();
    
    // Create test users
    const host = userFactory.create({ username: 'host' });
    const participant = userFactory.create({ username: 'participant' });
    const nonParticipant = userFactory.create({ username: 'nonParticipant' });
    
    await User.create([host, participant, nonParticipant]);
    
    hostId = host._id;
    participantId = participant._id;
    nonParticipantId = nonParticipant._id;

    // Create test session
    const session = new GroupSession({
      hostId,
      title: 'Test Session',
      scheduledTime: new Date(),
      duration: 1800,
      participants: [{
        userId: participantId,
        status: 'joined'
      }]
    });
    await session.save();
    sessionId = session._id;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('addMessage', () => {
    it('should add message from host', async () => {
      const message = await ChatService.addMessage(
        sessionId.toString(),
        hostId.toString(),
        'Test message'
      );

      expect(message.content).toBe('Test message');
      expect(message.senderId._id).toEqual(hostId);
      expect(message.type).toBe('text');
    });

    it('should add message from participant', async () => {
      const message = await ChatService.addMessage(
        sessionId.toString(),
        participantId.toString(),
        'Participant message'
      );

      expect(message.content).toBe('Participant message');
      expect(message.senderId._id).toEqual(participantId);
    });

    it('should reject messages from non-participants', async () => {
      await expect(
        ChatService.addMessage(
          sessionId.toString(),
          nonParticipantId.toString(),
          'Invalid message'
        )
      ).rejects.toThrow('User is not a participant in this session');
    });

    it('should reject messages for non-existent session', async () => {
      await expect(
        ChatService.addMessage(
          new mongoose.Types.ObjectId().toString(),
          hostId.toString(),
          'Test message'
        )
      ).rejects.toThrow('Session not found');
    });

    it('should reject messages in cancelled sessions', async () => {
      await GroupSession.findByIdAndUpdate(sessionId, { status: 'cancelled' });
      
      await expect(
        ChatService.addMessage(
          sessionId.toString(),
          hostId.toString(),
          'Test message'
        )
      ).rejects.toThrow('Cannot send messages in a cancelled session');
    });

    it('should allow system messages in cancelled sessions', async () => {
      await GroupSession.findByIdAndUpdate(sessionId, { status: 'cancelled' });
      
      const message = await ChatService.addMessage(
        sessionId.toString(),
        hostId.toString(),
        'System notification',
        'system'
      );

      expect(message.type).toBe('system');
      expect(message.content).toBe('System notification');
    });
  });

  describe('getSessionMessages', () => {
    beforeEach(async () => {
      // Add test messages
      const messages = Array.from({ length: 5 }, (_, i) => ({
        sessionId,
        senderId: hostId,
        content: `Message ${i + 1}`,
        createdAt: new Date(Date.now() - i * 1000) // Messages 1 second apart
      }));
      await ChatMessage.insertMany(messages);
    });

    it('should return messages in correct order', async () => {
      const messages = await ChatService.getSessionMessages(sessionId.toString());
      
      expect(messages).toHaveLength(5);
      expect(messages[0].content).toBe('Message 1');
      expect(messages[4].content).toBe('Message 5');
    });

    it('should respect limit option', async () => {
      const messages = await ChatService.getSessionMessages(sessionId.toString(), { limit: 3 });
      expect(messages).toHaveLength(3);
    });

    it('should respect before option', async () => {
      const cutoffDate = new Date(Date.now() - 2500); // Between 2nd and 3rd message
      const messages = await ChatService.getSessionMessages(sessionId.toString(), { before: cutoffDate });
      
      expect(messages.every(m => m.createdAt < cutoffDate)).toBe(true);
    });

    it('should populate sender information', async () => {
      const messages = await ChatService.getSessionMessages(sessionId.toString());
      
      expect(messages[0].senderId).toHaveProperty('username', 'host');
    });
  });

  describe('addSystemMessage', () => {
    it('should add system message', async () => {
      const message = await ChatService.addSystemMessage(
        sessionId.toString(),
        'System notification'
      );

      expect(message.type).toBe('system');
      expect(message.content).toBe('System notification');
      expect(message.senderId).toEqual(hostId);
    });

    it('should reject for non-existent session', async () => {
      await expect(
        ChatService.addSystemMessage(
          new mongoose.Types.ObjectId().toString(),
          'System message'
        )
      ).rejects.toThrow('Session not found');
    });
  });

  describe('getSessionParticipants', () => {
    it('should return populated session participants', async () => {
      const session = await ChatService.getSessionParticipants(sessionId.toString());
      
      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].userId).toHaveProperty('username', 'participant');
    });

    it('should reject for non-existent session', async () => {
      await expect(
        ChatService.getSessionParticipants(new mongoose.Types.ObjectId().toString())
      ).rejects.toThrow('Session not found');
    });
  });
}); 