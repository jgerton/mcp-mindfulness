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
const meditation_session_model_1 = require("../models/meditation-session.model");
describe('Meditation Session Analytics', () => {
    let userId;
    let meditationId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        userId = new mongoose_1.default.Types.ObjectId();
        meditationId = new mongoose_1.default.Types.ObjectId();
    }));
    describe('Time of Day Patterns', () => {
        it('should correctly group sessions by time blocks', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create sessions at different times
            yield meditation_session_model_1.MeditationSession.create([
                {
                    userId,
                    title: 'Morning Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date('2024-03-12T06:00:00'),
                    endTime: new Date('2024-03-12T06:15:00'),
                    duration: 15,
                    durationCompleted: 15,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                },
                {
                    userId,
                    title: 'Afternoon Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date('2024-03-12T12:00:00'),
                    endTime: new Date('2024-03-12T12:20:00'),
                    duration: 20,
                    durationCompleted: 20,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'anxious',
                    moodAfter: 'calm'
                },
                {
                    userId,
                    title: 'Evening Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date('2024-03-12T18:00:00'),
                    endTime: new Date('2024-03-12T18:30:00'),
                    duration: 30,
                    durationCompleted: 30,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'stressed',
                    moodAfter: 'calm'
                }
            ]);
            const timeBlockPipeline = [
                { $match: { userId } },
                {
                    $group: {
                        _id: {
                            $switch: {
                                branches: [
                                    { case: { $lt: [{ $hour: '$startTime' }, 12] }, then: 'morning' },
                                    { case: { $lt: [{ $hour: '$startTime' }, 18] }, then: 'afternoon' },
                                    { case: { $lt: [{ $hour: '$startTime' }, 24] }, then: 'evening' }
                                ],
                                default: 'night'
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ];
            const results = yield meditation_session_model_1.MeditationSession.aggregate(timeBlockPipeline);
            expect(results).toHaveLength(3);
            const morning = results.find(r => r._id === 'morning');
            expect(morning.count).toBe(1);
            const afternoon = results.find(r => r._id === 'afternoon');
            expect(afternoon.count).toBe(1);
            const evening = results.find(r => r._id === 'evening');
            expect(evening.count).toBe(1);
        }));
    });
    describe('Duration Trends', () => {
        it('should correctly analyze session duration patterns', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create sessions with different durations
            yield meditation_session_model_1.MeditationSession.create([
                {
                    userId,
                    title: 'Short Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 5 * 60000),
                    duration: 5,
                    durationCompleted: 5,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                },
                {
                    userId,
                    title: 'Medium Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 15 * 60000),
                    duration: 15,
                    durationCompleted: 15,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'stressed',
                    moodAfter: 'calm'
                },
                {
                    userId,
                    title: 'Long Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 20 * 60000),
                    duration: 20,
                    durationCompleted: 20,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'neutral',
                    moodAfter: 'peaceful'
                },
                {
                    userId,
                    title: 'Extra Long Meditation',
                    type: 'guided',
                    guidedMeditationId: meditationId,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 30 * 60000),
                    duration: 30,
                    durationCompleted: 30,
                    status: 'completed',
                    interruptions: 0,
                    completed: true,
                    moodBefore: 'stressed',
                    moodAfter: 'calm'
                }
            ]);
            const durationPipeline = [
                { $match: { userId } },
                {
                    $group: {
                        _id: {
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$duration', 10] }, then: 'short' },
                                    { case: { $lte: ['$duration', 20] }, then: 'medium' },
                                    { case: { $gt: ['$duration', 20] }, then: 'long' }
                                ],
                                default: 'unknown'
                            }
                        },
                        count: { $sum: 1 },
                        totalMinutes: { $sum: '$duration' }
                    }
                }
            ];
            const results = yield meditation_session_model_1.MeditationSession.aggregate(durationPipeline);
            expect(results).toHaveLength(3);
            const short = results.find(r => r._id === 'short');
            expect(short.count).toBe(1);
            expect(short.totalMinutes).toBe(5);
            const medium = results.find(r => r._id === 'medium');
            expect(medium.count).toBe(2);
            expect(medium.totalMinutes).toBe(35);
            const long = results.find(r => r._id === 'long');
            expect(long.count).toBe(1);
            expect(long.totalMinutes).toBe(30);
        }));
    });
});
