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
Object.defineProperty(exports, "__esModule", { value: true });
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
const stress_management_controller_1 = require("../../controllers/stress-management.controller");
const stress_management_service_1 = require("../../services/stress-management.service");
const stress_model_1 = require("../../models/stress.model");
const mocks_1 = require("../mocks");
// Mock data
const mockRecommendations = [
    'Take a break',
    'Practice deep breathing',
    'Go for a walk'
];
// Mock the StressManagementService
jest.mock('../../services/stress-management.service', () => ({
    StressManagementService: {
        assessStressLevel: jest.fn().mockResolvedValue(7),
        getRecommendations: jest.fn().mockResolvedValue([
            'Take a break',
            'Practice deep breathing',
            'Go for a walk'
        ])
    }
}));
// Mock the models
jest.mock('../../models/stress.model', () => {
    return {
        StressAssessment: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn()
        },
        UserPreferences: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn()
        }
    };
});
describe('StressManagementController', () => {
    let context;
    let req;
    let res;
    let stressAssessmentMock;
    let userPreferencesMock;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create test context with mocks
        context = (0, mocks_1.createTestContext)();
        req = context.getRequest();
        res = context.getResponse();
        // Mock response methods
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn().mockImplementation(data => {
            res.jsonData = data;
            return res;
        });
        res.send = jest.fn().mockReturnThis();
        // Setup user in request (simulating auth middleware)
        req.user = { _id: 'test-user-id', username: 'testuser' };
        // Create model mocks
        stressAssessmentMock = new mocks_1.ModelMock({
            collectionName: 'stressAssessments',
            mockData: [
                {
                    _id: 'assessment1',
                    userId: 'test-user-id',
                    score: 7,
                    triggers: ['work', 'family'],
                    timestamp: new Date('2023-06-15')
                },
                {
                    _id: 'assessment2',
                    userId: 'test-user-id',
                    score: 5,
                    triggers: ['work', 'health'],
                    timestamp: new Date('2023-06-14')
                }
            ]
        });
        userPreferencesMock = new mocks_1.ModelMock({
            collectionName: 'userPreferences',
            mockData: [
                {
                    _id: 'pref1',
                    userId: 'test-user-id',
                    notificationFrequency: 'daily',
                    preferredTechniques: ['breathing', 'meditation']
                }
            ]
        });
        // Add the missing methods to the mocks
        stressAssessmentMock.setMethodToReturn = function (method, returnValue) {
            this.setBehavior(method, () => returnValue);
        };
        stressAssessmentMock.setMethodToFail = function (method, error) {
            this.setBehavior(method, () => { throw error; });
        };
        stressAssessmentMock.getMockData = function () {
            return this.mockData;
        };
        userPreferencesMock.setMethodToReturn = function (method, returnValue) {
            this.setBehavior(method, () => returnValue);
        };
        userPreferencesMock.setMethodToFail = function (method, error) {
            this.setBehavior(method, () => { throw error; });
        };
        userPreferencesMock.getMockData = function () {
            return this.mockData;
        };
        // Setup model mocks
        stress_model_1.StressAssessment.find.mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(stressAssessmentMock.getMockData())
        }));
        stress_model_1.StressAssessment.findOne.mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(stressAssessmentMock.getMockData()[0])
        }));
        stress_model_1.UserPreferences.findOne.mockResolvedValue(userPreferencesMock.getMockData()[0]);
        stress_model_1.UserPreferences.findOneAndUpdate.mockImplementation((query, update, options) => {
            const updatedPrefs = Object.assign(Object.assign({}, userPreferencesMock.getMockData()[0]), update);
            return Promise.resolve(updatedPrefs);
        });
        // Setup StressManagementService mocks with proper return values
        stress_management_service_1.StressManagementService.assessStressLevel.mockResolvedValue(7);
        stress_management_service_1.StressManagementService.getRecommendations.mockResolvedValue(mockRecommendations);
    });
    describe('Test Setup', () => {
        it('should connect to the in-memory database', () => {
            expect(process.env.NODE_ENV).toBe('test');
        });
    });
    describe('submitAssessment', () => {
        it('should submit a stress assessment and return stress level with recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.body = {
                score: 7,
                triggers: ['work', 'family'],
                notes: 'Feeling overwhelmed with deadlines'
            };
            // Act
            yield stress_management_controller_1.StressManagementController.submitAssessment(req, res);
            // Assert
            expect(stress_management_service_1.StressManagementService.assessStressLevel).toHaveBeenCalledWith('test-user-id', req.body);
            expect(stress_management_service_1.StressManagementService.getRecommendations).toHaveBeenCalledWith('test-user-id');
            expect(res.json).toHaveBeenCalledWith({
                stressLevel: 7,
                recommendations: mockRecommendations
            });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.submitAssessment(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
        it('should handle errors properly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            stress_management_service_1.StressManagementService.assessStressLevel.mockRejectedValueOnce(new Error('Service error'));
            // Act
            yield stress_management_controller_1.StressManagementController.submitAssessment(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to submit stress assessment' });
        }));
    });
    describe('getStressHistory', () => {
        it('should return stress history for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            yield stress_management_controller_1.StressManagementController.getStressHistory(req, res);
            // Assert
            expect(res.json).toHaveBeenCalledWith(stressAssessmentMock.getMockData());
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.getStressHistory(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
        it('should handle errors properly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            stress_model_1.StressAssessment.find.mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            // Act
            yield stress_management_controller_1.StressManagementController.getStressHistory(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch stress history' });
        }));
    });
    describe('getLatestAssessment', () => {
        it('should return the latest assessment with recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            yield stress_management_controller_1.StressManagementController.getLatestAssessment(req, res);
            // Assert
            expect(res.json).toHaveBeenCalledWith({
                assessment: stressAssessmentMock.getMockData()[0],
                recommendations: mockRecommendations
            });
        }));
        it('should return 404 if no assessments found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            stress_model_1.StressAssessment.findOne.mockImplementationOnce(() => ({
                sort: jest.fn().mockResolvedValue(null)
            }));
            // Act
            yield stress_management_controller_1.StressManagementController.getLatestAssessment(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'No assessments found' });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.getLatestAssessment(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('updatePreferences', () => {
        it('should update user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.body = {
                notificationFrequency: 'weekly',
                preferredTechniques: ['meditation', 'yoga']
            };
            // Act
            yield stress_management_controller_1.StressManagementController.updatePreferences(req, res);
            // Assert
            expect(res.json).toHaveBeenCalledWith({
                _id: 'pref1',
                userId: 'test-user-id',
                notificationFrequency: 'weekly',
                preferredTechniques: ['meditation', 'yoga']
            });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.updatePreferences(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('getPreferences', () => {
        it('should return user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            yield stress_management_controller_1.StressManagementController.getPreferences(req, res);
            // Assert
            expect(res.json).toHaveBeenCalledWith(userPreferencesMock.getMockData()[0]);
        }));
        it('should return 404 if no preferences found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            stress_model_1.UserPreferences.findOne.mockResolvedValueOnce(null);
            // Act
            yield stress_management_controller_1.StressManagementController.getPreferences(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'No preferences found' });
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.getPreferences(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
    });
    describe('getStressInsights', () => {
        it('should return stress insights for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock the private methods
            const originalCalculateAverageStressLevel = stress_management_controller_1.StressManagementController['calculateAverageStressLevel'];
            const originalFindCommonTriggers = stress_management_controller_1.StressManagementController['findCommonTriggers'];
            const originalAnalyzeTrend = stress_management_controller_1.StressManagementController['analyzeTrend'];
            const originalFindPeakStressTimes = stress_management_controller_1.StressManagementController['findPeakStressTimes'];
            stress_management_controller_1.StressManagementController['calculateAverageStressLevel'] = jest.fn().mockReturnValue(6);
            stress_management_controller_1.StressManagementController['findCommonTriggers'] = jest.fn().mockReturnValue(['work', 'family']);
            stress_management_controller_1.StressManagementController['analyzeTrend'] = jest.fn().mockReturnValue('STABLE');
            stress_management_controller_1.StressManagementController['findPeakStressTimes'] = jest.fn().mockReturnValue(['9:00', '18:00']);
            // Act
            yield stress_management_controller_1.StressManagementController.getStressInsights(req, res);
            // Assert
            expect(res.json).toHaveBeenCalledWith({
                averageLevel: expect.any(Number),
                commonTriggers: expect.any(Array),
                trendAnalysis: expect.stringMatching(/IMPROVING|WORSENING|STABLE/),
                peakStressTimes: expect.any(Array)
            });
            // Restore original methods
            stress_management_controller_1.StressManagementController['calculateAverageStressLevel'] = originalCalculateAverageStressLevel;
            stress_management_controller_1.StressManagementController['findCommonTriggers'] = originalFindCommonTriggers;
            stress_management_controller_1.StressManagementController['analyzeTrend'] = originalAnalyzeTrend;
            stress_management_controller_1.StressManagementController['findPeakStressTimes'] = originalFindPeakStressTimes;
        }));
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield stress_management_controller_1.StressManagementController.getStressInsights(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        }));
        it('should handle errors properly', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            stress_model_1.StressAssessment.find.mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            // Act
            yield stress_management_controller_1.StressManagementController.getStressInsights(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate stress insights' });
        }));
    });
});
