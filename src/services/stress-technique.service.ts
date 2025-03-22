import StressTechnique, { StressTechniqueDocument } from '../models/stress-technique.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

export class StressTechniqueService {
  /**
   * Get a technique by its ID
   */
  static async getTechniqueById(id: string | mongoose.Types.ObjectId): Promise<StressTechniqueDocument | null> {
    return StressTechnique.findById(id);
  }

  /**
   * Get all techniques with optional pagination
   */
  static async getAllTechniques(page?: number, limit?: number): Promise<{
    techniques: StressTechniqueDocument[];
    pagination?: {
      totalResults: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const totalResults = await StressTechnique.countDocuments();
      const totalPages = Math.ceil(totalResults / limit);
      
      const techniques = await StressTechnique.find()
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });
      
      return {
        techniques,
        pagination: {
          totalResults,
          totalPages,
          currentPage: page,
          limit
        }
      };
    }
    
    const techniques = await StressTechnique.find().sort({ name: 1 });
    return { techniques };
  }

  /**
   * Get techniques by category
   */
  static async getTechniquesByCategory(category: string): Promise<StressTechniqueDocument[]> {
    return StressTechnique.find({ category });
  }

  /**
   * Get techniques by difficulty level
   */
  static async getTechniquesByDifficulty(difficultyLevel: string): Promise<StressTechniqueDocument[]> {
    return StressTechnique.find({ difficultyLevel });
  }

  /**
   * Search techniques by query string (searches name, description, and tags)
   */
  static async searchTechniques(query: string): Promise<StressTechniqueDocument[]> {
    // Use text search for more complex queries
    if (query.length > 3) {
      return StressTechnique.find({ $text: { $search: query } })
        .sort({ score: { $meta: 'textScore' } });
    }
    
    // Use regex for simple queries
    const regex = new RegExp(query, 'i');
    return StressTechnique.find({
      $or: [
        { name: regex },
        { description: regex },
        { tags: regex }
      ]
    });
  }

  /**
   * Get techniques within a duration range
   */
  static async getTechniquesByDuration(minDuration: number, maxDuration: number): Promise<StressTechniqueDocument[]> {
    return StressTechnique.find({
      durationMinutes: { $gte: minDuration, $lte: maxDuration }
    });
  }

  /**
   * Get recommended techniques for a user based on their preferences
   */
  static async getRecommendedTechniques(userId: string): Promise<StressTechniqueDocument[]> {
    // Find the user and their preferences
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Default preferences if none are set
    const defaultPreferences = {
      preferredCategories: ['breathing', 'meditation'],
      preferredDuration: 10,
      difficultyLevel: 'beginner'
    };

    // Get user preferences or use defaults
    const preferences = user.preferences?.stressManagement || defaultPreferences;
    
    // Build query based on user preferences
    const query: any = {};
    
    // Filter by preferred categories if available
    if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
      query.category = { $in: preferences.preferredCategories };
    }
    
    // Filter by difficulty level
    if (preferences.difficultyLevel) {
      query.difficultyLevel = preferences.difficultyLevel;
    }
    
    // Find techniques matching preferences
    const techniques = await StressTechnique.find(query);
    
    // If no techniques match preferences, return beginner techniques
    if (techniques.length === 0) {
      return StressTechnique.find({ difficultyLevel: 'beginner' }).limit(3);
    }
    
    return techniques;
  }

  /**
   * Create a new technique
   */
  static async createTechnique(techniqueData: any): Promise<StressTechniqueDocument> {
    const technique = new StressTechnique(techniqueData);
    return technique.save();
  }

  /**
   * Update an existing technique
   */
  static async updateTechnique(id: string, techniqueData: any): Promise<StressTechniqueDocument | null> {
    return StressTechnique.findByIdAndUpdate(id, techniqueData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Delete a technique
   */
  static async deleteTechnique(id: string): Promise<StressTechniqueDocument | null> {
    return StressTechnique.findByIdAndDelete(id);
  }
} 