export type StressLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface StressAssessment {
  userId: string;
  level: StressLevel;
  triggers: string[];
  timestamp: Date;
  notes?: string;
}

export interface StressTriggerAnalysis {
  trigger: string;
  averageStressLevel: number;
  frequency: number;
}

export interface StressPreferences {
  userId: string;
  notificationFrequency: 'low' | 'medium' | 'high';
  reminderTimes?: string[];
  preferredInterventions?: string[];
  customTriggers?: string[];
} 