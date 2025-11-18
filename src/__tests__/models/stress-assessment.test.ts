import mongoose from 'mongoose';
import { StressAssessment } from '../../models/stress-assessment.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { StressAssessmentTestFactory } from '../factories/stress.factory';
import { StressLevel } from '../../types/stress.types';

describe('StressAssessment Model', () => {
  let stressAssessmentFactory: StressAssessmentTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    stressAssessmentFactory = new StressAssessmentTestFactory();
    jest.spyOn(StressAssessment.prototype, 'save').mockImplementation(function(this: any) {
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
    it('should create and save assessment successfully', async () => {
      const testData = stressAssessmentFactory.create();
      const assessment = await StressAssessment.create(testData);
      expect(assessment.userId).toBeDefined();
      expect(assessment.level).toBe(testData.level);
      expect(assessment.physicalSymptoms).toBe(testData.physicalSymptoms);
      expect(assessment.emotionalSymptoms).toBe(testData.emotionalSymptoms);
      expect(assessment.behavioralSymptoms).toBe(testData.behavioralSymptoms);
      expect(assessment.cognitiveSymptoms).toBe(testData.cognitiveSymptoms);
    });

    it('should handle high symptom levels', async () => {
      const assessment = await StressAssessment.create(stressAssessmentFactory.withHighSymptoms());
      expect(assessment.physicalSymptoms).toBe(8);
      expect(assessment.emotionalSymptoms).toBe(9);
      expect(assessment.behavioralSymptoms).toBe(8);
      expect(assessment.cognitiveSymptoms).toBe(9);
      expect(assessment.score).toBe(9);
    });

    it('should handle low symptom levels', async () => {
      const assessment = await StressAssessment.create(stressAssessmentFactory.withLowSymptoms());
      expect(assessment.physicalSymptoms).toBe(2);
      expect(assessment.emotionalSymptoms).toBe(1);
      expect(assessment.behavioralSymptoms).toBe(2);
      expect(assessment.cognitiveSymptoms).toBe(1);
      expect(assessment.score).toBe(1);
    });
  });

  describe('Error Cases', () => {
    it('should fail when required fields are missing', () => {
      expect(() => new StressAssessment({})).toThrow();
    });

    it('should reject invalid stress level', () => {
      expect(() => new StressAssessment(stressAssessmentFactory.create({
        level: 'INVALID_LEVEL' as StressLevel
      }))).toThrow();
    });

    it('should reject invalid symptom scores', () => {
      expect(() => new StressAssessment(stressAssessmentFactory.create({
        physicalSymptoms: 11,
        emotionalSymptoms: 11,
        behavioralSymptoms: 11,
        cognitiveSymptoms: 11
      }))).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum symptom scores', () => {
      expect(() => new StressAssessment(stressAssessmentFactory.withLowSymptoms())).not.toThrow();
    });

    it('should handle maximum symptom scores', () => {
      expect(() => new StressAssessment(stressAssessmentFactory.withHighSymptoms())).not.toThrow();
    });

    it('should handle all stress levels', () => {
      Object.values(StressLevel).forEach(level => {
        expect(() => new StressAssessment(stressAssessmentFactory.withLevel(level))).not.toThrow();
      });
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const assessment = new StressAssessment({});
      const validationError = await assessment.validateSync();
      
      expect(validationError?.errors.userId).toBeDefined();
      expect(validationError?.errors.level).toBeDefined();
      expect(validationError?.errors.physicalSymptoms).toBeDefined();
      expect(validationError?.errors.emotionalSymptoms).toBeDefined();
      expect(validationError?.errors.behavioralSymptoms).toBeDefined();
      expect(validationError?.errors.cognitiveSymptoms).toBeDefined();
    });

    it('should validate symptom score ranges', async () => {
      const assessment = new StressAssessment(stressAssessmentFactory.create({
        physicalSymptoms: 11,
        emotionalSymptoms: 11,
        behavioralSymptoms: 11,
        cognitiveSymptoms: 11
      }));

      const validationError = await assessment.validateSync();
      expect(validationError?.errors.physicalSymptoms).toBeDefined();
      expect(validationError?.errors.emotionalSymptoms).toBeDefined();
      expect(validationError?.errors.behavioralSymptoms).toBeDefined();
      expect(validationError?.errors.cognitiveSymptoms).toBeDefined();
    });

    it('should validate stress level enum', async () => {
      const assessment = new StressAssessment(stressAssessmentFactory.create({
        level: 'INVALID_LEVEL' as StressLevel
      }));

      const validationError = await assessment.validateSync();
      expect(validationError?.errors.level).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    it('should set timestamps', async () => {
      const assessment = await StressAssessment.create(stressAssessmentFactory.create());
      
      expect(assessment.timestamp).toBeDefined();
      expect(assessment.timestamp).toBeInstanceOf(Date);
    });

    it('should calculate score correctly', async () => {
      const assessment = await StressAssessment.create(stressAssessmentFactory.create({
        physicalSymptoms: 5,
        emotionalSymptoms: 7,
        behavioralSymptoms: 3,
        cognitiveSymptoms: 6
      }));

      // Average of all symptom scores, rounded
      expect(assessment.score).toBe(5);
    });
  });
}); 