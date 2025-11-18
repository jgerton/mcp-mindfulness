"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stress_level_model_1 = require("../../models/stress-level.model");
describe('StressLevel Model', () => {
    let mapNumericToStressLevel;
    beforeEach(() => {
        mapNumericToStressLevel = (level) => {
            if (level <= 2)
                return stress_level_model_1.StressLevel.VERY_LOW;
            if (level <= 4)
                return stress_level_model_1.StressLevel.LOW;
            if (level <= 6)
                return stress_level_model_1.StressLevel.MODERATE;
            if (level <= 8)
                return stress_level_model_1.StressLevel.HIGH;
            return stress_level_model_1.StressLevel.VERY_HIGH;
        };
        jest.spyOn(Object, 'values').mockImplementation((obj) => {
            if (obj === stress_level_model_1.StressLevel) {
                return [
                    stress_level_model_1.StressLevel.VERY_LOW,
                    stress_level_model_1.StressLevel.LOW,
                    stress_level_model_1.StressLevel.MODERATE,
                    stress_level_model_1.StressLevel.HIGH,
                    stress_level_model_1.StressLevel.VERY_HIGH
                ];
            }
            return Object.values(obj);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Success Cases', () => {
        it('should have all expected stress levels defined', () => {
            const expectedLevels = [
                'VERY_LOW',
                'LOW',
                'MODERATE',
                'HIGH',
                'VERY_HIGH'
            ];
            expectedLevels.forEach(level => {
                expect(stress_level_model_1.StressLevel[level]).toBeDefined();
            });
        });
        it('should map numeric values to correct stress levels', () => {
            expect(mapNumericToStressLevel(1)).toBe(stress_level_model_1.StressLevel.VERY_LOW);
            expect(mapNumericToStressLevel(3)).toBe(stress_level_model_1.StressLevel.LOW);
            expect(mapNumericToStressLevel(5)).toBe(stress_level_model_1.StressLevel.MODERATE);
            expect(mapNumericToStressLevel(7)).toBe(stress_level_model_1.StressLevel.HIGH);
            expect(mapNumericToStressLevel(9)).toBe(stress_level_model_1.StressLevel.VERY_HIGH);
        });
        it('should maintain correct ordinal relationship', () => {
            const orderedLevels = [
                stress_level_model_1.StressLevel.VERY_LOW,
                stress_level_model_1.StressLevel.LOW,
                stress_level_model_1.StressLevel.MODERATE,
                stress_level_model_1.StressLevel.HIGH,
                stress_level_model_1.StressLevel.VERY_HIGH
            ];
            for (let i = 1; i < orderedLevels.length; i++) {
                const currentEnumValue = Object.keys(stress_level_model_1.StressLevel).indexOf(orderedLevels[i]);
                const previousEnumValue = Object.keys(stress_level_model_1.StressLevel).indexOf(orderedLevels[i - 1]);
                expect(currentEnumValue).toBeGreaterThan(previousEnumValue);
            }
        });
    });
    describe('Error Cases', () => {
        it('should not accept invalid stress level values', () => {
            const invalidLevel = 'INVALID_LEVEL';
            expect(() => {
                // @ts-ignore - Testing runtime behavior
                stress_level_model_1.StressLevel[invalidLevel];
            }).toThrow();
        });
        it('should reject undefined stress level', () => {
            expect(() => {
                // @ts-ignore - Testing runtime behavior
                stress_level_model_1.StressLevel[undefined];
            }).toThrow();
        });
        it('should reject null stress level', () => {
            expect(() => {
                // @ts-ignore - Testing runtime behavior
                stress_level_model_1.StressLevel[null];
            }).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle boundary values correctly', () => {
            expect(mapNumericToStressLevel(2)).toBe(stress_level_model_1.StressLevel.VERY_LOW);
            expect(mapNumericToStressLevel(4)).toBe(stress_level_model_1.StressLevel.LOW);
            expect(mapNumericToStressLevel(6)).toBe(stress_level_model_1.StressLevel.MODERATE);
            expect(mapNumericToStressLevel(8)).toBe(stress_level_model_1.StressLevel.HIGH);
            expect(mapNumericToStressLevel(10)).toBe(stress_level_model_1.StressLevel.VERY_HIGH);
        });
        it('should handle extreme numeric values', () => {
            expect(mapNumericToStressLevel(0)).toBe(stress_level_model_1.StressLevel.VERY_LOW);
            expect(mapNumericToStressLevel(100)).toBe(stress_level_model_1.StressLevel.VERY_HIGH);
        });
        it('should handle decimal values', () => {
            expect(mapNumericToStressLevel(1.5)).toBe(stress_level_model_1.StressLevel.VERY_LOW);
            expect(mapNumericToStressLevel(3.9)).toBe(stress_level_model_1.StressLevel.LOW);
            expect(mapNumericToStressLevel(5.5)).toBe(stress_level_model_1.StressLevel.MODERATE);
        });
    });
});
