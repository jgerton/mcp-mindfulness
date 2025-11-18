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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_session_service_1 = require("../../services/meditation-session.service");
const meditation_session_model_1 = require("../../models/meditation-session.model");
const session_analytics_service_1 = require("../../services/session-analytics.service");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_handler_1 = require("../test-utils/db-handler");
jest.mock('../../models/meditation-session.model');
jest.mock('../../services/session-analytics.service');
describe('MeditationSessionService', () => {
    let meditationSessionService;
    const mockUserId = new mongoose_1.default.Types.ObjectId().toString();
    const mockMeditationId = new mongoose_1.default.Types.ObjectId().toString();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.connect();
    }));
    beforeEach(() => {
        jest.clearAllMocks();
        meditationSessionService = new meditation_session_service_1.MeditationSessionService();
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.closeDatabase();
    }));
    describe('startSession', () => {
        const validSessionData = {
            meditationId: mockMeditationId,
            duration: 600,
            durationCompleted: 0,
            completed: false,
            moodBefore: 'calm',
            title: 'Morning Meditation',
            type: 'guided'
        };
        it('should start a new session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = Object.assign({ _id: new mongoose_1.default.Types.ObjectId(), userId: new mongoose_1.default.Types.ObjectId(mockUserId), status: base_wellness_session_model_1.WellnessSessionStatus.Active }, validSessionData);
            meditation_session_model_1.MeditationSession.create.mockResolvedValue(mockSession);
            meditation_session_model_1.MeditationSession.findOne.mockResolvedValue(null);
            const result = yield meditationSessionService.startSession(mockUserId, validSessionData);
            expect(result).toEqual({
                sessionId: mockSession._id.toString(),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active
            });
            expect(session_analytics_service_1.SessionAnalyticsService.prototype.createSessionAnalytics).toHaveBeenCalledWith(expect.objectContaining({
                userId: expect.any(mongoose_1.default.Types.ObjectId),
                sessionId: mockSession._id,
                meditationId: expect.any(mongoose_1.default.Types.ObjectId),
                startTime: expect.any(Date),
                duration: validSessionData.duration
            }));
        }));
        it('should throw error if active session exists', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_model_1.MeditationSession.findOne.mockResolvedValue({
                _id: new mongoose_1.default.Types.ObjectId(),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active
            });
            yield expect(meditationSessionService.startSession(mockUserId, validSessionData))
                .rejects.toThrow('Active session already exists');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_model_1.MeditationSession.findOne.mockRejectedValue(new Error('Database error'));
            yield expect(meditationSessionService.startSession(mockUserId, validSessionData))
                .rejects.toThrow('Database error');
        }));
    });
    describe('endSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        const mockEndData = {
            moodAfter: 'peaceful',
            notes: 'Great session'
        };
        it('should end session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active,
                startTime: new Date(Date.now() - 600000), // 10 minutes ago
                save: jest.fn()
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(mockSession);
            mockSession.save.mockResolvedValue(Object.assign(Object.assign({}, mockSession), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, endTime: expect.any(Date) }));
            yield meditationSessionService.endSession(mockSessionId, mockEndData.moodAfter, mockEndData.notes);
            expect(mockSession.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(mockSession.endTime).toBeDefined();
            expect(session_analytics_service_1.SessionAnalyticsService.prototype.updateSessionAnalytics).toHaveBeenCalledWith(mockSessionId, expect.objectContaining({
                endTime: expect.any(Date),
                moodAfter: mockEndData.moodAfter,
                notes: mockEndData.notes,
                completed: true
            }));
        }));
        it('should throw error for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(null);
            yield expect(meditationSessionService.endSession(mockSessionId, mockEndData.moodAfter, mockEndData.notes)).rejects.toThrow('Session not found');
        }));
        it('should throw error for non-active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Completed
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(mockSession);
            yield expect(meditationSessionService.endSession(mockSessionId, mockEndData.moodAfter, mockEndData.notes)).rejects.toThrow('Session is not active');
        }));
    });
    describe('completeSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        const mockCompleteData = {
            duration: 600,
            durationCompleted: 550,
            completed: true,
            moodAfter: 'peaceful',
            moodBefore: 'neutral',
            interruptions: 2,
            notes: 'Completed with minor interruptions',
            tags: ['morning', 'guided']
        };
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active,
                interruptions: 0,
                save: jest.fn()
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(mockSession);
            mockSession.save.mockResolvedValue(Object.assign(Object.assign(Object.assign({}, mockSession), mockCompleteData), { status: base_wellness_session_model_1.WellnessSessionStatus.Completed, endTime: expect.any(Date) }));
            const result = yield meditationSessionService.completeSession(mockSessionId, mockCompleteData);
            expect(result.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(result.durationCompleted).toBe(mockCompleteData.durationCompleted);
            expect(result.interruptions).toBe(mockCompleteData.interruptions);
            expect(session_analytics_service_1.SessionAnalyticsService.prototype.updateSessionAnalytics).toHaveBeenCalledWith(mockSessionId, expect.objectContaining(mockCompleteData));
        }));
        it('should throw error for already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Completed
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(mockSession);
            yield expect(meditationSessionService.completeSession(mockSessionId, mockCompleteData))
                .rejects.toThrow('Session is already completed');
        }));
    });
    describe('getActiveSession', () => {
        it('should return active session if exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = {
                _id: new mongoose_1.default.Types.ObjectId(),
                userId: new mongoose_1.default.Types.ObjectId(mockUserId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active
            };
            meditation_session_model_1.MeditationSession.findOne.mockResolvedValue(mockSession);
            const result = yield meditationSessionService.getActiveSession(mockUserId);
            expect(result).toBeDefined();
            expect(result.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
            expect(result.userId.toString()).toBe(mockUserId);
        }));
        it('should return null if no active session exists', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_model_1.MeditationSession.findOne.mockResolvedValue(null);
            const result = yield meditationSessionService.getActiveSession(mockUserId);
            expect(result).toBeNull();
        }));
    });
    describe('createSession', () => {
        const validCreateData = {
            userId: mockUserId,
            meditationId: mockMeditationId,
            duration: 600,
            type: 'guided',
            title: 'Morning Meditation',
            moodBefore: 'calm'
        };
        it('should create a new session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, validCreateData), { status: base_wellness_session_model_1.WellnessSessionStatus.Active, startTime: expect.any(Date) });
            meditation_session_model_1.MeditationSession.create.mockResolvedValue(mockSession);
            const result = yield meditationSessionService.createSession(validCreateData);
            expect(result).toBeDefined();
            expect(result.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
            expect(result.type).toBe(validCreateData.type);
            expect(result.duration).toBe(validCreateData.duration);
        }));
        it('should create session without optional meditationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const { meditationId } = validCreateData, dataWithoutMeditationId = __rest(validCreateData, ["meditationId"]);
            const mockSession = Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId() }, dataWithoutMeditationId), { status: base_wellness_session_model_1.WellnessSessionStatus.Active, startTime: expect.any(Date) });
            meditation_session_model_1.MeditationSession.create.mockResolvedValue(mockSession);
            const result = yield meditationSessionService.createSession(dataWithoutMeditationId);
            expect(result).toBeDefined();
            expect(result.meditationId).toBeUndefined();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_model_1.MeditationSession.create.mockRejectedValue(new Error('Database error'));
            yield expect(meditationSessionService.createSession(validCreateData))
                .rejects.toThrow('Database error');
        }));
    });
});
