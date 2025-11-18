import mongoose from 'mongoose';
import StressTechnique from '../../models/stress-technique.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { StressTechniqueTestFactory } from '../factories/stress-technique.factory';

describe('StressTechnique Model', () => {
  let stressTechniqueFactory: StressTechniqueTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(async () => {
    stressTechniqueFactory = new StressTechniqueTestFactory();
    jest.spyOn(StressTechnique.prototype, 'save').mockImplementation(function(this: any) {
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
    it('should create and save technique successfully', async () => {
      const testData = stressTechniqueFactory.create();
      const technique = await StressTechnique.create(testData);
      expect(technique.name).toBe(testData.name);
      expect(technique.description).toBe(testData.description);
      expect(technique.category).toBe(testData.category);
      expect(technique.difficultyLevel).toBe(testData.difficultyLevel);
    });

    it('should set default values correctly', async () => {
      const technique = await StressTechnique.create(stressTechniqueFactory.withoutOptionalFields());
      expect(technique.effectivenessRating).toBe(3);
      expect(technique.recommendedFrequency).toBe('as-needed');
      expect(technique.steps).toEqual([]);
    });

    it('should update timestamps on modification', async () => {
      const technique = await StressTechnique.create(stressTechniqueFactory.create());
      const originalUpdatedAt = technique.updatedAt;
      technique.name = 'Updated Name';
      await technique.save();
      expect(technique.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Error Cases', () => {
    it('should fail when required fields are missing', () => {
      expect(() => new StressTechnique({})).toThrow();
    });

    it('should reject invalid category', () => {
      expect(() => new StressTechnique(stressTechniqueFactory.create({
        category: 'invalid_category' as any
      }))).toThrow();
    });

    it('should reject invalid difficulty level', () => {
      expect(() => new StressTechnique(stressTechniqueFactory.create({
        difficultyLevel: 'invalid_level' as any
      }))).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum duration', () => {
      expect(() => new StressTechnique(stressTechniqueFactory.withDuration(0))).toThrow();
    });

    it('should handle maximum duration', () => {
      expect(() => new StressTechnique(stressTechniqueFactory.withDuration(121))).toThrow();
    });

    it('should handle empty arrays', async () => {
      const technique = await StressTechnique.create(stressTechniqueFactory.withoutOptionalFields());
      expect(technique.steps).toEqual([]);
      expect(technique.benefits).toEqual([]);
      expect(technique.tags).toEqual([]);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const technique = new StressTechnique({});
      const validationError = await technique.validateSync();
      
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.category).toBeDefined();
      expect(validationError?.errors.difficultyLevel).toBeDefined();
      expect(validationError?.errors.durationMinutes).toBeDefined();
    });

    it('should validate category enum', async () => {
      const technique = new StressTechnique(stressTechniqueFactory.create({
        category: 'invalid_category' as any
      }));

      const validationError = await technique.validateSync();
      expect(validationError?.errors.category).toBeDefined();
    });

    it('should validate difficulty level enum', async () => {
      const technique = new StressTechnique(stressTechniqueFactory.create({
        difficultyLevel: 'invalid_level' as any
      }));

      const validationError = await technique.validateSync();
      expect(validationError?.errors.difficultyLevel).toBeDefined();
    });

    it('should validate duration range', async () => {
      const tooShort = new StressTechnique(stressTechniqueFactory.withDuration(0));
      const tooLong = new StressTechnique(stressTechniqueFactory.withDuration(121));

      expect(await tooShort.validateSync()?.errors.durationMinutes).toBeDefined();
      expect(await tooLong.validateSync()?.errors.durationMinutes).toBeDefined();
    });

    it('should validate effectiveness rating range', async () => {
      const tooLow = new StressTechnique(stressTechniqueFactory.withEffectiveness(0));
      const tooHigh = new StressTechnique(stressTechniqueFactory.withEffectiveness(6));

      expect(await tooLow.validateSync()?.errors.effectivenessRating).toBeDefined();
      expect(await tooHigh.validateSync()?.errors.effectivenessRating).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    it('should trim string fields', async () => {
      const technique = await StressTechnique.create(stressTechniqueFactory.create({
        name: '  Trimmed Name  ',
        description: '  Trimmed Description  ',
        category: '  breathing  ' as any,
        difficultyLevel: '  beginner  ' as any
      }));

      expect(technique.name).toBe('Trimmed Name');
      expect(technique.description).toBe('Trimmed Description');
      expect(technique.category).toBe('breathing');
      expect(technique.difficultyLevel).toBe('beginner');
    });

    it('should handle maximum array lengths', async () => {
      const technique = await StressTechnique.create(stressTechniqueFactory.withMaxArrays());
      expect(technique.steps.length).toBeLessThanOrEqual(10);
      expect(technique.benefits.length).toBeLessThanOrEqual(10);
      expect(technique.tags.length).toBeLessThanOrEqual(10);
    });
  });
}); 