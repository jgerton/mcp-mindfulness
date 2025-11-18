import { Request, Response } from 'express';
import { ChatController } from '../../controllers/chat.controller';
import { ChatService } from '../../services/chat.service';
import mongoose from 'mongoose';

jest.mock('../../services/chat.service');

describe('ChatController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSessionId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mockReq = {
      params: { sessionId: mockSessionId },
      query: {},
      body: {},
      user: { _id: mockUserId },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getSessionMessages', () => {
    const mockMessages = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        sessionId: mockSessionId,
        userId: mockUserId,
        content: 'Test message 1',
        timestamp: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        sessionId: mockSessionId,
        userId: mockUserId,
        content: 'Test message 2',
        timestamp: new Date(),
      },
    ];

    it('should return messages successfully without query params', async () => {
      (ChatService.getSessionMessages as jest.Mock).mockResolvedValue(mockMessages);

      await ChatController.getSessionMessages(mockReq as Request, mockRes as Response);

      expect(ChatService.getSessionMessages).toHaveBeenCalledWith(
        mockSessionId,
        { before: undefined, limit: undefined }
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should return messages with pagination params', async () => {
      const beforeDate = new Date();
      mockReq.query = {
        before: beforeDate.toISOString(),
        limit: '10',
      };

      (ChatService.getSessionMessages as jest.Mock).mockResolvedValue(mockMessages);

      await ChatController.getSessionMessages(mockReq as Request, mockRes as Response);

      expect(ChatService.getSessionMessages).toHaveBeenCalledWith(
        mockSessionId,
        { before: beforeDate, limit: 10 }
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to fetch messages');
      (ChatService.getSessionMessages as jest.Mock).mockRejectedValue(error);

      await ChatController.getSessionMessages(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('sendMessage', () => {
    const mockMessage = {
      _id: new mongoose.Types.ObjectId().toString(),
      sessionId: mockSessionId,
      userId: mockUserId,
      content: 'Test message',
      timestamp: new Date(),
    };

    beforeEach(() => {
      mockReq.body = { content: 'Test message' };
    });

    it('should send message successfully', async () => {
      (ChatService.addMessage as jest.Mock).mockResolvedValue(mockMessage);

      await ChatController.sendMessage(mockReq as Request, mockRes as Response);

      expect(ChatService.addMessage).toHaveBeenCalledWith(
        mockSessionId,
        mockUserId,
        'Test message'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockMessage);
    });

    it('should return 400 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await ChatController.sendMessage(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
      expect(ChatService.addMessage).not.toHaveBeenCalled();
    });

    it('should return 400 if content is missing', async () => {
      mockReq.body = {};

      await ChatController.sendMessage(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
      expect(ChatService.addMessage).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to send message');
      (ChatService.addMessage as jest.Mock).mockRejectedValue(error);

      await ChatController.sendMessage(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('getActiveParticipants', () => {
    const mockParticipants = [
      { userId: new mongoose.Types.ObjectId().toString(), status: 'joined' },
      { userId: new mongoose.Types.ObjectId().toString(), status: 'joined' },
      { userId: new mongoose.Types.ObjectId().toString(), status: 'left' },
    ];

    const mockSession = {
      _id: mockSessionId,
      participants: mockParticipants,
    };

    it('should return active participants successfully', async () => {
      (ChatService.getSessionParticipants as jest.Mock).mockResolvedValue(mockSession);

      await ChatController.getActiveParticipants(mockReq as Request, mockRes as Response);

      expect(ChatService.getSessionParticipants).toHaveBeenCalledWith(mockSessionId);
      expect(mockRes.json).toHaveBeenCalledWith(
        mockParticipants.filter(p => p.status === 'joined')
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to fetch participants');
      (ChatService.getSessionParticipants as jest.Mock).mockRejectedValue(error);

      await ChatController.getActiveParticipants(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
}); 