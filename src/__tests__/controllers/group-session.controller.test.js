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
const group_session_controller_1 = require("../../controllers/group-session.controller");
const group_session_service_1 = require("../../services/group-session.service");
const mongoose_1 = require("mongoose");
jest.mock('../../services/group-session.service');
describe('GroupSessionController', () => {
    let mockReq;
    let mockRes;
    const mockUserId = new mongoose_1.Types.ObjectId().toString();
    beforeEach(() => {
        mockReq = {
            user: { _id: mockUserId },
            params: {},
            body: {},
            query: {}
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });
    describe('createSession', () => {
        const mockSessionData = {
            meditationId: new mongoose_1.Types.ObjectId().toString(),
            title: 'Morning Meditation',
            scheduledTime: new Date().toISOString(),
            duration: 30,
            description: 'Group meditation session',
            maxParticipants: 10,
            isPrivate: false,
            allowedParticipants: []
        };
        it('should create a session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = mockSessionData;
            const mockSession = Object.assign(Object.assign({}, mockSessionData), { _id: new mongoose_1.Types.ObjectId().toString() });
            jest.spyOn(group_session_service_1.GroupSessionService, 'createSession').mockResolvedValue(mockSession);
            yield group_session_controller_1.GroupSessionController.createSession(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.createSession).toHaveBeenCalledWith(mockUserId, mockSessionData.meditationId, mockSessionData.title, expect.any(Date), mockSessionData.duration, {
                description: mockSessionData.description,
                maxParticipants: mockSessionData.maxParticipants,
                isPrivate: mockSessionData.isPrivate,
                allowedParticipants: mockSessionData.allowedParticipants
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = { title: 'Incomplete Session' };
            yield group_session_controller_1.GroupSessionController.createSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = mockSessionData;
            const error = new Error('Service error');
            jest.spyOn(group_session_service_1.GroupSessionService, 'createSession').mockRejectedValue(error);
            yield group_session_controller_1.GroupSessionController.createSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('joinSession', () => {
        const sessionId = new mongoose_1.Types.ObjectId().toString();
        it('should join session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = { sessionId };
            const mockSession = { _id: sessionId, participants: [mockUserId] };
            jest.spyOn(group_session_service_1.GroupSessionService, 'joinSession').mockResolvedValue(mockSession);
            yield group_session_controller_1.GroupSessionController.joinSession(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.joinSession).toHaveBeenCalledWith(sessionId, mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.user = undefined;
            yield group_session_controller_1.GroupSessionController.joinSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
    });
    describe('startSession', () => {
        const sessionId = new mongoose_1.Types.ObjectId().toString();
        it('should start session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = { sessionId };
            const mockSession = { _id: sessionId, status: 'in-progress' };
            jest.spyOn(group_session_service_1.GroupSessionService, 'startSession').mockResolvedValue(mockSession);
            yield group_session_controller_1.GroupSessionController.startSession(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.startSession).toHaveBeenCalledWith(sessionId, mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = {};
            yield group_session_controller_1.GroupSessionController.startSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
    });
    describe('completeSession', () => {
        const sessionId = new mongoose_1.Types.ObjectId().toString();
        const completionData = {
            durationCompleted: 25,
            moodBefore: 'calm',
            moodAfter: 'relaxed'
        };
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = { sessionId };
            mockReq.body = completionData;
            const mockSession = { _id: sessionId, status: 'completed' };
            jest.spyOn(group_session_service_1.GroupSessionService, 'completeSession').mockResolvedValue(mockSession);
            yield group_session_controller_1.GroupSessionController.completeSession(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.completeSession).toHaveBeenCalledWith(sessionId, mockUserId, completionData);
            expect(mockRes.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = { sessionId };
            mockReq.body = {};
            yield group_session_controller_1.GroupSessionController.completeSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
    });
    describe('cancelSession', () => {
        const sessionId = new mongoose_1.Types.ObjectId().toString();
        it('should cancel session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = { sessionId };
            const mockSession = { _id: sessionId, status: 'cancelled' };
            jest.spyOn(group_session_service_1.GroupSessionService, 'cancelSession').mockResolvedValue(mockSession);
            yield group_session_controller_1.GroupSessionController.cancelSession(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.cancelSession).toHaveBeenCalledWith(sessionId, mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 400 when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = {};
            yield group_session_controller_1.GroupSessionController.cancelSession(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
        }));
    });
    describe('getUpcomingSessions', () => {
        it('should get upcoming sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [
                { _id: new mongoose_1.Types.ObjectId().toString(), title: 'Upcoming Session 1' },
                { _id: new mongoose_1.Types.ObjectId().toString(), title: 'Upcoming Session 2' }
            ];
            jest.spyOn(group_session_service_1.GroupSessionService, 'getUpcomingSessions').mockResolvedValue(mockSessions);
            yield group_session_controller_1.GroupSessionController.getUpcomingSessions(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.getUpcomingSessions).toHaveBeenCalledWith(mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
        }));
        it('should return 400 when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.user = undefined;
            yield group_session_controller_1.GroupSessionController.getUpcomingSessions(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        }));
    });
    describe('getUserSessions', () => {
        it('should get user sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [
                { _id: new mongoose_1.Types.ObjectId().toString(), title: 'Past Session 1' },
                { _id: new mongoose_1.Types.ObjectId().toString(), title: 'Past Session 2' }
            ];
            jest.spyOn(group_session_service_1.GroupSessionService, 'getUserSessions').mockResolvedValue(mockSessions);
            yield group_session_controller_1.GroupSessionController.getUserSessions(mockReq, mockRes);
            expect(group_session_service_1.GroupSessionService.getUserSessions).toHaveBeenCalledWith(mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith(mockSessions);
        }));
        it('should return 400 when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.user = undefined;
            yield group_session_controller_1.GroupSessionController.getUserSessions(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        }));
    });
});
