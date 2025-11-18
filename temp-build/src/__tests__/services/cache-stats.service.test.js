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
const cache_stats_service_1 = require("../../services/cache-stats.service");
// Mock only the persistence methods
const originalPersistStats = cache_stats_service_1.CacheStatsService.persistStats;
const originalGetHistoricalStats = cache_stats_service_1.CacheStatsService.getHistoricalStats;
beforeAll(() => {
    // Mock the persistence methods
    cache_stats_service_1.CacheStatsService.persistStats = jest.fn().mockResolvedValue(undefined);
    cache_stats_service_1.CacheStatsService.getHistoricalStats = jest.fn().mockResolvedValue([
        {
            cacheType: 'memory',
            stats: {
                test: { hits: 1, misses: 0, sets: 0, invalidations: 0, errors: 0, avgLatency: 10, bytesStored: 0, keyCount: 0 },
                overall: { hits: 1, misses: 0, sets: 0, invalidations: 0, errors: 0, avgLatency: 10, bytesStored: 0, keyCount: 0 }
            }
        }
    ]);
});
afterAll(() => {
    // Restore original methods
    cache_stats_service_1.CacheStatsService.persistStats = originalPersistStats;
    cache_stats_service_1.CacheStatsService.getHistoricalStats = originalGetHistoricalStats;
});
describe('CacheStatsService', () => {
    beforeEach(() => {
        cache_stats_service_1.CacheStatsService.reset();
        jest.clearAllMocks();
    });
    describe('Basic Operations', () => {
        it('should track cache hits correctly', () => {
            cache_stats_service_1.CacheStatsService.trackHit('memory', 'leaderboard', 10);
            cache_stats_service_1.CacheStatsService.trackHit('memory', 'leaderboard', 20);
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const leaderboardStats = stats.get('memory')['leaderboard'];
            const overallStats = stats.get('memory')['overall'];
            expect(leaderboardStats.hits).toBe(2);
            expect(leaderboardStats.avgLatency).toBe(15);
            expect(overallStats.hits).toBe(2);
            expect(overallStats.avgLatency).toBe(15);
        });
        it('should track cache misses correctly', () => {
            cache_stats_service_1.CacheStatsService.trackMiss('redis', 'achievements', 30);
            cache_stats_service_1.CacheStatsService.trackMiss('redis', 'achievements', 40);
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const achievementsStats = stats.get('redis')['achievements'];
            const overallStats = stats.get('redis')['overall'];
            expect(achievementsStats.misses).toBe(2);
            expect(achievementsStats.avgLatency).toBe(35);
            expect(overallStats.misses).toBe(2);
            expect(overallStats.avgLatency).toBe(35);
        });
        it('should track cache sets correctly', () => {
            cache_stats_service_1.CacheStatsService.trackSet('memory', 'user', 15, 1000);
            cache_stats_service_1.CacheStatsService.trackSet('memory', 'user', 25, 2000);
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const userStats = stats.get('memory')['user'];
            const overallStats = stats.get('memory')['overall'];
            expect(userStats.sets).toBe(2);
            expect(userStats.bytesStored).toBe(3000);
            expect(userStats.keyCount).toBe(2);
            expect(overallStats.sets).toBe(2);
            expect(overallStats.bytesStored).toBe(3000);
            expect(overallStats.keyCount).toBe(2);
        });
        it('should track cache invalidations correctly', () => {
            cache_stats_service_1.CacheStatsService.trackSet('redis', 'points', 10, 500);
            cache_stats_service_1.CacheStatsService.trackSet('redis', 'points', 15, 500);
            cache_stats_service_1.CacheStatsService.trackInvalidation('redis', 'points', 20);
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const pointsStats = stats.get('redis')['points'];
            const overallStats = stats.get('redis')['overall'];
            expect(pointsStats.invalidations).toBe(1);
            expect(pointsStats.keyCount).toBe(1);
            expect(overallStats.invalidations).toBe(1);
            expect(overallStats.keyCount).toBe(1);
        });
        it('should track errors correctly', () => {
            cache_stats_service_1.CacheStatsService.trackError('redis', 'session');
            cache_stats_service_1.CacheStatsService.trackError('redis', 'session');
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const sessionStats = stats.get('redis')['session'];
            const overallStats = stats.get('redis')['overall'];
            expect(sessionStats.errors).toBe(2);
            expect(overallStats.errors).toBe(2);
        });
    });
    describe('Hit Rate Calculation', () => {
        it('should calculate hit rate correctly', () => {
            cache_stats_service_1.CacheStatsService.trackHit('memory', 'user', 10);
            cache_stats_service_1.CacheStatsService.trackHit('memory', 'user', 15);
            cache_stats_service_1.CacheStatsService.trackMiss('memory', 'user', 20);
            const hitRate = cache_stats_service_1.CacheStatsService.getHitRate('memory', 'user');
            expect(hitRate).toBe(2 / 3);
        });
        it('should return 0 hit rate when no operations', () => {
            const hitRate = cache_stats_service_1.CacheStatsService.getHitRate('memory', 'empty');
            expect(hitRate).toBe(0);
        });
    });
    describe('Category Stats', () => {
        it('should return stats by category', () => {
            cache_stats_service_1.CacheStatsService.trackHit('redis', 'leaderboard', 10);
            cache_stats_service_1.CacheStatsService.trackMiss('redis', 'achievements', 20);
            cache_stats_service_1.CacheStatsService.trackSet('redis', 'user', 15, 1000);
            const categoryStats = cache_stats_service_1.CacheStatsService.getCategoryStats('redis');
            expect(categoryStats).toHaveLength(3);
            expect(categoryStats.map(s => s.category)).toContain('leaderboard');
            expect(categoryStats.map(s => s.category)).toContain('achievements');
            expect(categoryStats.map(s => s.category)).toContain('user');
        });
    });
    describe('Stats Persistence', () => {
        it.skip('should persist and retrieve historical stats', () => __awaiter(void 0, void 0, void 0, function* () {
            const startDate = new Date();
            cache_stats_service_1.CacheStatsService.trackHit('memory', 'test', 10);
            yield cache_stats_service_1.CacheStatsService.persistStats();
            const endDate = new Date();
            const historicalStats = yield cache_stats_service_1.CacheStatsService.getHistoricalStats('memory', startDate, endDate);
            expect(historicalStats).toHaveLength(1);
            expect(historicalStats[0].cacheType).toBe('memory');
            expect(historicalStats[0].stats.test.hits).toBe(1);
        }));
    });
});
