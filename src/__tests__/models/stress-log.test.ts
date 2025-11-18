import mongoose from 'mongoose';
import { StressLog } from '../../models/stress-log.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { StressLogTestFactory } from '../factories/stress-log.factory';

describe('StressLog Model', () => {
  let stressLogFactory: StressLogTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    stressLogFactory = new StressLogTestFactory();
    jest.spyOn(StressLog.prototype, 'save').mockImplementation(function(this: any) {
      return Promise.resolve(this);
    });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create and save log successfully', async () => {
      const testData = stressLogFactory.create();
      const log = await StressLog.create(testData);
      expect(log.userId).toBeDefined();
      expect(log.level).toBe(testData.level);
      expect(log.triggers).toEqual(testData.triggers);
      expect(log.symptoms).toEqual(testData.symptoms);
    });

    it('should set default date to current time', async () => {
      const log = await StressLog.create(stressLogFactory.create());
      const now = new Date();
      expect(log.date.getTime()).toBeCloseTo(now.getTime(), -2);
    });

    it('should trim string fields correctly', async () => {
      const log = await StressLog.create(stressLogFactory.create({
        triggers: ['  work  ', ' traffic '],
        symptoms: ['  headache  ', ' fatigue '],
        notes: '  Test notes  '
      }));
      expect(log.triggers[0]).toBe('work');
      expect(log.symptoms[0]).toBe('headache');
      expect(log.notes).toBe('Test notes');
    });
  });

  describe('Error Cases', () => {
    it('should fail when required fields are missing', () => {
      expect(() => new StressLog({})).toThrow();
    });

    it('should reject invalid stress level', () => {
      expect(() => new StressLog(stressLogFactory.create({ level: 11 }))).toThrow();
    });

    it('should reject too many triggers', () => {
      expect(() => new StressLog(stressLogFactory.create({
        triggers: Array(6).fill('trigger')
      }))).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum stress level', () => {
      expect(() => new StressLog(stressLogFactory.withLevel(1))).not.toThrow();
    });

    it('should handle maximum stress level', () => {
      expect(() => new StressLog(stressLogFactory.withLevel(10))).not.toThrow();
    });

    it('should handle empty arrays', async () => {
      const log = await StressLog.create(stressLogFactory.withoutOptionalFields());
      expect(log.triggers).toEqual([]);
      expect(log.symptoms).toEqual([]);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const log = new StressLog({});
      const validationError = await log.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.level).toBeDefined();
    });

    it('should validate stress level range', async () => {
      const tooLow = new StressLog(stressLogFactory.withLevel(0));
      const tooHigh = new StressLog(stressLogFactory.withLevel(11));

      expect(await tooLow.validateSync()?.errors.level).toBeDefined();
      expect(await tooHigh.validateSync()?.errors.level).toBeDefined();
    });

    it('should validate trigger array length and content', async () => {
      const tooManyTriggers = new StressLog(stressLogFactory.create({
        triggers: Array(6).fill('trigger')
      }));

      const longTrigger = new StressLog(stressLogFactory.create({
        triggers: ['a'.repeat(101)]
      }));

      expect(await tooManyTriggers.validateSync()?.errors.triggers).toBeDefined();
      expect(await longTrigger.validateSync()?.errors['triggers.0']).toBeDefined();
    });

    it('should validate symptom array length and content', async () => {
      const tooManySymptoms = new StressLog(stressLogFactory.create({
        symptoms: Array(11).fill('symptom')
      }));

      const longSymptom = new StressLog(stressLogFactory.create({
        symptoms: ['a'.repeat(101)]
      }));

      expect(await tooManySymptoms.validateSync()?.errors.symptoms).toBeDefined();
      expect(await longSymptom.validateSync()?.errors['symptoms.0']).toBeDefined();
    });

    it('should validate notes length', async () => {
      const log = new StressLog(stressLogFactory.withLongNotes());
      expect(await log.validateSync()?.errors.notes).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set timestamps', async () => {
      const log = await StressLog.create(stressLogFactory.create());
      
      expect(log.createdAt).toBeDefined();
      expect(log.updatedAt).toBeDefined();
      expect(log.createdAt).toBeInstanceOf(Date);
      expect(log.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Data Integrity', () => {
    it('should trim string fields in arrays', async () => {
      const log = await StressLog.create(stressLogFactory.create({
        triggers: ['  work  ', ' traffic '],
        symptoms: ['  headache  ', ' fatigue ']
      }));
      expect(log.triggers).toEqual(['work', 'traffic']);
      expect(log.symptoms).toEqual(['headache', 'fatigue']);
    });
  });
}); 