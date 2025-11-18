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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const user_model_1 = require("../../src/models/user.model");
const meditation_session_model_1 = require("../../src/models/meditation-session.model");
/**
 * Example MongoDB test demonstrating best practices for database testing
 *
 * This test file follows the standards established in our testing standards:
 * 1. Proper connection management with MongoMemoryServer
 * 2. Proper test setup and cleanup
 * 3. Proper ObjectId validation and comparison
 * 4. Proper error handling for database operations
 * 5. Isolation between tests
 */
describe('MongoDB Testing Example', () => {
    let mongoServer;
    // Set up the MongoDB Memory Server before all tests
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        yield mongoose_1.default.connect(uri);
        console.log('Connected to in-memory MongoDB server');
    }));
    // Close the connection and stop the server after all tests
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
        yield mongoServer.stop();
        console.log('Closed in-memory MongoDB server');
    }));
    // Clear all collections before each test
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            yield collection.deleteMany({});
        }
    }));
    describe('User Model', () => {
        it('should create a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            const user = yield user_model_1.User.create(userData);
            expect(user).toBeDefined();
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            // Password should be hashed, not stored as plaintext
            expect(user.password).not.toBe(userData.password);
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidUser = new user_model_1.User({
            // Missing required fields
            });
            // Use try/catch to validate errors
            try {
                yield invalidUser.validate();
                // If validation passes, fail the test
                fail('Validation should have failed');
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error.errors.username).toBeDefined();
                expect(error.errors.email).toBeDefined();
                expect(error.errors.password).toBeDefined();
            }
        }));
        it('should enforce unique email constraint', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create first user
            yield user_model_1.User.create({
                username: 'user1',
                email: 'duplicate@example.com',
                password: 'password123'
            });
            // Try to create second user with same email
            try {
                yield user_model_1.User.create({
                    username: 'user2',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });
                // If creation succeeds, fail the test
                fail('Should have thrown duplicate key error');
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error.code).toBe(11000); // MongoDB duplicate key error code
            }
        }));
    });
    describe('MeditationSession Model', () => {
        let userId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user for sessions
            const user = yield user_model_1.User.create({
                username: 'sessionuser',
                email: 'session@example.com',
                password: 'password123'
            });
            userId = user._id;
        }));
        it('should create a new meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionData = {
                userId,
                duration: 15,
                startTime: new Date(),
                endTime: new Date(Date.now() + 15 * 60 * 1000),
                completed: true,
                moodBefore: 'neutral',
                moodAfter: 'peaceful'
            };
            const session = yield meditation_session_model_1.MeditationSession.create(sessionData);
            expect(session).toBeDefined();
            expect(session.userId.toString()).toBe(userId.toString());
            expect(session.duration).toBe(sessionData.duration);
            expect(session.completed).toBe(sessionData.completed);
        }));
        it('should validate ObjectId references', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create session with invalid ObjectId
            const invalidSession = new meditation_session_model_1.MeditationSession({
                userId: 'invalid-id', // Not a valid ObjectId
                duration: 15,
                startTime: new Date()
            });
            try {
                yield invalidSession.validate();
                fail('Validation should have failed');
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error.errors.userId).toBeDefined();
            }
        }));
        it('should find sessions by user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions for the same user
            yield meditation_session_model_1.MeditationSession.create({
                userId,
                duration: 10,
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
                completed: true,
                moodBefore: 'stressed',
                moodAfter: 'calm'
            });
            yield meditation_session_model_1.MeditationSession.create({
                userId,
                duration: 15,
                startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 60 * 1000),
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'relaxed'
            });
            // Create a session for a different user
            const otherUser = yield user_model_1.User.create({
                username: 'otheruser',
                email: 'other@example.com',
                password: 'password123'
            });
            yield meditation_session_model_1.MeditationSession.create({
                userId: otherUser._id,
                duration: 20,
                startTime: new Date(),
                completed: false
            });
            // Find sessions for our test user
            const sessions = yield meditation_session_model_1.MeditationSession.find({ userId });
            expect(sessions).toBeDefined();
            expect(sessions).toHaveLength(2);
            // Verify all sessions belong to our user
            sessions.forEach(session => {
                expect(session.userId.toString()).toBe(userId.toString());
            });
        }));
        it('should handle complex queries with proper ObjectId comparison', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create sessions with different properties
            yield meditation_session_model_1.MeditationSession.create({
                userId,
                duration: 5,
                startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
                completed: true,
                moodBefore: 'neutral',
                moodAfter: 'neutral'
            });
            yield meditation_session_model_1.MeditationSession.create({
                userId,
                duration: 10,
                startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
                completed: true,
                moodBefore: 'stressed',
                moodAfter: 'calm'
            });
            yield meditation_session_model_1.MeditationSession.create({
                userId,
                duration: 15,
                startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            // Complex query: Find sessions with mood improvement, longer than 5 minutes, in the last 7 days
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const sessions = yield meditation_session_model_1.MeditationSession.find({
                userId: userId.toString(), // Test string comparison with ObjectId
                startTime: { $gte: oneWeekAgo },
                duration: { $gt: 5 },
                moodBefore: { $ne: 'peaceful' },
                moodAfter: 'peaceful'
            });
            expect(sessions).toBeDefined();
            expect(sessions).toHaveLength(1);
            expect(sessions[0].duration).toBe(15);
            expect(sessions[0].moodBefore).toBe('anxious');
            expect(sessions[0].moodAfter).toBe('peaceful');
        }));
    });
    describe('Error Handling', () => {
        it('should handle validation errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidSession = new meditation_session_model_1.MeditationSession({
            // Missing required fields
            });
            try {
                yield invalidSession.save();
                fail('Save should have failed');
            }
            catch (error) {
                expect(error).toBeDefined();
                expect(error instanceof mongoose_1.default.Error.ValidationError).toBe(true);
                // Check specific validation errors
                if (error instanceof mongoose_1.default.Error.ValidationError) {
                    expect(error.errors.userId).toBeDefined();
                    expect(error.errors.duration).toBeDefined();
                    expect(error.errors.startTime).toBeDefined();
                }
            }
        }));
        it('should handle database connection errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Simulate a connection error by closing the connection temporarily
            yield mongoose_1.default.connection.close();
            try {
                yield user_model_1.User.findOne({ username: 'nonexistent' });
                fail('Query should have failed due to closed connection');
            }
            catch (error) {
                expect(error).toBeDefined();
            }
            finally {
                // Reconnect for subsequent tests
                const uri = mongoServer.getUri();
                yield mongoose_1.default.connect(uri);
            }
        }));
    });
});
