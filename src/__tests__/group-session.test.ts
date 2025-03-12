import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { GroupSession, IGroupSession } from '../models/group-session.model';
import { Meditation } from '../models/meditation.model';
import { GroupSessionService } from '../services/group-session.service';

beforeEach(async () => {
  await User.deleteMany({});
  await GroupSession.deleteMany({});
  await Meditation.deleteMany({});
});

describe('Group Session System', () => {
  let host: mongoose.Document<unknown, {}, IUser> & IUser & { _id: mongoose.Types.ObjectId };
  let participant1: mongoose.Document<unknown, {}, IUser> & IUser & { _id: mongoose.Types.ObjectId };
  let participant2: mongoose.Document<unknown, {}, IUser> & IUser & { _id: mongoose.Types.ObjectId };
  let meditation: any;
  let session: mongoose.Document<unknown, {}, IGroupSession> & IGroupSession & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    await User.deleteMany({});
    await GroupSession.deleteMany({});
    await Meditation.deleteMany({});

    // Create test users
    host = await User.create({
      username: 'host',
      email: 'host@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant1 = await User.create({
      username: 'participant1',
      email: 'participant1@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    participant2 = await User.create({
      username: 'participant2',
      email: 'participant2@test.com',
      password: 'password123',
      friendIds: [],
      blockedUserIds: []
    });

    // Create test meditation
    meditation = await Meditation.create({
      title: 'Test Meditation',
      description: 'A test meditation session',
      duration: 10,
      type: 'guided',
      category: 'mindfulness',
      difficulty: 'beginner',
      audioUrl: 'https://example.com/meditation.mp3',
      tags: ['test']
    });
  });

  describe('Session Creation and Management', () => {
    it('should create a group session successfully', async () => {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1);

      const session = await GroupSessionService.createSession(
        host._id.toString(),
        meditation._id.toString(),
        'Test Group Session',
        scheduledTime,
        15,
        {
          description: 'A test group meditation session',
          maxParticipants: 5,
          isPrivate: false
        }
      );

      expect(session).toBeDefined();
      expect(session.hostId.toString()).toBe(host._id.toString());
      expect(session.meditationId.toString()).toBe(meditation._id.toString());
      expect(session.title).toBe('Test Group Session');
      expect(session.duration).toBe(15);
      expect(session.status).toBe('scheduled');
    });

    it('should not create a session with past scheduled time', async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);

      await expect(
        GroupSessionService.createSession(
          host._id.toString(),
          meditation._id.toString(),
          'Past Session',
          pastTime,
          15,
          { description: 'Should not be created' }
        )
      ).rejects.toThrow('Cannot schedule session in the past');
    });
  });

  describe('Session Participation', () => {
    beforeEach(async () => {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1);

      session = await GroupSessionService.createSession(
        host._id.toString(),
        meditation._id.toString(),
        'Test Session',
        scheduledTime,
        15,
        { maxParticipants: 2 }
      );
    });

    it('should allow participants to join session', async () => {
      const updatedSession = await GroupSessionService.joinSession(
        session._id.toString(),
        participant1._id.toString()
      );

      const joinedParticipant = updatedSession.participants.find(
        (p: { userId: mongoose.Types.ObjectId }) => p.userId.toString() === participant1._id.toString()
      );
      expect(joinedParticipant).toBeDefined();
      expect(joinedParticipant?.status).toBe('joined');
    });

    it('should not exceed maximum participants', async () => {
      // Join first participant
      await GroupSessionService.joinSession(
        session._id.toString(),
        participant1._id.toString()
      );

      // Join second participant
      await GroupSessionService.joinSession(
        session._id.toString(),
        participant2._id.toString()
      );

      // Verify we have 2 participants
      const updatedSession = await GroupSession.findById(session._id);
      expect(updatedSession?.participants.filter(p => p.status === 'joined')).toHaveLength(2);

      // Create third participant
      const participant3 = await User.create({
        username: 'participant3',
        email: 'participant3@test.com',
        password: 'password123',
        friendIds: [],
        blockedUserIds: []
      });

      // Try to join with third participant - should fail
      await expect(
        GroupSessionService.joinSession(
          session._id.toString(),
          participant3._id.toString()
        )
      ).rejects.toThrow('Session is full');
    });
  });

  describe('Session Flow', () => {
    beforeEach(async () => {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1);

      session = await GroupSessionService.createSession(
        host._id.toString(),
        meditation._id.toString(),
        'Flow Test Session',
        scheduledTime,
        15,
        { maxParticipants: 3 }
      );

      await GroupSessionService.joinSession(
        session._id.toString(),
        participant1._id.toString()
      );
    });

    it('should complete full session flow successfully', async () => {
      // Start session
      let updatedSession = await GroupSessionService.startSession(
        session._id.toString(),
        host._id.toString()
      );
      expect(updatedSession.status).toBe('in_progress');

      // Complete session for host
      updatedSession = await GroupSessionService.completeSession(
        session._id.toString(),
        host._id.toString(),
        {
          durationCompleted: 15,
          moodBefore: '5',
          moodAfter: '8'
        }
      );

      // Complete session for participant
      updatedSession = await GroupSessionService.completeSession(
        session._id.toString(),
        participant1._id.toString(),
        {
          durationCompleted: 15,
          moodBefore: '4',
          moodAfter: '7'
        }
      );

      const completedParticipants = updatedSession.participants
        .filter(p => p.status === 'completed')
        .map(p => p.userId);

      expect(completedParticipants).toContainEqual(host._id);
      expect(completedParticipants).toContainEqual(participant1._id);
      expect(updatedSession.status).toBe('completed');
    });

    it('should allow participants to leave session', async () => {
      const updatedSession = await GroupSessionService.leaveSession(
        session._id.toString(),
        participant1._id.toString()
      );

      const participant = updatedSession.participants.find(
        p => p.userId.toString() === participant1._id.toString()
      );
      expect(participant?.status).toBe('left');
    });

    it('should allow host to cancel session', async () => {
      const updatedSession = await GroupSessionService.cancelSession(
        session._id.toString(),
        host._id.toString()
      );

      expect(updatedSession.status).toBe('cancelled');
    });
  });

  describe('Session Queries', () => {
    beforeEach(async () => {
      // Create multiple sessions
      const futureTime1 = new Date();
      futureTime1.setHours(futureTime1.getHours() + 1);
      
      const futureTime2 = new Date();
      futureTime2.setHours(futureTime2.getHours() + 2);

      await GroupSessionService.createSession(
        host._id.toString(),
        meditation._id.toString(),
        'Upcoming Session 1',
        futureTime1,
        15,
        { isPrivate: false }
      );

      await GroupSessionService.createSession(
        host._id.toString(),
        meditation._id.toString(),
        'Upcoming Session 2',
        futureTime2,
        20,
        { isPrivate: false }
      );
    });

    it('should get upcoming sessions', async () => {
      const upcomingSessions = await GroupSessionService.getUpcomingSessions(
        participant1._id.toString()
      );

      expect(upcomingSessions).toHaveLength(2);
      expect(upcomingSessions[0].status).toBe('scheduled');
    });

    it('should get user sessions', async () => {
      const userSessions = await GroupSessionService.getUserSessions(
        host._id.toString()
      );

      expect(userSessions).toHaveLength(2);
      expect(userSessions[0].hostId.toString()).toBe(host._id.toString());
    });
  });
}); 