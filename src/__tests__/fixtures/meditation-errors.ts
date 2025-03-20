import { Types } from 'mongoose';
import { TEST_IDS } from './service-errors';

// Invalid Meditation Inputs
export const INVALID_MEDITATION_INPUTS = {
  NEGATIVE_DURATION: {
    duration: -1,
    userId: TEST_IDS.USER
  },
  INVALID_MOOD: {
    moodRating: 6,
    userId: TEST_IDS.USER
  },
  MISSING_REQUIRED: {
    type: 'GUIDED'
  },
  INVALID_TYPE: {
    type: 'INVALID',
    userId: TEST_IDS.USER
  }
} as const;

// Invalid IDs
export const INVALID_IDS = {
  SESSION: 'not-an-object-id',
  USER: '123invalid456'
} as const;

// Non-Existent IDs
export const NON_EXISTENT_IDS = {
  SESSION: new Types.ObjectId().toString(),
  USER: new Types.ObjectId().toString(),
  MEDITATION: new Types.ObjectId().toString()
} as const;

// Meditation State Errors
export const MEDITATION_STATE_ERRORS = {
  ALREADY_COMPLETED: {
    sessionId: TEST_IDS.SESSION,
    userId: TEST_IDS.USER,
    state: 'COMPLETED',
    completedAt: new Date().toISOString()
  },
  ALREADY_STARTED: {
    sessionId: TEST_IDS.SESSION,
    userId: TEST_IDS.USER,
    state: 'IN_PROGRESS',
    startedAt: new Date().toISOString()
  },
  INVALID_TRANSITION: {
    sessionId: TEST_IDS.SESSION,
    userId: TEST_IDS.USER,
    state: 'CREATED',
    requestedState: 'COMPLETED'
  }
} as const;

// Meditation Validation Rules
export const VALIDATION_RULES = {
  DURATION: {
    MIN: 1,
    MAX: 60
  },
  MOOD_RATING: {
    MIN: 1,
    MAX: 5
  },
  VALID_TYPES: ['GUIDED', 'UNGUIDED', 'BREATHING', 'BODY_SCAN'] as const
} as const; 