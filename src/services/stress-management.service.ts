import { StressLevel, StressAssessmentLegacy, StressReduction, TechniqueType } from '../models/stress.model';
import { UserService, UserPreferences } from './user.service';
import mongoose from 'mongoose';
import { StressAssessmentModel, UserModel } from '../models/stress.model';

interface StressAssessmentData {
  score: number;
  level: StressLevel;
  timestamp: Date;
  userId: string;
  physicalSymptoms: number;
  emotionalSymptoms: number;
  behavioralSymptoms: number;
  cognitiveSymptoms: number;
}

export class StressManagementService {
  static async assessStressLevel(userId: string, assessment: Omit<StressAssessmentData, 'score' | 'level' | 'timestamp'>): Promise<StressLevel> {
    // Calculate stress score based on assessment answers
    const stressScore = this.calculateStressScore(assessment);
    
    // Get user's historical stress data
    const historicalData = await this.getUserStressHistory(userId);
    
    // Determine stress level category
    const stressLevel = this.determineStressLevel(stressScore, historicalData);
    
    // Save assessment results
    await this.saveStressAssessment(userId, {
      ...assessment,
      score: stressScore,
      level: stressLevel,
      timestamp: new Date()
    });

    return stressLevel;
  }

  static async getRecommendations(userId: mongoose.Types.ObjectId, stressLevel?: number): Promise<Recommendation[]> {
    // Get user's current stress level if not provided
    let currentLevel = stressLevel;
    if (currentLevel === undefined) {
      const latestAssessment = await StressAssessmentModel.findOne({ userId }).sort({ timestamp: -1 });
      currentLevel = latestAssessment?.stressLevel || 5; // Default to medium if no assessments
    }
    
    // Get user preferences
    const userPrefs = await UserModel.findById(userId).select('preferences').lean();
    
    // Add null check before using userPrefs
    if (!userPrefs || !userPrefs.preferences) {
      // Use default preferences if none found
      return this.generateRecommendations(currentLevel, {
        duration: 'medium',
        intensity: 'medium',
        focus: ['stress-reduction']
      });
    }
    
    const recommendations = this.generateRecommendations(currentLevel, userPrefs.preferences);
    return recommendations;
  }

  static async recordStressChange(
    userId: string, 
    stressLevelBefore: string, 
    stressLevelAfter: string, 
    technique: string
  ): Promise<void> {
    // Record the effectiveness of a technique
    // This could be used for future recommendations
    
    // Implementation would store this data for analytics
    console.log(`User ${userId} stress change: ${stressLevelBefore} -> ${stressLevelAfter} using ${technique}`);
  }

  // Private helper methods
  private static calculateStressScore(assessment: Omit<StressAssessmentData, 'score' | 'level' | 'timestamp'>): number {
    // Calculate weighted score based on symptoms
    const physicalWeight = 0.25;
    const emotionalWeight = 0.3;
    const behavioralWeight = 0.2;
    const cognitiveWeight = 0.25;
    
    return (
      assessment.physicalSymptoms * physicalWeight +
      assessment.emotionalSymptoms * emotionalWeight +
      assessment.behavioralSymptoms * behavioralWeight +
      assessment.cognitiveSymptoms * cognitiveWeight
    );
  }

  private static determineStressLevel(score: number, history: any[]): StressLevel {
    // Determine stress level based on score and history
    if (score < 3) return 'LOW';
    if (score < 7) return 'MODERATE';
    return 'HIGH';
  }

  private static async saveStressAssessment(userId: string, assessment: StressAssessmentData): Promise<void> {
    // Save assessment to database
    // Implementation would create and save a StressAssessment document
    console.log(`Saving stress assessment for user ${userId}: ${JSON.stringify(assessment)}`);
  }

  private static async getUserStressHistory(userId: string): Promise<any[]> {
    // Get user's stress history from database
    // Implementation would query StressAssessment collection
    return [];
  }

  private static async getRecentAssessments(userId: string): Promise<any[]> {
    // Get recent stress assessments
    // Implementation would query StressAssessment collection with time filter
    return [];
  }

  private static generateRecommendations(level: StressLevel, preferences: UserPreferences): any[] {
    // Generate recommendations based on stress level and user preferences
    const recommendations = [
      {
        duration: 5,
        technique: "4-7-8 Breathing",
        type: "BREATHING" as TechniqueType,
        title: "Calming Breath Exercise",
        description: "A simple breathing technique to reduce anxiety"
      },
      {
        duration: 10,
        technique: "Body Scan",
        type: "MEDITATION" as TechniqueType,
        title: "Body Awareness Meditation",
        description: "A meditation focusing on body sensations"
      },
      {
        duration: 15,
        technique: "Progressive Muscle Relaxation",
        type: "PHYSICAL" as TechniqueType,
        title: "Tension Release",
        description: "Systematically tense and relax muscle groups"
      },
      {
        duration: 2,
        technique: "5-4-3-2-1 Grounding",
        type: "QUICK_RELIEF" as TechniqueType,
        title: "Sensory Grounding",
        description: "Use your senses to ground yourself in the present moment"
      }
    ];
    
    return recommendations;
  }
} 