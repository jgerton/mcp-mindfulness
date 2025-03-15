import { Request, Response } from 'express';
import { PMRController } from '../../controllers/pmr.controller';
import { PMRService } from '../../services/pmr.service';
import { MuscleGroup, PMRSession } from '../../models/pmr.model';
import mongoose from 'mongoose';

const mockResponse = () => {
  const res: Partial<Response> = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
  return res as Response;
};

const mockRequest = (data: any = {}): Partial<Request> => ({
  user: { _id: 'test-user', username: 'testuser' },
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
});

describe('PMRController', () => {
  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const db = mongoose.connection.db;
      if (db) {
        try {
          await db.collection('musclegroups').deleteMany({});
          await db.collection('pmrsessions').deleteMany({});
        } catch (error) {
          // Collections might not exist, ignore error
        }
      }
    }
    await PMRService.initializeDefaultMuscleGroups();
    
    const muscleGroups = await MuscleGroup.find().sort('order');
    if (muscleGroups.length !== 7) {
      console.log(`Warning: Expected 7 muscle groups, but found ${muscleGroups.length}`);
    }
  });

  describe('getMuscleGroups', () => {
    it('should return all muscle groups in correct order', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await PMRController.getMuscleGroups(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const groups = (res.json as jest.Mock).mock.calls[0][0];
      expect(groups).toHaveLength(7);
      expect(groups[0].name).toBe('hands_and_forearms');
      expect(groups[6].name).toBe('legs');
    });

    it('should handle errors gracefully', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Force an error by mocking the find method
      const originalFind = MuscleGroup.find;
      MuscleGroup.find = jest.fn().mockImplementationOnce(() => {
        throw new Error('Test error');
      }) as any;

      await PMRController.getMuscleGroups(req as Request, res);

      // Restore the original method
      MuscleGroup.find = originalFind;

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get muscle groups' });
    });

    it.skip('should return 500 for invalid session id', async () => {
      const req = mockRequest({
        params: { sessionId: 'invalid-id' },
        body: { completedGroups: [] }
      });
      const res = mockResponse();

      await PMRController.completeSession(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to complete PMR session' });
    });
  });

  describe('startSession', () => {
    it('should create new session with valid data', async () => {
      const req = mockRequest({
        body: { stressLevelBefore: 7 }
      });
      const res = mockResponse();

      await PMRController.startSession(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const session = (res.json as jest.Mock).mock.calls[0][0];
      expect(session.stressLevelBefore).toBe(7);
      expect(session.completedGroups).toEqual([]);
      expect(session.duration).toBe(225); // Total duration of all muscle groups
    });

    it('should return 401 when user not authenticated', async () => {
      const req = mockRequest();
      req.user = undefined;
      const res = mockResponse();

      await PMRController.startSession(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('completeSession', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await PMRService.startSession('test-user', 7);
      sessionId = (session._id as mongoose.Types.ObjectId).toString();
    });

    it('should complete session with valid data', async () => {
      const completedGroups = ['hands_and_forearms', 'biceps', 'shoulders'];
      const req = mockRequest({
        params: { sessionId },
        body: {
          completedGroups,
          stressLevelAfter: 3
        }
      });
      const res = mockResponse();

      await PMRController.completeSession(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const completedSession = (res.json as jest.Mock).mock.calls[0][0];
      expect(completedSession.completedGroups).toEqual(completedGroups);
      expect(completedSession.stressLevelAfter).toBe(3);
    });

    it.skip('should return 500 for invalid session id', async () => {
      const req = mockRequest({
        params: { sessionId: 'invalid-id' },
        body: { completedGroups: [] }
      });
      const res = mockResponse();

      await PMRController.completeSession(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to complete PMR session' });
    });
  });

  describe('updateProgress', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await PMRService.startSession('test-user');
      sessionId = (session._id as mongoose.Types.ObjectId).toString();
    });

    it('should update progress with valid muscle group', async () => {
      const req = mockRequest({
        params: { sessionId },
        body: { completedGroup: 'hands_and_forearms' }
      });
      const res = mockResponse();

      await PMRController.updateProgress(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const updatedSession = (res.json as jest.Mock).mock.calls[0][0];
      expect(updatedSession.completedGroups).toContain('hands_and_forearms');
    });

    it('should return 500 for invalid session id', async () => {
      const req = mockRequest({
        params: { sessionId: 'invalid-id' },
        body: { completedGroup: 'hands_and_forearms' }
      });
      const res = mockResponse();

      await PMRController.updateProgress(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update PMR progress' });
    });
  });

  describe('getUserSessions', () => {
    beforeEach(async () => {
      // Create multiple sessions
      await PMRService.startSession('test-user', 7);
      await PMRService.startSession('test-user', 8);
      await PMRService.startSession('test-user', 6);
    });

    it('should return user sessions with default limit', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await PMRController.getUserSessions(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const sessions = (res.json as jest.Mock).mock.calls[0][0];
      expect(sessions).toHaveLength(3);
    });

    it('should respect limit parameter', async () => {
      const req = mockRequest({ query: { limit: '2' } });
      const res = mockResponse();

      await PMRController.getUserSessions(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const sessions = (res.json as jest.Mock).mock.calls[0][0];
      expect(sessions).toHaveLength(2);
    });

    it('should return 401 when user not authenticated', async () => {
      const req = mockRequest();
      req.user = undefined;
      const res = mockResponse();

      await PMRController.getUserSessions(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('getEffectiveness', () => {
    beforeEach(async () => {
      // Create and complete sessions with different effectiveness
      const session1 = await PMRService.startSession('test-user', 8);
      await PMRService.completeSession(
        (session1._id as mongoose.Types.ObjectId).toString(),
        ['hands_and_forearms', 'biceps', 'shoulders'],
        4
      );

      const session2 = await PMRService.startSession('test-user', 7);
      await PMRService.completeSession(
        (session2._id as mongoose.Types.ObjectId).toString(),
        ['hands_and_forearms', 'biceps', 'shoulders', 'face', 'chest_and_back'],
        3
      );
    });

    it('should return effectiveness metrics', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await PMRController.getEffectiveness(req as Request, res);

      expect(res.json).toHaveBeenCalled();
      const effectiveness = (res.json as jest.Mock).mock.calls[0][0];
      expect(effectiveness).toHaveProperty('averageStressReduction');
      expect(effectiveness).toHaveProperty('totalSessions');
      expect(effectiveness).toHaveProperty('averageCompletionRate');
    });

    it('should return 401 when user not authenticated', async () => {
      const req = mockRequest();
      req.user = undefined;
      const res = mockResponse();

      await PMRController.getEffectiveness(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
}); 