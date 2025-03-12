import { Request, Response } from 'express';
import { MeditationSession } from '../models/meditation-session.model';
import { Meditation } from '../models/meditation.model';
import { CreateMeditationSessionInput, UpdateMeditationSessionInput, GetMeditationSessionsQuery } from '../validations/meditation-session.validation';
import mongoose from 'mongoose';

export class MeditationSessionController {
  // Start or create a new meditation session
  async create(req: Request<{}, {}, CreateMeditationSessionInput>, res: Response) {
    try {
      const sessionData = req.body;
      
      // Verify meditation exists and is active
      const meditation = await Meditation.findOne({ 
        _id: sessionData.meditationId,
        isActive: true 
      });
      
      if (!meditation) {
        return res.status(404).json({ message: 'Meditation not found or inactive' });
      }

      // Create session with user ID
      const session = await MeditationSession.create({
        ...sessionData,
        userId: req.user?._id
      });

      return res.status(201).json(session);
    } catch (error) {
      console.error('Error creating meditation session:', error);
      return res.status(500).json({ message: 'Error creating meditation session' });
    }
  }

  // Get all meditation sessions for the current user
  async getAll(req: Request<{}, {}, {}, GetMeditationSessionsQuery>, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10,
        startDate,
        endDate,
        completed,
        meditationId
      } = req.query;

      const query: any = { userId: req.user?._id };

      if (startDate) query.startTime = { $gte: new Date(startDate) };
      if (endDate) query.startTime = { ...query.startTime, $lte: new Date(endDate) };
      if (completed !== undefined) query.completed = completed;
      if (meditationId) query.meditationId = meditationId;

      const [sessions, total] = await Promise.all([
        MeditationSession.find(query)
          .sort({ startTime: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('meditationId', 'title duration type category'),
        MeditationSession.countDocuments(query)
      ]);

      return res.json({
        sessions,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error getting meditation sessions:', error);
      return res.status(500).json({ message: 'Error fetching meditation sessions' });
    }
  }

  // Get a single meditation session
  async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid session ID' });
      }

      const session = await MeditationSession.findOne({
        _id: id,
        userId: req.user?._id
      }).populate('meditationId', 'title duration type category');

      if (!session) {
        return res.status(404).json({ message: 'Meditation session not found' });
      }

      return res.json(session);
    } catch (error) {
      console.error('Error getting meditation session:', error);
      return res.status(500).json({ message: 'Error fetching meditation session' });
    }
  }

  // Update a meditation session (e.g., mark as completed, add notes)
  async update(req: Request<{ id: string }, {}, UpdateMeditationSessionInput>, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid session ID' });
      }

      const session = await MeditationSession.findOne({
        _id: id,
        userId: req.user?._id
      });

      if (!session) {
        return res.status(404).json({ message: 'Meditation session not found' });
      }

      const updatedSession = await MeditationSession.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).populate('meditationId', 'title duration type category');

      return res.json(updatedSession);
    } catch (error) {
      console.error('Error updating meditation session:', error);
      return res.status(500).json({ message: 'Error updating meditation session' });
    }
  }

  // Get user's meditation statistics
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      
      // Get total sessions and minutes meditated
      const [totalStats, recentSessions, moodAnalysis] = await Promise.all([
        MeditationSession.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId), completed: true } },
          { 
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              totalMinutes: { $sum: '$durationCompleted' },
              averageDuration: { $avg: '$durationCompleted' }
            }
          }
        ]),
        // Get streak information from recent sessions
        MeditationSession.find({
          userId,
          completed: true
        })
        .sort({ startTime: -1 })
        .limit(30), // Look at last 30 days
        // Get mood impact analysis
        MeditationSession.aggregate([
          { 
            $match: { 
              userId: new mongoose.Types.ObjectId(userId),
              completed: true,
              moodBefore: { $exists: true },
              moodAfter: { $exists: true }
            }
          },
          {
            $lookup: {
              from: 'meditations',
              localField: 'meditationId',
              foreignField: '_id',
              as: 'meditation'
            }
          },
          { $unwind: '$meditation' },
          {
            $group: {
              _id: {
                type: '$meditation.type',
                category: '$meditation.category'
              },
              totalSessions: { $sum: 1 },
              moodImprovements: {
                $sum: {
                  $switch: {
                    branches: [
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 4 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 3 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'neutral'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'bad'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 3 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'neutral'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'neutral'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'neutral'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'good'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 1 }
                    ],
                    default: 0
                  }
                }
              },
              averageMoodImprovement: { 
                $avg: {
                  $switch: {
                    branches: [
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 4 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 3 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'neutral'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'very_bad'] }, { $eq: ['$moodAfter', 'bad'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 3 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'bad'] }, { $eq: ['$moodAfter', 'neutral'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'neutral'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 2 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'neutral'] }, { $eq: ['$moodAfter', 'good'] }] }, then: 1 },
                      { case: { $and: [{ $eq: ['$moodBefore', 'good'] }, { $eq: ['$moodAfter', 'very_good'] }] }, then: 1 }
                    ],
                    default: 0
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              type: '$_id.type',
              category: '$_id.category',
              totalSessions: 1,
              moodImprovements: 1,
              averageMoodImprovement: { $round: ['$averageMoodImprovement', 2] },
              effectivenessScore: {
                $round: [
                  { $multiply: [
                    { $divide: ['$moodImprovements', '$totalSessions'] },
                    100
                  ]},
                  1
                ]
              }
            }
          },
          { $sort: { effectivenessScore: -1 } }
        ])
      ]);

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < recentSessions.length; i++) {
        const sessionDate = new Date(recentSessions[i].startTime);
        sessionDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate overall mood improvement stats
      const overallMoodStats = moodAnalysis.reduce((acc, curr) => {
        acc.totalMoodSessions += curr.totalSessions;
        acc.totalImprovements += curr.moodImprovements;
        return acc;
      }, { totalMoodSessions: 0, totalImprovements: 0 });

      const stats = {
        totalSessions: totalStats[0]?.totalSessions || 0,
        totalMinutes: totalStats[0]?.totalMinutes || 0,
        averageDuration: Math.round((totalStats[0]?.averageDuration || 0) * 10) / 10,
        currentStreak,
        moodAnalysis: {
          overall: {
            totalSessions: overallMoodStats.totalMoodSessions,
            averageImprovement: overallMoodStats.totalMoodSessions > 0 
              ? Math.round((overallMoodStats.totalImprovements / overallMoodStats.totalMoodSessions) * 10) / 10
              : 0
          },
          byTypeAndCategory: moodAnalysis
        }
      };

      return res.json(stats);
    } catch (error) {
      console.error('Error getting meditation stats:', error);
      return res.status(500).json({ message: 'Error fetching meditation statistics' });
    }
  }
} 