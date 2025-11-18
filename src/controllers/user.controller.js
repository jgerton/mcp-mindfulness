"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const base_controller_1 = require("../core/base.controller");
const user_model_1 = require("../models/user.model");
const http_error_1 = require("../errors/http-error");
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
class UserController extends base_controller_1.BaseController {
    constructor(userModel) {
        super(userModel);
    }
    async validateCreate(data) {
        if (!data.email || !data.password) {
            throw new http_error_1.HttpError(400, 'Email and password are required');
        }
        if (data.password.length < 8) {
            throw new http_error_1.HttpError(400, 'Password must be at least 8 characters');
        }
        if (!this.isValidEmail(data.email)) {
            throw new http_error_1.HttpError(400, 'Invalid email format', {
                code: errors_1.ErrorCodes.VALIDATION_ERROR,
                category: errors_1.ErrorCategory.VALIDATION,
                details: { field: 'email', constraint: 'format' }
            });
        }
        const existingUser = await this.model.findOne({ email: data.email });
        if (existingUser) {
            throw new http_error_1.HttpError(409, 'Email already registered', {
                code: errors_1.ErrorCodes.DUPLICATE_ERROR,
                category: errors_1.ErrorCategory.VALIDATION,
                details: { field: 'email', message: 'Email already registered' }
            });
        }
    }
    async validateUpdate(data) {
        if (data.password && data.password.length < 8) {
            throw new http_error_1.HttpError(400, 'Password must be at least 8 characters', {
                code: errors_1.ErrorCodes.VALIDATION_ERROR,
                category: errors_1.ErrorCategory.VALIDATION,
                details: { field: 'password', constraint: 'complexity' }
            });
        }
        if (data.email) {
            if (!this.isValidEmail(data.email)) {
                throw new http_error_1.HttpError(400, 'Invalid email format', {
                    code: errors_1.ErrorCodes.VALIDATION_ERROR,
                    category: errors_1.ErrorCategory.VALIDATION,
                    details: { field: 'email', constraint: 'format' }
                });
            }
            const existingUser = await this.model.findOne({
                email: data.email,
                _id: { $ne: data._id }
            });
            if (existingUser) {
                throw new http_error_1.HttpError(409, 'Email already in use', {
                    code: errors_1.ErrorCodes.DUPLICATE_ERROR,
                    category: errors_1.ErrorCategory.VALIDATION,
                    details: { field: 'email', message: 'Email already in use' }
                });
            }
        }
    }
    buildFilterQuery(query) {
        const filter = {};
        if (query.email) {
            filter.email = new RegExp(query.email, 'i');
        }
        if (query.role) {
            filter.role = query.role;
        }
        if (query.active !== undefined) {
            filter.active = query.active === 'true';
        }
        return filter;
    }
    // Custom methods
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new http_error_1.HttpError(400, 'Email and password are required');
        }
        const user = await this.model.findOne({ email });
        if (!user) {
            throw new http_error_1.HttpError(401, 'Invalid credentials', {
                code: errors_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: errors_1.ErrorCategory.AUTHENTICATION,
                details: { message: 'Invalid email or password' }
            });
        }
        const isValid = await (0, auth_1.comparePasswords)(password, user.password);
        if (!isValid) {
            throw new http_error_1.HttpError(401, 'Invalid credentials', {
                code: errors_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: errors_1.ErrorCategory.AUTHENTICATION,
                details: { message: 'Invalid email or password' }
            });
        }
        // Remove password from response
        const userResponse = user.toObject();
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(200).json(userWithoutPassword);
    }
    async updatePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;
        if (!currentPassword || !newPassword) {
            throw new http_error_1.HttpError(400, 'Current and new password are required');
        }
        if (newPassword.length < 8) {
            throw new http_error_1.HttpError(400, 'New password must be at least 8 characters', {
                code: errors_1.ErrorCodes.VALIDATION_ERROR,
                category: errors_1.ErrorCategory.VALIDATION,
                details: { field: 'password', constraint: 'complexity' }
            });
        }
        const user = await this.model.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, 'User not found', {
                code: errors_1.ErrorCodes.NOT_FOUND,
                category: errors_1.ErrorCategory.NOT_FOUND,
                details: { resourceType: 'user' }
            });
        }
        const isValid = await (0, auth_1.comparePasswords)(currentPassword, user.password);
        if (!isValid) {
            throw new http_error_1.HttpError(401, 'Current password is incorrect');
        }
        user.password = await (0, auth_1.hashPassword)(newPassword);
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    async getProfile(req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            throw new http_error_1.HttpError(401, 'Unauthorized');
        }
        const user = await this.model.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, 'User not found', {
                code: errors_1.ErrorCodes.NOT_FOUND,
                category: errors_1.ErrorCategory.NOT_FOUND,
                details: { resourceType: 'user' }
            });
        }
        const userResponse = user.toObject();
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(200).json(userWithoutPassword);
    }
    async updateProfile(req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            throw new http_error_1.HttpError(401, 'Unauthorized');
        }
        await this.validateUpdate({ ...req.body, _id: userId });
        const updateData = req.body;
        if (updateData.password) {
            updateData.password = await (0, auth_1.hashPassword)(updateData.password);
        }
        const user = await this.model.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        if (!user) {
            throw new http_error_1.HttpError(404, 'User not found');
        }
        const userResponse = user.toObject();
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(200).json(userWithoutPassword);
    }
    async getStats(req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            throw new http_error_1.HttpError(401, 'Unauthorized');
        }
        const user = await this.model.findById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, 'User not found');
        }
        // Get user stats from various services
        // TODO: Implement actual stats gathering
        const stats = {
            totalSessions: 0,
            totalMinutes: 0,
            averageSessionLength: 0,
            streakDays: 0,
            lastSessionDate: null
        };
        res.status(200).json(stats);
    }
    // Override create to hash password
    async create(req, res) {
        await this.validateCreate(req.body);
        const hashedPassword = await (0, auth_1.hashPassword)(req.body.password);
        const [user] = await this.model.create([{
                ...req.body,
                password: hashedPassword
            }]);
        const userResponse = user.toObject();
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(201).json(userWithoutPassword);
    }
    // Override update to handle password hashing
    async update(req, res) {
        const userId = req.params.id;
        await this.validateUpdate({ ...req.body, _id: userId });
        const updateData = req.body;
        if (updateData.password) {
            updateData.password = await (0, auth_1.hashPassword)(updateData.password);
        }
        const user = await this.model.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        if (!user) {
            throw new http_error_1.HttpError(404, 'User not found');
        }
        const userResponse = user.toObject();
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(200).json(userWithoutPassword);
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Get user stats
    static async getStats(req, res) {
        var _a;
        try {
            const user = await user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Here you would typically aggregate meditation sessions, achievements, etc.
            // For now, return placeholder stats
            return res.json({
                totalMeditations: 0,
                totalMinutes: 0,
                streak: 0,
                achievements: []
            });
        }
        catch (error) {
            console.error('Error getting user stats:', error);
            return res.status(500).json({ message: 'Error fetching user stats' });
        }
    }
}
exports.UserController = UserController;
