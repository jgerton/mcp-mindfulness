import mongoose from 'mongoose';
import { Achievement, UserAchievement, IAchievement, IUserAchievement } from '../models/achievement.model';
import { MeditationSession } from '../models/meditation-session.model';
import { StressAssessment } from '../models/stress-assessment.model';

/**
 * Service for managing achievements and user progress
 */
export class AchievementService {
  /**
   * Process a user activity and update achievements accordingly
   * @param userId - The ID of the user
   * @param activityType - The type of activity performed
   * @param activityData - Additional data about the activity
   */
  public async processUserActivity(
    userId: mongoose.Types.ObjectId | string,
    activityType: 'meditation_completed' | 'stress_assessment_completed' | 'login' | 'streak',
    activityData: any
  ): Promise<void> {
    // Convert string ID to ObjectId if needed
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Find all achievements that might be affected by this activity
    const relevantAchievements = await Achievement.find({
      'criteria.type': activityType
    });
    
    // Process each achievement
    for (const achievement of relevantAchievements) {
      await this.processAchievement(userObjectId, achievement, activityType, activityData);
    }
  }
  
  /**
   * Process a specific achievement for a user
   * @param userId - The user ID
   * @param achievement - The achievement to process
   * @param activityType - The type of activity performed
   * @param activityData - Additional data about the activity
   */
  private async processAchievement(
    userId: mongoose.Types.ObjectId,
    achievement: IAchievement,
    activityType: string,
    activityData: any
  ): Promise<void> {
    // Find or create user achievement record
    let userAchievement = await UserAchievement.findOne({
      userId,
      achievementId: achievement._id
    });
    
    // If no record exists, create a new one
    if (!userAchievement) {
      userAchievement = new UserAchievement({
        userId,
        achievementId: achievement._id,
        progress: 0,
        isCompleted: false
      });
    }
    
    // Skip if already completed
    if (userAchievement.isCompleted) {
      return;
    }
    
    // Update progress based on achievement criteria and activity
    const newProgress = await this.calculateProgress(
      userId,
      achievement,
      activityType,
      activityData,
      userAchievement.progress
    );
    
    // Update user achievement
    userAchievement.progress = newProgress;
    
    // Check if achievement is now completed
    if (newProgress >= 100) {
      userAchievement.isCompleted = true;
      userAchievement.dateEarned = new Date();
    }
    
    // Save changes
    await userAchievement.save();
  }
  
  /**
   * Calculate progress for an achievement based on activity
   * @param userId - The user ID
   * @param achievement - The achievement to calculate progress for
   * @param activityType - The type of activity performed
   * @param activityData - Additional data about the activity
   * @param currentProgress - Current progress value
   * @returns New progress value (0-100)
   */
  private async calculateProgress(
    userId: mongoose.Types.ObjectId,
    achievement: IAchievement,
    activityType: string,
    activityData: any,
    currentProgress: number
  ): Promise<number> {
    const { type, value } = achievement.criteria;
    
    // Ensure activity type matches achievement criteria
    if (type !== activityType) {
      return currentProgress;
    }
    
    switch (type) {
      case 'meditation_completed': {
        // For meditation count achievements
        if (achievement.category === 'count') {
          const totalSessions = await MeditationSession.countDocuments({
            userId,
            completed: true
          });
          
          return Math.min(100, Math.floor((totalSessions / value) * 100));
        }
        
        // For meditation duration achievements
        if (achievement.category === 'duration') {
          const sessions = await MeditationSession.find({
            userId,
            completed: true
          });
          
          const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
          const targetDuration = value * 60; // Convert minutes to seconds
          
          return Math.min(100, Math.floor((totalDuration / targetDuration) * 100));
        }
        
        break;
      }
      
      case 'stress_assessment_completed': {
        // For stress assessment count achievements
        if (achievement.category === 'count') {
          const totalAssessments = await StressAssessment.countDocuments({
            userId
          });
          
          return Math.min(100, Math.floor((totalAssessments / value) * 100));
        }
        
        // For stress reduction achievements
        if (achievement.category === 'milestone' && activityData?.stressReduction) {
          const { stressReduction } = activityData;
          
          if (stressReduction >= value) {
            return 100;
          }
        }
        
        break;
      }
      
      case 'streak': {
        // For login streak achievements
        if (achievement.category === 'streak' && activityData?.currentStreak) {
          const { currentStreak } = activityData;
          
          return Math.min(100, Math.floor((currentStreak / value) * 100));
        }
        
        // For meditation streak achievements
        if (achievement.category === 'streak' && activityData?.meditationStreak) {
          const { meditationStreak } = activityData;
          
          return Math.min(100, Math.floor((meditationStreak / value) * 100));
        }
        
        break;
      }
      
      case 'login': {
        // For login count achievements
        if (achievement.category === 'count') {
          const { loginCount } = activityData || { loginCount: 1 };
          
          return Math.min(100, Math.floor((loginCount / value) * 100));
        }
        
        break;
      }
    }
    
    // Default: no change in progress
    return currentProgress;
  }
  
