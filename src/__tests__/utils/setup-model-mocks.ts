import { Model } from 'mongoose';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';

export const setupModelMocks = () => {
  const mockBreathingPattern = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  } as unknown as Model<BreathingPattern>;

  const mockBreathingSession = {
    findById: jest.fn(),
    find: jest.fn(),
    save: jest.fn()
  } as unknown as Model<BreathingSession>;

  return {
    mockBreathingPattern,
    mockBreathingSession
  };
}; 