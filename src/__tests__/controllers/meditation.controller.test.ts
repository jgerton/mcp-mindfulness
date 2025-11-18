import { Request, Response } from 'express';
import { Types, Document } from 'mongoose';
import { MeditationController } from '../../controllers/meditation.controller';
import { MeditationService } from '../../services/meditation.service';
import { MeditationSessionService } from '../../services/meditation-session.service';
import { IMeditationSession } from '../../models/meditation-session.model';
import { WellnessSessionStatus } from '../../models/base-wellness-session.model';
import mongoose from 'mongoose';
import { IMeditation } from '../../models/meditation.model';

const validMeditationData = {
  title: 'Test Meditation',
  description: 'Test description',
  duration: 10,
  type: 'guided',
  category: 'mindfulness',
  difficulty: 'beginner',
  tags: ['test']
};

const mockMeditation = {
  _id: new Types.ObjectId(),
  ...validMeditationData,
  __v: 0,
  $assertPopulated: jest.fn(),
  $clearModifiedPaths: jest.fn(),
  $clone: jest.fn(),
  $createModifiedPathsSnapshot: jest.fn(),
  $getAllSubdocs: jest.fn(),
  $getPopulatedDocs: jest.fn(),
  $ignore: jest.fn(),
  $inc: jest.fn(),
  $isDefault: jest.fn(),
  $isDeleted: jest.fn(),
  $isEmpty: jest.fn(),
  $isValid: jest.fn(),
  $locals: {},
  $markValid: jest.fn(),
  $model: jest.fn(),
  $op: null,
  $parent: jest.fn(),
  $session: jest.fn(),
  $set: jest.fn(),
  $toObject: jest.fn(),
  $where: jest.fn(),
  collection: {},
  db: {},
  delete: jest.fn(),
  deleteOne: jest.fn(),
  depopulate: jest.fn(),
  directModifiedPaths: jest.fn(),
  equals: jest.fn(),
  errors: {},
  get: jest.fn(),
  getChanges: jest.fn(),
  increment: jest.fn(),
  init: jest.fn(),
  invalidate: jest.fn(),
  isDirectModified: jest.fn(),
  isDirectSelected: jest.fn(),
  isInit: jest.fn(),
  isModified: jest.fn(),
  isNew: false,
  isSelected: jest.fn(),
  markModified: jest.fn(),
  modifiedPaths: jest.fn(),
  overwrite: jest.fn(),
  populate: jest.fn(),
  populated: jest.fn(),
  remove: jest.fn(),
  replaceOne: jest.fn(),
  save: jest.fn(),
  schema: {},
  set: jest.fn(),
  toJSON: jest.fn(),
  unmarkModified: jest.fn(),
  update: jest.fn(),
  updateOne: jest.fn(),
  validate: jest.fn(),
  validateSync: jest.fn()
} as unknown as Document<unknown, {}, IMeditation> & IMeditation & Required<{ _id: Types.ObjectId }> & { __v: number };

const mockMeditations = [mockMeditation];

const mockUser = {
  _id: new Types.ObjectId().toString(),
  username: 'testuser'
};

const mockSession = {
  _id: new Types.ObjectId(),
  userId: new Types.ObjectId(mockUser._id),
  title: 'Test Session',
  type: 'guided',
  duration: 10,
  durationMinutes: 10,
  completionPercentage: 0,
  status: WellnessSessionStatus.Active,
  startTime: new Date(),
  endTime: undefined,
  interruptions: 0,
  isStreakEligible: true,
  completeSession: jest.fn(),
  processAchievements: jest.fn(),
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0,
  $assertPopulated: jest.fn(),
  $clearModifiedPaths: jest.fn(),
  $clone: jest.fn(),
  $createModifiedPathsSnapshot: jest.fn(),
  $getAllSubdocs: jest.fn(),
  $getPopulatedDocs: jest.fn(),
  $ignore: jest.fn(),
  $inc: jest.fn(),
  $isDefault: jest.fn(),
  $isDeleted: jest.fn(),
  $isEmpty: jest.fn(),
  $isValid: jest.fn(),
  $locals: {},
  $markValid: jest.fn(),
  $model: jest.fn(),
  $op: null,
  $parent: jest.fn(),
  $session: jest.fn(),
  $set: jest.fn(),
  $toObject: jest.fn(),
  $where: jest.fn(),
  collection: {},
  db: {},
  delete: jest.fn(),
  deleteOne: jest.fn(),
  depopulate: jest.fn(),
  directModifiedPaths: jest.fn(),
  equals: jest.fn(),
  errors: {},
  get: jest.fn(),
  getChanges: jest.fn(),
  increment: jest.fn(),
  init: jest.fn(),
  invalidate: jest.fn(),
  isDirectModified: jest.fn(),
  isDirectSelected: jest.fn(),
  isInit: jest.fn(),
  isModified: jest.fn(),
  isNew: false,
  isSelected: jest.fn(),
  markModified: jest.fn(),
  modifiedPaths: jest.fn(),
  overwrite: jest.fn(),
  populate: jest.fn(),
  populated: jest.fn(),
  remove: jest.fn(),
  replaceOne: jest.fn(),
  save: jest.fn(),
  schema: {},
  set: jest.fn(),
  toJSON: jest.fn(),
  unmarkModified: jest.fn(),
  update: jest.fn(),
  updateOne: jest.fn(),
  validate: jest.fn(),
  validateSync: jest.fn()
} as unknown as Document<unknown, {}, IMeditationSession> & IMeditationSession & Required<{ _id: Types.ObjectId }> & { __v: number };

