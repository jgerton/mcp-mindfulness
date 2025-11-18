"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mood_types_model_1 = require("../../models/mood-types.model");
describe('Mood Model', () => {
    let testMood;
    beforeEach(() => {
        testMood = {
            type: mood_types_model_1.MoodTypes.NEUTRAL,
            timestamp: new Date()
        };
        jest.spyOn(Object, 'values').mockImplementation((obj) => {
            if (obj === mood_types_model_1.MoodTypes) {
                return [
                    'VERY_NEGATIVE',
                    'NEGATIVE',
                    'NEUTRAL',
                    'POSITIVE',
                    'VERY_POSITIVE',
                    'ANXIOUS',
                    'STRESSED',
                    'CALM',
                    'PEACEFUL'
                ];
            }
            return Object.values(obj);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Success Cases', () => {
        it('should create valid mood object with all required fields', () => {
            expect(testMood.type).toBe(mood_types_model_1.MoodTypes.NEUTRAL);
            expect(testMood.timestamp).toBeInstanceOf(Date);
        });
        it('should accept all valid mood types', () => {
            const validTypes = [
                mood_types_model_1.MoodTypes.VERY_NEGATIVE,
                mood_types_model_1.MoodTypes.NEGATIVE,
                mood_types_model_1.MoodTypes.NEUTRAL,
                mood_types_model_1.MoodTypes.POSITIVE,
                mood_types_model_1.MoodTypes.VERY_POSITIVE,
                mood_types_model_1.MoodTypes.ANXIOUS,
                mood_types_model_1.MoodTypes.STRESSED,
                mood_types_model_1.MoodTypes.CALM,
                mood_types_model_1.MoodTypes.PEACEFUL
            ];
            validTypes.forEach(type => {
                const mood = Object.assign(Object.assign({}, testMood), { type });
                expect(mood.type).toBe(type);
                expect(mood_types_model_1.moodValues[type]).toBeDefined();
                expect(typeof mood_types_model_1.moodValues[type]).toBe('number');
            });
        });
        it('should maintain correct value relationships between moods', () => {
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_POSITIVE]).toBeGreaterThan(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_NEGATIVE]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.POSITIVE]).toBeGreaterThan(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.NEGATIVE]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.PEACEFUL]).toBeGreaterThan(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.STRESSED]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.CALM]).toBeGreaterThan(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.ANXIOUS]);
        });
    });
    describe('Error Cases', () => {
        it('should reject invalid mood types', () => {
            expect(() => {
                const mood = {
                    // @ts-ignore - Testing runtime behavior
                    type: 'INVALID_MOOD',
                    timestamp: new Date()
                };
                // @ts-ignore - Testing runtime behavior
                expect(mood_types_model_1.moodValues[mood.type]).toBeUndefined();
            }).not.toThrow();
        });
        it('should reject missing timestamp', () => {
            expect(() => {
                const mood = {
                    type: mood_types_model_1.MoodTypes.NEUTRAL,
                    // @ts-ignore - Testing runtime behavior
                    timestamp: undefined
                };
            }).toThrow();
        });
        it('should reject invalid timestamp format', () => {
            expect(() => {
                const mood = {
                    type: mood_types_model_1.MoodTypes.NEUTRAL,
                    // @ts-ignore - Testing runtime behavior
                    timestamp: 'not-a-date'
                };
            }).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle boundary mood values', () => {
            // Test minimum value
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_NEGATIVE]).toBe(1);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.STRESSED]).toBe(1);
            // Test maximum value
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_POSITIVE]).toBe(5);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.PEACEFUL]).toBe(5);
        });
        it('should handle equivalent emotional states', () => {
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_NEGATIVE]).toBe(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.STRESSED]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.NEGATIVE]).toBe(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.ANXIOUS]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.POSITIVE]).toBe(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.CALM]);
            expect(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.VERY_POSITIVE]).toBe(mood_types_model_1.moodValues[mood_types_model_1.MoodTypes.PEACEFUL]);
        });
        it('should handle timestamp edge cases', () => {
            // Test with current timestamp
            const now = new Date();
            const currentMood = Object.assign(Object.assign({}, testMood), { timestamp: now });
            expect(currentMood.timestamp).toEqual(now);
            // Test with past timestamp
            const past = new Date('2000-01-01');
            const pastMood = Object.assign(Object.assign({}, testMood), { timestamp: past });
            expect(pastMood.timestamp).toEqual(past);
        });
    });
});
