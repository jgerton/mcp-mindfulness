import { Request, Response } from 'express';
import { StressTechniqueService } from '../services/stress-technique.service';

export class StressTechniqueController {
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
    } catch (error) {
      console.error('Error getting techniques:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques',
        error: error.message
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
    } catch (error) {
      console.error('Error getting technique by ID:', error);
      res.status(500).json({
        message: 'Error retrieving stress management technique',
        error: error.message
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
    } catch (error) {
      console.error('Error getting techniques by category:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques by category',
        error: error.message
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
    } catch (error) {
      console.error('Error getting techniques by difficulty:', error);
      res.status(500).json({
        message: 'Error retrieving stress management techniques by difficulty',
        error: error.message
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
    } catch (error) {
      console.error('Error searching techniques:', error);
      res.status(500).json({
        message: 'Error searching stress management techniques',
        error: error.message
      });
    }
  }

  /**
   * Get recommended stress management techniques for current user
   * @route GET /api/stress-techniques/recommendations
   */
  static async getRecommendedTechniques(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const recommendations = await StressTechniqueService.getRecommendedTechniques(userId);
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      if (error.message === 'User not found') {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.status(500).json({
        message: 'Error retrieving stress management technique recommendations',
        error: error.message
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
    } catch (error) {
      console.error('Error creating technique:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          error: error.message
        });
        return;
      }
      
      res.status(500).json({
        message: 'Error creating stress management technique',
        error: error.message
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
    } catch (error) {
      console.error('Error updating technique:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          error: error.message
        });
        return;
      }
      
      res.status(500).json({
        message: 'Error updating stress management technique',
        error: error.message
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
    } catch (error) {
      console.error('Error deleting technique:', error);
      res.status(500).json({
        message: 'Error deleting stress management technique',
        error: error.message
      });
    }
  }
} 