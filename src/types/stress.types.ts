export enum StressLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export enum TechniqueType {
  BREATHING = 'BREATHING',
  MEDITATION = 'MEDITATION',
  PMR = 'PMR',
  MINDFULNESS = 'MINDFULNESS'
}

export interface StressAssessment {
  userId: string;
  level: StressLevel;
  timestamp: Date;
  physicalTension?: number;
  mentalAnxiety?: number;
  emotionalDistress?: number;
  sleepQuality?: number;
  energyLevel?: number;
}

export interface StressRecommendation {
  techniqueType: TechniqueType;
  description: string;
  duration: number;
  intensity: number;
}

export interface Recommendation {
  duration: number;
  technique: string;
  type: TechniqueType;
  title: string;
  description: string;
} 