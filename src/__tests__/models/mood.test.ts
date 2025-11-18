import { MoodTypes, moodValues } from '../../models/mood-types.model';
import { IMood } from '../../models/mood.model';

describe('Mood Model', () => {
  let testMood: IMood;

  beforeEach(() => {
    testMood = {
      type: MoodTypes.NEUTRAL,
      timestamp: new Date()
    };

    jest.spyOn(Object, 'values').mockImplementation((obj) => {
      if (obj === MoodTypes) {
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
      expect(testMood.type).toBe(MoodTypes.NEUTRAL);
      expect(testMood.timestamp).toBeInstanceOf(Date);
    });

    it('should accept all valid mood types', () => {
      const validTypes = [
        MoodTypes.VERY_NEGATIVE,
        MoodTypes.NEGATIVE,
        MoodTypes.NEUTRAL,
        MoodTypes.POSITIVE,
        MoodTypes.VERY_POSITIVE,
        MoodTypes.ANXIOUS,
        MoodTypes.STRESSED,
        MoodTypes.CALM,
        MoodTypes.PEACEFUL
      ];

      validTypes.forEach(type => {
        const mood: IMood = { ...testMood, type };
        expect(mood.type).toBe(type);
        expect(moodValues[type]).toBeDefined();
        expect(typeof moodValues[type]).toBe('number');
      });
    });

    it('should maintain correct value relationships between moods', () => {
      expect(moodValues[MoodTypes.VERY_POSITIVE]).toBeGreaterThan(moodValues[MoodTypes.VERY_NEGATIVE]);
      expect(moodValues[MoodTypes.POSITIVE]).toBeGreaterThan(moodValues[MoodTypes.NEGATIVE]);
      expect(moodValues[MoodTypes.PEACEFUL]).toBeGreaterThan(moodValues[MoodTypes.STRESSED]);
      expect(moodValues[MoodTypes.CALM]).toBeGreaterThan(moodValues[MoodTypes.ANXIOUS]);
    });
  });

  describe('Error Cases', () => {
    it('should reject invalid mood types', () => {
      expect(() => {
        const mood: IMood = {
          // @ts-ignore - Testing runtime behavior
          type: 'INVALID_MOOD',
          timestamp: new Date()
        };
        // @ts-ignore - Testing runtime behavior
        expect(moodValues[mood.type]).toBeUndefined();
      }).not.toThrow();
    });

    it('should reject missing timestamp', () => {
      expect(() => {
        const mood: IMood = {
          type: MoodTypes.NEUTRAL,
          // @ts-ignore - Testing runtime behavior
          timestamp: undefined
        };
      }).toThrow();
    });

    it('should reject invalid timestamp format', () => {
      expect(() => {
        const mood: IMood = {
          type: MoodTypes.NEUTRAL,
          // @ts-ignore - Testing runtime behavior
          timestamp: 'not-a-date'
        };
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary mood values', () => {
      // Test minimum value
      expect(moodValues[MoodTypes.VERY_NEGATIVE]).toBe(1);
      expect(moodValues[MoodTypes.STRESSED]).toBe(1);

      // Test maximum value
      expect(moodValues[MoodTypes.VERY_POSITIVE]).toBe(5);
      expect(moodValues[MoodTypes.PEACEFUL]).toBe(5);
    });

    it('should handle equivalent emotional states', () => {
      expect(moodValues[MoodTypes.VERY_NEGATIVE]).toBe(moodValues[MoodTypes.STRESSED]);
      expect(moodValues[MoodTypes.NEGATIVE]).toBe(moodValues[MoodTypes.ANXIOUS]);
      expect(moodValues[MoodTypes.POSITIVE]).toBe(moodValues[MoodTypes.CALM]);
      expect(moodValues[MoodTypes.VERY_POSITIVE]).toBe(moodValues[MoodTypes.PEACEFUL]);
    });

    it('should handle timestamp edge cases', () => {
      // Test with current timestamp
      const now = new Date();
      const currentMood: IMood = { ...testMood, timestamp: now };
      expect(currentMood.timestamp).toEqual(now);

      // Test with past timestamp
      const past = new Date('2000-01-01');
      const pastMood: IMood = { ...testMood, timestamp: past };
      expect(pastMood.timestamp).toEqual(past);
    });
  });
}); 