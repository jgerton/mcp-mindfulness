import { MeditationSession } from '../models/meditation-session.model';
import { StressAssessmentLegacy } from '../models/stress.model';
import { User } from '../models/user.model';
import { SessionAnalyticsService } from './session-analytics.service';
import mongoose from 'mongoose';

/**
 * Service for generating personalized recommendations for meditation sessions
 */
export class RecommendationService {
  /**
   * Get personalized session recommendations for a user
   * @param userId The user ID to get recommendations for
   * @param limit The maximum number of recommendations to return
   * @returns Array of recommended session objects
   */
  static async getPersonalizedRecommendations(
    userId: string | mongoose.Types.ObjectId,
    limit: number = 3
  ): Promise<any[]> {
    try {
      // Get user's recent sessions
      const recentSessions = await MeditationSession.find({ userId })
        .sort({ completedAt: -1 })
        .limit(10)
        .lean();
      
      // Get user's stress assessments
      const recentStressAssessments = await StressAssessmentLegacy.find({ userId })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();
      
      // Get user preferences
      const user = await User.findById(userId).lean();

      // Get analytics for the user
      const analyticsService = new SessionAnalyticsService();
      const analytics = await analyticsService.getUserStats(userId.toString());

      // Generate recommendations based on collected data
      const recommendations = await this.generateRecommendations(
        userId,
        recentSessions,
        recentStressAssessments,
        user,
        analytics
      );
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate recommendations based on user data
   * @param userId User ID
   * @param recentSessions Recent meditation sessions
   * @param recentStressAssessments Recent stress assessments
   * @param user User object with preferences
   * @param analytics User analytics data
   * @returns Array of recommendation objects
   */
  private static async generateRecommendations(
    userId: string | mongoose.Types.ObjectId,
    recentSessions: any[],
    recentStressAssessments: any[],
    user: any,
    analytics: any
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    // 1. Recommend based on stress level
    if (recentStressAssessments.length > 0) {
      const latestAssessment = recentStressAssessments[0];
      const stressLevel = latestAssessment.score || 0;
      
      // Get stress-based recommendations
      const stressRecommendations = this.getStressBasedRecommendations(stressLevel);
      recommendations.push(...stressRecommendations);
      
      // Add recommendations based on stress triggers if available
      if (latestAssessment.triggers && latestAssessment.triggers.length > 0) {
        const triggerRecommendations = this.getTriggerBasedRecommendations(latestAssessment.triggers);
        recommendations.push(...triggerRecommendations);
      }
    }
    
    // 2. Recommend based on session history
    if (recentSessions.length > 0) {
      // Find most completed session type
      const sessionTypes = recentSessions.map(s => s.type);
      const mostFrequentType = this.getMostFrequent(sessionTypes);
      
      // Find average duration
      const avgDuration = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
      const recommendedDuration = Math.round(avgDuration / 5) * 5; // Round to nearest 5 minutes
      
      recommendations.push({
        type: mostFrequentType || 'meditation',
        title: `${this.capitalizeFirstLetter(mostFrequentType || 'meditation')} Session`,
        duration: recommendedDuration || 15,
        category: mostFrequentType || 'general',
        reason: 'Based on your session history',
        priority: 7
      });
      
      // Check for incomplete sessions and recommend to complete them
      const incompleteSessions = recentSessions.filter(s => s.progress < 100);
      if (incompleteSessions.length > 0) {
        const latestIncomplete = incompleteSessions[0];
        recommendations.push({
          type: latestIncomplete.type || 'meditation',
          title: latestIncomplete.title || 'Continue Your Practice',
          duration: latestIncomplete.duration || 10,
          category: latestIncomplete.category || 'general',
          reason: 'Continue your previous session',
          priority: 9,
          sessionId: latestIncomplete._id
        });
      }
    }
    
    // 3. Recommend based on time of day
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 9) {
      // Morning
      recommendations.push({
        type: 'meditation',
        title: 'Morning Energizing Meditation',
        duration: 10,
        category: 'energy',
        reason: 'Great way to start your day',
        priority: currentHour >= 6 && currentHour <= 8 ? 8 : 5
      });
    } else if (currentHour >= 12 && currentHour < 14) {
      // Midday
      recommendations.push({
        type: 'breathing',
        title: 'Midday Breathing Exercise',
        duration: 5,
        category: 'breathing',
        reason: 'Quick midday reset',
        priority: 6
      });
    } else if (currentHour >= 21 || currentHour < 1) {
      // Evening
      recommendations.push({
        type: 'meditation',
        title: 'Evening Wind Down',
        duration: 15,
        category: 'sleep',
        reason: 'Prepare for restful sleep',
        priority: currentHour >= 22 ? 9 : 7
      });
    }
    
    // 4. Recommend based on analytics insights
    if (analytics) {
      // If user has better mood improvements with longer sessions
      if (analytics.moodImprovementByDuration && 
          analytics.moodImprovementByDuration.longerSessions > 
          analytics.moodImprovementByDuration.shorterSessions) {
        recommendations.push({
          type: 'meditation',
          title: 'Extended Meditation Practice',
          duration: 25,
          category: 'mindfulness',
          reason: 'Longer sessions have improved your mood more',
          priority: 8
        });
      }
      
      // If user has better completion rate in the morning
      if (analytics.completionRateByTimeOfDay && 
          analytics.completionRateByTimeOfDay.morning > 
          analytics.completionRateByTimeOfDay.evening) {
        const morningHour = 7;
        recommendations.push({
          type: 'meditation',
          title: 'Morning Meditation Routine',
          duration: 15,
          category: 'mindfulness',
          reason: 'You complete more morning sessions',
          priority: currentHour >= morningHour - 1 && currentHour <= morningHour + 1 ? 9 : 6,
          scheduledTime: new Date().setHours(morningHour, 0, 0, 0)
        });
      }
    }
    
    // 5. Add variety recommendations
    if (recentSessions.length > 3) {
      const recentTypes = new Set(recentSessions.slice(0, 3).map(s => s.type));
      
      // If user has been doing the same type of sessions, recommend something different
      if (recentTypes.size === 1) {
        const currentType = recentSessions[0].type;
        const alternativeType = currentType === 'meditation' ? 'breathing' : 
                               currentType === 'breathing' ? 'body-scan' : 'meditation';
        
        recommendations.push({
          type: alternativeType,
          title: `Try ${this.capitalizeFirstLetter(alternativeType)}`,
          duration: 10,
          category: 'variety',
          reason: 'Add variety to your practice',
          priority: 7
        });
      }
    }
    
    // 6. Add recommendations based on user preferences if available
    if (user && user.preferences) {
      const preferenceRecommendations = await this.getUserPreferenceRecommendations(user.preferences);
      recommendations.push(...preferenceRecommendations);
    }
    
    // Sort recommendations by priority (highest first)
    return recommendations.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get the most frequent item in an array
   * @param arr Array of items
   * @returns The most frequent item or undefined if array is empty
   */
  private static getMostFrequent<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    
    const frequency: Record<string, number> = {};
    let maxItem: T | undefined = undefined;
    let maxCount = 0;
    
    for (const item of arr) {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
      
      if (frequency[key] > maxCount) {
        maxCount = frequency[key];
        maxItem = item;
      }
    }
    
    return maxItem;
  }
  
  /**
   * Capitalize the first letter of a string
   * @param str String to capitalize
   * @returns Capitalized string
   */
  private static capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Get recommendations based on stress level
   * @param stressLevel Stress level (0-10)
   * @returns Array of recommendations based on stress level
   */
  static getStressBasedRecommendations(stressLevel: number): any[] {
    const recommendations: any[] = [];
    
    if (stressLevel >= 7) {
      // High stress - recommend stress reduction sessions
      recommendations.push({
        type: 'meditation',
        title: 'Stress Relief Meditation',
        duration: 10,
        category: 'stress-reduction',
        reason: 'Based on your recent stress levels',
        priority: 10
      });
      
      // Add a breathing exercise for immediate relief
      recommendations.push({
        type: 'breathing',
        title: 'Quick Stress Relief Breathing',
        duration: 5,
        category: 'stress-reduction',
        reason: 'For immediate stress relief',
        priority: 9
      });
    } else if (stressLevel >= 4) {
      // Medium stress - recommend calming sessions
      recommendations.push({
        type: 'meditation',
        title: 'Calming Meditation',
        duration: 15,
        category: 'calm',
        reason: 'To help maintain balance',
        priority: 8
      });
      
      // Add a body scan for physical tension
      recommendations.push({
        type: 'body-scan',
        title: 'Tension Release Body Scan',
        duration: 12,
        category: 'relaxation',
        reason: 'To release physical tension',
        priority: 7
      });
    } else {
      // Low stress - recommend focus or mindfulness
      recommendations.push({
        type: 'meditation',
        title: 'Mindfulness Practice',
        duration: 20,
        category: 'mindfulness',
        reason: 'To enhance your mindfulness practice',
        priority: 6
      });
      
      // Add a gratitude meditation
      recommendations.push({
        type: 'meditation',
        title: 'Gratitude Meditation',
        duration: 15,
        category: 'positive',
        reason: 'To cultivate positive emotions',
        priority: 5
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get recommendations based on identified stress triggers
   * @param triggers Array of stress triggers
   * @returns Array of recommendations targeting specific triggers
   */
  private static getTriggerBasedRecommendations(triggers: string[]): any[] {
    const recommendations: any[] = [];
    
    // Map common triggers to specific meditation techniques
    const triggerRecommendationMap: Record<string, any> = {
      'work': {
        type: 'meditation',
        title: 'Work Stress Relief',
        duration: 10,
        category: 'stress-reduction',
        reason: 'Targeted for work-related stress',
        priority: 9
      },
      'family': {
        type: 'meditation',
        title: 'Family Harmony Meditation',
        duration: 15,
        category: 'relationships',
        reason: 'Helps with family-related stress',
        priority: 8
      },
      'health': {
        type: 'meditation',
        title: 'Health Anxiety Relief',
        duration: 12,
        category: 'anxiety',
        reason: 'Focused on health-related concerns',
        priority: 9
      },
      'financial': {
        type: 'breathing',
        title: 'Financial Stress Breathing',
        duration: 8,
        category: 'stress-reduction',
        reason: 'Helps manage financial stress',
        priority: 8
      },
      'social': {
        type: 'meditation',
        title: 'Social Anxiety Meditation',
        duration: 15,
        category: 'anxiety',
        reason: 'Designed for social anxiety',
        priority: 7
      },
      'time': {
        type: 'breathing',
        title: 'Quick Time Management Reset',
        duration: 5,
        category: 'focus',
        reason: 'Brief session for time-related stress',
        priority: 8
      }
    };
    
    // Add recommendations for the top 2 triggers
    for (let i = 0; i < Math.min(triggers.length, 2); i++) {
      const trigger = triggers[i].toLowerCase();
      if (triggerRecommendationMap[trigger]) {
        recommendations.push(triggerRecommendationMap[trigger]);
      } else {
        // Generic recommendation for unknown triggers
        recommendations.push({
          type: 'meditation',
          title: 'Stress Trigger Relief',
          duration: 10,
          category: 'stress-reduction',
          reason: `Helps with your identified stress trigger: ${triggers[i]}`,
          priority: 7
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get recommendations based on user preferences
   * @param preferences User preference object
   * @returns Array of recommendations based on user preferences
   */
  private static async getUserPreferenceRecommendations(preferences: any): Promise<any[]> {
    const recommendations: any[] = [];
    
    if (!preferences) return recommendations;
    
    // Use preferred techniques if available
    if (preferences.preferredTechniques && preferences.preferredTechniques.length > 0) {
      const technique = preferences.preferredTechniques[0];
      const title = this.getTechniqueTitle(technique);
      
      recommendations.push({
        type: this.mapTechniqueToType(technique),
        title,
        duration: preferences.preferredDuration || 15,
        category: 'preferred',
        reason: 'Based on your preferred techniques',
        priority: 8
      });
    }
    
    // Use preferred time if available
    if (preferences.timePreferences && preferences.timePreferences.preferredTime) {
      const currentHour = new Date().getHours();
      const isPreferredTime = this.isCurrentTimePreferred(currentHour, preferences.timePreferences.preferredTime);
      
      if (isPreferredTime) {
        recommendations.push({
          type: 'meditation',
          title: 'Preferred Time Session',
          duration: preferences.preferredDuration || 15,
          category: 'preferred',
          reason: 'Now is your preferred meditation time',
          priority: 9
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Check if current time matches user's preferred time
   * @param currentHour Current hour (0-23)
   * @param preferredTimes Array of preferred time strings
   * @returns Boolean indicating if current time is preferred
   */
  private static isCurrentTimePreferred(currentHour: number, preferredTimes: string[]): boolean {
    // Map time strings to hour ranges
    const timeRanges: Record<string, [number, number]> = {
      'MORNING': [5, 11],
      'AFTERNOON': [12, 17],
      'EVENING': [18, 22],
      'NIGHT': [23, 4]
    };
    
    return preferredTimes.some(time => {
      const range = timeRanges[time];
      if (!range) return false;
      
      const [start, end] = range;
      if (start <= end) {
        return currentHour >= start && currentHour <= end;
      } else {
        // Handle ranges that cross midnight
        return currentHour >= start || currentHour <= end;
      }
    });
  }
  
  /**
   * Map technique code to user-friendly title
   * @param technique Technique code
   * @returns User-friendly title
   */
  private static getTechniqueTitle(technique: string): string {
    const titleMap: Record<string, string> = {
      '4-7-8': '4-7-8 Breathing Technique',
      'BOX_BREATHING': 'Box Breathing Exercise',
      'ALTERNATE_NOSTRIL': 'Alternate Nostril Breathing',
      'GUIDED': 'Guided Meditation',
      'MINDFULNESS': 'Mindfulness Meditation',
      'BODY_SCAN': 'Body Scan Meditation',
      'PROGRESSIVE_RELAXATION': 'Progressive Muscle Relaxation',
      'STRETCHING': 'Mindful Stretching',
      'WALKING': 'Walking Meditation',
      'GROUNDING': 'Grounding Exercise',
      'VISUALIZATION': 'Visualization Meditation',
      'QUICK_BREATH': 'Quick Breathing Reset'
    };
    
    return titleMap[technique] || 'Personalized Meditation';
  }
  
  /**
   * Map technique to session type
   * @param technique Technique code
   * @returns Session type
   */
  private static mapTechniqueToType(technique: string): string {
    const typeMap: Record<string, string> = {
      '4-7-8': 'breathing',
      'BOX_BREATHING': 'breathing',
      'ALTERNATE_NOSTRIL': 'breathing',
      'GUIDED': 'guided',
      'MINDFULNESS': 'meditation',
      'BODY_SCAN': 'body-scan',
      'PROGRESSIVE_RELAXATION': 'body-scan',
      'STRETCHING': 'movement',
      'WALKING': 'movement',
      'GROUNDING': 'meditation',
      'VISUALIZATION': 'meditation',
      'QUICK_BREATH': 'breathing'
    };
    
    return typeMap[technique] || 'meditation';
  }
} 