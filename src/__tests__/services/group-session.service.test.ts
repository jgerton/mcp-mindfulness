import mongoose from 'mongoose';
import { GroupSessionService } from '../../services/group-session.service';
import { GroupSession } from '../../models/group-session.model';
import { User } from '../../models/user.model';
import { AchievementService } from '../../services/achievement.service';
import { ChatService } from '../../services/chat.service';
import { FriendService } from '../../services/friend.service';
import { connectToTestDB, disconnectFromTestDB, clearDatabase } from '../test-utils/db-handler';
import { UserTestFactory } from '../factories/user.factory';

// Mock external services
jest.mock('../../services/achievement.service');
jest.mock('../../services/chat.service');
jest.mock('../../services/friend.service');

describe('GroupSessionService', () => {
  let hostId: mongoose.Types.ObjectId;
  let meditationId: mongoose.Types.ObjectId;
  let userFactory: UserTestFactory;

  beforeAll(async () => {
    await connectToTestDB();
  });

  beforeEach(() => {
    hostId = new mongoose.Types.ObjectId();
    meditationId = new mongoose.Types.ObjectId();
    userFactory = new UserTestFactory();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectFromTestDB();
  });

  describe('createSession', () => {
    it('should create a new group session', async () => {
      const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        scheduledTime,
        1800, // 30 minutes
        {
          description: 'Test Description',
          maxParticipants: 5,
          isPrivate: true,
          allowedParticipants: [new mongoose.Types.ObjectId().toString()]
        }
      );

      expect(session._id).toBeDefined();
      expect(session.hostId).toEqual(hostId);
      expect(session.status).toBe('scheduled');
      expect(session.participants).toHaveLength(0);
    });

    it('should reject sessions scheduled in the past', async () => {
      const pastTime = new Date(Date.now() - 3600000); // 1 hour ago
      await expect(
        GroupSessionService.createSession(
          hostId.toString(),
          meditationId.toString(),
          'Test Session',
          pastTime,
          1800
        )
      ).rejects.toThrow('Cannot schedule session in the past');
    });
  });

  describe('joinSession', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        new Date(Date.now() + 3600000),
        1800
      );
      sessionId = session._id.toString();
    });

    it('should allow user to join session', async () => {
      const userId = new mongoose.Types.ObjectId();
      const session = await GroupSessionService.joinSession(sessionId, userId.toString());

      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].userId).toEqual(userId);
      expect(session.participants[0].status).toBe('joined');
    });

    it('should prevent joining full sessions', async () => {
      const session = await GroupSession.findById(sessionId);
      session.maxParticipants = 1;
      await session.save();

      await GroupSessionService.joinSession(sessionId, new mongoose.Types.ObjectId().toString());
      await expect(
        GroupSessionService.joinSession(sessionId, new mongoose.Types.ObjectId().toString())
      ).rejects.toThrow('Session is full');
    });
  });

  describe('startSession', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        new Date(Date.now() + 3600000),
        1800
      );
      sessionId = session._id.toString();
    });

    it('should start session and initialize participant data', async () => {
      const userId = new mongoose.Types.ObjectId();
      await GroupSessionService.joinSession(sessionId, userId.toString());
      
      const session = await GroupSessionService.startSession(sessionId, hostId.toString());
      
      expect(session.status).toBe('in_progress');
      expect(session.participants.every(p => p.sessionData.startTime)).toBe(true);
    });

    it('should add host as participant if not joined', async () => {
      const session = await GroupSessionService.startSession(sessionId, hostId.toString());
      
      const hostParticipant = session.participants.find(p => p.userId.equals(hostId));
      expect(hostParticipant).toBeDefined();
      expect(hostParticipant.status).toBe('joined');
    });
  });

  describe('completeSession', () => {
    let sessionId: string;
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        new Date(Date.now() + 3600000),
        1800
      );
      sessionId = session._id.toString();
      await GroupSessionService.joinSession(sessionId, userId.toString());
      await GroupSessionService.startSession(sessionId, hostId.toString());
    });

    it('should complete participant session', async () => {
      const session = await GroupSessionService.completeSession(
        sessionId,
        userId.toString(),
        { durationCompleted: 1800 }
      );

      const participant = session.participants.find(p => p.userId.equals(userId));
      expect(participant.status).toBe('completed');
      expect(participant.duration).toBe(1800);
    });

    it('should process achievements for sessions with 3+ participants', async () => {
      // Add more participants
      await GroupSessionService.joinSession(sessionId, new mongoose.Types.ObjectId().toString());
      await GroupSessionService.joinSession(sessionId, new mongoose.Types.ObjectId().toString());

      await GroupSessionService.completeSession(
        sessionId,
        userId.toString(),
        { durationCompleted: 1800 }
      );

      expect(AchievementService.processGroupSession).toHaveBeenCalledWith(userId.toString());
    });
  });

  describe('leaveSession', () => {
    let sessionId: string;
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      const user = userFactory.create({ _id: userId, username: 'TestUser' });
      await User.create(user);

      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        new Date(Date.now() + 3600000),
        1800
      );
      sessionId = session._id.toString();
      await GroupSessionService.joinSession(sessionId, userId.toString());
    });

    it('should mark participant as left and add system message', async () => {
      const session = await GroupSessionService.leaveSession(sessionId, userId.toString());

      const participant = session.participants.find(p => p.userId.equals(userId));
      expect(participant.status).toBe('left');
      expect(ChatService.addMessage).toHaveBeenCalledWith(
        sessionId,
        userId.toString(),
        'TestUser has left the session',
        'system'
      );
    });
  });

  describe('getUpcomingSessions', () => {
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      const user = userFactory.create({ _id: userId });
      await User.create(user);

      // Mock friend list
      (FriendService.getFriendList as jest.Mock).mockResolvedValue([
        { requesterId: userId, recipientId: new mongoose.Types.ObjectId() }
      ]);
    });

    it('should return accessible upcoming sessions', async () => {
      // Create public session
      await GroupSessionService.createSession(
        new mongoose.Types.ObjectId().toString(),
        meditationId.toString(),
        'Public Session',
        new Date(Date.now() + 3600000),
        1800
      );

      // Create private session where user is host
      await GroupSessionService.createSession(
        userId.toString(),
        meditationId.toString(),
        'Private Session',
        new Date(Date.now() + 3600000),
        1800,
        { isPrivate: true }
      );

      const sessions = await GroupSessionService.getUpcomingSessions(userId.toString());
      expect(sessions).toHaveLength(2);
    });
  });

  describe('cancelSession', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await GroupSessionService.createSession(
        hostId.toString(),
        meditationId.toString(),
        'Test Session',
        new Date(Date.now() + 3600000),
        1800
      );
      sessionId = session._id.toString();
    });

    it('should cancel session and notify participants', async () => {
      const session = await GroupSessionService.cancelSession(sessionId, hostId.toString());

      expect(session.status).toBe('cancelled');
      expect(ChatService.addMessage).toHaveBeenCalledWith(
        sessionId,
        hostId.toString(),
        'Session has been cancelled by the host',
        'system'
      );
    });

    it('should only allow host to cancel session', async () => {
      await expect(
        GroupSessionService.cancelSession(sessionId, new mongoose.Types.ObjectId().toString())
      ).rejects.toThrow('Session not found or cannot be cancelled');
    });
  });
}); 