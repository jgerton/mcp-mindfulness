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
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
/**
 * Example MongoDB test with proper connection management
 *
 * This test file demonstrates best practices for:
 * - MongoDB Memory Server setup
 * - Connection management
 * - Collection clearing
 * - ObjectId handling
 * - Error handling
 */
describe('MongoDB Testing Example', () => {
    let mongoServer;
    // Set up MongoDB Memory Server before all tests
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        yield mongoose_1.default.connect(uri);
        console.log('Connected to in-memory MongoDB server');
    }));
    // Close connection and stop server after all tests
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
        it('should create and save a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            const user = new user_model_1.User(userData);
            const savedUser = yield user.save();
            // Check that the user was saved with an ID
            expect(savedUser._id).toBeDefined();
            expect(savedUser.username).toBe(userData.username);
            expect(savedUser.email).toBe(userData.email);
            // Verify we can find the user
            const foundUser = yield user_model_1.User.findById(savedUser._id);
            expect(foundUser).toBeDefined();
            expect(foundUser.username).toBe(userData.username);
        }));
        it('should fail when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidUser = new user_model_1.User({
            // Missing required fields
            });
            // Expect validation error
            yield expect(invalidUser.save()).rejects.toThrow();
        }));
    });
    describe('Session Model', () => {
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
        it('should create and save a session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionData = {
                userId,
                duration: 10,
                type: 'breathing',
                stressLevelBefore: 7,
                startTime: new Date(),
                completed: false
            };
            const session = new session_model_1.Session(sessionData);
            const savedSession = yield session.save();
            // Check that the session was saved with an ID
            expect(savedSession._id).toBeDefined();
            expect(savedSession.userId.toString()).toBe(userId.toString());
            expect(savedSession.duration).toBe(sessionData.duration);
            // Verify we can find the session
            const foundSession = yield session_model_1.Session.findById(savedSession._id);
            expect(foundSession).toBeDefined();
            expect(foundSession.userId.toString()).toBe(userId.toString());
        }));
        it('should properly handle ObjectId comparisons', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a session
            const session = yield session_model_1.Session.create({
                userId,
                duration: 10,
                type: 'breathing',
                stressLevelBefore: 7,
                startTime: new Date(),
                completed: false
            });
            // Find sessions by userId
            const sessions = yield session_model_1.Session.find({ userId });
            expect(sessions).toHaveLength(1);
            // Compare ObjectIds correctly (as strings)
            expect(sessions[0]._id.toString()).toBe(session._id.toString());
            expect(sessions[0].userId.toString()).toBe(userId.toString());
            // This would fail because ObjectIds are objects, not strings
            // expect(sessions[0]._id).toBe(session._id); // INCORRECT
            // This would also fail because ObjectIds are objects, not strings
            // expect(sessions[0].userId).toBe(userId); // INCORRECT
        }));
        it('should validate ObjectIds before querying', () => __awaiter(void 0, void 0, void 0, function* () {
            // Invalid ObjectId
            const invalidId = 'not-an-object-id';
            // Validate before querying
            const isValid = mongoose_1.default.Types.ObjectId.isValid(invalidId);
            expect(isValid).toBe(false);
            // Only query if valid
            if (isValid) {
                yield session_model_1.Session.findById(invalidId);
            }
            else {
                // Handle invalid ID case
                const error = new Error('Invalid ID format');
                expect(error.message).toBe('Invalid ID format');
            }
        }));
        it('should handle non-existent documents gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a valid but non-existent ObjectId
            const nonExistentId = new mongoose_1.default.Types.ObjectId();
            // Find by non-existent ID
            const session = yield session_model_1.Session.findById(nonExistentId);
            // Should return null, not throw an error
            expect(session).toBeNull();
        }));
    });
    describe('Relationships', () => {
        it('should handle relationships between models correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a user
            const user = yield user_model_1.User.create({
                username: 'relationuser',
                email: 'relation@example.com',
                password: 'password123'
            });
            // Create multiple sessions for the user
            yield session_model_1.Session.create([
                {
                    userId: user._id,
                    duration: 10,
                    type: 'breathing',
                    stressLevelBefore: 7,
                    startTime: new Date(),
                    completed: true,
                    endTime: new Date(),
                    stressLevelAfter: 4
                },
                {
                    userId: user._id,
                    duration: 15,
                    type: 'pmr',
                    stressLevelBefore: 8,
                    startTime: new Date(),
                    completed: false
                }
            ]);
            // Find all sessions for the user
            const sessions = yield session_model_1.Session.find({ userId: user._id });
            // Verify relationship
            expect(sessions).toHaveLength(2);
            sessions.forEach(session => {
                expect(session.userId.toString()).toBe(user._id.toString());
            });
            // Verify we can filter by additional criteria
            const completedSessions = yield session_model_1.Session.find({
                userId: user._id,
                completed: true
            });
            expect(completedSessions).toHaveLength(1);
            expect(completedSessions[0].type).toBe('breathing');
        }));
    });
});
