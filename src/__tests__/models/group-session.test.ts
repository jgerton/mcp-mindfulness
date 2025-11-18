import mongoose from 'mongoose';
import { 
  GroupSession, 
  IGroupSession, 
  IParticipant,
  IParticipantSessionData 
} from '../../models/group-session.model';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';

// Type-safe test data factory
interface GroupSessionInput extends Partial<IGroupSession> {
  hostId?: mongoose.Types.ObjectId;
  meditationId?: mongoose.Types.ObjectId;
  title?: string;
  scheduledTime?: Date;
  duration?: number;
  maxParticipants?: number;
}

interface ParticipantInput extends Partial<IParticipant> {
  userId?: mongoose.Types.ObjectId;
  status?: 'joined' | 'left' | 'completed';
}

const createTestParticipant = (overrides: ParticipantInput = {}): ParticipantInput => ({
  userId: new mongoose.Types.ObjectId(),
  status: 'joined',
  duration: 0,
  joinedAt: new Date(),
  sessionData: {
    durationCompleted: 0,
    startTime: new Date()
  },
  ...overrides
});

const createTestSession = (overrides: GroupSessionInput = {}): GroupSessionInput => ({
  hostId: new mongoose.Types.ObjectId(),
  meditationId: new mongoose.Types.ObjectId(),
  title: 'Test Group Session',
  scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
  duration: 1800, // 30 minutes
  maxParticipants: 10,
  status: 'scheduled',
  participants: [],
  isPrivate: false,
  ...overrides
});

