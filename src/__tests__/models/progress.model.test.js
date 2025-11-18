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
const progress_factory_1 = require("../factories/progress.factory");
describe('Progress Model', () => {
    let progressFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
        progressFactory = new progress_factory_1.ProgressTestFactory();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    describe('Schema Validation', () => {
        it('should create a valid progress record', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create();
            const savedProgress = yield progress_model_1.Progress.create(progress);
            expect(savedProgress._id).toBeDefined();
            expect(savedProgress.userId).toBe(progress.userId);
            expect(savedProgress.meditationId).toBe(progress.meditationId);
            expect(savedProgress.duration).toBe(progress.duration);
        }));
        it('should require userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ userId: undefined });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should require meditationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ meditationId: undefined });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should require duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ duration: undefined });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should require startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ startTime: undefined });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should require endTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ endTime: undefined });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should validate mood enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ mood: 'invalid' });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
        it('should validate minimum duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = progressFactory.create({ duration: -1 });
            yield expect(progress_model_1.Progress.create(progress)).rejects.toThrow();
        }));
    });
    describe('Virtual Fields', () => {
        it('should calculate session length in minutes', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.withDuration(30));
            expect(progress.sessionLength).toBe(30);
        }));
        it('should handle zero duration sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.withDuration(0));
            expect(progress.sessionLength).toBe(0);
        }));
    });
    describe('Static Methods', () => {
        describe('getTotalMeditationTime', () => {
            it('should calculate total meditation time', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                yield progress_model_1.Progress.create([
                    progressFactory.withDuration(15).create({ userId }),
                    progressFactory.withDuration(30).create({ userId }),
                    progressFactory.withDuration(45).create({ userId })
                ]);
                const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId);
                expect(totalTime).toBe(90);
            }));
            it('should return 0 for user with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId);
                expect(totalTime).toBe(0);
            }));
            it('should only count completed sessions', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                yield progress_model_1.Progress.create([
                    progressFactory.create({ userId, duration: 15, completed: true }),
                    progressFactory.create({ userId, duration: 30, completed: false }),
                    progressFactory.create({ userId, duration: 45, completed: true })
                ]);
                const totalTime = yield progress_model_1.Progress.getTotalMeditationTime(userId);
                expect(totalTime).toBe(60);
            }));
        });
        describe('getCurrentStreak', () => {
            it('should calculate current streak correctly', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                yield progress_model_1.Progress.create([
                    progressFactory.forStreak(userId, 0), // today
                    progressFactory.forStreak(userId, 1), // yesterday
                    progressFactory.forStreak(userId, 2) // 2 days ago
                ]);
                const streak = yield progress_model_1.Progress.getCurrentStreak(userId);
                expect(streak).toBe(3);
            }));
            it('should break streak on missed day', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                yield progress_model_1.Progress.create([
                    progressFactory.forStreak(userId, 0), // today
                    progressFactory.forStreak(userId, 2) // 2 days ago (missing yesterday)
                ]);
                const streak = yield progress_model_1.Progress.getCurrentStreak(userId);
                expect(streak).toBe(1);
            }));
            it('should handle multiple sessions per day in streak', () => __awaiter(void 0, void 0, void 0, function* () {
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const today = new Date();
                yield progress_model_1.Progress.create([
                    progressFactory.create({ userId, startTime: today, duration: 15 }),
                    progressFactory.create({ userId, startTime: today, duration: 15 }),
                    progressFactory.forStreak(userId, 1), // yesterday
                ]);
                const streak = yield progress_model_1.Progress.getCurrentStreak(userId);
                expect(streak).toBe(2);
            }));
        });
    });
    describe('Indexes', () => {
        it('should have compound index on userId and createdAt', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some((index) => index.key.userId === 1 && index.key.createdAt === -1);
            expect(hasIndex).toBe(true);
        }));
        it('should have index on meditationId', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some((index) => index.key.meditationId === 1);
            expect(hasIndex).toBe(true);
        }));
        it('should have index on startTime', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield progress_model_1.Progress.collection.getIndexes();
            const hasIndex = Object.values(indexes).some((index) => index.key.startTime === 1);
            expect(hasIndex).toBe(true);
        }));
    });
    describe('Data Integrity', () => {
        it('should trim notes field', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.withNotes('  Test notes  '));
            expect(progress.notes).toBe('Test notes');
        }));
        it('should handle empty notes', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.withNotes(''));
            expect(progress.notes).toBe('');
        }));
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.create());
            const originalUpdatedAt = progress.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            progress.notes = 'Updated notes';
            yield progress.save();
            expect(progress.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
    describe('Mood Tracking', () => {
        it('should track mood changes', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.withMood('neutral'));
            expect(progress.mood).toBe('neutral');
            progress.mood = 'positive';
            yield progress.save();
            expect(progress.mood).toBe('positive');
        }));
        it('should allow mood to be undefined', () => __awaiter(void 0, void 0, void 0, function* () {
            const progress = yield progress_model_1.Progress.create(progressFactory.create({ mood: undefined }));
            expect(progress.mood).toBeUndefined();
        }));
        it('should validate mood values', () => __awaiter(void 0, void 0, void 0, function* () {
            const validMoods = ['very-negative', 'negative', 'neutral', 'positive', 'very-positive'];
            for (const mood of validMoods) {
                const progress = yield progress_model_1.Progress.create(progressFactory.withMood(mood));
                expect(progress.mood).toBe(mood);
            }
        }));
    });
});
