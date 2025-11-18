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
const pmr_controller_1 = require("../../controllers/pmr.controller");
const pmr_service_1 = require("../../services/pmr.service");
const pmr_model_1 = require("../../models/pmr.model");
const mongoose_1 = __importDefault(require("mongoose"));
const mockResponse = () => {
    const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    };
    return res;
};
const mockRequest = (data = {}) => ({
    user: { _id: 'test-user', username: 'testuser' },
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
});
describe('PMRController', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            const db = mongoose_1.default.connection.db;
            if (db) {
                try {
                    yield db.collection('musclegroups').deleteMany({});
                    yield db.collection('pmrsessions').deleteMany({});
                }
                catch (error) {
                    // Collections might not exist, ignore error
                }
            }
        }
        yield pmr_service_1.PMRService.initializeDefaultMuscleGroups();
        const muscleGroups = yield pmr_model_1.MuscleGroup.find().sort('order');
        if (muscleGroups.length !== 7) {
            console.log(`Warning: Expected 7 muscle groups, but found ${muscleGroups.length}`);
        }
    }));
    describe('getMuscleGroups', () => {
        it('should return all muscle groups in correct order', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getMuscleGroups(req, res);
            expect(res.json).toHaveBeenCalled();
            const groups = res.json.mock.calls[0][0];
            expect(groups).toHaveLength(7);
            expect(groups[0].name).toBe('hands_and_forearms');
            expect(groups[6].name).toBe('legs');
        }));
        it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            // Force an error by mocking the find method
            const originalFind = pmr_model_1.MuscleGroup.find;
            pmr_model_1.MuscleGroup.find = jest.fn().mockImplementationOnce(() => {
                throw new Error('Test error');
            });
            yield pmr_controller_1.PMRController.getMuscleGroups(req, res);
            // Restore the original method
            pmr_model_1.MuscleGroup.find = originalFind;
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get muscle groups' });
        }));
        it('should return 500 for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                params: { sessionId: 'invalid-id' },
                body: { completedGroups: [] }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.completeSession(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to complete PMR session' });
        }));
    });
    describe('startSession', () => {
        it('should create new session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                body: { stressLevelBefore: 7 }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.startSession(req, res);
            expect(res.json).toHaveBeenCalled();
            const session = res.json.mock.calls[0][0];
            expect(session.stressLevelBefore).toBe(7);
            expect(session.completedGroups).toEqual([]);
            expect(session.duration).toBe(225); // Total duration of all muscle groups
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield pmr_controller_1.PMRController.startSession(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('completeSession', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield pmr_service_1.PMRService.startSession('test-user', 7);
            sessionId = session._id.toString();
        }));
        it('should complete session with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const completedGroups = ['hands_and_forearms', 'biceps', 'shoulders'];
            const req = mockRequest({
                params: { sessionId },
                body: {
                    completedGroups,
                    stressLevelAfter: 3
                }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.completeSession(req, res);
            expect(res.json).toHaveBeenCalled();
            const completedSession = res.json.mock.calls[0][0];
            expect(completedSession.completedGroups).toEqual(completedGroups);
            expect(completedSession.stressLevelAfter).toBe(3);
        }));
        it('should return 500 for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                params: { sessionId: 'invalid-id' },
                body: { completedGroups: [] }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.completeSession(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to complete PMR session' });
        }));
    });
    describe('updateProgress', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield pmr_service_1.PMRService.startSession('test-user');
            sessionId = session._id.toString();
        }));
        it('should update progress with valid muscle group', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                params: { sessionId },
                body: { completedGroup: 'hands_and_forearms' }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.updateProgress(req, res);
            expect(res.json).toHaveBeenCalled();
            const updatedSession = res.json.mock.calls[0][0];
            expect(updatedSession.completedGroups).toContain('hands_and_forearms');
        }));
        it('should return 500 for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                params: { sessionId: 'invalid-id' },
                body: { completedGroup: 'hands_and_forearms' }
            });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.updateProgress(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update PMR progress' });
        }));
    });
    describe('getUserSessions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions
            yield pmr_service_1.PMRService.startSession('test-user', 7);
            yield pmr_service_1.PMRService.startSession('test-user', 8);
            yield pmr_service_1.PMRService.startSession('test-user', 6);
        }));
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getUserSessions(req, res);
            expect(res.json).toHaveBeenCalled();
            const sessions = res.json.mock.calls[0][0];
            expect(sessions).toHaveLength(3);
        }));
        it('should respect limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({ query: { limit: '2' } });
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getUserSessions(req, res);
            expect(res.json).toHaveBeenCalled();
            const sessions = res.json.mock.calls[0][0];
            expect(sessions).toHaveLength(2);
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getUserSessions(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('getEffectiveness', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete sessions with different effectiveness
            const session1 = yield pmr_service_1.PMRService.startSession('test-user', 8);
            yield pmr_service_1.PMRService.completeSession(session1._id.toString(), ['hands_and_forearms', 'biceps', 'shoulders'], 4);
            const session2 = yield pmr_service_1.PMRService.startSession('test-user', 7);
            yield pmr_service_1.PMRService.completeSession(session2._id.toString(), ['hands_and_forearms', 'biceps', 'shoulders', 'face', 'chest_and_back'], 3);
        }));
        it('should return effectiveness metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getEffectiveness(req, res);
            expect(res.json).toHaveBeenCalled();
            const effectiveness = res.json.mock.calls[0][0];
            expect(effectiveness).toHaveProperty('averageStressReduction');
            expect(effectiveness).toHaveProperty('totalSessions');
            expect(effectiveness).toHaveProperty('averageCompletionRate');
        }));
        it('should return 401 when user not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield pmr_controller_1.PMRController.getEffectiveness(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
});
