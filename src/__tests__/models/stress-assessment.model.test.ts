import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { StressAssessment, IStressAssessment } from '../../models/stress-assessment.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await StressAssessment.deleteMany({});
});

describe('StressAssessment Model', () => {
  const userId = new mongoose.Types.ObjectId();
  
  const validStressAssessmentData = {
    userId,
    date: new Date(),
    stressLevel: 6,
    physicalSymptoms: ['Headache', 'Muscle tension'],
    emotionalSymptoms: ['Anxiety', 'Irritability'],
    triggers: ['Work deadline', 'Lack of sleep']
  };

  describe('Schema Validation', () => {
    it('should create a valid stress assessment', async () => {
      const stressAssessment = new StressAssessment(validStressAssessmentData);
      const savedStressAssessment = await stressAssessment.save();
      
      expect(savedStressAssessment._id).toBeDefined();
      expect(savedStressAssessment.userId.toString()).toBe(userId.toString());
      expect(savedStressAssessment.date).toEqual(validStressAssessmentData.date);
      expect(savedStressAssessment.stressLevel).toBe(validStressAssessmentData.stressLevel);
      expect(savedStressAssessment.physicalSymptoms).toEqual(validStressAssessmentData.physicalSymptoms);
      expect(savedStressAssessment.emotionalSymptoms).toEqual(validStressAssessmentData.emotionalSymptoms);
      expect(savedStressAssessment.triggers).toEqual(validStressAssessmentData.triggers);
      expect(savedStressAssessment.createdAt).toBeDefined();
      expect(savedStressAssessment.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const stressAssessment = new StressAssessment({
        userId,
        stressLevel: 5,
        physicalSymptoms: ['Headache'],
        emotionalSymptoms: ['Anxiety'],
        triggers: ['Work deadline']
      });
      const savedStressAssessment = await stressAssessment.save();
      
      expect(savedStressAssessment.date).toBeDefined();
      expect(savedStressAssessment.date instanceof Date).toBe(true);
    });

    it('should fail validation when required fields are missing', async () => {
      const stressAssessment = new StressAssessment({});
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.stressLevel).toBeDefined();
    });

    it('should fail validation when stressLevel is below minimum', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        stressLevel: 0
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.stressLevel).toBeDefined();
      expect(error.errors.stressLevel.message).toBe('Stress level must be at least 1');
    });

    it('should fail validation when stressLevel exceeds maximum', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        stressLevel: 11
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.stressLevel).toBeDefined();
      expect(error.errors.stressLevel.message).toBe('Stress level cannot exceed 10');
    });

    it('should fail validation when too many physical symptoms are provided', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        physicalSymptoms: Array(11).fill('Symptom')
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.physicalSymptoms).toBeDefined();
      expect(error.errors.physicalSymptoms.message).toBe('Cannot have more than 10 physical symptoms');
    });

    it('should fail validation when too many emotional symptoms are provided', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        emotionalSymptoms: Array(11).fill('Symptom')
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.emotionalSymptoms).toBeDefined();
      expect(error.errors.emotionalSymptoms.message).toBe('Cannot have more than 10 emotional symptoms');
    });

    it('should fail validation when too many triggers are provided', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        triggers: Array(6).fill('Trigger')
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.triggers).toBeDefined();
      expect(error.errors.triggers.message).toBe('Cannot have more than 5 triggers');
    });

    it('should fail validation when notes exceed maximum length', async () => {
      const stressAssessment = new StressAssessment({
        ...validStressAssessmentData,
        notes: 'A'.repeat(1001)
      });
      
      let error: any;
      try {
        await stressAssessment.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.notes).toBeDefined();
      expect(error.errors.notes.message).toBe('Notes cannot be more than 1000 characters');
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate low stress category correctly', async () => {
      const stressAssessment = await new StressAssessment({
        ...validStressAssessmentData,
        stressLevel: 3
      }).save();
      
      expect(stressAssessment.stressCategory).toBe('low');
    });

    it('should calculate moderate stress category correctly', async () => {
      const stressAssessment = await new StressAssessment({
        ...validStressAssessmentData,
        stressLevel: 6
      }).save();
      
      expect(stressAssessment.stressCategory).toBe('moderate');
    });

    it('should calculate high stress category correctly', async () => {
      const stressAssessment = await new StressAssessment({
        ...validStressAssessmentData,
        stressLevel: 8
      }).save();
      
      expect(stressAssessment.stressCategory).toBe('high');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create multiple stress assessments for testing
      await StressAssessment.create([
        {
          userId,
          date: new Date('2023-06-01'),
          stressLevel: 3,
          physicalSymptoms: ['Headache'],
          emotionalSymptoms: ['Anxiety'],
          triggers: ['Work']
        },
        {
          userId,
          date: new Date('2023-06-05'),
          stressLevel: 7,
          physicalSymptoms: ['Muscle tension'],
          emotionalSymptoms: ['Irritability'],
          triggers: ['Lack of sleep']
        },
        {
          userId,
          date: new Date('2023-06-10'),
          stressLevel: 5,
          physicalSymptoms: ['Fatigue'],
          emotionalSymptoms: ['Worry'],
          triggers: ['Financial concerns']
        }
      ]);
    });

    it('should calculate average stress level correctly', async () => {
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-06-10');
      
      const result = await StressAssessment.getAverageStressLevel(userId, startDate, endDate);
      
      expect(result.averageStressLevel).toBe(5); // (3 + 7 + 5) / 3 = 5
      expect(result.count).toBe(3);
    });

    it('should return zero for average when no assessments exist', async () => {
      const differentUserId = new mongoose.Types.ObjectId();
      const startDate = new Date('2023-06-01');
      const endDate = new Date('2023-06-10');
      
      const result = await StressAssessment.getAverageStressLevel(differentUserId, startDate, endDate);
      
      expect(result.averageStressLevel).toBe(0);
      expect(result.count).toBe(0);
    });

    it('should filter by date range correctly', async () => {
      const startDate = new Date('2023-06-02');
      const endDate = new Date('2023-06-07');
      
      const result = await StressAssessment.getAverageStressLevel(userId, startDate, endDate);
      
      expect(result.averageStressLevel).toBe(7); // Only the second assessment is in range
      expect(result.count).toBe(1);
    });
  });
}); 