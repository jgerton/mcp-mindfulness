import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../utils/test-server';
import { FriendController } from '../../controllers/friend.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/friend.controller');

describe('Friend Routes', () => {
  let app: Express;
  let authToken: string;

  const mockUser = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockFriend = {
    id: 'friend123',
    username: 'frienduser',
    email: 'friend@example.com'
  };

  const mockRequest = {
    id: 'request123',
    senderId: mockUser.id,
    receiverId: mockFriend.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /requests/send/:userId', () => {
    it('should send friend request', async () => {
      (FriendController.sendFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockRequest);
      });

      const response = await request(app)
        .post(`/api/friends/requests/send/${mockFriend.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockRequest);
    });

    it('should handle already sent request', async () => {
      (FriendController.sendFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Friend request already sent' });
      });

      const response = await request(app)
        .post(`/api/friends/requests/send/${mockFriend.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle self friend request', async () => {
      const response = await request(app)
        .post(`/api/friends/requests/send/${mockUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /requests', () => {
    it('should get pending friend requests', async () => {
      const mockRequests = [mockRequest];
      (FriendController.getPendingRequests as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ requests: mockRequests });
      });

      const response = await request(app)
        .get('/api/friends/requests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.requests).toEqual(mockRequests);
    });

    it('should handle no pending requests', async () => {
      (FriendController.getPendingRequests as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ requests: [] });
      });

      const response = await request(app)
        .get('/api/friends/requests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.requests).toHaveLength(0);
    });
  });

  describe('PUT /requests/:requestId/accept', () => {
    it('should accept friend request', async () => {
      const acceptedRequest = { ...mockRequest, status: 'accepted' };
      (FriendController.acceptFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(acceptedRequest);
      });

      const response = await request(app)
        .put(`/api/friends/requests/${mockRequest.id}/accept`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('accepted');
    });

    it('should handle non-existent request', async () => {
      (FriendController.acceptFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Friend request not found' });
      });

      const response = await request(app)
        .put('/api/friends/requests/nonexistent/accept')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /requests/:requestId/reject', () => {
    it('should reject friend request', async () => {
      const rejectedRequest = { ...mockRequest, status: 'rejected' };
      (FriendController.rejectFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(rejectedRequest);
      });

      const response = await request(app)
        .put(`/api/friends/requests/${mockRequest.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');
    });

    it('should handle already processed request', async () => {
      (FriendController.rejectFriendRequest as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Request already processed' });
      });

      const response = await request(app)
        .put(`/api/friends/requests/${mockRequest.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /list', () => {
    it('should get friend list', async () => {
      const mockFriends = [mockFriend];
      (FriendController.getFriendList as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ friends: mockFriends });
      });

      const response = await request(app)
        .get('/api/friends/list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.friends).toEqual(mockFriends);
    });

    it('should handle empty friend list', async () => {
      (FriendController.getFriendList as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ friends: [] });
      });

      const response = await request(app)
        .get('/api/friends/list')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.friends).toHaveLength(0);
    });
  });

  describe('DELETE /remove/:friendId', () => {
    it('should remove friend', async () => {
      (FriendController.removeFriend as jest.Mock).mockImplementation((req, res) => {
        res.sendStatus(204);
      });

      const response = await request(app)
        .delete(`/api/friends/remove/${mockFriend.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should handle non-existent friend', async () => {
      (FriendController.removeFriend as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Friend not found' });
      });

      const response = await request(app)
        .delete('/api/friends/remove/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 