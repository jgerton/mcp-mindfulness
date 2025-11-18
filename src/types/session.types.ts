export enum SessionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BaseSession {
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: SessionStatus;
  notes?: string;
}

export interface MeditationSessionData extends BaseSession {
  technique: string;
  guidedAudio?: string;
  intensity: number;
  focusRating?: number;
  moodBefore?: string;
  moodAfter?: string;
}

export interface PMRSessionData extends BaseSession {
  muscleGroups: string[];
  tensionLevel: number;
  relaxationAchieved: number;
}

export interface BreathingSessionData extends BaseSession {
  pattern: string;
  breathsPerMinute: number;
  oxygenSaturation?: number;
  heartRate?: number;
} 