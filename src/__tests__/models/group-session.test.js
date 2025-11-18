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
const group_session_model_1 = require("../../models/group-session.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestParticipant = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId(), status: 'joined', duration: 0, joinedAt: new Date(), sessionData: {
        durationCompleted: 0,
        startTime: new Date()
    } }, overrides));
const createTestSession = (overrides = {}) => (Object.assign({ hostId: new mongoose_1.default.Types.ObjectId(), meditationId: new mongoose_1.default.Types.ObjectId(), title: 'Test Group Session', scheduledTime: new Date(Date.now() + 3600000), duration: 1800, maxParticipants: 10, status: 'scheduled', participants: [], isPrivate: false }, overrides));
describe('GroupSession Model', () => {
    let testSession;
    let hostId;
    let meditationId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        hostId = new mongoose_1.default.Types.ObjectId();
        meditationId = new mongoose_1.default.Types.ObjectId();
        testSession = {
            hostId,
            meditationId,
            title: 'Test Group Session',
            scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
            duration: 1800, // 30 minutes
            maxParticipants: 10,
            status: 'scheduled',
            participants: [],
            isPrivate: false
        };
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create group session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(testSession);
            expect(session.hostId).toEqual(testSession.hostId);
            expect(session.title).toBe(testSession.title);
            expect(session.duration).toBe(testSession.duration);
            expect(session.status).toBe('scheduled');
        }));
        it('should manage participants correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const participant = {
                userId,
                status: 'joined',
                duration: 0,
                joinedAt: new Date(),
                sessionData: {
                    durationCompleted: 300,
                    startTime: new Date()
                }
            };
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { participants: [participant] }));
            expect(session.participants).toHaveLength(1);
            expect(session.participants[0].userId).toEqual(userId);
            expect(session.participants[0].sessionData.durationCompleted).toBe(300);
        }));
        it('should transition through session states', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(testSession);
            session.status = 'in_progress';
            session.startTime = new Date();
            yield session.save();
            expect(session.status).toBe('in_progress');
            session.status = 'completed';
            session.endTime = new Date();
            yield session.save();
            expect(session.status).toBe('completed');
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new group_session_model_1.GroupSession({});
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.hostId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.meditationId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.title).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.scheduledTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.maxParticipants).toBeDefined();
        }));
        it('should reject invalid field lengths', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new group_session_model_1.GroupSession(Object.assign(Object.assign({}, testSession), { title: 'a'.repeat(101), description: 'a'.repeat(501) }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.title).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
        }));
        it('should reject past scheduledTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new group_session_model_1.GroupSession(Object.assign(Object.assign({}, testSession), { scheduledTime: new Date(Date.now() - 3600000) // 1 hour ago
             }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.scheduledTime).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle session at max capacity', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { maxParticipants: 2, participants: [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(),
                        status: 'joined',
                        duration: 0,
                        joinedAt: new Date(),
                        sessionData: { durationCompleted: 0, startTime: new Date() }
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(),
                        status: 'joined',
                        duration: 0,
                        joinedAt: new Date(),
                        sessionData: { durationCompleted: 0, startTime: new Date() }
                    }
                ] }));
            expect(session.isFull()).toBe(true);
            expect(session.canUserJoin(new mongoose_1.default.Types.ObjectId())).toBe(false);
        }));
        it('should handle private session access control', () => __awaiter(void 0, void 0, void 0, function* () {
            const allowedUserId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { isPrivate: true, allowedParticipants: [allowedUserId] }));
            expect(session.canUserJoin(allowedUserId)).toBe(true);
            expect(session.canUserJoin(new mongoose_1.default.Types.ObjectId())).toBe(false);
        }));
        it('should handle session cancellation with participants', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { participants: [
                    {
                        userId: new mongoose_1.default.Types.ObjectId(),
                        status: 'joined',
                        duration: 300,
                        joinedAt: new Date(),
                        sessionData: { durationCompleted: 300, startTime: new Date() }
                    },
                    {
                        userId: new mongoose_1.default.Types.ObjectId(),
                        status: 'joined',
                        duration: 600,
                        joinedAt: new Date(),
                        sessionData: { durationCompleted: 600, startTime: new Date() }
                    }
                ] }));
            session.status = 'cancelled';
            yield session.save();
            expect(session.status).toBe('cancelled');
            expect(session.participants.every(p => p.status === 'left')).toBe(true);
            expect(session.participants.every(p => p.duration > 0)).toBe(true);
        }));
    });
    describe('Indexes', () => {
        it('should have index on hostId', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield group_session_model_1.GroupSession.collection.getIndexes();
            const hasHostIdIndex = Object.values(indexes).some(index => index.key && index.key.hostId === 1);
            expect(hasHostIdIndex).toBe(true);
        }));
        it('should have index on scheduledTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield group_session_model_1.GroupSession.collection.getIndexes();
            const hasScheduledTimeIndex = Object.values(indexes).some(index => index.key && index.key.scheduledTime === 1);
            expect(hasScheduledTimeIndex).toBe(true);
        }));
    });
    describe('Participant Management', () => {
        it('should validate participant session data', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(testSession);
            const participant = createTestParticipant({
                sessionData: {
                    durationCompleted: -1, // Invalid duration
                    startTime: new Date()
                }
            });
            session.participants.push(participant);
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['participants.0.sessionData.durationCompleted']).toBeDefined();
        }));
        it('should track participant status changes correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(testSession);
            const userId = new mongoose_1.default.Types.ObjectId();
            // Join session
            session.participants.push(createTestParticipant({ userId }));
            yield session.save();
            expect(session.participants[0].status).toBe('joined');
            // Leave session
            session.participants[0].status = 'left';
            session.participants[0].leftAt = new Date();
            yield session.save();
            expect(session.participants[0].status).toBe('left');
            expect(session.participants[0].leftAt).toBeDefined();
            // Complete session
            session.participants[0].status = 'completed';
            session.participants[0].sessionData.endTime = new Date();
            yield session.save();
            expect(session.participants[0].status).toBe('completed');
            expect(session.participants[0].sessionData.endTime).toBeDefined();
        }));
    });
    describe('Session State Management', () => {
        it('should validate state transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(testSession);
            // Valid transitions
            expect(() => { session.status = 'in_progress'; }).not.toThrow();
            expect(() => { session.status = 'completed'; }).not.toThrow();
            expect(() => { session.status = 'cancelled'; }).not.toThrow();
            // Invalid transitions
            const invalidSession = new group_session_model_1.GroupSession(testSession);
            invalidSession.status = 'completed';
            expect(() => { invalidSession.status = 'scheduled'; }).toThrow();
            expect(() => { invalidSession.status = 'in_progress'; }).toThrow();
        }));
        it('should handle session completion with mixed participant states', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { participants: [
                    createTestParticipant({ status: 'completed' }),
                    createTestParticipant({ status: 'left' }),
                    createTestParticipant({ status: 'joined' })
                ] }));
            session.status = 'completed';
            yield session.save();
            expect(session.participants.every(p => p.status === 'completed' || p.status === 'left')).toBe(true);
        }));
    });
    describe('User Join Validation', () => {
        it('should prevent joining completed or cancelled sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_model_1.GroupSession.create(testSession);
            session.status = 'completed';
            expect(session.canUserJoin(userId)).toBe(false);
            session.status = 'cancelled';
            expect(session.canUserJoin(userId)).toBe(false);
        }));
        it('should prevent duplicate joins', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { participants: [createTestParticipant({ userId })] }));
            expect(session.canUserJoin(userId)).toBe(false);
        }));
        it('should handle rejoining after leaving', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const session = yield group_session_model_1.GroupSession.create(Object.assign(Object.assign({}, testSession), { participants: [createTestParticipant({
                        userId,
                        status: 'left',
                        leftAt: new Date()
                    })] }));
            expect(session.canUserJoin(userId)).toBe(true);
        }));
    });
});
