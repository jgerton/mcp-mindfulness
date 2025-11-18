import mongoose from 'mongoose';
import { Meditation } from '../../models/meditation.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { MeditationTestFactory } from '../factories/meditation.factory';

describe('Meditation Model', () => {
  let meditationFactory: MeditationTestFactory;
  let authorId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    authorId = new mongoose.Types.ObjectId();
    meditationFactory = new MeditationTestFactory();
    
    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
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
    it('should create meditation with all required fields', async () => {
      const testData = meditationFactory.create();
      const meditation = await Meditation.create(testData);
      expect(meditation.title).toBe(testData.title);
      expect(meditation.description).toBe(testData.description);
      expect(meditation.duration).toBe(testData.duration);
      expect(meditation.type).toBe(testData.type);
    });

    it('should accept valid enum values', async () => {
      // Test guided meditation
      const guidedMeditation = await Meditation.create(meditationFactory.guided());
      expect(guidedMeditation.type).toBe('guided');
      expect(guidedMeditation.audioUrl).toBeDefined();

      // Test timer meditation
      const timerMeditation = await Meditation.create(meditationFactory.timer());
      expect(timerMeditation.type).toBe('timer');
      expect(timerMeditation.audioUrl).toBeUndefined();

      // Test ambient meditation
      const ambientMeditation = await Meditation.create(meditationFactory.ambient());
      expect(ambientMeditation.type).toBe('ambient');
      expect(ambientMeditation.audioUrl).toBeDefined();

      // Test different categories
      const categories = ['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other'] as const;
      for (const category of categories) {
        const meditation = await Meditation.create(meditationFactory.withCategory(category));
        expect(meditation.category).toBe(category);
      }

      // Test different difficulties
      const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
      for (const difficulty of difficulties) {
        const meditation = await Meditation.create(meditationFactory.withDifficulty(difficulty));
        expect(meditation.difficulty).toBe(difficulty);
      }
    });

    it('should handle custom meditation creation', async () => {
      const meditation = await Meditation.create(meditationFactory.create({ authorId: authorId.toString() }));
      expect(meditation.authorId?.toString()).toBe(authorId.toString());
      expect(meditation.isActive).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const meditation = new Meditation({});
      const validationError = await meditation.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.type).toBeDefined();
    });

    it('should reject invalid enum values', async () => {
      const invalidData = meditationFactory.create();
      const invalidMeditation = new Meditation({
        ...invalidData,
        type: 'invalid-type',
        category: 'invalid-category',
        difficulty: 'invalid-difficulty'
      });
      const validationError = await invalidMeditation.validateSync();
      expect(validationError?.errors.type).toBeDefined();
      expect(validationError?.errors.category).toBeDefined();
      expect(validationError?.errors.difficulty).toBeDefined();
    });

    it('should reject invalid duration values', async () => {
      const meditation = new Meditation(meditationFactory.create({ duration: 0 }));
      const validationError = await meditation.validateSync();
      expect(validationError?.errors.duration).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum valid duration', async () => {
      const meditation = await Meditation.create(meditationFactory.create({ duration: 1 }));
      expect(meditation.duration).toBe(1);
    });

    it('should handle empty and whitespace strings', async () => {
      const meditation = await Meditation.create(meditationFactory.create({
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
        tags: ['  tag1  ', '  tag2  ']
      }));
      expect(meditation.title).toBe('Trimmed Title');
      expect(meditation.description).toBe('Trimmed Description');
      expect(meditation.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle system meditations without author', async () => {
      const systemMeditation = await Meditation.create(meditationFactory.create({
        authorId: undefined,
        isActive: undefined
      }));
      expect(systemMeditation.authorId).toBeUndefined();
      expect(systemMeditation.isActive).toBe(true);

      const userMeditation = await Meditation.create(meditationFactory.create({
        authorId: authorId.toString(),
        isActive: false
      }));
      expect(userMeditation.authorId?.toString()).toBe(authorId.toString());
      expect(userMeditation.isActive).toBe(false);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', async () => {
      const meditation = new Meditation({});
      const validationError = await meditation.validateSync();
      
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.type).toBeDefined();
      expect(validationError?.errors.category).toBeDefined();
    });
  });
}); 