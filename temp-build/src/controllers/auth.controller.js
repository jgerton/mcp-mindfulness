"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_model_1 = require("../models/user.model");
const jwt_utils_1 = require("../utils/jwt.utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                // Check if user already exists
                const existingUser = yield user_model_1.User.findOne({ $or: [{ email }, { username }] });
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                // Hash password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                // Create new user
                const user = yield user_model_1.User.create({
                    username,
                    email,
                    password: hashedPassword,
                    friendIds: [],
                    blockedUserIds: []
                });
                // Generate token
                const token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.username);
                res.status(201).json({
                    token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Find user
                const user = yield user_model_1.User.findOne({ email });
                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                // Check password
                const isMatch = yield bcryptjs_1.default.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                // Generate token
                const token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.username);
                res.json({
                    token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: 'Not authenticated' });
                }
                // Generate new token
                const token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.username);
                res.json({ token });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.AuthController = AuthController;
