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
const group_session_service_1 = require("../../services/group-session.service");
const group_session_model_1 = require("../../models/group-session.model");
const user_model_1 = require("../../models/user.model");
const achievement_service_1 = require("../../services/achievement.service");
const chat_service_1 = require("../../services/chat.service");
const friend_service_1 = require("../../services/friend.service");
const db_handler_1 = require("../test-utils/db-handler");
const user_factory_1 = require("../factories/user.factory");
// Mock external services
jest.mock('../../services/achievement.service');
jest.mock('../../services/chat.service');
jest.mock('../../services/friend.service');
describe('GroupSessionService', () => {
    let hostId;
    let meditationId;
    let userFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        hostId = new mongoose_1.default.Types.ObjectId();
        meditationId = new mongoose_1.default.Types.ObjectId();
        userFactory = new user_factory_1.UserTestFactory();
        jest.clearAllMocks();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('createSession', () => {
        it('should create a new group session', () => __awaiter(void 0, void 0, void 0, function* () {
            const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', scheduledTime, 1800, // 30 minutes
            {
                description: 'Test Description',
                maxParticipants: 5,
                isPrivate: true,
                allowedParticipants: [new mongoose_1.default.Types.ObjectId().toString()]
            });
            expect(session._id).toBeDefined();
            expect(session.hostId).toEqual(hostId);
            expect(session.status).toBe('scheduled');
            expect(session.participants).toHaveLength(0);
        }));
        it('should reject sessions scheduled in the past', () => __awaiter(void 0, void 0, void 0, function* () {
            const pastTime = new Date(Date.now() - 3600000); // 1 hour ago
            yield expect(group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', pastTime, 1800)).rejects.toThrow('Cannot schedule session in the past');
        }));
    });
    describe('joinSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', new Date(Date.now() + 3600000), 1800);
            sessionId = session._id.toString();
        }));
        it('should allow user to join session', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
            expect(session.participants).toHaveLength(1);
            expect(session.participants[0].userId).toEqual(userId);
            expect(session.participants[0].status).toBe('joined');
        }));
        it('should prevent joining full sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            session.maxParticipants = 1;
            yield session.save();
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, new mongoose_1.default.Types.ObjectId().toString());
            yield expect(group_session_service_1.GroupSessionService.joinSession(sessionId, new mongoose_1.default.Types.ObjectId().toString())).rejects.toThrow('Session is full');
        }));
    });
    describe('startSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', new Date(Date.now() + 3600000), 1800);
            sessionId = session._id.toString();
        }));
        it('should start session and initialize participant data', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
            const session = yield group_session_service_1.GroupSessionService.startSession(sessionId, hostId.toString());
            expect(session.status).toBe('in_progress');
            expect(session.participants.every(p => p.sessionData.startTime)).toBe(true);
        }));
        it('should add host as participant if not joined', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.startSession(sessionId, hostId.toString());
            const hostParticipant = session.participants.find(p => p.userId.equals(hostId));
            expect(hostParticipant).toBeDefined();
            expect(hostParticipant.status).toBe('joined');
        }));
    });
    describe('completeSession', () => {
        let sessionId;
        let userId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            userId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', new Date(Date.now() + 3600000), 1800);
            sessionId = session._id.toString();
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
            yield group_session_service_1.GroupSessionService.startSession(sessionId, hostId.toString());
        }));
        it('should complete participant session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.completeSession(sessionId, userId.toString(), { durationCompleted: 1800 });
            const participant = session.participants.find(p => p.userId.equals(userId));
            expect(participant.status).toBe('completed');
            expect(participant.duration).toBe(1800);
        }));
        it('should process achievements for sessions with 3+ participants', () => __awaiter(void 0, void 0, void 0, function* () {
            // Add more participants
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, new mongoose_1.default.Types.ObjectId().toString());
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, new mongoose_1.default.Types.ObjectId().toString());
            yield group_session_service_1.GroupSessionService.completeSession(sessionId, userId.toString(), { durationCompleted: 1800 });
            expect(achievement_service_1.AchievementService.processGroupSession).toHaveBeenCalledWith(userId.toString());
        }));
    });
    describe('leaveSession', () => {
        let sessionId;
        let userId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            userId = new mongoose_1.default.Types.ObjectId();
            const user = userFactory.create({ _id: userId, username: 'TestUser' });
            yield user_model_1.User.create(user);
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', new Date(Date.now() + 3600000), 1800);
            sessionId = session._id.toString();
            yield group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
        }));
        it('should mark participant as left and add system message', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.leaveSession(sessionId, userId.toString());
            const participant = session.participants.find(p => p.userId.equals(userId));
            expect(participant.status).toBe('left');
            expect(chat_service_1.ChatService.addMessage).toHaveBeenCalledWith(sessionId, userId.toString(), 'TestUser has left the session', 'system');
        }));
    });
    describe('getUpcomingSessions', () => {
        let userId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            userId = new mongoose_1.default.Types.ObjectId();
            const user = userFactory.create({ _id: userId });
            yield user_model_1.User.create(user);
            // Mock friend list
            friend_service_1.FriendService.getFriendList.mockResolvedValue([
                { requesterId: userId, recipientId: new mongoose_1.default.Types.ObjectId() }
            ]);
        }));
        it('should return accessible upcoming sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create public session
            yield group_session_service_1.GroupSessionService.createSession(new mongoose_1.default.Types.ObjectId().toString(), meditationId.toString(), 'Public Session', new Date(Date.now() + 3600000), 1800);
            // Create private session where user is host
            yield group_session_service_1.GroupSessionService.createSession(userId.toString(), meditationId.toString(), 'Private Session', new Date(Date.now() + 3600000), 1800, { isPrivate: true });
            const sessions = yield group_session_service_1.GroupSessionService.getUpcomingSessions(userId.toString());
            expect(sessions).toHaveLength(2);
        }));
    });
    describe('cancelSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId.toString(), 'Test Session', new Date(Date.now() + 3600000), 1800);
            sessionId = session._id.toString();
        }));
        it('should cancel session and notify participants', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_service_1.GroupSessionService.cancelSession(sessionId, hostId.toString());
            expect(session.status).toBe('cancelled');
            expect(chat_service_1.ChatService.addMessage).toHaveBeenCalledWith(sessionId, hostId.toString(), 'Session has been cancelled by the host', 'system');
        }));
        it('should only allow host to cancel session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(group_session_service_1.GroupSessionService.cancelSession(sessionId, new mongoose_1.default.Types.ObjectId().toString())).rejects.toThrow('Session not found or cannot be cancelled');
        }));
    });
});
