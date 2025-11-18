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
const session_service_1 = require("../../services/session.service");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const base_wellness_session_model_2 = require("../../models/base-wellness-session.model");
const db_handler_1 = require("../test-utils/db-handler");
const base_wellness_session_factory_1 = require("../factories/base-wellness-session.factory");
jest.mock('../../models/base-wellness-session.model');
describe('SessionService', () => {
    const sessionFactory = new base_wellness_session_factory_1.BaseWellnessSessionTestFactory();
    const mockUserId = new mongoose_1.default.Types.ObjectId().toString();
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.connect();
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        yield db_handler_1.dbHandler.clearDatabase();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.closeDatabase();
    }));
    describe('createSession', () => {
        const validSessionData = {
            userId: mockUserId,
            duration: 600,
            moodBefore: base_wellness_session_model_2.WellnessMoodState.Neutral,
            type: 'meditation'
        };
        it('should create a new session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                userId: new mongoose_1.default.Types.ObjectId(mockUserId),
                duration: validSessionData.duration,
                moodBefore: validSessionData.moodBefore
            });
            base_wellness_session_model_1.BaseWellnessSession.create.mockResolvedValue(mockSession);
            const result = yield session_service_1.SessionService.createSession(validSessionData);
            expect(result).toBeDefined();
            expect(result.userId.toString()).toBe(mockUserId);
            expect(result.status).toBe(base_wellness_session_model_2.WellnessSessionStatus.Active);
            expect(result.duration).toBe(validSessionData.duration);
            expect(result.moodBefore).toBe(validSessionData.moodBefore);
        }));
        it('should throw error for invalid duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = Object.assign(Object.assign({}, validSessionData), { duration: -1 });
            yield expect(session_service_1.SessionService.createSession(invalidData))
                .rejects.toThrow('Duration must be positive');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.create.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.createSession(validSessionData))
                .rejects.toThrow('Database error');
        }));
    });
    describe('getSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        it('should return session by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId)
            });
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(mockSession);
            const result = yield session_service_1.SessionService.getSession(mockSessionId);
            expect(result).toBeDefined();
            expect(result._id.toString()).toBe(mockSessionId);
        }));
        it('should return null for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(null);
            const result = yield session_service_1.SessionService.getSession(mockSessionId);
            expect(result).toBeNull();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findById.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.getSession(mockSessionId))
                .rejects.toThrow('Database error');
        }));
    });
    describe('getUserSessions', () => {
        it('should return all sessions for user', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [
                sessionFactory.create({ userId: new mongoose_1.default.Types.ObjectId(mockUserId) }),
                sessionFactory.create({ userId: new mongoose_1.default.Types.ObjectId(mockUserId) })
            ];
            base_wellness_session_model_1.BaseWellnessSession.find.mockResolvedValue(mockSessions);
            const result = yield session_service_1.SessionService.getUserSessions(mockUserId);
            expect(result).toHaveLength(2);
            expect(result[0].userId.toString()).toBe(mockUserId);
            expect(result[1].userId.toString()).toBe(mockUserId);
        }));
        it('should handle empty results', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.find.mockResolvedValue([]);
            const result = yield session_service_1.SessionService.getUserSessions(mockUserId);
            expect(result).toHaveLength(0);
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.find.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.getUserSessions(mockUserId))
                .rejects.toThrow('Database error');
        }));
    });
    describe('updateSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        it('should update session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId)
            });
            const updateData = {
                notes: 'Updated notes',
                moodAfter: base_wellness_session_model_2.WellnessMoodState.Peaceful
            };
            base_wellness_session_model_1.BaseWellnessSession.findByIdAndUpdate.mockResolvedValue(Object.assign(Object.assign({}, mockSession), updateData));
            const result = yield session_service_1.SessionService.updateSession(mockSessionId, updateData);
            expect(result.notes).toBe(updateData.notes);
            expect(result.moodAfter).toBe(updateData.moodAfter);
        }));
        it('should throw error for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findByIdAndUpdate.mockResolvedValue(null);
            yield expect(session_service_1.SessionService.updateSession(mockSessionId, { notes: 'test' }))
                .rejects.toThrow('Session not found');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.updateSession(mockSessionId, { notes: 'test' }))
                .rejects.toThrow('Database error');
        }));
    });
    describe('completeSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_2.WellnessSessionStatus.Active
            });
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(Object.assign(Object.assign({}, mockSession), { save: jest.fn().mockResolvedValue(Object.assign(Object.assign({}, mockSession), { status: base_wellness_session_model_2.WellnessSessionStatus.Completed, endTime: expect.any(Date) })) }));
            const result = yield session_service_1.SessionService.completeSession(mockSessionId, base_wellness_session_model_2.WellnessMoodState.Peaceful);
            expect(result.status).toBe(base_wellness_session_model_2.WellnessSessionStatus.Completed);
            expect(result.moodAfter).toBe(base_wellness_session_model_2.WellnessMoodState.Peaceful);
            expect(result.endTime).toBeDefined();
        }));
        it('should throw error for already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_2.WellnessSessionStatus.Completed
            });
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(mockSession);
            yield expect(session_service_1.SessionService.completeSession(mockSessionId, base_wellness_session_model_2.WellnessMoodState.Peaceful))
                .rejects.toThrow('Session is already completed');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findById.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.completeSession(mockSessionId, base_wellness_session_model_2.WellnessMoodState.Peaceful))
                .rejects.toThrow('Database error');
        }));
    });
    describe('abandonSession', () => {
        const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
        it('should abandon session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_2.WellnessSessionStatus.Active
            });
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(Object.assign(Object.assign({}, mockSession), { save: jest.fn().mockResolvedValue(Object.assign(Object.assign({}, mockSession), { status: base_wellness_session_model_2.WellnessSessionStatus.Abandoned, endTime: expect.any(Date) })) }));
            const result = yield session_service_1.SessionService.abandonSession(mockSessionId);
            expect(result.status).toBe(base_wellness_session_model_2.WellnessSessionStatus.Abandoned);
            expect(result.endTime).toBeDefined();
        }));
        it('should throw error for already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSession = sessionFactory.create({
                _id: new mongoose_1.default.Types.ObjectId(mockSessionId),
                status: base_wellness_session_model_2.WellnessSessionStatus.Completed
            });
            base_wellness_session_model_1.BaseWellnessSession.findById.mockResolvedValue(mockSession);
            yield expect(session_service_1.SessionService.abandonSession(mockSessionId))
                .rejects.toThrow('Cannot abandon completed session');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            base_wellness_session_model_1.BaseWellnessSession.findById.mockRejectedValue(new Error('Database error'));
            yield expect(session_service_1.SessionService.abandonSession(mockSessionId))
                .rejects.toThrow('Database error');
        }));
    });
});
