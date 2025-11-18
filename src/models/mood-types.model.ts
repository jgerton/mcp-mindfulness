export enum MoodTypes {
  VERY_NEGATIVE = 'VERY_NEGATIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  POSITIVE = 'POSITIVE',
  VERY_POSITIVE = 'VERY_POSITIVE',
  ANXIOUS = 'ANXIOUS',
  STRESSED = 'STRESSED',
  CALM = 'CALM',
  PEACEFUL = 'PEACEFUL'
}

export const moodValues: Record<MoodTypes, number> = {
  [MoodTypes.VERY_NEGATIVE]: 1,
  [MoodTypes.NEGATIVE]: 2,
  [MoodTypes.NEUTRAL]: 3,
  [MoodTypes.POSITIVE]: 4,
  [MoodTypes.VERY_POSITIVE]: 5,
  [MoodTypes.ANXIOUS]: 2,
  [MoodTypes.STRESSED]: 1,
  [MoodTypes.CALM]: 4,
  [MoodTypes.PEACEFUL]: 5
}; 