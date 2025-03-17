import { Schema, model, Document } from 'mongoose';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  errors: number;
  avgLatency: number;
  bytesStored: number;
  keyCount: number;
}

interface CategoryStats extends CacheStats {
  category: string;
}

interface CacheTypeStats {
  [category: string]: CacheStats;
  overall: CacheStats;
}

interface ICacheStatsSnapshot extends Document {
  timestamp: Date;
  cacheType: string;
  stats: CacheTypeStats;
}

const cacheStatsSchema = new Schema<ICacheStatsSnapshot>({
  timestamp: { type: Date, required: true },
  cacheType: { type: String, required: true },
  stats: { type: Schema.Types.Mixed, required: true }
});

const CacheStatsSnapshot = model<ICacheStatsSnapshot>('CacheStatsSnapshot', cacheStatsSchema);

export class CacheStatsService {
  private static stats: Map<string, CacheTypeStats> = new Map();
  private static persistenceInterval: NodeJS.Timeout | null = null;

  private static getOrCreateStats(cacheType: string, category: string): CacheStats {
    if (!this.stats.has(cacheType)) {
      this.stats.set(cacheType, {
        overall: this.createEmptyStats(),
      });
    }

    const typeStats = this.stats.get(cacheType)!;
    if (!typeStats[category]) {
      typeStats[category] = this.createEmptyStats();
    }

    return typeStats[category];
  }

  private static createEmptyStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      errors: 0,
      avgLatency: 0,
      bytesStored: 0,
      keyCount: 0,
    };
  }

  private static updateLatency(stats: CacheStats, latency: number): void {
    const totalOps = stats.hits + stats.misses + stats.sets + stats.invalidations;
    stats.avgLatency = ((stats.avgLatency * (totalOps - 1)) + latency) / totalOps;
  }

  static trackHit(cacheType: string, category: string, latency: number): void {
    const categoryStats = this.getOrCreateStats(cacheType, category);
    const overallStats = this.getOrCreateStats(cacheType, 'overall');

    categoryStats.hits++;
    overallStats.hits++;

    this.updateLatency(categoryStats, latency);
    this.updateLatency(overallStats, latency);
  }

  static trackMiss(cacheType: string, category: string, latency: number): void {
    const categoryStats = this.getOrCreateStats(cacheType, category);
    const overallStats = this.getOrCreateStats(cacheType, 'overall');

    categoryStats.misses++;
    overallStats.misses++;

    this.updateLatency(categoryStats, latency);
    this.updateLatency(overallStats, latency);
  }

  static trackSet(cacheType: string, category: string, latency: number, bytes: number): void {
    const categoryStats = this.getOrCreateStats(cacheType, category);
    const overallStats = this.getOrCreateStats(cacheType, 'overall');

    categoryStats.sets++;
    overallStats.sets++;
    categoryStats.bytesStored += bytes;
    overallStats.bytesStored += bytes;
    categoryStats.keyCount++;
    overallStats.keyCount++;

    this.updateLatency(categoryStats, latency);
    this.updateLatency(overallStats, latency);
  }

  static trackInvalidation(cacheType: string, category: string, latency: number): void {
    const categoryStats = this.getOrCreateStats(cacheType, category);
    const overallStats = this.getOrCreateStats(cacheType, 'overall');

    categoryStats.invalidations++;
    overallStats.invalidations++;
    categoryStats.keyCount = Math.max(0, categoryStats.keyCount - 1);
    overallStats.keyCount = Math.max(0, overallStats.keyCount - 1);

    this.updateLatency(categoryStats, latency);
    this.updateLatency(overallStats, latency);
  }

  static trackError(cacheType: string, category: string): void {
    const categoryStats = this.getOrCreateStats(cacheType, category);
    const overallStats = this.getOrCreateStats(cacheType, 'overall');

    categoryStats.errors++;
    overallStats.errors++;
  }

  static getStats(): Map<string, CacheTypeStats> {
    return new Map(this.stats);
  }

  static getCategoryStats(cacheType: string): CategoryStats[] {
    const typeStats = this.stats.get(cacheType);
    if (!typeStats) return [];

    return Object.entries(typeStats)
      .filter(([category]) => category !== 'overall')
      .map(([category, stats]) => ({
        category,
        ...stats
      }));
  }

  static getHitRate(cacheType: string, category?: string): number {
    const stats = category 
      ? this.getOrCreateStats(cacheType, category)
      : this.getOrCreateStats(cacheType, 'overall');
    
    const total = stats.hits + stats.misses;
    return total === 0 ? 0 : stats.hits / total;
  }

  static async persistStats(): Promise<void> {
    for (const [cacheType, stats] of this.stats.entries()) {
      const snapshot = new CacheStatsSnapshot({
        timestamp: new Date(),
        cacheType,
        stats
      });
      await snapshot.save();
    }
  }

  static startStatsPersistence(intervalMs: number = 300000): void { // Default: 5 minutes
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
    }
    this.persistenceInterval = setInterval(() => this.persistStats(), intervalMs);
  }

  static stopStatsPersistence(): void {
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
      this.persistenceInterval = null;
    }
  }

  static reset(): void {
    this.stats.clear();
  }

  static async getHistoricalStats(
    cacheType: string,
    startDate: Date,
    endDate: Date
  ): Promise<ICacheStatsSnapshot[]> {
    return CacheStatsSnapshot.find({
      cacheType,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
  }
} 