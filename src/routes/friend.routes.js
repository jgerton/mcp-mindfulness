"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const friend_controller_1 = require("../controllers/friend.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Get friend list
router.get('/', async (req, res) => {
    try {
        await friend_controller_1.FriendController.getFriendList(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Send friend request
router.post('/requests/send/:userId', async (req, res) => {
    try {
        await friend_controller_1.FriendController.sendFriendRequest(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Accept friend request
router.post('/requests/accept/:userId', async (req, res) => {
    try {
        await friend_controller_1.FriendController.acceptFriendRequest(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Reject friend request
router.post('/requests/reject/:userId', async (req, res) => {
    try {
        await friend_controller_1.FriendController.rejectFriendRequest(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get pending friend requests
router.get('/requests', async (req, res) => {
    try {
        await friend_controller_1.FriendController.getPendingRequests(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Remove friend
router.delete('/:userId', async (req, res) => {
    try {
        await friend_controller_1.FriendController.removeFriend(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