describe('GroupSession Model', () => {
  let testSession: GroupSessionInput;
  let hostId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    hostId = new mongoose.Types.ObjectId();
    meditationId = new mongoose.Types.ObjectId();
    testSession = {
      hostId,
      meditationId,
      title: 'Test Group Session',
      scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
      duration: 1800, // 30 minutes
      maxParticipants: 10,
      status: 'scheduled',
      participants: [],
      isPrivate: false
    };

    jest.spyOn(mongoose.Model.prototype, 'save')
      .mockImplementation(function(this: any) {
        return Promise.resolve(this);
      });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('Success Cases', () => {
    it('should create group session successfully', async () => {
      const session = await GroupSession.create(testSession);
      expect(session.hostId).toEqual(testSession.hostId);
      expect(session.title).toBe(testSession.title);
      expect(session.duration).toBe(testSession.duration);
      expect(session.status).toBe('scheduled');
    });

    it('should manage participants correctly', async () => {
      const userId = new mongoose.Types.ObjectId();
      const participant = {
        userId,
        status: 'joined' as const,
        duration: 0,
        joinedAt: new Date(),
        sessionData: {
          durationCompleted: 300,
          startTime: new Date()
        }
      };

      const session = await GroupSession.create({
        ...testSession,
        participants: [participant]
      });

      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].userId).toEqual(userId);
      expect(session.participants[0].sessionData.durationCompleted).toBe(300);
    });

    it('should transition through session states', async () => {
      const session = await GroupSession.create(testSession);
      
      session.status = 'in_progress';
      session.startTime = new Date();
      await session.save();
      expect(session.status).toBe('in_progress');

      session.status = 'completed';
      session.endTime = new Date();
      await session.save();
      expect(session.status).toBe('completed');
    });
  });

  describe('Error Cases', () => {
    it('should reject missing required fields', async () => {
      const session = new GroupSession({});
      const validationError = await session.validateSync();
      
      expect(validationError?.errors.hostId).toBeDefined();
      expect(validationError?.errors.meditationId).toBeDefined();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.scheduledTime).toBeDefined();
      expect(validationError?.errors.duration).toBeDefined();
      expect(validationError?.errors.maxParticipants).toBeDefined();
    });

    it('should reject invalid field lengths', async () => {
      const session = new GroupSession({
        ...testSession,
        title: 'a'.repeat(101),
        description: 'a'.repeat(501)
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.title).toBeDefined();
      expect(validationError?.errors.description).toBeDefined();
    });

    it('should reject past scheduledTime', async () => {
      const session = new GroupSession({
        ...testSession,
        scheduledTime: new Date(Date.now() - 3600000) // 1 hour ago
      });

      const validationError = await session.validateSync();
      expect(validationError?.errors.scheduledTime).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle session at max capacity', async () => {
      const session = await GroupSession.create({
        ...testSession,
        maxParticipants: 2,
        participants: [
          {
            userId: new mongoose.Types.ObjectId(),
            status: 'joined',
            duration: 0,
            joinedAt: new Date(),
            sessionData: { durationCompleted: 0, startTime: new Date() }
          },
          {
            userId: new mongoose.Types.ObjectId(),
            status: 'joined',
            duration: 0,
            joinedAt: new Date(),
            sessionData: { durationCompleted: 0, startTime: new Date() }
          }
        ]
      });

      expect(session.isFull()).toBe(true);
      expect(session.canUserJoin(new mongoose.Types.ObjectId())).toBe(false);
    });

    it('should handle private session access control', async () => {
      const allowedUserId = new mongoose.Types.ObjectId();
      const session = await GroupSession.create({
        ...testSession,
        isPrivate: true,
        allowedParticipants: [allowedUserId]
      });

      expect(session.canUserJoin(allowedUserId)).toBe(true);
      expect(session.canUserJoin(new mongoose.Types.ObjectId())).toBe(false);
    });

    it('should handle session cancellation with participants', async () => {
      const session = await GroupSession.create({
        ...testSession,
        participants: [
          {
            userId: new mongoose.Types.ObjectId(),
            status: 'joined',
            duration: 300,
            joinedAt: new Date(),
            sessionData: { durationCompleted: 300, startTime: new Date() }
          },
          {
            userId: new mongoose.Types.ObjectId(),
            status: 'joined',
            duration: 600,
            joinedAt: new Date(),
            sessionData: { durationCompleted: 600, startTime: new Date() }
          }
        ]
      });

      session.status = 'cancelled';
      await session.save();

      expect(session.status).toBe('cancelled');
      expect(session.participants.every(p => p.status === 'left')).toBe(true);
      expect(session.participants.every(p => p.duration > 0)).toBe(true);
    });
  });

  describe('Indexes', () => {
    it('should have index on hostId', async () => {
      const indexes = await GroupSession.collection.getIndexes();
      const hasHostIdIndex = Object.values(indexes).some(
        index => index.key && index.key.hostId === 1
      );
      expect(hasHostIdIndex).toBe(true);
    });

    it('should have index on scheduledTime', async () => {
      const indexes = await GroupSession.collection.getIndexes();
      const hasScheduledTimeIndex = Object.values(indexes).some(
        index => index.key && index.key.scheduledTime === 1
      );
      expect(hasScheduledTimeIndex).toBe(true);
    });
  });

  describe('Participant Management', () => {
    it('should validate participant session data', async () => {
      const session = await GroupSession.create(testSession);
      const participant = createTestParticipant({
        sessionData: {
          durationCompleted: -1, // Invalid duration
          startTime: new Date()
        }
      });

      session.participants.push(participant);
      const validationError = await session.validateSync();
      expect(validationError?.errors['participants.0.sessionData.durationCompleted']).toBeDefined();
    });

    it('should track participant status changes correctly', async () => {
      const session = await GroupSession.create(testSession);
      const userId = new mongoose.Types.ObjectId();
      
      // Join session
      session.participants.push(createTestParticipant({ userId }));
      await session.save();
      expect(session.participants[0].status).toBe('joined');
      
      // Leave session
      session.participants[0].status = 'left';
      session.participants[0].leftAt = new Date();
      await session.save();
      expect(session.participants[0].status).toBe('left');
      expect(session.participants[0].leftAt).toBeDefined();
      
      // Complete session
      session.participants[0].status = 'completed';
      session.participants[0].sessionData.endTime = new Date();
      await session.save();
      expect(session.participants[0].status).toBe('completed');
      expect(session.participants[0].sessionData.endTime).toBeDefined();
    });
  });

  describe('Session State Management', () => {
    it('should validate state transitions', async () => {
      const session = await GroupSession.create(testSession);
      
      // Valid transitions
      expect(() => { session.status = 'in_progress'; }).not.toThrow();
      expect(() => { session.status = 'completed'; }).not.toThrow();
      expect(() => { session.status = 'cancelled'; }).not.toThrow();
      
      // Invalid transitions
      const invalidSession = new GroupSession(testSession);
      invalidSession.status = 'completed';
      expect(() => { invalidSession.status = 'scheduled'; }).toThrow();
      expect(() => { invalidSession.status = 'in_progress'; }).toThrow();
    });

    it('should handle session completion with mixed participant states', async () => {
      const session = await GroupSession.create({
        ...testSession,
        participants: [
          createTestParticipant({ status: 'completed' }),
          createTestParticipant({ status: 'left' }),
          createTestParticipant({ status: 'joined' })
        ]
      });

      session.status = 'completed';
      await session.save();

      expect(session.participants.every(p => 
        p.status === 'completed' || p.status === 'left'
      )).toBe(true);
    });
  });

  describe('User Join Validation', () => {
    it('should prevent joining completed or cancelled sessions', async () => {
      const userId = new mongoose.Types.ObjectId();
      const session = await GroupSession.create(testSession);
      
      session.status = 'completed';
      expect(session.canUserJoin(userId)).toBe(false);
      
      session.status = 'cancelled';
      expect(session.canUserJoin(userId)).toBe(false);
    });

    it('should prevent duplicate joins', async () => {
      const userId = new mongoose.Types.ObjectId();
      const session = await GroupSession.create({
        ...testSession,
        participants: [createTestParticipant({ userId })]
      });

      expect(session.canUserJoin(userId)).toBe(false);
    });

    it('should handle rejoining after leaving', async () => {
      const userId = new mongoose.Types.ObjectId();
      const session = await GroupSession.create({
        ...testSession,
        participants: [createTestParticipant({ 
          userId,
          status: 'left',
          leftAt: new Date()
        })]
      });

      expect(session.canUserJoin(userId)).toBe(true);
    });
  });
}); 