import { faker } from '@faker-js/faker';
import { IAchievement } from '../../models/achievement.model';
import { BaseTestFactory } from './base-test-factory';

export class AchievementTestFactory extends BaseTestFactory<IAchievement> {
  create(overrides: Partial<IAchievement> = {}): IAchievement {
    return {
      _id: this.generateId(),
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      userId: this.generateId(),
      criteria: {
        type: 'SESSION_COUNT',
        target: faker.number.int({ min: 5, max: 100 }),
        progress: 0
      },
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  withProgress(progress: number): IAchievement {
    const achievement = this.create();
    achievement.criteria.progress = progress;
    return achievement;
  }

  completed(): IAchievement {
    const achievement = this.create();
    achievement.isCompleted = true;
    achievement.completedAt = new Date();
    achievement.criteria.progress = achievement.criteria.target;
    return achievement;
  }

  withCriteriaType(type: string, target: number = 10): IAchievement {
    return this.create({
      criteria: {
        type,
        target,
        progress: 0
      }
    });
  }

  batch(count: number): IAchievement[] {
    return Array.from({ length: count }, () => this.create());
  }
} 