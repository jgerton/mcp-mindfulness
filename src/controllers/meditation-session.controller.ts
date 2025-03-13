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
        meditationId,
        type,
        category,
        minDuration,
        maxDuration,
        moodBefore,
        moodAfter,
        sortBy = 'startTime',
        sortOrder = 'desc'
      } = req.query;

      const query: any = { userId: req.user?._id };

      // Basic filters
      if (startDate) query.startTime = { $gte: new Date(startDate) };
      if (endDate) query.startTime = { ...query.startTime, $lte: new Date(endDate) };
      if (completed !== undefined) query.completed = completed;
      if (meditationId) query.meditationId = new mongoose.Types.ObjectId(meditationId);

      // Duration filters
      if (minDuration || maxDuration) {
        query.durationCompleted = {};
        if (minDuration) query.durationCompleted.$gte = minDuration;
        if (maxDuration) query.durationCompleted.$lte = maxDuration;
      }

      // Mood filters
      if (moodBefore) query.moodBefore = moodBefore;
      if (moodAfter) query.moodAfter = moodAfter;

      // Meditation type and category filters (using $lookup)
      const aggregatePipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: 'meditations',
            localField: 'meditationId',
            foreignField: '_id',
            as: 'meditation'
          }
        },
        { $unwind: '$meditation' }
      ];

      if (type) {
        aggregatePipeline.push({
          $match: { 'meditation.type': type }
        });
      }

      if (category) {
        aggregatePipeline.push({
          $match: { 'meditation.category': category }
        });
      }

      // Sorting
      const sortStage: any = {};
      if (sortBy === 'duration') {
        sortStage.$sort = { durationCompleted: sortOrder === 'desc' ? -1 : 1 };
      } else if (sortBy === 'moodImprovement') {
        // Add mood improvement calculation
        aggregatePipeline.push({
          $addFields: {
            moodImprovement: {
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
        });
        sortStage.$sort = { moodImprovement: sortOrder === 'desc' ? -1 : 1 };
      } else {
        sortStage.$sort = { startTime: sortOrder === 'desc' ? -1 : 1 };
      }
      aggregatePipeline.push(sortStage);

      // Pagination
      const skip = (page - 1) * limit;
      aggregatePipeline.push(
        { $skip: skip },
        { $limit: limit }
      );

      // Execute aggregation
      const [sessions, totalCount] = await Promise.all([
        MeditationSession.aggregate(aggregatePipeline),
        MeditationSession.aggregate([
          ...aggregatePipeline.slice(0, -2), // Remove skip and limit
          { $count: 'total' }
        ])
      ]);

      return res.json({
        sessions,
        total: totalCount[0]?.total || 0,
        page,
        totalPages: Math.ceil((totalCount[0]?.total || 0) / limit)
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
      const [totalStats, recentSessions, moodAnalysis, timeAnalysis, streakAnalysis] = await Promise.all([
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
        .limit(30),
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
        ]),
        // Time-based analytics
        MeditationSession.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              completed: true
            }
          },
          {
            $facet: {
              // Time of day patterns (grouped into 4-hour blocks)
              timeOfDayPatterns: [
                {
                  $group: {
                    _id: {
                      timeBlock: {
                        $switch: {
                          branches: [
                            { case: { $and: [{ $gte: [{ $hour: '$startTime' }, 5] }, { $lt: [{ $hour: '$startTime' }, 9] }] }, then: 'Early Morning (5-9)' },
                            { case: { $and: [{ $gte: [{ $hour: '$startTime' }, 9] }, { $lt: [{ $hour: '$startTime' }, 13] }] }, then: 'Late Morning (9-13)' },
                            { case: { $and: [{ $gte: [{ $hour: '$startTime' }, 13] }, { $lt: [{ $hour: '$startTime' }, 17] }] }, then: 'Afternoon (13-17)' },
                            { case: { $and: [{ $gte: [{ $hour: '$startTime' }, 17] }, { $lt: [{ $hour: '$startTime' }, 21] }] }, then: 'Evening (17-21)' },
                            { case: { $and: [{ $gte: [{ $hour: '$startTime' }, 21] }, { $lt: [{ $hour: '$startTime' }, 24] }] }, then: 'Night (21-24)' }
                          ],
                          default: 'Late Night (0-5)'
                        }
                      },
                      dayOfWeek: { $dayOfWeek: '$startTime' }
                    },
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$durationCompleted' },
                    avgMoodImprovement: {
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
                    timeBlock: '$_id.timeBlock',
                    dayOfWeek: '$_id.dayOfWeek',
                    count: 1,
                    avgDuration: { $round: ['$avgDuration', 1] },
                    avgMoodImprovement: { $round: ['$avgMoodImprovement', 2] },
                    effectiveness: {
                      $round: [
                        { $multiply: [
                          { $divide: ['$avgMoodImprovement', 4] }, // 4 is max mood improvement
                          100
                        ]},
                        1
                      ]
                    }
                  }
                },
                { $sort: { 'timeBlock': 1, 'dayOfWeek': 1 } }
              ],
              // Duration trends
              durationTrends: [
                {
                  $group: {
                    _id: {
                      durationRange: {
                        $switch: {
                          branches: [
                            { case: { $lte: ['$durationCompleted', 5] }, then: '1-5 minutes' },
                            { case: { $lte: ['$durationCompleted', 10] }, then: '6-10 minutes' },
                            { case: { $lte: ['$durationCompleted', 15] }, then: '11-15 minutes' },
                            { case: { $lte: ['$durationCompleted', 20] }, then: '16-20 minutes' },
                            { case: { $lte: ['$durationCompleted', 30] }, then: '21-30 minutes' }
                          ],
                          default: '30+ minutes'
                        }
                      },
                      month: { $month: '$startTime' },
                      year: { $year: '$startTime' }
                    },
                    count: { $sum: 1 },
                    totalMinutes: { $sum: '$durationCompleted' },
                    avgMoodImprovement: {
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
                    durationRange: '$_id.durationRange',
                    month: '$_id.month',
                    year: '$_id.year',
                    count: 1,
                    totalMinutes: 1,
                    avgMoodImprovement: { $round: ['$avgMoodImprovement', 2] },
                    effectiveness: {
                      $round: [
                        { $multiply: [
                          { $divide: ['$avgMoodImprovement', 4] }, // 4 is max mood improvement
                          100
                        ]},
                        1
                      ]
                    }
                  }
                },
                { 
                  $sort: { 
                    'year': -1,
                    'month': -1,
                    'durationRange': 1
                  }
                }
              ],
              // Weekly trends
              weeklyTrends: [
                {
                  $group: {
                    _id: { 
                      year: { $year: '$startTime' },
                      week: { $week: '$startTime' }
                    },
                    count: { $sum: 1 },
                    totalMinutes: { $sum: '$durationCompleted' },
                    avgDuration: { $avg: '$durationCompleted' }
                  }
                },
                { 
                  $sort: { 
                    '_id.year': -1,
                    '_id.week': -1
                  }
                },
                { $limit: 12 }
              ],
              // Monthly progress
              monthlyProgress: [
                {
                  $group: {
                    _id: {
                      year: { $year: '$startTime' },
                      month: { $month: '$startTime' }
                    },
                    count: { $sum: 1 },
                    totalMinutes: { $sum: '$durationCompleted' },
                    avgDuration: { $avg: '$durationCompleted' },
                    completionRate: {
                      $avg: { $cond: ['$completed', 1, 0] }
                    }
                  }
                },
                {
                  $sort: {
                    '_id.year': -1,
                    '_id.month': -1
                  }
                },
                { $limit: 12 }
              ]
            }
          }
        ]),
        // Streak analysis
        MeditationSession.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              completed: true
            }
          },
          {
            $sort: { startTime: -1 }
          },
          {
            $group: {
              _id: null,
              // Current streak from the latest session
              currentStreak: { $first: '$streakDay' },
              // Find the longest streak
              longestStreak: { $max: '$streakDay' },
              // Count total streaks (when maintainedStreak is true)
              totalStreaks: {
                $sum: { $cond: ['$maintainedStreak', 1, 0] }
              },
              // Collect milestone achievements
              milestones: {
                $addToSet: {
                  $cond: [
                    { $ne: ['$streakMilestone', 'none'] },
                    '$streakMilestone',
                    '$$REMOVE'
                  ]
                }
              },
              // Get streak history (last 30 days)
              streakHistory: {
                $push: {
                  date: '$startTime',
                  streakDay: '$streakDay',
                  maintained: '$maintainedStreak',
                  milestone: '$streakMilestone'
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              currentStreak: 1,
              longestStreak: 1,
              totalStreaks: 1,
              milestones: 1,
              // Only keep last 30 days of streak history
              streakHistory: { $slice: ['$streakHistory', 30] }
            }
          }
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
        streakStats: {
          currentStreak: streakAnalysis[0]?.currentStreak || 0,
          longestStreak: streakAnalysis[0]?.longestStreak || 0,
          totalStreaks: streakAnalysis[0]?.totalStreaks || 0,
          milestones: streakAnalysis[0]?.milestones || [],
          streakHistory: streakAnalysis[0]?.streakHistory || []
        },
        moodAnalysis: {
          overall: {
            totalSessions: overallMoodStats.totalMoodSessions,
            averageImprovement: overallMoodStats.totalMoodSessions > 0 
              ? Math.round((overallMoodStats.totalImprovements / overallMoodStats.totalMoodSessions) * 10) / 10
              : 0
          },
          byTypeAndCategory: moodAnalysis
        },
        timeAnalysis: {
          timeOfDayPatterns: timeAnalysis[0]?.timeOfDayPatterns || [],
          durationTrends: timeAnalysis[0]?.durationTrends || [],
          weeklyTrends: timeAnalysis[0]?.weeklyTrends || [],
          monthlyProgress: timeAnalysis[0]?.monthlyProgress || []
        }
      };

      return res.json(stats);
    } catch (error) {
      console.error('Error getting meditation stats:', error);
      return res.status(500).json({ message: 'Error fetching meditation statistics' });
    }
  }
} 