  /**
   * Get all achievements for a user
   * @param userId - The user ID
   * @returns Array of user achievements with details
   */
  public async getUserAchievements(userId: mongoose.Types.ObjectId | string): Promise<any[]> {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Find all user achievements and populate with achievement details
    const userAchievements = await UserAchievement.find({ userId: userObjectId })
      .populate('achievementId')
      .lean();
    
    // Format the response
    return userAchievements.map(ua => ({
      id: ua.achievementId._id,
      name: ua.achievementId.name,
      description: ua.achievementId.description,
      category: ua.achievementId.category,
      icon: ua.achievementId.icon,
      points: ua.achievementId.points,
      progress: ua.progress,
      isCompleted: ua.isCompleted,
      dateEarned: ua.dateEarned
    }));
  }
  
  /**
   * Get completed achievements for a user
   * @param userId - The user ID
   * @returns Array of completed achievements
   */
  public async getCompletedAchievements(userId: mongoose.Types.ObjectId | string): Promise<any[]> {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Find completed user achievements
    const completedAchievements = await UserAchievement.find({
      userId: userObjectId,
      isCompleted: true
    })
      .populate('achievementId')
      .lean();
    
    // Format the response
    return completedAchievements.map(ua => ({
      id: ua.achievementId._id,
      name: ua.achievementId.name,
      description: ua.achievementId.description,
      category: ua.achievementId.category,
      icon: ua.achievementId.icon,
      points: ua.achievementId.points,
      dateEarned: ua.dateEarned
    }));
  }
  
  /**
   * Get total achievement points for a user
   * @param userId - The user ID
   * @returns Total points earned
   */
  public async getUserPoints(userId: mongoose.Types.ObjectId | string): Promise<number> {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Find completed user achievements
    const completedAchievements = await UserAchievement.find({
      userId: userObjectId,
      isCompleted: true
    })
      .populate('achievementId')
      .lean();
    
    // Sum up the points
    return completedAchievements.reduce((total, ua) => total + ua.achievementId.points, 0);
  }
  
  /**
   * Create a new achievement
   * @param achievementData - The achievement data
   * @returns The created achievement
   */
  public async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = new Achievement(achievementData);
    await achievement.save();
    return achievement;
  }
  
  /**
   * Update an existing achievement
   * @param id - The achievement ID
   * @param updateData - The data to update
   * @returns The updated achievement
   */
  public async updateAchievement(
    id: mongoose.Types.ObjectId | string,
    updateData: Partial<IAchievement>
  ): Promise<IAchievement | null> {
    const achievementId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
    
    const achievement = await Achievement.findByIdAndUpdate(
      achievementId,
      updateData,
      { new: true, runValidators: true }
    );
    
    return achievement;
  }
  
  /**
   * Delete an achievement
   * @param id - The achievement ID
   * @returns True if deleted, false otherwise
   */
  public async deleteAchievement(id: mongoose.Types.ObjectId | string): Promise<boolean> {
    const achievementId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
    
    // Delete the achievement
    const result = await Achievement.deleteOne({ _id: achievementId });
    
    // Delete associated user achievements
    if (result.deletedCount > 0) {
      await UserAchievement.deleteMany({ achievementId });
      return true;
    }
    
    return false;
  }
}

export default new AchievementService(); 