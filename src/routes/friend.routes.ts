import express from 'express';
import { FriendController } from '../controllers/friend.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get friend list
router.get('/', async (req, res) => {
  try {
    await FriendController.getFriendList(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Send friend request
router.post('/requests/send/:userId', async (req, res) => {
  try {
    await FriendController.sendFriendRequest(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Accept friend request
router.post('/requests/accept/:userId', async (req, res) => {
  try {
    await FriendController.acceptFriendRequest(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Reject friend request
router.post('/requests/reject/:userId', async (req, res) => {
  try {
    await FriendController.rejectFriendRequest(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get pending friend requests
router.get('/requests', async (req, res) => {
  try {
    await FriendController.getPendingRequests(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Remove friend
router.delete('/:userId', async (req, res) => {
  try {
    await FriendController.removeFriend(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router; 