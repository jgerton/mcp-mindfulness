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
const stress_management_controller_1 = require("../../controllers/stress-management.controller");
const stress_management_service_1 = require("../../services/stress-management.service");
jest.mock('../../services/stress-management.service');
jest.mock('../../services/stress-analysis.service');
describe('StressManagementController', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            params: { userId: 'user123' },
            body: {},
            query: {},
            user: { _id: 'user123' }
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });
    describe('assessStressLevel', () => {
        const mockAssessment = {
            level: 'HIGH',
            symptoms: ['headache', 'tension'],
            triggers: ['work', 'deadlines']
        };
        it('should successfully assess stress level', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = mockAssessment;
            jest.spyOn(stress_management_service_1.StressManagementService, 'assessStressLevel')
                .mockResolvedValue('HIGH');
            yield stress_management_controller_1.StressManagementController.assessStressLevel(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.assessStressLevel)
                .toHaveBeenCalledWith(mockReq.params.userId, mockAssessment);
            expect(mockRes.json).toHaveBeenCalledWith({ stressLevel: 'HIGH' });
        }));
        it('should handle errors during assessment', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Assessment failed');
            jest.spyOn(stress_management_service_1.StressManagementService, 'assessStressLevel')
                .mockRejectedValue(error);
            yield stress_management_controller_1.StressManagementController.assessStressLevel(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Assessment failed' });
        }));
        it('should handle invalid assessment data', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = { level: 'INVALID_LEVEL' };
            const error = new Error('Invalid stress level');
            jest.spyOn(stress_management_service_1.StressManagementService, 'assessStressLevel')
                .mockRejectedValue(error);
            yield stress_management_controller_1.StressManagementController.assessStressLevel(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
        }));
        it('should handle missing user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = {};
            yield stress_management_controller_1.StressManagementController.assessStressLevel(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'User ID is required' });
        }));
    });
    describe('getRecommendations', () => {
        const mockRecommendations = ['Take breaks', 'Deep breathing', 'Exercise'];
        it('should return recommendations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getRecommendations')
                .mockResolvedValue(mockRecommendations);
            yield stress_management_controller_1.StressManagementController.getRecommendations(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getRecommendations)
                .toHaveBeenCalledWith(mockReq.params.userId);
            expect(mockRes.json).toHaveBeenCalledWith(mockRecommendations);
        }));
        it('should handle errors when fetching recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to fetch recommendations');
            jest.spyOn(stress_management_service_1.StressManagementService, 'getRecommendations')
                .mockRejectedValue(error);
            yield stress_management_controller_1.StressManagementController.getRecommendations(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch recommendations' });
        }));
        it('should handle empty recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getRecommendations')
                .mockResolvedValue([]);
            yield stress_management_controller_1.StressManagementController.getRecommendations(mockReq, mockRes);
            expect(mockRes.json).toHaveBeenCalledWith([]);
        }));
    });
    describe('getRecommendationsWithLevel', () => {
        const mockLevel = 'HIGH';
        const mockRecommendations = ['Immediate break', 'Contact support', 'Relaxation techniques'];
        it('should return level-specific recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = { level: mockLevel };
            jest.spyOn(stress_management_service_1.StressManagementService, 'getRecommendations')
                .mockResolvedValue(mockRecommendations);
            yield stress_management_controller_1.StressManagementController.getRecommendationsWithLevel(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getRecommendations)
                .toHaveBeenCalledWith(mockReq.params.userId, mockLevel);
            expect(mockRes.json).toHaveBeenCalledWith(mockRecommendations);
        }));
        it('should handle invalid stress level', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = { level: 'INVALID' };
            yield stress_management_controller_1.StressManagementController.getRecommendationsWithLevel(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
        }));
    });
    describe('recordStressChange', () => {
        const mockStressChange = {
            stressLevelBefore: 'HIGH',
            stressLevelAfter: 'MEDIUM',
            technique: 'deep-breathing'
        };
        it('should record stress level change successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = mockStressChange;
            jest.spyOn(stress_management_service_1.StressManagementService, 'recordStressChange')
                .mockResolvedValue(undefined);
            yield stress_management_controller_1.StressManagementController.recordStressChange(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.recordStressChange)
                .toHaveBeenCalledWith(mockReq.params.userId, mockStressChange.stressLevelBefore, mockStressChange.stressLevelAfter, mockStressChange.technique);
            expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
        }));
        it('should handle invalid stress levels', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = {
                stressLevelBefore: 'INVALID',
                stressLevelAfter: 'HIGH',
                technique: 'deep-breathing'
            };
            yield stress_management_controller_1.StressManagementController.recordStressChange(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid stress level' });
        }));
        it('should handle missing technique', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = {
                stressLevelBefore: 'HIGH',
                stressLevelAfter: 'MEDIUM'
            };
            yield stress_management_controller_1.StressManagementController.recordStressChange(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Technique is required' });
        }));
    });
    describe('getStressHistory', () => {
        const mockHistory = [
            { date: new Date(), level: 'HIGH', triggers: ['work'] },
            { date: new Date(), level: 'MEDIUM', triggers: ['personal'] }
        ];
        it('should return stress history successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressHistory')
                .mockResolvedValue(mockHistory);
            yield stress_management_controller_1.StressManagementController.getStressHistory(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getStressHistory)
                .toHaveBeenCalledWith(mockReq.params.userId);
            expect(mockRes.json).toHaveBeenCalledWith(mockHistory);
        }));
        it('should handle empty history', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressHistory')
                .mockResolvedValue([]);
            yield stress_management_controller_1.StressManagementController.getStressHistory(mockReq, mockRes);
            expect(mockRes.json).toHaveBeenCalledWith([]);
        }));
        it('should handle date range filters', () => __awaiter(void 0, void 0, void 0, function* () {
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            mockReq.query = { startDate, endDate };
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressHistory')
                .mockResolvedValue(mockHistory);
            yield stress_management_controller_1.StressManagementController.getStressHistory(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getStressHistory)
                .toHaveBeenCalledWith(mockReq.params.userId, { startDate, endDate });
        }));
    });
    describe('getStressAnalytics', () => {
        const mockAnalytics = {
            averageLevel: 'MEDIUM',
            commonTriggers: ['work', 'health'],
            trendAnalysis: 'improving'
        };
        it('should return stress analytics successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressAnalytics')
                .mockResolvedValue(mockAnalytics);
            yield stress_management_controller_1.StressManagementController.getStressAnalytics(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getStressAnalytics)
                .toHaveBeenCalledWith(mockReq.params.userId);
            expect(mockRes.json).toHaveBeenCalledWith(mockAnalytics);
        }));
        it('should handle insufficient data', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressAnalytics')
                .mockResolvedValue(null);
            yield stress_management_controller_1.StressManagementController.getStressAnalytics(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient data for analysis' });
        }));
    });
    describe('getStressPatterns', () => {
        const mockPatterns = {
            dailyPattern: 'highest in mornings',
            weeklyPattern: 'peaks on Mondays',
            monthlyPattern: 'consistent throughout'
        };
        it('should return stress patterns successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressPatterns')
                .mockResolvedValue(mockPatterns);
            yield stress_management_controller_1.StressManagementController.getStressPatterns(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getStressPatterns)
                .toHaveBeenCalledWith(mockReq.params.userId);
            expect(mockRes.json).toHaveBeenCalledWith(mockPatterns);
        }));
        it('should handle no patterns found', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getStressPatterns')
                .mockResolvedValue(null);
            yield stress_management_controller_1.StressManagementController.getStressPatterns(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'No stress patterns found' });
        }));
    });
    describe('getPeakStressHours', () => {
        const mockPeakHours = ['09:00', '17:00'];
        it('should return peak stress hours successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getPeakStressHours')
                .mockResolvedValue(mockPeakHours);
            yield stress_management_controller_1.StressManagementController.getPeakStressHours(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getPeakStressHours)
                .toHaveBeenCalledWith(mockReq.params.userId);
            expect(mockRes.json).toHaveBeenCalledWith(mockPeakHours);
        }));
        it('should handle no peak hours found', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(stress_management_service_1.StressManagementService, 'getPeakStressHours')
                .mockResolvedValue([]);
            yield stress_management_controller_1.StressManagementController.getPeakStressHours(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'No peak stress hours found' });
        }));
        it('should handle time range filters', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.query = { startTime: '09:00', endTime: '17:00' };
            jest.spyOn(stress_management_service_1.StressManagementService, 'getPeakStressHours')
                .mockResolvedValue(mockPeakHours);
            yield stress_management_controller_1.StressManagementController.getPeakStressHours(mockReq, mockRes);
            expect(stress_management_service_1.StressManagementService.getPeakStressHours)
                .toHaveBeenCalledWith(mockReq.params.userId, { startTime: '09:00', endTime: '17:00' });
        }));
    });
});
