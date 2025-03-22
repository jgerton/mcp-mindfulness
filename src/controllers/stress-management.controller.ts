import { Request, Response } from 'express';
import { StressManagementService } from '../services/stress-management.service';
import { StressAssessmentLegacy, UserPreferences } from '../models/stress.model';

export class StressManagementController {
  static async submitAssessment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id; // Assuming auth middleware sets user
      const assessment = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stressLevel = await StressManagementService.assessStressLevel(userId, assessment);
      const recommendations = await StressManagementService.getRecommendations(userId);

      res.json({
        stressLevel,
        recommendations
      });
    } catch (error) {
      console.error('Error submitting stress assessment:', error);
      res.status(500).json({ error: 'Failed to submit stress assessment' });
    }
  }

  static async getStressHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const history = await StressAssessmentLegacy.find({
        userId,
        timestamp: {
          $gte: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: endDate ? new Date(endDate as string) : new Date()
        }
      }).sort({ timestamp: -1 });

      res.json(history);
    } catch (error) {
      console.error('Error fetching stress history:', error);
      res.status(500).json({ error: 'Failed to fetch stress history' });
    }
  }

  static async getLatestAssessment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const latestAssessment = await StressAssessmentLegacy.findOne({ userId })
        .sort({ timestamp: -1 });

      if (!latestAssessment) {
        res.status(404).json({ error: 'No assessments found' });
        return;
      }

      const recommendations = await StressManagementService.getRecommendations(userId);

      res.json({
        assessment: latestAssessment,
        recommendations
      });
    } catch (error) {
      console.error('Error fetching latest assessment:', error);
      res.status(500).json({ error: 'Failed to fetch latest assessment' });
    }
  }

  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const preferences = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const updatedPreferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { ...preferences },
        { new: true, upsert: true }
      );

      res.json(updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }

  static async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const preferences = await UserPreferences.findOne({ userId });

      if (!preferences) {
        res.status(404).json({ error: 'No preferences found' });
        return;
      }

      res.json(preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  static async getStressInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get last 30 days of assessments
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const assessments = await StressAssessmentLegacy.find({
        userId,
        timestamp: { $gte: thirtyDaysAgo }
      }).sort({ timestamp: 1 });

      // Calculate insights
      const insights = {
        averageLevel: this.calculateAverageStressLevel(assessments),
        commonTriggers: this.findCommonTriggers(assessments),
        trendAnalysis: this.analyzeTrend(assessments),
        peakStressTimes: this.findPeakStressTimes(assessments)
      };

      res.json(insights);
    } catch (error) {
      console.error('Error generating stress insights:', error);
      res.status(500).json({ error: 'Failed to generate stress insights' });
    }
  }

  private static calculateAverageStressLevel(assessments: StressAssessmentLegacy[]): number {
    if (!assessments.length) return 0;
    return assessments.reduce((sum, assessment) => sum + (assessment.score || 0), 0) / assessments.length;
  }

  private static findCommonTriggers(assessments: StressAssessmentLegacy[]): string[] {
    const triggerCount = new Map<string, number>();
    
    assessments.forEach(assessment => {
      assessment.triggers?.forEach(trigger => {
        triggerCount.set(trigger, (triggerCount.get(trigger) || 0) + 1);
      });
    });

    return Array.from(triggerCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);
  }

  private static analyzeTrend(assessments: StressAssessmentLegacy[]): 'IMPROVING' | 'WORSENING' | 'STABLE' {
    if (assessments.length < 2) return 'STABLE';

    const firstHalf = assessments.slice(0, Math.floor(assessments.length / 2));
    const secondHalf = assessments.slice(Math.floor(assessments.length / 2));

    const firstAvg = this.calculateAverageStressLevel(firstHalf);
    const secondAvg = this.calculateAverageStressLevel(secondHalf);

    if (secondAvg < firstAvg - 0.5) return 'IMPROVING';
    if (secondAvg > firstAvg + 0.5) return 'WORSENING';
    return 'STABLE';
  }

  private static findPeakStressTimes(assessments: StressAssessmentLegacy[]): string[] {
    const hourlyStress = new Map<number, number>();
    
    assessments.forEach(assessment => {
      const hour = new Date(assessment.timestamp).getHours();
      hourlyStress.set(hour, (hourlyStress.get(hour) || 0) + (assessment.score || 0));
    });

    return Array.from(hourlyStress.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => `${hour}:00`);
  }
} 