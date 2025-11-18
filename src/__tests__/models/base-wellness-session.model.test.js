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
const db_handler_1 = require("../test-utils/db-handler");
const base_wellness_session_factory_1 = require("../factories/base-wellness-session.factory");
const TestSessionSchema = (0, base_wellness_session_model_1.createWellnessSessionSchema)({
    testField: String
});
const TestSession = mongoose_1.default.model('TestSession', TestSessionSchema);
describe('BaseWellnessSession Model', () => {
    let sessionFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        sessionFactory = new base_wellness_session_factory_1.BaseWellnessSessionTestFactory();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Schema Creation', () => {
        it('should create extended schema with additional fields', () => {
            const extendedSchema = (0, base_wellness_session_model_1.createWellnessSessionSchema)({
                customField: { type: String, required: true }
            });
            expect(extendedSchema.path('customField')).toBeDefined();
            expect(extendedSchema.path('userId')).toBeDefined();
            expect(extendedSchema.path('startTime')).toBeDefined();
        });
        it('should inherit base schema validations', () => {
            const session = new TestSession({});
            const validationError = session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        });
    });
    describe('Virtual Fields', () => {
        it('should correctly indicate completed status', () => __awaiter(void 0, void 0, void 0, function* () {
            const activeSession = new TestSession(sessionFactory.create());
            expect(activeSession.isCompleted).toBe(false);
            const completedSession = new TestSession(sessionFactory.completed());
            expect(completedSession.isCompleted).toBe(true);
        }));
    });
    describe('Success Cases', () => {
        it('should create wellness session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = sessionFactory.create();
            const session = yield TestSession.create(testData);
            expect(session.userId).toEqual(testData.userId);
            expect(session.startTime).toEqual(testData.startTime);
            expect(session.duration).toBe(testData.duration);
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
        }));
        it('should complete session with mood', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create());
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Calm);
            expect(session.status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
            expect(session.moodAfter).toBe(base_wellness_session_model_1.WellnessMoodState.Calm);
            expect(session.endTime).toBeDefined();
        }));
        it('should track state history through transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create());
            yield session.pause();
            yield session.resume();
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            expect(session.stateHistory).toHaveLength(4); // Initial + 3 transitions
            expect(session.stateHistory[0].status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
            expect(session.stateHistory[1].status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Paused);
            expect(session.stateHistory[2].status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Active);
            expect(session.stateHistory[3].status).toBe(base_wellness_session_model_1.WellnessSessionStatus.Completed);
        }));
        it('should handle mood state transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create({
                moodBefore: base_wellness_session_model_1.WellnessMoodState.Stressed
            }));
            yield session.complete(base_wellness_session_model_1.WellnessMoodState.Peaceful);
            expect(session.moodBefore).toBe(base_wellness_session_model_1.WellnessMoodState.Stressed);
            expect(session.moodAfter).toBe(base_wellness_session_model_1.WellnessMoodState.Peaceful);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession({});
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
        it('should reject invalid mood states', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new TestSession(Object.assign(Object.assign({}, sessionFactory.create()), { moodBefore: 'invalid', moodAfter: 'invalid' }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.moodBefore).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.moodAfter).toBeDefined();
        }));
        it('should reject invalid state transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const completedSession = yield TestSession.create(sessionFactory.completed());
            yield expect(completedSession.pause()).rejects.toThrow();
            yield expect(completedSession.resume()).rejects.toThrow();
            yield expect(completedSession.abandon()).rejects.toThrow();
            const abandonedSession = yield TestSession.create(sessionFactory.abandoned());
            yield expect(abandonedSession.pause()).rejects.toThrow();
            yield expect(abandonedSession.resume()).rejects.toThrow();
            yield expect(abandonedSession.complete()).rejects.toThrow();
        }));
        it('should reject invalid durations', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooShort = new TestSession(sessionFactory.withDuration(0));
            const tooLong = new TestSession(sessionFactory.withDuration(7201)); // > 2 hours
            expect(yield ((_a = tooShort.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.duration)).toBeDefined();
            expect(yield ((_b = tooLong.validateSync()) === null || _b === void 0 ? void 0 : _b.errors.duration)).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle endTime validation', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const invalidEndTime = new Date(startTime.getTime() - 1000); // 1 second before start
            const session = new TestSession(sessionFactory.create({
                startTime,
                endTime: invalidEndTime
            }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.endTime).toBeDefined();
        }));
        it('should handle duration calculations with precision', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date(Date.now() - 5000); // 5 seconds ago
            const session = yield TestSession.create(sessionFactory.create({ startTime }));
            const duration = session.getActualDuration();
            expect(duration).toBeGreaterThanOrEqual(4);
            expect(duration).toBeLessThanOrEqual(6);
        }));
        it('should handle unimplemented achievement processing', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create());
            yield expect(session.processAchievements()).rejects.toThrow('Achievement processing must be implemented');
        }));
        it('should handle empty notes', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create({ notes: undefined }));
            expect(session.notes).toBeUndefined();
        }));
        it('should handle maximum notes length', () => __awaiter(void 0, void 0, void 0, function* () {
            const longNotes = 'a'.repeat(1001); // Over 1000 chars
            const session = new TestSession(sessionFactory.create({ notes: longNotes }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.notes).toBeDefined();
        }));
    });
    describe('Data Integrity', () => {
        it('should trim notes field', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create({
                notes: '  Test notes  '
            }));
            expect(session.notes).toBe('Test notes');
        }));
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create());
            const originalUpdatedAt = session.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            session.notes = 'Updated notes';
            yield session.save();
            expect(session.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
        it('should set endTime on completion via pre-validate middleware', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield TestSession.create(sessionFactory.create());
            session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
            yield session.validate();
            expect(session.endTime).toBeDefined();
            expect(session.endTime).toBeInstanceOf(Date);
        }));
    });
});
