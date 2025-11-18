import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { StressTechniqueService } from '../services/stress-technique.service';
import { BaseController } from '../core/base-controller';
import { StressTechniqueDocument } from '../models/stress-technique.model';
import { HttpError } from '../errors/http-error';
import { FilterQuery } from 'mongoose';

export class StressTechniqueController extends BaseController<StressTechniqueDocument> {
  /**
   * Get all stress management techniques
   * @route GET /api/stress-techniques
   */
  static async getAllTechniques(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const result = await StressTechniqueService.getAllTechniques(page, limit);
      
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('Error getting techniques:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get a stress management technique by ID
   * @route GET /api/stress-techniques/:id
   */
  static async getTechniqueById(req: Request, res: Response): Promise<void> {
    try {
      const technique = await StressTechniqueService.getTechniqueById(req.params.id);
      
      if (!technique) {
        res.status(404).json({ message: 'Stress management technique not found' });
        return;
      }
      
      res.status(200).json({ technique });
    } catch (error: unknown) {
      console.error('Error getting technique by ID:', error);
      res.status(500).json({
        message: 'Error retrieving stress management technique',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get stress management techniques by category
   * @route GET /api/stress-techniques/category/:category
   */
  static async getTechniquesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const techniques = await StressTechniqueService.getTechniquesByCategory(req.params.category);
      res.status(200).json({ techniques });
    } catch (error: unknown) {
      console.error('Error getting techniques by category:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques by category',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get stress management techniques by difficulty level
   * @route GET /api/stress-techniques/difficulty/:level
   */
  static async getTechniquesByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const techniques = await StressTechniqueService.getTechniquesByDifficulty(req.params.level);
      res.status(200).json({ techniques });
    } catch (error: unknown) {
      console.error('Error getting techniques by difficulty:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques by difficulty',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Search stress management techniques
   * @route GET /api/stress-techniques/search
   */
  static async searchTechniques(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }
      
      const techniques = await StressTechniqueService.searchTechniques(query);
      res.status(200).json({ techniques });
    } catch (error: unknown) {
      console.error('Error searching techniques:', error);
      res.status(500).json({
        message: 'Error searching stress management techniques',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get recommended stress management techniques for current user
   * @route GET /api/stress-techniques/recommendations
   */
  static async getRecommendedTechniques(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const recommendations = await StressTechniqueService.getRecommendedTechniques(userId);
      res.status(200).json({ recommendations });
    } catch (error: unknown) {
      console.error('Error getting recommendations:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.status(500).json({
        message: 'Error retrieving stress management technique recommendations',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Create a new stress management technique
   * @route POST /api/stress-techniques
   */
  static async createTechnique(req: Request, res: Response): Promise<void> {
    try {
      const technique = await StressTechniqueService.createTechnique(req.body);
      res.status(201).json({ 
        message: 'Stress management technique created successfully',
        technique 
      });
    } catch (error: unknown) {
      console.error('Error creating technique:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          error: error.message
        });
        return;
      }
      
      res.status(500).json({
        message: 'Error creating stress management technique',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Update a stress management technique
   * @route PUT /api/stress-techniques/:id
   */
  static async updateTechnique(req: Request, res: Response): Promise<void> {
    try {
      const technique = await StressTechniqueService.updateTechnique(req.params.id, req.body);
      
      if (!technique) {
        res.status(404).json({ message: 'Stress management technique not found' });
        return;
      }
      
      res.status(200).json({ 
        message: 'Stress management technique updated successfully',
        technique 
      });
    } catch (error: unknown) {
      console.error('Error updating technique:', error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          error: error.message
        });
        return;
      }
      
      res.status(500).json({
        message: 'Error updating stress management technique',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Delete a stress management technique
   * @route DELETE /api/stress-techniques/:id
   */
  static async deleteTechnique(req: Request, res: Response): Promise<void> {
    try {
      const technique = await StressTechniqueService.deleteTechnique(req.params.id);
      
      if (!technique) {
        res.status(404).json({ message: 'Stress management technique not found' });
        return;
      }
      
      res.status(200).json({ 
        message: 'Stress management technique deleted successfully',
        technique 
      });
    } catch (error: unknown) {
      console.error('Error deleting technique:', error);
      res.status(500).json({
        message: 'Error deleting stress management technique',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  protected async validateCreate(req: Request): Promise<void> {
    const { name, description, duration, type, difficulty } = req.body;

    if (!name) {
      throw HttpError.badRequest('Name is required');
    }
    if (!description) {
      throw HttpError.badRequest('Description is required');
    }
    if (!duration || duration < 0) {
      throw HttpError.badRequest('Valid duration is required');
    }
    if (!type || !['BREATHING', 'MEDITATION', 'PHYSICAL'].includes(type)) {
      throw HttpError.badRequest('Valid type is required (BREATHING, MEDITATION, or PHYSICAL)');
    }
    if (!difficulty || !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
      throw HttpError.badRequest('Valid difficulty is required (BEGINNER, INTERMEDIATE, or ADVANCED)');
    }
  }

  protected async validateUpdate(req: Request): Promise<void> {
    const { type, difficulty, duration } = req.body;

    if (type && !['BREATHING', 'MEDITATION', 'PHYSICAL'].includes(type)) {
      throw HttpError.badRequest('Invalid type specified');
    }
    if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
      throw HttpError.badRequest('Invalid difficulty specified');
    }
    if (duration !== undefined && duration < 0) {
      throw HttpError.badRequest('Duration must be a positive number');
    }
  }

  protected buildFilterQuery(req: Request): FilterQuery<StressTechniqueDocument> {
    const filter: FilterQuery<StressTechniqueDocument> = {};
    const { type, difficulty, minDuration, maxDuration, search } = req.query;

    if (type) {
      filter.type = type;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) {
        filter.duration.$gte = Number(minDuration);
      }
      if (maxDuration) {
        filter.duration.$lte = Number(maxDuration);
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    return filter;
  }

  // Custom methods specific to StressTechnique
  async getByDifficulty(req: Request): Promise<StressTechniqueDocument[]> {
    const { difficulty } = req.params;
    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
      throw HttpError.badRequest('Invalid difficulty specified');
    }

    const techniques = await this.model
      .find({ difficulty })
      .sort({ duration: 1 })
      .exec();

    return techniques;
  }

  async getRecommended(req: Request): Promise<StressTechniqueDocument[]> {
    const { userId } = req.params;
    const userLevel = await this.getUserLevel(userId);
    
    const difficulty = this.mapUserLevelToDifficulty(userLevel);
    const techniques = await this.model
      .find({ difficulty })
      .limit(5)
      .sort({ rating: -1 })
      .exec();

    return techniques;
  }

  private async getUserLevel(userId: string): Promise<number> {
    // This would typically come from a user service or progress tracking
    // For now, return a mock implementation
    return 2; // Mock intermediate level
  }

  private mapUserLevelToDifficulty(level: number): string {
    if (level <= 1) return 'BEGINNER';
    if (level <= 3) return 'INTERMEDIATE';
    return 'ADVANCED';
  }
} 