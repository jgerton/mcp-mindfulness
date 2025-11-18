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
const cache_stats_controller_1 = require("../../controllers/cache-stats.controller");
const cache_stats_service_1 = require("../../services/cache-stats.service");
jest.mock('../../services/cache-stats.service');
describe('CacheStatsController', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            params: {},
            query: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
            setHeader: jest.fn(),
        };
        jest.clearAllMocks();
    });
    describe('getCurrentStats', () => {
        const mockStats = new Map([
            ['userCache', { hits: 100, misses: 20 }],
            ['sessionCache', { hits: 50, misses: 10 }],
        ]);
        it('should return formatted current stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getStats.mockReturnValue(mockStats);
            yield cache_stats_controller_1.CacheStatsController.getCurrentStats(mockReq, mockRes);
            expect(cache_stats_service_1.CacheStatsService.getStats).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith([
                { cacheType: 'userCache', hits: 100, misses: 20 },
                { cacheType: 'sessionCache', hits: 50, misses: 10 },
            ]);
        }));
        it('should handle errors when fetching stats', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getStats.mockImplementation(() => {
                throw new Error('Service error');
            });
            yield cache_stats_controller_1.CacheStatsController.getCurrentStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch current cache statistics' });
        }));
    });
    describe('getHistoricalStats', () => {
        const mockHistoricalStats = [
            { timestamp: new Date(), stats: { hits: 100, misses: 20 } },
        ];
        beforeEach(() => {
            mockReq.query = {
                startDate: '2024-01-01',
                endDate: '2024-01-02',
                cacheType: 'userCache',
            };
        });
        it('should return historical stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockResolvedValue(mockHistoricalStats);
            yield cache_stats_controller_1.CacheStatsController.getHistoricalStats(mockReq, mockRes);
            expect(cache_stats_service_1.CacheStatsService.getHistoricalStats).toHaveBeenCalledWith('userCache', expect.any(Date), expect.any(Date));
            expect(mockRes.json).toHaveBeenCalledWith(mockHistoricalStats);
        }));
        it('should return 400 if required parameters are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.query = {};
            yield cache_stats_controller_1.CacheStatsController.getHistoricalStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockRejectedValue(new Error('Service error'));
            yield cache_stats_controller_1.CacheStatsController.getHistoricalStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch historical cache statistics' });
        }));
    });
    describe('getCategoryStats', () => {
        beforeEach(() => {
            mockReq.params = { cacheType: 'userCache' };
        });
        it('should return category stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCategoryStats = [
                { category: 'users', hits: 100, misses: 20 },
                { category: 'sessions', hits: 50, misses: 10 },
            ];
            cache_stats_service_1.CacheStatsService.getCategoryStats.mockReturnValue(mockCategoryStats);
            yield cache_stats_controller_1.CacheStatsController.getCategoryStats(mockReq, mockRes);
            expect(cache_stats_service_1.CacheStatsService.getCategoryStats).toHaveBeenCalledWith('userCache');
            expect(mockRes.json).toHaveBeenCalledWith(mockCategoryStats);
        }));
        it('should return 400 if cache type is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = {};
            yield cache_stats_controller_1.CacheStatsController.getCategoryStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Cache type is required' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getCategoryStats.mockImplementation(() => {
                throw new Error('Service error');
            });
            yield cache_stats_controller_1.CacheStatsController.getCategoryStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch category statistics' });
        }));
    });
    describe('getHitRates', () => {
        const mockStats = new Map([
            ['userCache', { hits: 100, misses: 20 }],
            ['sessionCache', { hits: 50, misses: 10 }],
        ]);
        it('should return hit rates successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getStats.mockReturnValue(mockStats);
            cache_stats_service_1.CacheStatsService.getHitRate.mockReturnValue(0.8);
            cache_stats_service_1.CacheStatsService.getCategoryStats.mockReturnValue([
                { category: 'users', hits: 80, misses: 20 },
            ]);
            yield cache_stats_controller_1.CacheStatsController.getHitRates(mockReq, mockRes);
            expect(cache_stats_service_1.CacheStatsService.getStats).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    cacheType: expect.any(String),
                    overall: expect.any(Number),
                    categories: expect.arrayContaining([
                        expect.objectContaining({
                            category: expect.any(String),
                            hitRate: expect.any(Number),
                        }),
                    ]),
                }),
            ]));
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getStats.mockImplementation(() => {
                throw new Error('Service error');
            });
            yield cache_stats_controller_1.CacheStatsController.getHitRates(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch hit rates' });
        }));
    });
    describe('getCategoryDetails', () => {
        beforeEach(() => {
            mockReq.params = {
                cacheType: 'userCache',
                category: 'users',
            };
            mockReq.query = {
                timeRange: '3600000', // 1 hour in milliseconds
            };
        });
        it('should return category details successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockHistoricalStats = [
                {
                    timestamp: new Date(),
                    cacheType: 'userCache',
                    stats: {
                        users: {
                            hits: 100,
                            misses: 20,
                            sets: 30,
                            avgLatency: 5,
                            bytesStored: 1024 * 1024, // 1MB
                            errors: 1,
                        },
                    },
                },
            ];
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockResolvedValue(mockHistoricalStats);
            cache_stats_service_1.CacheStatsService.getStats.mockReturnValue(new Map([
                ['userCache', { users: { hits: 100, misses: 20, sets: 30, errors: 1 } }],
            ]));
            yield cache_stats_controller_1.CacheStatsController.getCategoryDetails(mockReq, mockRes);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                current: expect.any(Object),
                historical: expect.any(Array),
                summary: expect.objectContaining({
                    avgHitRate: expect.any(Number),
                    avgLatency: expect.any(Number),
                    peakMemoryUsage: expect.any(Number),
                    totalOperations: expect.any(Number),
                    errorRate: expect.any(Number),
                }),
            }));
        }));
        it('should return 400 if required parameters are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.params = {};
            yield cache_stats_controller_1.CacheStatsController.getCategoryDetails(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Cache type and category are required' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockRejectedValue(new Error('Service error'));
            yield cache_stats_controller_1.CacheStatsController.getCategoryDetails(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch category details' });
        }));
    });
    describe('exportStats', () => {
        beforeEach(() => {
            mockReq.query = {
                format: 'json',
                startDate: '2024-01-01',
                endDate: '2024-01-02',
                cacheType: 'userCache',
            };
        });
        it('should export stats as JSON successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockHistoricalStats = [
                {
                    timestamp: new Date(),
                    cacheType: 'userCache',
                    stats: { users: { hits: 100, misses: 20 } },
                },
            ];
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockResolvedValue(mockHistoricalStats);
            cache_stats_service_1.CacheStatsService.getStats.mockReturnValue(new Map([
                ['userCache', { users: { hits: 100, misses: 20 } }],
            ]));
            cache_stats_service_1.CacheStatsService.getCategoryStats.mockReturnValue([
                { category: 'users', hits: 100, misses: 20 },
            ]);
            cache_stats_service_1.CacheStatsService.getHitRate.mockReturnValue(0.8);
            yield cache_stats_controller_1.CacheStatsController.exportStats(mockReq, mockRes);
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('cache-stats-userCache'));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                summary: expect.any(Object),
                historicalData: expect.any(Array),
            }));
        }));
        it('should export stats as CSV successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.query.format = 'csv';
            const mockHistoricalStats = [
                {
                    timestamp: new Date(),
                    cacheType: 'userCache',
                    stats: { users: { hits: 100, misses: 20 } },
                },
            ];
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockResolvedValue(mockHistoricalStats);
            cache_stats_service_1.CacheStatsService.getStats.mockReturnValue(new Map([
                ['userCache', { users: { hits: 100, misses: 20 } }],
            ]));
            yield cache_stats_controller_1.CacheStatsController.exportStats(mockReq, mockRes);
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('cache-stats-userCache'));
            expect(mockRes.send).toHaveBeenCalled();
        }));
        it('should return 400 if required parameters are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.query = {};
            yield cache_stats_controller_1.CacheStatsController.exportStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            cache_stats_service_1.CacheStatsService.getHistoricalStats.mockRejectedValue(new Error('Service error'));
            yield cache_stats_controller_1.CacheStatsController.exportStats(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to export statistics' });
        }));
    });
});
