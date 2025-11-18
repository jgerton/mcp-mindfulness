import mongoose from 'mongoose';
import { StressLevelService } from '../../services/stress-level.service';
import { StressLog } from '../../models/stress-log.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

describe('StressLevelService', () => {
  let testUserId: string;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    testUserId = new mongoose.Types.ObjectId().toString();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('getUserStressLevels', () => {
    describe('Success Cases', () => {
      it('should get all stress levels for a user', async () => {
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date('2024-01-01'),
            level: 5,
            triggers: ['work'],
            symptoms: ['headache'],
            notes: 'Test note 1'
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date('2024-01-02'),
            level: 3,
            triggers: ['family'],
            symptoms: ['anxiety'],
            notes: 'Test note 2'
          }
        ];

        await StressLog.insertMany(stressLogs);

        const result = await StressLevelService.getUserStressLevels(testUserId);
        expect(result).toHaveLength(2);
        expect(result[0].level).toBe(3); // Most recent first
        expect(result[1].level).toBe(5);
      });

      it('should filter stress levels by date range', async () => {
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date('2024-01-01'),
            level: 5
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date('2024-02-01'),
            level: 3
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date('2024-03-01'),
            level: 4
          }
        ];

        await StressLog.insertMany(stressLogs);

        const result = await StressLevelService.getUserStressLevels(
          testUserId,
          new Date('2024-01-15'),
          new Date('2024-02-15')
        );

        expect(result).toHaveLength(1);
        expect(result[0].level).toBe(3);
      });
    });

    describe('Error Cases', () => {
      it('should handle invalid user ID format', async () => {
        await expect(
          StressLevelService.getUserStressLevels('invalid-id')
        ).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array for non-existent user', async () => {
        const result = await StressLevelService.getUserStressLevels(
          new mongoose.Types.ObjectId().toString()
        );
        expect(result).toHaveLength(0);
      });

      it('should handle empty date range', async () => {
        const result = await StressLevelService.getUserStressLevels(
          testUserId,
          new Date('2024-01-01'),
          new Date('2024-01-01')
        );
        expect(result).toHaveLength(0);
      });
    });
  });

  describe('getAverageStressLevel', () => {
    describe('Success Cases', () => {
      it('should calculate correct average stress level', async () => {
        const today = new Date();
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: today,
            level: 5
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
            level: 3
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            level: 4
          }
        ];

        await StressLog.insertMany(stressLogs);

        const average = await StressLevelService.getAverageStressLevel(testUserId, 30);
        expect(average).toBe(4.0);
      });
    });

    describe('Error Cases', () => {
      it('should handle invalid days parameter', async () => {
        await expect(
          StressLevelService.getAverageStressLevel(testUserId, -1)
        ).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should return 0 for no stress logs', async () => {
        const average = await StressLevelService.getAverageStressLevel(testUserId);
        expect(average).toBe(0);
      });

      it('should only include stress levels within specified days', async () => {
        const today = new Date();
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: today,
            level: 5
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000),
            level: 3
          }
        ];

        await StressLog.insertMany(stressLogs);

        const average = await StressLevelService.getAverageStressLevel(testUserId, 30);
        expect(average).toBe(5.0);
      });
    });
  });

  describe('createStressLog', () => {
    describe('Success Cases', () => {
      it('should create stress log with all fields', async () => {
        const logData = {
          date: new Date('2024-01-01'),
          level: 5,
          triggers: ['work', 'deadlines'],
          symptoms: ['headache', 'anxiety'],
          notes: 'Feeling overwhelmed'
        };

        const result = await StressLevelService.createStressLog(testUserId, logData);

        expect(result.userId.toString()).toBe(testUserId);
        expect(result.level).toBe(5);
        expect(result.triggers).toEqual(['work', 'deadlines']);
        expect(result.symptoms).toEqual(['headache', 'anxiety']);
        expect(result.notes).toBe('Feeling overwhelmed');
      });

      it('should create stress log with minimal fields', async () => {
        const logData = {
          level: 3
        };

        const result = await StressLevelService.createStressLog(testUserId, logData);

        expect(result.userId.toString()).toBe(testUserId);
        expect(result.level).toBe(3);
        expect(result.triggers).toEqual([]);
        expect(result.symptoms).toEqual([]);
        expect(result.date).toBeDefined();
      });
    });

    describe('Error Cases', () => {
      it('should throw error for invalid stress level', async () => {
        const logData = {
          level: 11
        };

        await expect(
          StressLevelService.createStressLog(testUserId, logData)
        ).rejects.toThrow();
      });

      it('should throw error for missing level', async () => {
        const logData = {
          triggers: ['work']
        };

        await expect(
          StressLevelService.createStressLog(testUserId, logData)
        ).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty arrays for triggers and symptoms', async () => {
        const logData = {
          level: 5,
          triggers: [],
          symptoms: []
        };

        const result = await StressLevelService.createStressLog(testUserId, logData);
        expect(result.triggers).toEqual([]);
        expect(result.symptoms).toEqual([]);
      });
    });
  });

  describe('getStressTrends', () => {
    describe('Success Cases', () => {
      it('should identify IMPROVING trend', async () => {
        const today = new Date();
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
            level: 8,
            triggers: ['work']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            level: 6,
            triggers: ['work']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: today,
            level: 4,
            triggers: ['work']
          }
        ];

        await StressLog.insertMany(stressLogs);

        const trends = await StressLevelService.getStressTrends(testUserId, 30);
        expect(trends.trend).toBe('IMPROVING');
        expect(trends.average).toBe(6.0);
        expect(trends.highestLevel).toBe(8);
        expect(trends.lowestLevel).toBe(4);
        expect(trends.commonTriggers).toContain('work');
      });

      it('should identify WORSENING trend', async () => {
        const today = new Date();
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
            level: 4,
            triggers: ['work']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            level: 6,
            triggers: ['family']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: today,
            level: 8,
            triggers: ['health']
          }
        ];

        await StressLog.insertMany(stressLogs);

        const trends = await StressLevelService.getStressTrends(testUserId, 30);
        expect(trends.trend).toBe('WORSENING');
        expect(trends.average).toBe(6.0);
        expect(trends.highestLevel).toBe(8);
        expect(trends.lowestLevel).toBe(4);
        expect(trends.commonTriggers).toHaveLength(3);
      });
    });

    describe('Error Cases', () => {
      it('should handle invalid days parameter', async () => {
        await expect(
          StressLevelService.getStressTrends(testUserId, -1)
        ).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should identify STABLE trend for small variations', async () => {
        const today = new Date();
        const stressLogs = [
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
            level: 5,
            triggers: ['work']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            level: 5,
            triggers: ['work']
          },
          {
            userId: new mongoose.Types.ObjectId(testUserId),
            date: today,
            level: 5,
            triggers: ['work']
          }
        ];

        await StressLog.insertMany(stressLogs);

        const trends = await StressLevelService.getStressTrends(testUserId, 30);
        expect(trends.trend).toBe('STABLE');
        expect(trends.average).toBe(5.0);
      });

      it('should return default values for no stress logs', async () => {
        const trends = await StressLevelService.getStressTrends(testUserId);
        expect(trends).toEqual({
          average: 0,
          trend: 'STABLE',
          highestLevel: 0,
          lowestLevel: 0,
          commonTriggers: []
        });
      });
    });
  });
}); 