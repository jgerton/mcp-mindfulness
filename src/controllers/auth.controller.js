"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_error_1 = require("../errors/http-error");
const error_codes_1 = require("../utils/error-codes");
const auth_1 = require("../utils/auth");
const jwt_1 = require("../utils/jwt");
class AuthController {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async register(req, res) {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new http_error_1.HttpError(400, 'Username, email and password are required', {
                code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                category: error_codes_1.ErrorCategory.VALIDATION
            });
        }
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new http_error_1.HttpError(409, 'Email already registered', {
                code: error_codes_1.ErrorCodes.DUPLICATE_ERROR,
                category: error_codes_1.ErrorCategory.VALIDATION
            });
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await this.userModel.create({
            username,
            email,
            password: hashedPassword
        });
        const token = (0, jwt_1.generateToken)(user.id, username);
        res.status(201).json({ token });
    }
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new http_error_1.HttpError(400, 'Email and password are required', {
                code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                category: error_codes_1.ErrorCategory.VALIDATION
            });
        }
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new http_error_1.HttpError(401, 'Invalid credentials', {
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: error_codes_1.ErrorCategory.AUTHENTICATION
            });
        }
        const isValid = await (0, auth_1.comparePasswords)(password, user.password);
        if (!isValid) {
            throw new http_error_1.HttpError(401, 'Invalid credentials', {
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: error_codes_1.ErrorCategory.AUTHENTICATION
            });
        }
        const token = (0, jwt_1.generateToken)(user.id, user.username || '');
        res.status(200).json({ token });
    }
    static async refreshToken(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            // Generate new token
            const token = (0, jwt_1.generateToken)(user._id.toString(), user.username);
            res.json({ token });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
