import { MoodTypes, moodValues } from './mood-types.model';

export interface IMood {
  type: MoodTypes;
  timestamp: Date;
}

export { moodValues, MoodTypes }; 