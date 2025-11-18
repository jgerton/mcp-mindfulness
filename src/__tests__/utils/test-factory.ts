import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BreathingPattern, BreathingSession } from '../../models/breathing.model';

export class TestFactory {
  static createMockRequest(overrides: Partial<Request> = {}): Request {
    return {
      body: {},
      query: {},
      params: {},
      headers: {},
      ...overrides
    } as Request;
  }

  static createMockResponse(): Response {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res as Response;
  }

  static createBreathingPattern(overrides: Partial<BreathingPattern> = {}): BreathingPattern {
    return {
      name: '4-7-8',
      inhale: 4,
      hold: 7,
      exhale: 8,
      cycles: 4,
      ...overrides
    } as BreathingPattern;
  }

  static createBreathingSession(overrides: Partial<BreathingSession> = {}): BreathingSession {
    const defaultSession = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId().toString(),
      patternName: '4-7-8',
      startTime: new Date(),
      targetCycles: 4,
      stressLevelBefore: 7,
      ...overrides
    };

    return defaultSession as BreathingSession;
  }
} 