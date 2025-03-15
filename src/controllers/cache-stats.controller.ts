import { Request, Response } from 'express';
import { CacheStatsService } from '../services/cache-stats.service';
import { Parser } from 'json2csv';

export class CacheStatsController {
  static async getCurrentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = CacheStatsService.getStats();
      const formattedStats = Array.from(stats.entries()).map(([cacheType, typeStats]) => ({
        cacheType,
        ...typeStats
      }));
      res.json(formattedStats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current cache statistics' });
    }
  }

  static async getHistoricalStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, cacheType } = req.query;
      
      if (!startDate || !endDate || !cacheType) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const stats = await CacheStatsService.getHistoricalStats(
        cacheType as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch historical cache statistics' });
    }
  }

  static async getCategoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { cacheType } = req.params;
      
      if (!cacheType) {
        res.status(400).json({ error: 'Cache type is required' });
        return;
      }

      const stats = CacheStatsService.getCategoryStats(cacheType);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
  }

  static async getHitRates(req: Request, res: Response): Promise<void> {
    try {
      const stats = CacheStatsService.getStats();
      const hitRates = Array.from(stats.keys()).map(cacheType => ({
        cacheType,
        overall: CacheStatsService.getHitRate(cacheType),
        categories: CacheStatsService.getCategoryStats(cacheType).map(cat => ({
          category: cat.category,
          hitRate: CacheStatsService.getHitRate(cacheType, cat.category)
        }))
      }));
      res.json(hitRates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hit rates' });
    }
  }

  static async getCategoryDetails(req: Request, res: Response): Promise<void> {
    try {
      const { cacheType, category } = req.params;
      const { timeRange } = req.query;
      
      if (!cacheType || !category) {
        res.status(400).json({ error: 'Cache type and category are required' });
        return;
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (parseInt(timeRange as string) || 3600000));

      const historicalStats = await CacheStatsService.getHistoricalStats(cacheType, startDate, endDate);
      
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

      const currentStats = CacheStatsService.getStats().get(cacheType)?.[category];
      
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
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category details' });
    }
  }

  static async exportStats(req: Request, res: Response): Promise<void> {
    try {
      const { format, startDate, endDate, cacheType } = req.query;
      
      if (!startDate || !endDate || !cacheType) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const historicalStats = await CacheStatsService.getHistoricalStats(
        cacheType as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const currentStats = CacheStatsService.getStats().get(cacheType as string);
      const hitRates = CacheStatsService.getCategoryStats(cacheType as string).map(cat => ({
        category: cat.category,
        hitRate: CacheStatsService.getHitRate(cacheType as string, cat.category)
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

        const parser = new Parser();
        const csv = parser.parse(flattenedData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=cache-stats-${cacheType}-${new Date().toISOString()}.csv`);
        res.send(csv);
      } else {
        // JSON export
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=cache-stats-${cacheType}-${new Date().toISOString()}.json`);
        res.json(exportData);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to export statistics' });
    }
  }
} 