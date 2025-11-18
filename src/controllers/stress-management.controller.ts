import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StressManagementService } from '../services/stress-management.service';
import { handleError } from '../utils/errors';
import { StressLevel } from '../types/stress.types';

export class StressManagementController {
  public static async assessStressLevel(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const assessment = req.body;
      const stressLevel = await StressManagementService.assessStressLevel(userId, assessment);
      res.json({ stressLevel });
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const recommendations = await StressManagementService.getRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getRecommendationsWithLevel(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { level } = req.body;
      const recommendations = await StressManagementService.getRecommendations(userId, level as StressLevel);
      res.json(recommendations);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async recordStressChange(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { stressLevelBefore, stressLevelAfter, technique } = req.body;
      await StressManagementService.recordStressChange(
        userId,
        stressLevelBefore as StressLevel,
        stressLevelAfter as StressLevel,
        technique
      );
      res.sendStatus(200);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getStressHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const history = await StressManagementService.getStressHistory(userId);
      res.json(history);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getStressAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const analytics = await StressManagementService.getStressAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getStressPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const patterns = await StressManagementService.getStressPatterns(userId);
      res.json(patterns);
    } catch (error) {
      handleError(error, res);
    }
  }

  public static async getPeakStressHours(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const peakHours = await StressManagementService.getPeakStressHours(userId);
      res.json(peakHours);
    } catch (error) {
      handleError(error, res);
    }
  }
} 