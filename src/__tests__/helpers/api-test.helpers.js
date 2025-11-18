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
exports.AchievementApiTestHelper = exports.ApiTestHelper = exports.API_TEST_TIMEOUT = void 0;
exports.createAchievementApiTestHelper = createAchievementApiTestHelper;
const mongoose_1 = __importDefault(require("mongoose"));
const achievement_model_1 = require("../../models/achievement.model");
const test_server_1 = require("../utils/test-server");
/**
 * Standard timeout for API tests
 */
exports.API_TEST_TIMEOUT = 10000;
/**
 * Base API test helper class
 */
class ApiTestHelper {
    /**
     * Create a new API test helper
     * @param config Test configuration
     */
    constructor(config = {}) {
        this.mockAuthMiddleware = null;
        this.server = new test_server_1.TestServer();
        this.config = Object.assign({ setupAuth: true, autoCleanup: true }, config);
        this.testUser = this.config.user || {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            username: 'testuser',
            role: 'user'
        };
    }
    /**
     * Set up mock authentication middleware
     */
    setupMockAuth() {
        // Only set up mock auth if requested
        if (!this.config.setupAuth) {
            console.log('Auth setup skipped based on config');
            return;
        }
        console.log('Setting up mock auth middleware');
        // Mock the authentication middleware
        const authMiddleware = require('../../middleware/auth.middleware');
        const jwtUtils = require('../../utils/jwt.utils');
        console.log('Auth middleware imported:', Object.keys(authMiddleware));
        // Mock the JWT verification
        jest.spyOn(jwtUtils, 'verifyToken').mockImplementation(() => {
            return { _id: '507f1f77bcf86cd799439011', username: 'testuser' };
        });
        // Mock the authentication middleware
        this.mockAuthMiddleware = jest.spyOn(authMiddleware, 'authenticateToken')
            .mockImplementation(function (req, res, next) {
            console.log('Mock auth middleware called');
            req.user = {
                _id: '507f1f77bcf86cd799439011',
                username: 'testuser',
                email: 'test@example.com',
                lastLogin: new Date(),
                isActive: true
            };
            next();
        });
        console.log('Mock auth setup complete, spy created:', !!this.mockAuthMiddleware);
    }
    /**
     * Clean up resources after tests
     */
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            // Restore mocks
            if (this.mockAuthMiddleware) {
                this.mockAuthMiddleware.mockRestore();
            }
            // Close server
            yield this.server.close();
        });
    }
    /**
     * Get a supertest agent for the server
     */
    getAgent() {
        // Add authorization header directly in tests instead of here
        return this.server.getAgent();
    }
    /**
     * Log the current connection state
     */
    logConnectionState() {
        this.server.logConnectionState();
    }
}
exports.ApiTestHelper = ApiTestHelper;
/**
 * Achievement API test helper class
 */
class AchievementApiTestHelper extends ApiTestHelper {
    constructor() {
        super(...arguments);
        this.testAchievements = [];
    }
    /**
     * Set up test data for achievement tests
     */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            // Start the server
            yield this.server.start();
            // Set up mock authentication
            this.setupMockAuth();
            // Create test achievements
            yield this.createTestAchievements();
        });
    }
    /**
     * Clean up test data and resources
     */
    cleanup() {
        const _super = Object.create(null, {
            cleanup: { get: () => super.cleanup }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.autoCleanup) {
                yield this.clearTestData();
            }
            yield _super.cleanup.call(this);
        });
    }
    /**
     * Create test achievements for testing
     */
    createTestAchievements() {
        return __awaiter(this, void 0, void 0, function* () {
            // Define test achievements
            const achievements = [
                {
                    name: 'Test Achievement 1',
                    description: 'First test achievement',
                    category: achievement_model_1.AchievementCategory.TIME,
                    type: achievement_model_1.AchievementType.BRONZE,
                    threshold: 5,
                    icon: 'test-icon-1.png',
                    points: 10,
                    criteria: {
                        type: 'time',
                        value: 5
                    }
                },
                {
                    name: 'Test Achievement 2',
                    description: 'Second test achievement',
                    category: achievement_model_1.AchievementCategory.STREAK,
                    type: achievement_model_1.AchievementType.SILVER,
                    threshold: 10,
                    icon: 'test-icon-2.png',
                    points: 20,
                    criteria: {
                        type: 'streak',
                        value: 10
                    }
                },
                {
                    name: 'Test Achievement 3',
                    description: 'Third test achievement',
                    category: achievement_model_1.AchievementCategory.MILESTONE,
                    type: achievement_model_1.AchievementType.GOLD,
                    threshold: 15,
                    icon: 'test-icon-3.png',
                    points: 30,
                    criteria: {
                        type: 'milestone',
                        value: 15
                    }
                }
            ];
            // Insert achievements into the database
            this.testAchievements = yield achievement_model_1.Achievement.insertMany(achievements);
        });
    }
    /**
     * Clear test data
     */
    clearTestData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield achievement_model_1.Achievement.deleteMany({});
        });
    }
    /**
     * Get all test achievements
     */
    getAchievements() {
        return this.testAchievements;
    }
    /**
     * Get a specific achievement by ID
     */
    getAchievement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield achievement_model_1.Achievement.findById(id);
        });
    }
    /**
     * Generate an invalid Object ID
     */
    getInvalidId() {
        return 'invalid-id';
    }
    /**
     * Generate a non-existent but valid Object ID
     */
    getNonExistentId() {
        return new mongoose_1.default.Types.ObjectId().toString();
    }
}
exports.AchievementApiTestHelper = AchievementApiTestHelper;
/**
 * Create a new achievement API test helper
 */
function createAchievementApiTestHelper(config = {}) {
    return new AchievementApiTestHelper(config);
}
