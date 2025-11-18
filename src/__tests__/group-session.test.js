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
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const group_session_model_1 = require("../models/group-session.model");
const meditation_model_1 = require("../models/meditation.model");
const group_session_service_1 = require("../services/group-session.service");
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.User.deleteMany({});
    yield group_session_model_1.GroupSession.deleteMany({});
    yield meditation_model_1.Meditation.deleteMany({});
}));
describe('Group Session System', () => {
    let host;
    let participant1;
    let participant2;
    let meditation;
    let session;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.User.deleteMany({});
        yield group_session_model_1.GroupSession.deleteMany({});
        yield meditation_model_1.Meditation.deleteMany({});
        // Create test users
        host = yield user_model_1.User.create({
            username: 'host',
            email: 'host@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        participant1 = yield user_model_1.User.create({
            username: 'participant1',
            email: 'participant1@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        participant2 = yield user_model_1.User.create({
            username: 'participant2',
            email: 'participant2@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        // Create test meditation
        meditation = yield meditation_model_1.Meditation.create({
            title: 'Test Meditation',
            description: 'A test meditation session',
            duration: 10,
            type: 'guided',
            category: 'mindfulness',
            difficulty: 'beginner',
            audioUrl: 'https://example.com/meditation.mp3',
            tags: ['test']
        });
    }));
    describe('Session Creation and Management', () => {
        it('should create a group session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const scheduledTime = new Date();
            scheduledTime.setHours(scheduledTime.getHours() + 1);
            const session = yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Test Group Session', scheduledTime, 15, {
                description: 'A test group meditation session',
                maxParticipants: 5,
                isPrivate: false
            });
            expect(session).toBeDefined();
            expect(session.hostId.toString()).toBe(host._id.toString());
            expect(session.meditationId.toString()).toBe(meditation._id.toString());
            expect(session.title).toBe('Test Group Session');
            expect(session.duration).toBe(15);
            expect(session.status).toBe('scheduled');
        }));
        it('should not create a session with past scheduled time', () => __awaiter(void 0, void 0, void 0, function* () {
            const pastTime = new Date();
            pastTime.setHours(pastTime.getHours() - 1);
            yield expect(group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Past Session', pastTime, 15, { description: 'Should not be created' })).rejects.toThrow('Cannot schedule session in the past');
        }));
    });
    describe('Session Participation', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const scheduledTime = new Date();
            scheduledTime.setHours(scheduledTime.getHours() + 1);
            session = yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Test Session', scheduledTime, 15, { maxParticipants: 2 });
        }));
        it('should allow participants to join session', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSession = yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
            const joinedParticipant = updatedSession.participants.find((p) => p.userId.toString() === participant1._id.toString());
            expect(joinedParticipant).toBeDefined();
            expect(joinedParticipant === null || joinedParticipant === void 0 ? void 0 : joinedParticipant.status).toBe('joined');
        }));
        it('should not exceed maximum participants', () => __awaiter(void 0, void 0, void 0, function* () {
            // Join first participant
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
            // Join second participant
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant2._id.toString());
            // Verify we have 2 participants
            const updatedSession = yield group_session_model_1.GroupSession.findById(session._id);
            expect(updatedSession === null || updatedSession === void 0 ? void 0 : updatedSession.participants.filter(p => p.status === 'joined')).toHaveLength(2);
            // Create third participant
            const participant3 = yield user_model_1.User.create({
                username: 'participant3',
                email: 'participant3@test.com',
                password: 'password123',
                friendIds: [],
                blockedUserIds: []
            });
            // Try to join with third participant - should fail
            yield expect(group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant3._id.toString())).rejects.toThrow('Session is full');
        }));
    });
    describe('Session Flow', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const scheduledTime = new Date();
            scheduledTime.setHours(scheduledTime.getHours() + 1);
            session = yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Flow Test Session', scheduledTime, 15, { maxParticipants: 3 });
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
        }));
        it('should complete full session flow successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Start session
            let updatedSession = yield group_session_service_1.GroupSessionService.startSession(session._id.toString(), host._id.toString());
            expect(updatedSession.status).toBe('in_progress');
            // Complete session for host
            updatedSession = yield group_session_service_1.GroupSessionService.completeSession(session._id.toString(), host._id.toString(), {
                durationCompleted: 15,
                moodBefore: '5',
                moodAfter: '8'
            });
            // Complete session for participant
            updatedSession = yield group_session_service_1.GroupSessionService.completeSession(session._id.toString(), participant1._id.toString(), {
                durationCompleted: 15,
                moodBefore: '4',
                moodAfter: '7'
            });
            const completedParticipants = updatedSession.participants
                .filter(p => p.status === 'completed')
                .map(p => p.userId);
            expect(completedParticipants).toContainEqual(host._id);
            expect(completedParticipants).toContainEqual(participant1._id);
            expect(updatedSession.status).toBe('completed');
        }));
        it('should allow participants to leave session', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSession = yield group_session_service_1.GroupSessionService.leaveSession(session._id.toString(), participant1._id.toString());
            const participant = updatedSession.participants.find(p => p.userId.toString() === participant1._id.toString());
            expect(participant === null || participant === void 0 ? void 0 : participant.status).toBe('left');
        }));
        it('should allow host to cancel session', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSession = yield group_session_service_1.GroupSessionService.cancelSession(session._id.toString(), host._id.toString());
            expect(updatedSession.status).toBe('cancelled');
        }));
    });
    describe('Session Queries', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions
            const futureTime1 = new Date();
            futureTime1.setHours(futureTime1.getHours() + 1);
            const futureTime2 = new Date();
            futureTime2.setHours(futureTime2.getHours() + 2);
            yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Upcoming Session 1', futureTime1, 15, { isPrivate: false });
            yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), meditation._id.toString(), 'Upcoming Session 2', futureTime2, 20, { isPrivate: false });
        }));
        it('should get upcoming sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const upcomingSessions = yield group_session_service_1.GroupSessionService.getUpcomingSessions(participant1._id.toString());
            expect(upcomingSessions).toHaveLength(2);
            expect(upcomingSessions[0].status).toBe('scheduled');
        }));
        it('should get user sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const userSessions = yield group_session_service_1.GroupSessionService.getUserSessions(host._id.toString());
            expect(userSessions).toHaveLength(2);
            expect(userSessions[0].hostId.toString()).toBe(host._id.toString());
        }));
    });
});