describe('Test Setup', () => {
  it('should connect to the in-memory database', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});

describe('MeditationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: validMeditationData,
      user: mockUser,
      params: { id: mockMeditation._id.toString() }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock static methods
    jest.spyOn(MeditationService, 'createMeditation').mockResolvedValue(mockMeditation);
    jest.spyOn(MeditationService, 'getAllMeditations').mockResolvedValue(mockMeditations);
    jest.spyOn(MeditationService, 'getMeditationById').mockResolvedValue(mockMeditation);
    jest.spyOn(MeditationService, 'updateMeditation').mockResolvedValue(mockMeditation);
    jest.spyOn(MeditationService, 'deleteMeditation').mockResolvedValue(mockMeditation);

    jest.spyOn(MeditationSessionService.prototype, 'getActiveSession').mockResolvedValue(mockSession);
    jest.spyOn(MeditationSessionService.prototype, 'startSession').mockResolvedValue({ sessionId: mockSession._id.toString(), status: WellnessSessionStatus.Active });
    jest.spyOn(MeditationSessionService.prototype, 'completeSession').mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMeditation', () => {
    it('should successfully create a meditation', async () => {
      await MeditationController.createMeditation(mockRequest as Request, mockResponse as Response);

      expect(MeditationService.createMeditation).toHaveBeenCalledWith(validMeditationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
    });

    it('should handle validation errors', async () => {
      const invalidData = { ...validMeditationData, duration: -1 };
      mockRequest.body = invalidData;
      jest.spyOn(MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: duration: Path `duration` (-1) is less than minimum allowed value (1).'));

      await MeditationController.createMeditation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: duration: Path `duration` (-1) is less than minimum allowed value (1).' });
    });

    it('should handle empty request body', async () => {
      mockRequest.body = {};
      jest.spyOn(MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: difficulty: Path `difficulty` is required., category: Path `category` is required., type: Path `type` is required., duration: Path `duration` is required., description: Path `description` is required., title: Path `title` is required.'));

      await MeditationController.createMeditation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: difficulty: Path `difficulty` is required., category: Path `category` is required., type: Path `type` is required., duration: Path `duration` is required., description: Path `description` is required., title: Path `title` is required.' });
    });

    it('should handle invalid meditation type', async () => {
      const invalidData = { ...validMeditationData, type: 'invalid_type' };
      mockRequest.body = invalidData;
      jest.spyOn(MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: type: `invalid_type` is not a valid enum value for path `type`.'));

      await MeditationController.createMeditation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: type: `invalid_type` is not a valid enum value for path `type`.' });
    });
  });

  describe('getAllMeditations', () => {
    it('should successfully get all meditations', async () => {
      await MeditationController.getAllMeditations(mockRequest as Request, mockResponse as Response);

      expect(MeditationService.getAllMeditations).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockMeditations);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(MeditationService, 'getAllMeditations').mockRejectedValue(error);

      await MeditationController.getAllMeditations(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should filter meditations by category', async () => {
      mockRequest.query = { category: 'mindfulness' };

      await MeditationController.getAllMeditations(mockRequest as Request, mockResponse as Response);

      expect(MeditationService.getAllMeditations).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockMeditations);
    });
  });

  describe('getMeditationById', () => {
    const meditationId = '507f1f77bcf86cd799439011';

    it('should successfully get meditation by id', async () => {
      mockRequest.params = { id: meditationId };

      await MeditationController.getMeditationById(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(MeditationService.getMeditationById).toHaveBeenCalledWith(meditationId);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
    });

    it('should return 404 if meditation not found', async () => {
      mockRequest.params = { id: meditationId };
      jest.spyOn(MeditationService, 'getMeditationById').mockResolvedValue(null);

      await MeditationController.getMeditationById(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
    });

    it('should handle invalid meditation ID format', async () => {
      mockRequest.params = { id: 'invalid-id' };
      jest.spyOn(MeditationService, 'getMeditationById').mockRejectedValue(new Error('Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"'));

      await MeditationController.getMeditationById(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"' });
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if one exists', async () => {
      await MeditationController.getActiveSession(mockRequest as Request, mockResponse as Response);

      expect(MeditationSessionService.prototype.getActiveSession).toHaveBeenCalledWith(mockUser._id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await MeditationController.getActiveSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(MeditationSessionService.prototype, 'getActiveSession').mockRejectedValue(error);

      await MeditationController.getActiveSession(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('startSession', () => {
    it('should successfully start a session', async () => {
      await MeditationController.startSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(MeditationSessionService.prototype.startSession).toHaveBeenCalledWith(mockUser._id, {
        meditationId: mockMeditation._id.toString(),
        completed: false,
        duration: 0,
        durationCompleted: 0
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ sessionId: mockSession._id.toString(), status: WellnessSessionStatus.Active });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await MeditationController.startSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should handle already active session', async () => {
      const error = new Error('Active session already exists');
      jest.spyOn(MeditationSessionService.prototype, 'startSession').mockRejectedValue(error);

      await MeditationController.startSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle invalid meditation ID', async () => {
      mockRequest.params = { id: 'invalid-id' };
      const error = new Error('Invalid meditation ID');
      jest.spyOn(MeditationSessionService.prototype, 'startSession').mockRejectedValue(error);

      await MeditationController.startSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('completeSession', () => {
    const completionData = {
      duration: 10,
      durationCompleted: 8,
      completed: true,
      moodAfter: 'peaceful' as const,
      notes: 'Test notes'
    };

    it('should successfully complete a session', async () => {
      mockRequest.body = completionData;
      mockRequest.params = { id: mockSession._id.toString() };

      await MeditationController.completeSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(MeditationSessionService.prototype.completeSession).toHaveBeenCalledWith(mockSession._id.toString(), completionData);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
    });

    it('should handle completion errors', async () => {
      mockRequest.body = completionData;
      mockRequest.params = { id: mockSession._id.toString() };
      const error = new Error('No active session found');
      jest.spyOn(MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);

      await MeditationController.completeSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle invalid session duration', async () => {
      mockRequest.body = { ...completionData, duration: -1 };
      mockRequest.params = { id: mockSession._id.toString() };
      const error = new Error('Invalid session duration');
      jest.spyOn(MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);

      await MeditationController.completeSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle invalid mood value', async () => {
      mockRequest.body = { ...completionData, moodAfter: 'invalid' };
      mockRequest.params = { id: mockSession._id.toString() };
      const error = new Error('Invalid mood value');
      jest.spyOn(MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);

      await MeditationController.completeSession(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('updateMeditation', () => {
    const meditationId = '507f1f77bcf86cd799439011';
    const updateData = {
      title: 'Updated Meditation',
      duration: 20
    };

    it('should successfully update a meditation', async () => {
      mockRequest.params = { id: meditationId };
      mockRequest.body = updateData;

      await MeditationController.updateMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(MeditationService.updateMeditation).toHaveBeenCalledWith(meditationId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
    });

    it('should return 404 if meditation not found', async () => {
      mockRequest.params = { id: meditationId };
      mockRequest.body = updateData;
      jest.spyOn(MeditationService, 'updateMeditation').mockResolvedValue(null);

      await MeditationController.updateMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
    });

    it('should handle empty update data', async () => {
      mockRequest.params = { id: meditationId };
      mockRequest.body = {};

      await MeditationController.updateMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No update data provided' });
    });

    it('should handle invalid update fields', async () => {
      mockRequest.params = { id: meditationId };
      mockRequest.body = { invalidField: 'value' };

      await MeditationController.updateMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid update fields' });
    });
  });

  describe('deleteMeditation', () => {
    const meditationId = '507f1f77bcf86cd799439011';

    it('should successfully delete a meditation', async () => {
      mockRequest.params = { id: meditationId };

      await MeditationController.deleteMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(MeditationService.deleteMeditation).toHaveBeenCalledWith(meditationId);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation deleted successfully' });
    });

    it('should return 404 if meditation not found', async () => {
      mockRequest.params = { id: meditationId };
      jest.spyOn(MeditationService, 'deleteMeditation').mockResolvedValue(null);

      await MeditationController.deleteMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
    });

    it('should handle deletion errors', async () => {
      mockRequest.params = { id: meditationId };
      const error = new Error('Database error');
      jest.spyOn(MeditationService, 'deleteMeditation').mockRejectedValue(error);

      await MeditationController.deleteMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle invalid meditation ID format', async () => {
      mockRequest.params = { id: 'invalid-id' };
      jest.spyOn(MeditationService, 'deleteMeditation').mockRejectedValue(new Error('Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"'));

      await MeditationController.deleteMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"' });
    });

    it('should handle meditation in use', async () => {
      mockRequest.params = { id: meditationId };
      const error = new Error('Meditation is currently in use');
      jest.spyOn(MeditationService, 'deleteMeditation').mockRejectedValue(error);

      await MeditationController.deleteMeditation(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});