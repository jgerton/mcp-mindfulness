import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import { 
  IStressManagementSession, 
  StressManagementTechnique,
  IStressManagementFeedback 
} from '../../models/stress-management-session.model';
import { WellnessSessionStatus, WellnessMoodState } from '../../models/base-wellness-session.model';
import { BaseWellnessSessionTestFactory } from './base-wellness-session.factory';

export class StressManagementSessionTestFactory extends BaseWellnessSessionTestFactory {
  create(overrides: Partial<IStressManagementSession> = {}): IStressManagementSession {
    const baseSession = super.create();
    return {
      ...baseSession,
      technique: faker.helpers.arrayElement(Object.values(StressManagementTechnique)),
      stressLevelBefore: faker.number.int({ min: 1, max: 10 }),
      stressLevelAfter: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 })),
      guidedSessionId: faker.helpers.maybe(() => new Types.ObjectId()),
      triggers: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => faker.lorem.words(3)),
      physicalSymptoms: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => faker.lorem.words(2)),
      emotionalSymptoms: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => faker.lorem.words(2)),
      effectiveness: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 })),
      ...overrides
    } as IStressManagementSession;
  }

  withTechnique(technique: StressManagementTechnique): IStressManagementSession {
    return this.create({ technique });
  }

  withStressLevels(before: number, after: number): IStressManagementSession {
    return this.create({
      stressLevelBefore: before,
      stressLevelAfter: after
    });
  }

  withGuidedSession(): IStressManagementSession {
    return this.create({
      guidedSessionId: new Types.ObjectId(),
      technique: StressManagementTechnique.GuidedImagery
    });
  }

  completed(overrides: Partial<IStressManagementSession> = {}): IStressManagementSession {
    const startTime = faker.date.recent();
    const duration = faker.number.int({ min: 300, max: 3600 });
    const stressLevelBefore = faker.number.int({ min: 5, max: 10 });
    
    return this.create({
      startTime,
      endTime: new Date(startTime.getTime() + duration * 1000),
      duration,
      status: WellnessSessionStatus.Completed,
      stressLevelBefore,
      stressLevelAfter: faker.number.int({ min: 1, max: stressLevelBefore }),
      effectiveness: faker.number.int({ min: 3, max: 5 }),
      moodAfter: faker.helpers.arrayElement(Object.values(WellnessMoodState)),
      ...overrides
    });
  }

  withFeedback(overrides: Partial<IStressManagementFeedback> = {}): IStressManagementSession {
    const feedback: IStressManagementFeedback = {
      effectivenessRating: faker.number.int({ min: 1, max: 5 }),
      stressReductionRating: faker.number.int({ min: 1, max: 5 }),
      comments: faker.lorem.paragraph(),
      improvements: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.lorem.sentence()),
      ...overrides
    };

    return this.create({
      status: WellnessSessionStatus.Completed,
      feedback
    });
  }

  withSymptoms(physical: string[], emotional: string[]): IStressManagementSession {
    return this.create({
      physicalSymptoms: physical,
      emotionalSymptoms: emotional
    });
  }

  withTriggers(triggers: string[]): IStressManagementSession {
    return this.create({ triggers });
  }

  batch(count: number): IStressManagementSession[] {
    return Array.from({ length: count }, () => this.create());
  }
} 