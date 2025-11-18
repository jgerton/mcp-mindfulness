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
const progress_model_1 = require("../../models/progress.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestProgress = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId(), meditationId: new mongoose_1.default.Types.ObjectId(), duration: 15, completed: true, mood: 'neutral', notes: 'Test session', startTime: new Date(), endTime: new Date(Date.now() + 15 * 60 * 1000) }, overrides));
describe('Progress Model', () => {
    let testProgress;
    let userId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        userId = new mongoose_1.default.Types.ObjectId();
        const startTime = new Date();
        testProgress = {
            userId,
            meditationId: new mongoose_1.default.Types.ObjectId(),
            duration: 15,
            completed: true,
            mood: 'neutral',
            notes: 'Test session',
            startTime,
            endTime: new Date(startTime.getTime() + 15 * 60 * 1000)
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
        it('should create and save progress successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(testProgress);
            expect(progress.userId).toEqual(testProgress.userId);
            expect(progress.meditationId).toEqual(testProgress.meditationId);
            expect(progress.duration).toBe(testProgress.duration);
            expect(progress.completed).toBe(true);
        }));
        it('should calculate total meditation time correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, testProgress), { duration: 15 }),
                Object.assign(Object.assign({}, testProgress), { duration: 30 }),
                Object.assign(Object.assign({}, testProgress), { duration: 45 })
            ]);
            const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId.toString());
            expect(totalTime).toBe(90);
        }));
        it('should maintain meditation streak for consecutive days', () => __awaiter(void 0, void 0, void 0, function* () {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, testProgress), { startTime: today, endTime: new Date(today.getTime() + 15 * 60 * 1000) }),
                Object.assign(Object.assign({}, testProgress), { startTime: yesterday, endTime: new Date(yesterday.getTime() + 15 * 60 * 1000) })
            ]);
            const streak = yield progress_model_1.Progress.getCurrentStreak(userId.toString());
            expect(streak).toBe(2);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress({});
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.meditationId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
        }));
        it('should reject invalid mood values', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress(Object.assign(Object.assign({}, testProgress), { mood: 'invalid-mood' }));
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.mood).toBeDefined();
        }));
        it('should reject negative duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress(Object.assign(Object.assign({}, testProgress), { duration: -1 }));
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle zero duration meditation sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, testProgress), { duration: 0 }));
            expect(progress.duration).toBe(0);
            const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId.toString());
            expect(totalTime).toBe(0);
        }));
        it('should handle streak reset after missed day', () => __awaiter(void 0, void 0, void 0, function* () {
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, testProgress), { startTime: today, endTime: new Date(today.getTime() + 15 * 60 * 1000) }),
                Object.assign(Object.assign({}, testProgress), { startTime: threeDaysAgo, endTime: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000) })
            ]);
            const streak = yield progress_model_1.Progress.getCurrentStreak(userId.toString());
            expect(streak).toBe(1);
        }));
        it('should handle empty notes and trim whitespace', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, testProgress), { notes: '  ' }));
            expect(progress.notes).toBe('');
            const progressWithSpaces = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, testProgress), { notes: '  Test notes  ' }));
            expect(progressWithSpaces.notes).toBe('Test notes');
        }));
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress({});
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.meditationId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.endTime).toBeDefined();
        }));
        it('should validate mood enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress(Object.assign(Object.assign({}, createTestProgress()), { mood: 'invalid' }));
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.mood).toBeDefined();
        }));
        it('should validate minimum duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = new progress_model_1.Progress(Object.assign(Object.assign({}, createTestProgress()), { duration: -1 }));
            const validationError = yield progress.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
    });
    describe('Default Values', () => {
        it('should set completed to true by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, createTestProgress()), { completed: undefined }));
            expect(progress.completed).toBe(true);
        }));
        it('should set timestamps', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(createTestProgress());
            expect(progress.createdAt).toBeDefined();
            expect(progress.updatedAt).toBeDefined();
            expect(progress.createdAt).toBeInstanceOf(Date);
            expect(progress.updatedAt).toBeInstanceOf(Date);
        }));
    });
    describe('Virtual Fields', () => {
        it('should calculate session length in minutes', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later
            const progress = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, createTestProgress()), { startTime,
                endTime }));
            expect(progress.sessionLength).toBe(30);
        }));
    });
    describe('Static Methods', () => {
        it('should calculate total meditation time', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, createTestProgress()), { userId, duration: 15 }),
                Object.assign(Object.assign({}, createTestProgress()), { userId, duration: 30 }),
                Object.assign(Object.assign({}, createTestProgress()), { userId, duration: 45 })
            ]);
            const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId.toString());
            expect(totalTime).toBe(90);
        }));
        it('should return 0 total time for user with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId.toString());
            expect(totalTime).toBe(0);
        }));
        it('should calculate current streak', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, createTestProgress()), { userId, startTime: today, endTime: new Date(today.getTime() + 15 * 60 * 1000) }),
                Object.assign(Object.assign({}, createTestProgress()), { userId, startTime: yesterday, endTime: new Date(yesterday.getTime() + 15 * 60 * 1000) }),
                Object.assign(Object.assign({}, createTestProgress()), { userId, startTime: twoDaysAgo, endTime: new Date(twoDaysAgo.getTime() + 15 * 60 * 1000) })
            ]);
            const streak = yield progress_model_1.Progress.getCurrentStreak(userId.toString());
            expect(streak).toBe(3);
        }));
        it('should break streak on missed day', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId();
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            yield progress_model_1.Progress.create([
                Object.assign(Object.assign({}, createTestProgress()), { userId, startTime: today, endTime: new Date(today.getTime() + 15 * 60 * 1000) }),
                Object.assign(Object.assign({}, createTestProgress()), { userId, startTime: threeDaysAgo, endTime: new Date(threeDaysAgo.getTime() + 15 * 60 * 1000) })
            ]);
            const streak = yield progress_model_1.Progress.getCurrentStreak(userId.toString());
            expect(streak).toBe(1); // Only today counts
        }));
    });
    describe('Indexes', () => {
        it('should have compound index on userId and createdAt', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some(index => index.key && index.key.userId === 1 && index.key.createdAt === -1);
            expect(hasIndex).toBe(true);
        }));
        it('should have index on meditationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some(index => index.key && index.key.meditationId === 1);
            expect(hasIndex).toBe(true);
        }));
        it('should have index on startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some(index => index.key && index.key.startTime === 1);
            expect(hasIndex).toBe(true);
        }));
    });
    describe('Data Integrity', () => {
        it('should trim notes field', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(Object.assign(Object.assign({}, createTestProgress()), { notes: '  Test notes  ' }));
            expect(progress.notes).toBe('Test notes');
        }));
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(createTestProgress());
            const originalUpdatedAt = progress.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            progress.notes = 'Updated notes';
            yield progress.save();
            expect(progress.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
});
