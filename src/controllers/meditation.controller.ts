import { Request, Response } from 'express';
import { Meditation } from '../models/meditation.model';
import { CreateMeditationInput, UpdateMeditationInput, GetMeditationsQuery } from '../validations/meditation.validation';
import mongoose from 'mongoose';

export class MeditationController {
  // Create a new meditation
  static async create(req: Request<{}, {}, CreateMeditationInput>, res: Response) {
    try {
      const meditationData = req.body;
      if (req.user) {
        meditationData.authorId = req.user._id;
      }
      
      const meditation = await Meditation.create(meditationData);
      return res.status(201).json(meditation);
    } catch (error) {
      console.error('Error creating meditation:', error);
      return res.status(500).json({ message: 'Error creating meditation' });
    }
  }

  // Get all meditations with filtering and pagination
  static async getAllMeditations(req: Request<{}, {}, {}, GetMeditationsQuery>, res: Response) {
    try {
      const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
      const query: any = { isActive: true };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const [meditations, total] = await Promise.all([
        Meditation.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('authorId', 'username'),
        Meditation.countDocuments(query)
      ]);

      return res.json({
        meditations,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error getting meditations:', error);
      return res.status(500).json({ message: 'Error fetching meditations' });
    }
  }

  // Get a single meditation by ID
  static async getMeditationById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meditation ID' });
      }

      const meditation = await Meditation.findById(id).populate('authorId', 'username');
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }

      return res.json(meditation);
    } catch (error) {
      console.error('Error getting meditation:', error);
      return res.status(500).json({ message: 'Error fetching meditation' });
    }
  }

  // Start a meditation session
  static async startMeditation(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meditation ID' });
      }

      const meditation = await Meditation.findById(id);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }

      // Here you would typically create a meditation session record
      // For now, just return success
      return res.json({ message: 'Meditation session started', meditation });
    } catch (error) {
      console.error('Error starting meditation:', error);
      return res.status(500).json({ message: 'Error starting meditation session' });
    }
  }

  // Complete a meditation session
  static async completeMeditation(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meditation ID' });
      }

      const meditation = await Meditation.findById(id);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }

      // Here you would typically update the meditation session record
      // For now, just return success
      return res.json({ message: 'Meditation session completed', meditation });
    } catch (error) {
      console.error('Error completing meditation:', error);
      return res.status(500).json({ message: 'Error completing meditation session' });
    }
  }

  // Update a meditation
  static async update(req: Request<{ id: string }, {}, UpdateMeditationInput>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meditation ID' });
      }

      const meditation = await Meditation.findById(id);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }

      // Check if user is authorized to update (if they're the author)
      console.log('Debug - Meditation authorId:', meditation.authorId?.toString());
      console.log('Debug - Current user ID:', req.user?._id?.toString());
      console.log('Debug - Types:', {
        authorIdType: typeof meditation.authorId,
        userIdType: typeof req.user?._id,
        authorIdValid: meditation.authorId ? mongoose.Types.ObjectId.isValid(meditation.authorId) : false,
        userIdValid: req.user?._id ? mongoose.Types.ObjectId.isValid(req.user._id) : false
      });
      console.log('Debug - Direct comparison result:', meditation.authorId?.toString() === req.user?._id?.toString());
      
      if (meditation.authorId && meditation.authorId.toString() !== req.user?._id?.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this meditation' });
      }

      const updatedMeditation = await Meditation.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).populate('authorId', 'username');

      return res.json(updatedMeditation);
    } catch (error) {
      console.error('Error updating meditation:', error);
      return res.status(500).json({ message: 'Error updating meditation' });
    }
  }

  // Delete a meditation (soft delete by setting isActive to false)
  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meditation ID' });
      }

      const meditation = await Meditation.findById(id);
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found' });
      }

      // Check if user is authorized to delete (if they're the author)
      if (meditation.authorId && meditation.authorId.toString() !== req.user?._id?.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this meditation' });
      }

      await Meditation.findByIdAndUpdate(id, { isActive: false });
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting meditation:', error);
      return res.status(500).json({ message: 'Error deleting meditation' });
    }
  }

  private static validateMeditationData(meditation: CreateMeditationInput) {
    const validationResults = {
      titleLength: meditation.title.length >= 3 && meditation.title.length <= 100,
      descriptionLength: meditation.description.length >= 10 && meditation.description.length <= 1000,
      durationValid: meditation.duration > 0 && meditation.duration <= 120,
      typeValid: ['guided', 'unguided', 'music'].includes(meditation.type),
      categoryValid: ['mindfulness', 'breathing', 'body_scan', 'loving_kindness', 'transcendental', 'zen', 'vipassana', 'yoga'].includes(meditation.category),
      difficultyValid: ['beginner', 'intermediate', 'advanced'].includes(meditation.difficulty),
      tagsValid: Array.isArray(meditation.tags) && meditation.tags.every(tag => typeof tag === 'string'),
      authorIdValid: meditation.authorId ? mongoose.Types.ObjectId.isValid(meditation.authorId) : true
    };
    return validationResults;
  }
} 