import { Request, Response } from 'express';
import { Meditation } from '../models/meditation.model';
import { CreateMeditationInput, UpdateMeditationInput, GetMeditationsQuery } from '../validations/meditation.validation';
import mongoose from 'mongoose';

export class MeditationController {
  // Create a new meditation
  async create(req: Request<{}, {}, CreateMeditationInput>, res: Response) {
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
  async getAll(req: Request<{}, {}, {}, GetMeditationsQuery>, res: Response) {
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
  async getById(req: Request<{ id: string }>, res: Response) {
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

  // Update a meditation
  async update(req: Request<{ id: string }, {}, UpdateMeditationInput>, res: Response) {
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
      if (meditation.authorId && meditation.authorId.toString() !== req.user?._id) {
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
  async delete(req: Request<{ id: string }>, res: Response) {
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
      if (meditation.authorId && meditation.authorId.toString() !== req.user?._id) {
        return res.status(403).json({ message: 'Not authorized to delete this meditation' });
      }

      await Meditation.findByIdAndUpdate(id, { isActive: false });
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting meditation:', error);
      return res.status(500).json({ message: 'Error deleting meditation' });
    }
  }
} 