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
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const session_factory_1 = require("../factories/session.factory");
describe('BaseWellnessSession', () => {
    const TestSession = mongoose_1.default.model('TestSession', base_wellness_session_model_1.baseWellnessSessionSchema);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            const db = mongoose_1.default.connection.db;
            if (db) {
                try {
                    yield db.collection('testsessions').deleteMany({});
                }
                catch (error) {
                    // Collection might not exist, ignore error
                }
            }
        }
    }));
    describe('Schema Validation', () => {
        it('should require all mandatory fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession({});
            let error;
            try {
                yield session.validate();
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
            expect(error.errors.startTime).toBeDefined();
            expect(error.errors.duration).toBeDefined();
        }));
        it('should accept valid mood states', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            const error = yield session.validate().catch(e => e);
            expect(error).toBeUndefined();
        }));
        it('should reject invalid mood states', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                moodBefore: 'invalid_mood'
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.moodBefore).toBeDefined();
        }));
        it('should reject invalid session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                userId: 'invalid_id',
                startTime: 'invalid_date',
                endTime: 'invalid_date',
                duration: -1,
                status: 'invalid_status'
            }));
            try {
                yield session.save();
                fail('Should have thrown validation error');
            }
            catch (err) {
                const error = err;
                expect(error.errors.userId).toBeDefined();
                expect(error.errors.startTime).toBeDefined();
                expect(error.errors.duration).toBeDefined();
                expect(error.errors.status).toBeDefined();
            }
        }));
    });
    describe('Status Management', () => {
        it('should handle valid status transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
            const error = yield session.validate().catch(e => e);
            expect(error).toBeUndefined();
        }));
        it('should reject invalid status values', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: 'invalid_status'
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.status).toBeDefined();
        }));
    });
    describe('Timestamps', () => {
        it('should automatically set createdAt and updatedAt', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            expect(session.createdAt).toBeDefined();
            expect(session.updatedAt).toBeDefined();
        }));
        it('should update updatedAt on changes', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            const originalUpdatedAt = session.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 100));
            session.notes = 'Updated notes';
            yield session.save();
            expect(session.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
    describe('Type Safety', () => {
        it('should enforce ObjectId type for userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                userId: 'invalid_id'
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.userId).toBeDefined();
        }));
        it('should enforce Date type for startTime and endTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                startTime: 'invalid_date',
                endTime: 'invalid_date'
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.startTime).toBeDefined();
            expect(error.errors.endTime).toBeDefined();
        }));
    });
    describe('Achievement Processing', () => {
        it('should throw error when processAchievements is not implemented', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield expect(session.processAchievements()).rejects.toThrow('Achievement processing must be implemented by session type');
        }));
    });
    // New edge cases
    describe('Edge Cases', () => {
        it('should reject negative duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                duration: -1
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.duration).toBeDefined();
        }));
        it('should reject endTime before startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const now = new Date();
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                startTime: now,
                endTime: new Date(now.getTime() - 1000) // 1 second before
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.endTime).toBeDefined();
        }));
        it('should enforce notes length limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                notes: 'a'.repeat(1001) // Assuming 1000 char limit
            }));
            const error = yield session.validate().catch(e => e);
            expect(error).toBeDefined();
            expect(error.errors.notes).toBeDefined();
        }));
    });
    // Add new test suites after existing ones
    describe('Status Transitions', () => {
        it('should allow transition from Active to Paused', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Paused)).toBe(true);
        }));
        it('should allow transition from Active to Completed', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Completed)).toBe(true);
        }));
        it('should allow transition from Active to Abandoned', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Abandoned)).toBe(true);
        }));
        it('should allow transition from Paused to Active', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Paused
            }));
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Active)).toBe(true);
        }));
        it('should not allow transition from Completed to any status', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createCompletedTestSessionData)());
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Active)).toBe(false);
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Paused)).toBe(false);
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Abandoned)).toBe(false);
        }));
        it('should not allow transition from Abandoned to any status', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Abandoned
            }));
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Active)).toBe(false);
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Paused)).toBe(false);
            expect(session.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Completed)).toBe(false);
        }));
    });
    describe('Pause and Resume', () => {
        it('should pause an active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            yield session.pause();
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Paused);
        }));
        it('should resume a paused session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Paused
            }));
            yield session.save();
            yield session.resume();
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
        }));
        it('should not pause a completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createCompletedTestSessionData)());
            yield session.save();
            yield expect(session.pause()).rejects.toThrow('Cannot pause session in completed status');
        }));
        it('should not resume an active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            yield expect(session.resume()).rejects.toThrow('Cannot resume session in active status');
        }));
        it('should not resume an abandoned session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Abandoned
            }));
            yield session.save();
            yield expect(session.resume()).rejects.toThrow('Cannot resume session in abandoned status');
        }));
    });
    describe('Session Completion and Abandonment', () => {
        it('should complete an active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(session.moodAfter).toBe(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            expect(session.endTime).toBeDefined();
        }));
        it('should not complete a paused session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Paused
            }));
            yield session.save();
            yield expect(session.complete()).rejects.toThrow(`Cannot complete session in ${base_wellness_session_model_1.WellnessSessionStatus.Paused} status`);
        }));
        it('should abandon an active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)());
            yield session.save();
            yield session.abandon();
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Abandoned);
            expect(session.endTime).toBeDefined();
        }));
        it('should abandon a paused session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Paused
            }));
            yield session.save();
            yield session.abandon();
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Abandoned);
            expect(session.endTime).toBeDefined();
        }));
        it('should not complete an abandoned session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createTestSessionData)({
                status: base_wellness_session_model_1.WellnessSessionStatus.Abandoned
            }));
            yield session.save();
            yield expect(session.complete()).rejects.toThrow('Cannot complete session in abandoned status');
        }));
        it('should not abandon a completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession((0, session_factory_1.createCompletedTestSessionData)());
            yield session.save();
            yield expect(session.abandon()).rejects.toThrow('Cannot abandon session in completed status');
        }));
    });
});
