import { StressLevel } from '../../models/stress-level.model';

describe('StressLevel Model', () => {
  let mapNumericToStressLevel: (level: number) => StressLevel;

  beforeEach(() => {
    mapNumericToStressLevel = (level: number): StressLevel => {
      if (level <= 2) return StressLevel.VERY_LOW;
      if (level <= 4) return StressLevel.LOW;
      if (level <= 6) return StressLevel.MODERATE;
      if (level <= 8) return StressLevel.HIGH;
      return StressLevel.VERY_HIGH;
    };
    jest.spyOn(Object, 'values').mockImplementation((obj) => {
      if (obj === StressLevel) {
        return [
          StressLevel.VERY_LOW,
          StressLevel.LOW,
          StressLevel.MODERATE,
          StressLevel.HIGH,
          StressLevel.VERY_HIGH
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
        expect(StressLevel[level as keyof typeof StressLevel]).toBeDefined();
      });
    });

    it('should map numeric values to correct stress levels', () => {
      expect(mapNumericToStressLevel(1)).toBe(StressLevel.VERY_LOW);
      expect(mapNumericToStressLevel(3)).toBe(StressLevel.LOW);
      expect(mapNumericToStressLevel(5)).toBe(StressLevel.MODERATE);
      expect(mapNumericToStressLevel(7)).toBe(StressLevel.HIGH);
      expect(mapNumericToStressLevel(9)).toBe(StressLevel.VERY_HIGH);
    });

    it('should maintain correct ordinal relationship', () => {
      const orderedLevels = [
        StressLevel.VERY_LOW,
        StressLevel.LOW,
        StressLevel.MODERATE,
        StressLevel.HIGH,
        StressLevel.VERY_HIGH
      ];
      for (let i = 1; i < orderedLevels.length; i++) {
        const currentEnumValue = Object.keys(StressLevel).indexOf(orderedLevels[i]);
        const previousEnumValue = Object.keys(StressLevel).indexOf(orderedLevels[i - 1]);
        expect(currentEnumValue).toBeGreaterThan(previousEnumValue);
      }
    });
  });

  describe('Error Cases', () => {
    it('should not accept invalid stress level values', () => {
      const invalidLevel = 'INVALID_LEVEL';
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        StressLevel[invalidLevel];
      }).toThrow();
    });

    it('should reject undefined stress level', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        StressLevel[undefined];
      }).toThrow();
    });

    it('should reject null stress level', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        StressLevel[null];
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values correctly', () => {
      expect(mapNumericToStressLevel(2)).toBe(StressLevel.VERY_LOW);
      expect(mapNumericToStressLevel(4)).toBe(StressLevel.LOW);
      expect(mapNumericToStressLevel(6)).toBe(StressLevel.MODERATE);
      expect(mapNumericToStressLevel(8)).toBe(StressLevel.HIGH);
      expect(mapNumericToStressLevel(10)).toBe(StressLevel.VERY_HIGH);
    });

    it('should handle extreme numeric values', () => {
      expect(mapNumericToStressLevel(0)).toBe(StressLevel.VERY_LOW);
      expect(mapNumericToStressLevel(100)).toBe(StressLevel.VERY_HIGH);
    });

    it('should handle decimal values', () => {
      expect(mapNumericToStressLevel(1.5)).toBe(StressLevel.VERY_LOW);
      expect(mapNumericToStressLevel(3.9)).toBe(StressLevel.LOW);
      expect(mapNumericToStressLevel(5.5)).toBe(StressLevel.MODERATE);
    });
  });
}); 