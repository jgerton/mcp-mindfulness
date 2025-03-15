"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Get user profile
router.get('/profile', (req, res) => {
    user_controller_1.UserController.getProfile(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
// Update user profile
router.put('/profile', (req, res) => {
    user_controller_1.UserController.updateProfile(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
// Get user stats
router.get('/stats', (req, res) => {
    user_controller_1.UserController.getStats(req, res)
        .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});
exports.default = router;
