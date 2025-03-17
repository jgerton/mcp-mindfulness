import { BreathingTechnique, MeditationTechnique, PhysicalTechnique } from '../models/stress.model';
import mongoose from 'mongoose';

// Define a local interface that matches what we're returning
export interface UserPreferences {
  preferredTechniques: Array<BreathingTechnique | MeditationTechnique | PhysicalTechnique>;
  notificationPreferences: {
    reminders: boolean;
    frequency: string;
    timeOfDay: string;
  };
  accessibility: {
    needsVisualAlternatives: boolean;
    needsAudioAlternatives: boolean;
  };
}

export class UserService {
  /**
   * Get user preferences for stress management
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    // This would typically fetch from a database
    // For now, return default preferences
    return {
      preferredTechniques: [
        '4-7-8' as BreathingTechnique, 
        'GUIDED' as MeditationTechnique, 
        'PROGRESSIVE_RELAXATION' as PhysicalTechnique
      ],
      notificationPreferences: {
        reminders: true,
        frequency: 'DAILY',
        timeOfDay: 'MORNING'
      },
      accessibility: {
        needsVisualAlternatives: false,
        needsAudioAlternatives: false
      }
    };
  }
} 