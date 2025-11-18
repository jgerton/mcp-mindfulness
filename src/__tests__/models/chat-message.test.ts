import mongoose from 'mongoose';
import { ChatMessage, IChatMessage } from '../../models/chat-message.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface ChatMessageInput {
  sessionId?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  content?: string;
  type?: 'text' | 'system';
}

describe('ChatMessage Model', () => {
  let testMessage: ChatMessageInput;
  let sessionId: mongoose.Types.ObjectId;
  let senderId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    sessionId = new mongoose.Types.ObjectId();
    senderId = new mongoose.Types.ObjectId();
    testMessage = {
      sessionId,
      senderId,
      content: 'Test message',
      type: 'text'
    };

    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
        return Promise.resolve(this);
      });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create chat message successfully', async () => {
      const message = await ChatMessage.create(testMessage);
      expect(message.sessionId).toEqual(testMessage.sessionId);
      expect(message.senderId).toEqual(testMessage.senderId);
      expect(message.content).toBe(testMessage.content);
      expect(message.type).toBe(testMessage.type);
    });

    it('should set default values correctly', async () => {
      const message = await ChatMessage.create({
        ...testMessage,
        type: undefined
      });
      expect(message.type).toBe('text');
      expect(message.createdAt).toBeDefined();
      expect(message.updatedAt).toBeDefined();
    });

    it('should handle virtual fields correctly', async () => {
      const message = await ChatMessage.create(testMessage);
      expect(message.userId).toBe(senderId.toString());
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const message = new ChatMessage({});
      const validationError = await message.validateSync();
      
      expect(validationError?.errors.sessionId).toBeDefined();
      expect(validationError?.errors.senderId).toBeDefined();
      expect(validationError?.errors.content).toBeDefined();
    });

    it('should reject invalid type values', async () => {
      const message = new ChatMessage({
        ...testMessage,
        type: 'invalid' as any
      });

      const validationError = await message.validateSync();
      expect(validationError?.errors.type).toBeDefined();
    });

    it('should reject invalid ObjectId references', async () => {
      const message = new ChatMessage({
        ...testMessage,
        sessionId: 'invalid',
        senderId: 'invalid'
      });

      const validationError = await message.validateSync();
      expect(validationError?.errors.sessionId).toBeDefined();
      expect(validationError?.errors.senderId).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in content', async () => {
      const message = await ChatMessage.create({
        ...testMessage,
        content: '  Test message with spaces  '
      });
      expect(message.content).toBe('Test message with spaces');
    });

    it('should handle timestamp updates on modification', async () => {
      const message = await ChatMessage.create(testMessage);
      const originalUpdatedAt = message.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
      message.content = 'Updated content';
      await message.save();

      expect(message.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should handle system message type', async () => {
      const systemMessage = await ChatMessage.create({
        ...testMessage,
        type: 'system',
        content: 'User joined the chat'
      });
      expect(systemMessage.type).toBe('system');
      expect(systemMessage.content).toBe('User joined the chat');
    });
  });
}); 