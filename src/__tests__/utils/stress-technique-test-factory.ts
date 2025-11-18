import { BaseTestDataFactory } from './mock-factories';
import { IStressTechnique } from '../../models/stress-technique.model';
import { Types } from 'mongoose';

export class StressTechniqueTestFactory extends BaseTestDataFactory<IStressTechnique> {
  defaultData(): IStressTechnique {
    return {
      _id: new Types.ObjectId().toString(),
      name: 'Test Technique',
      description: 'Test technique description',
      duration: 300, // 5 minutes in seconds
      type: 'BREATHING',
      difficulty: 'BEGINNER',
      instructions: ['Step 1', 'Step 2', 'Step 3'],
      benefits: ['Reduces stress', 'Improves focus'],
      category: 'MEDITATION',
      imageUrl: 'https://example.com/technique.jpg',
      audioUrl: 'https://example.com/technique.mp3',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  withDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): IStressTechnique {
    return this.create({ overrides: { difficulty } });
  }

  withType(type: 'BREATHING' | 'MEDITATION' | 'PHYSICAL'): IStressTechnique {
    return this.create({ overrides: { type } });
  }

  withDuration(minutes: number): IStressTechnique {
    return this.create({ overrides: { duration: minutes * 60 } });
  }

  withoutAudio(): IStressTechnique {
    const technique = this.create();
    const { audioUrl, ...techniqueWithoutAudio } = technique;
    return techniqueWithoutAudio as IStressTechnique;
  }
} 