import express from 'express';
import { FriendController } from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Friend requests
router.post('/requests/send', FriendController.sendFriendRequest);
router.post('/requests/:requestId/accept', FriendController.acceptFriendRequest);
router.post('/requests/:requestId/reject', FriendController.rejectFriendRequest);
router.get('/requests/pending', FriendController.getPendingRequests);

// Friend management
router.get('/list', FriendController.getFriendList);
router.delete('/:friendId', FriendController.removeFriend);

// Blocking
router.post('/block/:targetUserId', FriendController.blockUser);
router.post('/unblock/:targetUserId', FriendController.unblockUser);
router.get('/blocked', FriendController.getBlockedUsers);

export default router; 