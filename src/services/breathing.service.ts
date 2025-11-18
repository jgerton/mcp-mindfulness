import { BreathingPattern, BreathingSession } from '../models/breathing.model';
import { StressManagementService } from './stress-management.service';
import { StressLevel } from '../types/stress.types';
import mongoose from 'mongoose';

export class BreathingService {
  private static readonly DEFAULT_PATTERNS = {
    '4-7-8': {
      name: '4-7-8',
      inhale: 4,
      hold: 7,
      exhale: 8,
      cycles: 4
    },
    'BOX_BREATHING': {
      name: 'BOX_BREATHING',
      inhale: 4,
      hold: 4,
      exhale: 4,
      postExhaleHold: 4,
      cycles: 4
    },
    'QUICK_BREATH': {
      name: 'QUICK_BREATH',
      inhale: 2,
      exhale: 4,
      cycles: 6
    }
  };

  static async initializeDefaultPatterns(): Promise<void> {
    for (const pattern of Object.values(this.DEFAULT_PATTERNS)) {
      await BreathingPattern.findOneAndUpdate(
        { name: pattern.name },
        pattern,
        { upsert: true }
      );
    }
  }

  static async startSession(userId: string, patternName: string, stressLevelBefore?: number): Promise<BreathingSession> {
    const pattern = await BreathingPattern.findOne({ name: patternName });
    if (!pattern) {
      throw new Error('Invalid breathing pattern');
    }

    const session = new BreathingSession({
      userId,
      patternName,
      startTime: new Date(),
      targetCycles: pattern.cycles,
      stressLevelBefore
    });

    await session.save();
    return session;
  }

  static async getUserSessionById(sessionId: string): Promise<BreathingSession | null> {
    return BreathingSession.findById(sessionId);
  }

  static async completeSession(sessionId: string, completedCycles: number, stressLevelAfter?: number): Promise<BreathingSession> {
    const session = await BreathingSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.endTime) {
      throw new Error('Session already completed');
    }

    session.endTime = new Date();
    session.completedCycles = completedCycles;
    session.stressLevelAfter = stressLevelAfter;

    await session.save();

    // Update stress management if stress levels were recorded
    if (session.stressLevelBefore !== undefined && stressLevelAfter !== undefined) {
      await StressManagementService.recordStressChange(
        session.userId,
        this.mapNumberToStressLevel(session.stressLevelBefore),
        this.mapNumberToStressLevel(stressLevelAfter),
        (session._id as mongoose.Types.ObjectId).toString()
      );
    }

    return session;
  }

  private static mapNumberToStressLevel(level: number): StressLevel {
    if (level <= 3) return StressLevel.LOW;
    if (level <= 7) return StressLevel.MODERATE;
    return StressLevel.HIGH;
  }

  static async getPattern(name: string): Promise<BreathingPattern | null> {
    return BreathingPattern.findOne({ name });
  }

  static async getUserSessions(userId: string, limit = 10): Promise<BreathingSession[]> {
    return BreathingSession.find({ userId })
      .sort({ startTime: -1 })
      .limit(limit);
  }

  static async getEffectiveness(userId: string): Promise<{
    averageStressReduction: number;
    totalSessions: number;
    mostEffectivePattern: string;
  }> {
    const sessions = await BreathingSession.find({
      userId,
      stressLevelBefore: { $exists: true },
      stressLevelAfter: { $exists: true }
    });

    if (!sessions.length) {
      return {
        averageStressReduction: 0,
        totalSessions: 0,
        mostEffectivePattern: ''
      };
    }

    const patternEffectiveness = new Map<string, { total: number; count: number }>();
    let totalReduction = 0;

    sessions.forEach(session => {
      const reduction = (session.stressLevelBefore || 0) - (session.stressLevelAfter || 0);
      totalReduction += reduction;

      const pattern = session.patternName;
      const current = patternEffectiveness.get(pattern) || { total: 0, count: 0 };
      patternEffectiveness.set(pattern, {
        total: current.total + reduction,
        count: current.count + 1
      });
    });

    let mostEffectivePattern = '';
    let bestAverage = 0;

    patternEffectiveness.forEach((value, pattern) => {
      const average = value.total / value.count;
      if (average > bestAverage) {
        bestAverage = average;
        mostEffectivePattern = pattern;
      }
    });

    return {
      averageStressReduction: totalReduction / sessions.length,
      totalSessions: sessions.length,
      mostEffectivePattern
    };
  }
} 