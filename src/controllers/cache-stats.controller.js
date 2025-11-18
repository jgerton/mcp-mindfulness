"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStatsController = void 0;
const cache_stats_service_1 = require("../services/cache-stats.service");
const json2csv_1 = require("json2csv");
class CacheStatsController {
    static async getCurrentStats(req, res) {
        try {
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const formattedStats = Array.from(stats.entries()).map(([cacheType, typeStats]) => ({
                cacheType,
                ...typeStats
            }));
            res.json(formattedStats);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch current cache statistics' });
        }
    }
    static async getHistoricalStats(req, res) {
        try {
            const { startDate, endDate, cacheType } = req.query;
            if (!startDate || !endDate || !cacheType) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }
            const stats = await cache_stats_service_1.CacheStatsService.getHistoricalStats(cacheType, new Date(startDate), new Date(endDate));
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch historical cache statistics' });
        }
    }
    static async getCategoryStats(req, res) {
        try {
            const { cacheType } = req.params;
            if (!cacheType) {
                res.status(400).json({ error: 'Cache type is required' });
                return;
            }
            const stats = cache_stats_service_1.CacheStatsService.getCategoryStats(cacheType);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch category statistics' });
        }
    }
    static async getHitRates(req, res) {
        try {
            const stats = cache_stats_service_1.CacheStatsService.getStats();
            const hitRates = Array.from(stats.keys()).map(cacheType => ({
                cacheType,
                overall: cache_stats_service_1.CacheStatsService.getHitRate(cacheType),
                categories: cache_stats_service_1.CacheStatsService.getCategoryStats(cacheType).map(cat => ({
                    category: cat.category,
                    hitRate: cache_stats_service_1.CacheStatsService.getHitRate(cacheType, cat.category)
                }))
            }));
            res.json(hitRates);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch hit rates' });
        }
    }
    static async getCategoryDetails(req, res) {
        var _a;
        try {
            const { cacheType, category } = req.params;
            const { timeRange } = req.query;
            if (!cacheType || !category) {
                res.status(400).json({ error: 'Cache type and category are required' });
                return;
            }
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (parseInt(timeRange) || 3600000));
            const historicalStats = await cache_stats_service_1.CacheStatsService.getHistoricalStats(cacheType, startDate, endDate);
            const categoryData = historicalStats.map(snapshot => ({
                timestamp: snapshot.timestamp,
                ...snapshot.stats[category],
                hitRate: snapshot.stats[category]
                    ? snapshot.stats[category].hits / (snapshot.stats[category].hits + snapshot.stats[category].misses)
                    : 0,
                memoryUsageMB: snapshot.stats[category]
                    ? snapshot.stats[category].bytesStored / (1024 * 1024)
                    : 0
            }));
            const currentStats = (_a = cache_stats_service_1.CacheStatsService.getStats().get(cacheType)) === null || _a === void 0 ? void 0 : _a[category];
            const analysis = {
                current: currentStats,
                historical: categoryData,
                summary: {
                    avgHitRate: categoryData.reduce((acc, curr) => acc + curr.hitRate, 0) / categoryData.length,
                    avgLatency: categoryData.reduce((acc, curr) => acc + curr.avgLatency, 0) / categoryData.length,
                    peakMemoryUsage: Math.max(...categoryData.map(d => d.memoryUsageMB)),
                    totalOperations: currentStats ? (currentStats.hits + currentStats.misses + currentStats.sets) : 0,
                    errorRate: currentStats ? currentStats.errors / (currentStats.hits + currentStats.misses + currentStats.sets) : 0
                }
            };
            res.json(analysis);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch category details' });
        }
    }
    static async exportStats(req, res) {
        try {
            const { format, startDate, endDate, cacheType } = req.query;
            if (!startDate || !endDate || !cacheType) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }
            const historicalStats = await cache_stats_service_1.CacheStatsService.getHistoricalStats(cacheType, new Date(startDate), new Date(endDate));
            const currentStats = cache_stats_service_1.CacheStatsService.getStats().get(cacheType);
            const hitRates = cache_stats_service_1.CacheStatsService.getCategoryStats(cacheType).map(cat => ({
                category: cat.category,
                hitRate: cache_stats_service_1.CacheStatsService.getHitRate(cacheType, cat.category)
            }));
            const exportData = {
                summary: {
                    timestamp: new Date().toISOString(),
                    cacheType,
                    currentStats,
                    hitRates
                },
                historicalData: historicalStats
            };
            if (format === 'csv') {
                // Flatten the data for CSV export
                const flattenedData = historicalStats.map(stat => ({
                    timestamp: stat.timestamp,
                    cacheType: stat.cacheType,
                    ...Object.entries(stat.stats).reduce((acc, [category, metrics]) => ({
                        ...acc,
                        [`${category}_hits`]: metrics.hits,
                        [`${category}_misses`]: metrics.misses,
                        [`${category}_sets`]: metrics.sets,
                        [`${category}_latency`]: metrics.avgLatency,
                        [`${category}_memory`]: metrics.bytesStored
                    }), {})
                }));
                const parser = new json2csv_1.Parser();
                const csv = parser.parse(flattenedData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=cache-stats-${cacheType}-${new Date().toISOString()}.csv`);
                res.send(csv);
            }
            else {
                // JSON export
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=cache-stats-${cacheType}-${new Date().toISOString()}.json`);
                res.json(exportData);
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to export statistics' });
        }
    }
}
exports.CacheStatsController = CacheStatsController;
