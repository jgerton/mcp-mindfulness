import { Request, Response } from 'express';
import { ExportService, ExportOptions } from '../services/export.service';
import { parseDateParam } from '../utils/db.utils';

// Using Request with user property for type safety
// This matches what the authenticateToken middleware adds to the request
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
  };
}

/**
 * Controller for data export API endpoints - PLACEHOLDER IMPLEMENTATION
 */
export class ExportController {
  /**
   * Export user achievements
   * @route GET /api/export/achievements
   */
  static async exportAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Parse query parameters
      const format = req.query.format as 'json' | 'csv' || 'json';
      const startDate = parseDateParam(req.query.startDate as string);
      const endDate = parseDateParam(req.query.endDate as string);

      // Create options object
      const options: ExportOptions = {
        format,
        startDate,
        endDate
      };

      // Get data from service
      const result = await ExportService.getUserAchievements(userId, options);

      // Send appropriate response based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="achievements-${userId}.csv"`);
        res.status(200).send(result);
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error: any) {
      console.error('Error in exportAchievements:', error);
      res.status(500).json({ error: 'Failed to export achievements', message: error.message });
    }
  }

  /**
   * Export user meditations
   * @route GET /api/export/meditations
   */
  static async exportMeditations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Parse query parameters
      const format = req.query.format as 'json' | 'csv' || 'json';
      const startDate = parseDateParam(req.query.startDate as string);
      const endDate = parseDateParam(req.query.endDate as string);

      // Create options object
      const options: ExportOptions = {
        format,
        startDate,
        endDate
      };

      // Get data from service
      const result = await ExportService.getUserMeditations(userId, options);

      // Send appropriate response based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="meditations-${userId}.csv"`);
        res.status(200).send(result);
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error: any) {
      console.error('Error in exportMeditations:', error);
      res.status(500).json({ error: 'Failed to export meditations', message: error.message });
    }
  }

  /**
   * Export user stress assessments
   * @route GET /api/export/stress-levels
   */
  static async exportStressLevels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Parse query parameters
      const format = req.query.format as 'json' | 'csv' || 'json';
      const startDate = parseDateParam(req.query.startDate as string);
      const endDate = parseDateParam(req.query.endDate as string);

      // Create options object
      const options: ExportOptions = {
        format,
        startDate,
        endDate
      };

      // Get data from service
      const result = await ExportService.getUserStressAssessments(userId, options);

      // Send appropriate response based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="stress-levels-${userId}.csv"`);
        res.status(200).send(result);
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error: any) {
      console.error('Error in exportStressLevels:', error);
      res.status(500).json({ error: 'Failed to export stress levels', message: error.message });
    }
  }

  /**
   * Export all user data
   * @route GET /api/export/user-data
   */
  static async exportUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate user authentication
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Parse query parameters
      const format = req.query.format as 'json' | 'csv' || 'json';

      // Create options object
      const options: ExportOptions = {
        format
      };

      // Get data from service
      const result = await ExportService.getUserData(userId, options);

      // Send appropriate response based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.csv"`);
        res.status(200).send(result);
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error: any) {
      console.error('Error in exportUserData:', error);
      res.status(500).json({ error: 'Failed to export user data', message: error.message });
    }
  }
} 