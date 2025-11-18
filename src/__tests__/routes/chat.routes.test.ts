import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../utils/test-server';
import { ChatController } from '../../controllers/chat.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/chat.controller');

describe('Chat Routes', () => {
  let app: Express;
  let authToken: string;

  const mockMessages = [
    {
      id: 'msg1',
      sessionId: 'session123',
      senderId: 'user123',
      content: 'Hello everyone!',
      type: 'text',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'msg2',
      sessionId: 'session123',
      senderId: 'user456',
      content: 'Hi there!',
      type: 'text',
      createdAt: '2024-01-01T10:01:00Z'
    }
  ];

  const mockParticipants = [
    {
      userId: 'user123',
      username: 'john_doe',
      status: 'joined',
      joinedAt: '2024-01-01T09:55:00Z'
    },
    {
      userId: 'user456',
      username: 'jane_doe',
      status: 'joined',
      joinedAt: '2024-01-01T09:56:00Z'
    }
  ];

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /sessions/:sessionId/messages', () => {
    it('should get session messages successfully', async () => {
      (ChatController.getSessionMessages as jest.Mock).mockImplementation((req, res) => {
        res.json(mockMessages);
      });

      const response = await request(app)
        .get('/api/chat/sessions/session123/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMessages);
    });

    it('should handle pagination parameters', async () => {
      (ChatController.getSessionMessages as jest.Mock).mockImplementation((req, res) => {
        res.json(mockMessages.slice(0, 1));
      });

      const response = await request(app)
        .get('/api/chat/sessions/session123/messages')
        .query({ before: '2024-01-01T10:01:00Z', limit: '1' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should handle non-existent session', async () => {
      (ChatController.getSessionMessages as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ message: 'Session not found' });
      });

      const response = await request(app)
        .get('/api/chat/sessions/nonexistent/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Session not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/chat/sessions/session123/messages');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('POST /sessions/:sessionId/messages', () => {
    const validMessage = {
      content: 'Hello everyone!'
    };

    it('should send message successfully', async () => {
      const mockNewMessage = {
        id: 'msg3',
        sessionId: 'session123',
        senderId: 'user123',
        content: validMessage.content,
        type: 'text',
        createdAt: '2024-01-01T10:02:00Z'
      };

      (ChatController.sendMessage as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockNewMessage);
      });

      const response = await request(app)
        .post('/api/chat/sessions/session123/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validMessage);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockNewMessage);
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post('/api/chat/sessions/session123/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle non-existent session', async () => {
      (ChatController.sendMessage as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ message: 'Session not found' });
      });

      const response = await request(app)
        .post('/api/chat/sessions/nonexistent/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validMessage);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Session not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/chat/sessions/session123/messages')
        .send(validMessage);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /sessions/:sessionId/participants', () => {
    it('should get active participants successfully', async () => {
      (ChatController.getActiveParticipants as jest.Mock).mockImplementation((req, res) => {
        res.json(mockParticipants);
      });

      const response = await request(app)
        .get('/api/chat/sessions/session123/participants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParticipants);
    });

    it('should handle non-existent session', async () => {
      (ChatController.getActiveParticipants as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ message: 'Session not found' });
      });

      const response = await request(app)
        .get('/api/chat/sessions/nonexistent/participants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Session not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/chat/sessions/session123/participants');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });
}); 