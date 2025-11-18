"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meditation_controller_1 = require("../../controllers/meditation.controller");
const meditation_service_1 = require("../../services/meditation.service");
const meditation_session_service_1 = require("../../services/meditation-session.service");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const mongoose_2 = __importDefault(require("mongoose"));
const validMeditationData = {
    title: 'Test Meditation',
    description: 'Test description',
    duration: 10,
    type: 'guided',
    category: 'mindfulness',
    difficulty: 'beginner',
    tags: ['test']
};
const mockMeditation = Object.assign(Object.assign({ _id: new mongoose_1.Types.ObjectId() }, validMeditationData), { __v: 0, $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $createModifiedPathsSnapshot: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
const mockMeditations = [mockMeditation];
const mockUser = {
    _id: new mongoose_1.Types.ObjectId().toString(),
    username: 'testuser'
};
const mockSession = {
    _id: new mongoose_1.Types.ObjectId(),
    userId: new mongoose_1.Types.ObjectId(mockUser._id),
    title: 'Test Session',
    type: 'guided',
    duration: 10,
    durationMinutes: 10,
    completionPercentage: 0,
    status: base_wellness_session_model_1.WellnessSessionStatus.Active,
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
};
describe('Test Setup', () => {
    it('should connect to the in-memory database', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(mongoose_2.default.connection.readyState).toBe(1);
    }));
});
describe('MeditationController', () => {
    let mockRequest;
    let mockResponse;
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
        jest.spyOn(meditation_service_1.MeditationService, 'createMeditation').mockResolvedValue(mockMeditation);
        jest.spyOn(meditation_service_1.MeditationService, 'getAllMeditations').mockResolvedValue(mockMeditations);
        jest.spyOn(meditation_service_1.MeditationService, 'getMeditationById').mockResolvedValue(mockMeditation);
        jest.spyOn(meditation_service_1.MeditationService, 'updateMeditation').mockResolvedValue(mockMeditation);
        jest.spyOn(meditation_service_1.MeditationService, 'deleteMeditation').mockResolvedValue(mockMeditation);
        jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'getActiveSession').mockResolvedValue(mockSession);
        jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'startSession').mockResolvedValue({ sessionId: mockSession._id.toString(), status: base_wellness_session_model_1.WellnessSessionStatus.Active });
        jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'completeSession').mockResolvedValue(mockSession);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('createMeditation', () => {
        it('should successfully create a meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            yield meditation_controller_1.MeditationController.createMeditation(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.createMeditation).toHaveBeenCalledWith(validMeditationData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
        }));
        it('should handle validation errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = Object.assign(Object.assign({}, validMeditationData), { duration: -1 });
            mockRequest.body = invalidData;
            jest.spyOn(meditation_service_1.MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: duration: Path `duration` (-1) is less than minimum allowed value (1).'));
            yield meditation_controller_1.MeditationController.createMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: duration: Path `duration` (-1) is less than minimum allowed value (1).' });
        }));
        it('should handle empty request body', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = {};
            jest.spyOn(meditation_service_1.MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: difficulty: Path `difficulty` is required., category: Path `category` is required., type: Path `type` is required., duration: Path `duration` is required., description: Path `description` is required., title: Path `title` is required.'));
            yield meditation_controller_1.MeditationController.createMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: difficulty: Path `difficulty` is required., category: Path `category` is required., type: Path `type` is required., duration: Path `duration` is required., description: Path `description` is required., title: Path `title` is required.' });
        }));
        it('should handle invalid meditation type', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = Object.assign(Object.assign({}, validMeditationData), { type: 'invalid_type' });
            mockRequest.body = invalidData;
            jest.spyOn(meditation_service_1.MeditationService, 'createMeditation').mockRejectedValue(new Error('Meditation validation failed: type: `invalid_type` is not a valid enum value for path `type`.'));
            yield meditation_controller_1.MeditationController.createMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation validation failed: type: `invalid_type` is not a valid enum value for path `type`.' });
        }));
    });
    describe('getAllMeditations', () => {
        it('should successfully get all meditations', () => __awaiter(void 0, void 0, void 0, function* () {
            yield meditation_controller_1.MeditationController.getAllMeditations(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.getAllMeditations).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(mockMeditations);
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Database error');
            jest.spyOn(meditation_service_1.MeditationService, 'getAllMeditations').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.getAllMeditations(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
        it('should filter meditations by category', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.query = { category: 'mindfulness' };
            yield meditation_controller_1.MeditationController.getAllMeditations(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.getAllMeditations).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(mockMeditations);
        }));
    });
    describe('getMeditationById', () => {
        const meditationId = '507f1f77bcf86cd799439011';
        it('should successfully get meditation by id', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            yield meditation_controller_1.MeditationController.getMeditationById(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.getMeditationById).toHaveBeenCalledWith(meditationId);
            expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
        }));
        it('should return 404 if meditation not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            jest.spyOn(meditation_service_1.MeditationService, 'getMeditationById').mockResolvedValue(null);
            yield meditation_controller_1.MeditationController.getMeditationById(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
        }));
        it('should handle invalid meditation ID format', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: 'invalid-id' };
            jest.spyOn(meditation_service_1.MeditationService, 'getMeditationById').mockRejectedValue(new Error('Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"'));
            yield meditation_controller_1.MeditationController.getMeditationById(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"' });
        }));
    });
    describe('getActiveSession', () => {
        it('should return active session if one exists', () => __awaiter(void 0, void 0, void 0, function* () {
            yield meditation_controller_1.MeditationController.getActiveSession(mockRequest, mockResponse);
            expect(meditation_session_service_1.MeditationSessionService.prototype.getActiveSession).toHaveBeenCalledWith(mockUser._id);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should return 401 if user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield meditation_controller_1.MeditationController.getActiveSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Database error');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'getActiveSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.getActiveSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('startSession', () => {
        it('should successfully start a session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield meditation_controller_1.MeditationController.startSession(mockRequest, mockResponse);
            expect(meditation_session_service_1.MeditationSessionService.prototype.startSession).toHaveBeenCalledWith(mockUser._id, {
                meditationId: mockMeditation._id.toString(),
                completed: false,
                duration: 0,
                durationCompleted: 0
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ sessionId: mockSession._id.toString(), status: base_wellness_session_model_1.WellnessSessionStatus.Active });
        }));
        it('should return 401 if user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.user = undefined;
            yield meditation_controller_1.MeditationController.startSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
        it('should handle already active session', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Active session already exists');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'startSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.startSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
        it('should handle invalid meditation ID', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: 'invalid-id' };
            const error = new Error('Invalid meditation ID');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'startSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.startSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('completeSession', () => {
        const completionData = {
            duration: 10,
            durationCompleted: 8,
            completed: true,
            moodAfter: 'peaceful',
            notes: 'Test notes'
        };
        it('should successfully complete a session', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = completionData;
            mockRequest.params = { id: mockSession._id.toString() };
            yield meditation_controller_1.MeditationController.completeSession(mockRequest, mockResponse);
            expect(meditation_session_service_1.MeditationSessionService.prototype.completeSession).toHaveBeenCalledWith(mockSession._id.toString(), completionData);
            expect(mockResponse.json).toHaveBeenCalledWith(mockSession);
        }));
        it('should handle completion errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = completionData;
            mockRequest.params = { id: mockSession._id.toString() };
            const error = new Error('No active session found');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.completeSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
        it('should handle invalid session duration', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = Object.assign(Object.assign({}, completionData), { duration: -1 });
            mockRequest.params = { id: mockSession._id.toString() };
            const error = new Error('Invalid session duration');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.completeSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
        it('should handle invalid mood value', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.body = Object.assign(Object.assign({}, completionData), { moodAfter: 'invalid' });
            mockRequest.params = { id: mockSession._id.toString() };
            const error = new Error('Invalid mood value');
            jest.spyOn(meditation_session_service_1.MeditationSessionService.prototype, 'completeSession').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.completeSession(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('updateMeditation', () => {
        const meditationId = '507f1f77bcf86cd799439011';
        const updateData = {
            title: 'Updated Meditation',
            duration: 20
        };
        it('should successfully update a meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            mockRequest.body = updateData;
            yield meditation_controller_1.MeditationController.updateMeditation(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.updateMeditation).toHaveBeenCalledWith(meditationId, updateData);
            expect(mockResponse.json).toHaveBeenCalledWith(mockMeditation);
        }));
        it('should return 404 if meditation not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            mockRequest.body = updateData;
            jest.spyOn(meditation_service_1.MeditationService, 'updateMeditation').mockResolvedValue(null);
            yield meditation_controller_1.MeditationController.updateMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
        }));
        it('should handle empty update data', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            mockRequest.body = {};
            yield meditation_controller_1.MeditationController.updateMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No update data provided' });
        }));
        it('should handle invalid update fields', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            mockRequest.body = { invalidField: 'value' };
            yield meditation_controller_1.MeditationController.updateMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid update fields' });
        }));
    });
    describe('deleteMeditation', () => {
        const meditationId = '507f1f77bcf86cd799439011';
        it('should successfully delete a meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            yield meditation_controller_1.MeditationController.deleteMeditation(mockRequest, mockResponse);
            expect(meditation_service_1.MeditationService.deleteMeditation).toHaveBeenCalledWith(meditationId);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation deleted successfully' });
        }));
        it('should return 404 if meditation not found', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            jest.spyOn(meditation_service_1.MeditationService, 'deleteMeditation').mockResolvedValue(null);
            yield meditation_controller_1.MeditationController.deleteMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Meditation not found' });
        }));
        it('should handle deletion errors', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            const error = new Error('Database error');
            jest.spyOn(meditation_service_1.MeditationService, 'deleteMeditation').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.deleteMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
        it('should handle invalid meditation ID format', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: 'invalid-id' };
            jest.spyOn(meditation_service_1.MeditationService, 'deleteMeditation').mockRejectedValue(new Error('Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"'));
            yield meditation_controller_1.MeditationController.deleteMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Meditation"' });
        }));
        it('should handle meditation in use', () => __awaiter(void 0, void 0, void 0, function* () {
            mockRequest.params = { id: meditationId };
            const error = new Error('Meditation is currently in use');
            jest.spyOn(meditation_service_1.MeditationService, 'deleteMeditation').mockRejectedValue(error);
            yield meditation_controller_1.MeditationController.deleteMeditation(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
});
