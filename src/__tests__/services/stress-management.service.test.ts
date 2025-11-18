import mongoose from 'mongoose';
import { StressManagementService } from '../../services/stress-management.service';
import { StressAssessmentLegacy, UserPreferences } from '../../models/stress.model';
import { StressLevel, TechniqueType } from '../../types/stress.types';
import { dbHandler } from '../test-utils/db-handler';

jest.mock('../../models/stress.model');

describe('StressManagementService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  
  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('Stress Assessment', () => {
    describe('Success Cases', () => {
      it('should successfully assess high stress level', async () => {
        const assessment = {
          userId: mockUserId,
          physicalSymptoms: 8,
          emotionalSymptoms: 7,
          behavioralSymptoms: 6,
          cognitiveSymptoms: 7
        };

        const result = await StressManagementService.assessStressLevel(mockUserId, assessment);
        expect(result).toBe(StressLevel.HIGH);
      });

      it('should successfully assess low stress level', async () => {
        const assessment = {
          userId: mockUserId,
          physicalSymptoms: 2,
          emotionalSymptoms: 1,
          behavioralSymptoms: 1,
          cognitiveSymptoms: 2
        };

        const result = await StressManagementService.assessStressLevel(mockUserId, assessment);
        expect(result).toBe(StressLevel.LOW);
      });
    });

    describe('Error Cases', () => {
      it('should throw error for missing user ID', async () => {
        const assessment = {
          userId: '',
          physicalSymptoms: 5,
          emotionalSymptoms: 5,
          behavioralSymptoms: 5,
          cognitiveSymptoms: 5
        };

        await expect(StressManagementService.assessStressLevel('', assessment))
          .rejects.toThrow('User ID is required for stress assessment');
      });

      it('should throw error for invalid assessment data', async () => {
        const invalidAssessment = null;
        await expect(StressManagementService.assessStressLevel(mockUserId, invalidAssessment as any))
          .rejects.toThrow('Assessment data is required');
      });
    });

    describe('Edge Cases', () => {
      it('should handle maximum symptom values', async () => {
        const assessment = {
          userId: mockUserId,
          physicalSymptoms: 10,
          emotionalSymptoms: 10,
          behavioralSymptoms: 10,
          cognitiveSymptoms: 10
        };

        const result = await StressManagementService.assessStressLevel(mockUserId, assessment);
        expect(result).toBe(StressLevel.HIGH);
      });

      it('should handle minimum symptom values', async () => {
        const assessment = {
          userId: mockUserId,
          physicalSymptoms: 0,
          emotionalSymptoms: 0,
          behavioralSymptoms: 0,
          cognitiveSymptoms: 0
        };

        const result = await StressManagementService.assessStressLevel(mockUserId, assessment);
        expect(result).toBe(StressLevel.LOW);
      });

      it('should handle missing symptom values with defaults', async () => {
        const assessment = {
          userId: mockUserId,
          physicalSymptoms: 5
        };

        const result = await StressManagementService.assessStressLevel(mockUserId, assessment as any);
        expect([StressLevel.LOW, StressLevel.MODERATE, StressLevel.HIGH]).toContain(result);
      });
    });
  });

  describe('Stress Recommendations', () => {
    describe('Success Cases', () => {
      it('should successfully return recommendations based on preferences', async () => {
        await UserPreferences.create({
          userId: mockUserId,
          preferredTechniques: [TechniqueType.BREATHING, TechniqueType.MEDITATION],
          preferredDuration: 15,
          timePreferences: {
            reminderFrequency: 'DAILY',
            preferredTimes: ['09:00', '18:00']
          }
        });

        const recommendations = await StressManagementService.getRecommendations(mockUserId, StressLevel.HIGH);
        expect(recommendations).toBeInstanceOf(Array);
        expect(recommendations.length).toBeGreaterThan(0);
        recommendations.forEach(rec => {
          expect(rec).toHaveProperty('duration');
          expect(rec).toHaveProperty('technique');
          expect(rec).toHaveProperty('type');
          expect(rec).toHaveProperty('title');
          expect(rec).toHaveProperty('description');
        });
      });
    });

    describe('Error Cases', () => {
      it('should throw error for invalid user ID', async () => {
        await expect(StressManagementService.getRecommendations('invalid-id'))
          .rejects.toThrow('Invalid user ID format');
      });
    });

    describe('Edge Cases', () => {
      it('should handle user with no preferences', async () => {
        const newUserId = new mongoose.Types.ObjectId().toString();
        const recommendations = await StressManagementService.getRecommendations(newUserId, StressLevel.MODERATE);
        
        expect(recommendations).toBeInstanceOf(Array);
        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations[0].duration).toBeGreaterThan(0);
      });

      it('should handle all stress levels', async () => {
        for (const level of Object.values(StressLevel)) {
          const recommendations = await StressManagementService.getRecommendations(mockUserId, level);
          expect(recommendations).toBeInstanceOf(Array);
          expect(recommendations.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Stress Change Tracking', () => {
    describe('Success Cases', () => {
      it('should successfully record stress change', async () => {
        const consoleSpy = jest.spyOn(console, 'log');

        await StressManagementService.recordStressChange(
          mockUserId,
          StressLevel.HIGH,
          StressLevel.MODERATE,
          'breathing_exercise'
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`User ${mockUserId} stress change: HIGH -> MODERATE using breathing_exercise`)
        );
      });
    });

    describe('Error Cases', () => {
      it('should throw error for missing parameters', async () => {
        await expect(StressManagementService.recordStressChange(
          mockUserId,
          StressLevel.HIGH,
          undefined as any,
          'breathing_exercise'
        )).rejects.toThrow('Missing required parameters for recordStressChange');
      });
    });

    describe('Edge Cases', () => {
      it('should handle all stress level combinations', async () => {
        const levels = Object.values(StressLevel);
        for (const before of levels) {
          for (const after of levels) {
            await StressManagementService.recordStressChange(
              mockUserId,
              before,
              after,
              'test_technique'
            );
          }
        }
      });
    });
  });

  describe('Stress History and Analytics', () => {
    describe('Success Cases', () => {
      beforeEach(async () => {
        const now = new Date();
        const assessments = [
          { userId: mockUserId, level: StressLevel.HIGH, score: 8, timestamp: now },
          { userId: mockUserId, level: StressLevel.LOW, score: 2, timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        ];

        await StressAssessmentLegacy.insertMany(assessments);
      });

      it('should return stress history', async () => {
        const history = await StressManagementService.getStressHistory(mockUserId);
        expect(history).toHaveLength(2);
        expect(history[0].level).toBe(StressLevel.HIGH);
        expect(history[1].level).toBe(StressLevel.LOW);
      });

      it('should return correct analytics', async () => {
        const analytics = await StressManagementService.getStressAnalytics(mockUserId);
        expect(analytics).toHaveProperty('averageLevel');
        expect(analytics).toHaveProperty('trendAnalysis');
        expect(analytics).toHaveProperty('peakStressTimes');
      });

      it('should identify correct patterns', async () => {
        const patterns = await StressManagementService.getStressPatterns(mockUserId);
        expect(patterns).toHaveProperty('weekdayPatterns');
        expect(patterns).toHaveProperty('timeOfDayPatterns');
        expect(patterns).toHaveProperty('commonTriggers');
      });

      it('should identify peak stress hours', async () => {
        const peakHours = await StressManagementService.getPeakStressHours(mockUserId);
        expect(Array.isArray(peakHours)).toBe(true);
        expect(peakHours.length).toBeGreaterThan(0);
      });
    });

    describe('Error Cases', () => {
      it('should throw error for invalid user ID in stress history', async () => {
        await expect(StressManagementService.getStressHistory('invalid-id'))
          .rejects.toThrow('Invalid user ID format');
      });

      it('should throw error for invalid user ID in analytics', async () => {
        await expect(StressManagementService.getStressAnalytics('invalid-id'))
          .rejects.toThrow('Invalid user ID format');
      });

      it('should throw error for invalid user ID in patterns', async () => {
        await expect(StressManagementService.getStressPatterns('invalid-id'))
          .rejects.toThrow('Invalid user ID format');
      });

      it('should throw error for invalid user ID in peak hours', async () => {
        await expect(StressManagementService.getPeakStressHours('invalid-id'))
          .rejects.toThrow('Invalid user ID format');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty history', async () => {
        const history = await StressManagementService.getStressHistory(mockUserId);
        expect(history).toHaveLength(0);
      });

      it('should handle no assessments in analytics', async () => {
        const analytics = await StressManagementService.getStressAnalytics(mockUserId);
        expect(analytics.averageLevel).toBe(0);
        expect(analytics.trendAnalysis).toBe('STABLE');
        expect(analytics.peakStressTimes).toBeInstanceOf(Array);
      });

      it('should handle no assessments in patterns', async () => {
        const patterns = await StressManagementService.getStressPatterns(mockUserId);
        expect(patterns.weekdayPatterns).toBeDefined();
        expect(patterns.timeOfDayPatterns).toBeDefined();
        expect(patterns.commonTriggers).toBeDefined();
      });

      it('should handle no assessments in peak hours', async () => {
        const peakHours = await StressManagementService.getPeakStressHours(mockUserId);
        expect(Array.isArray(peakHours)).toBe(true);
        expect(peakHours.length).toBe(0);
      });
    });
  });
});