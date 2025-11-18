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
exports.CacheStatsService = void 0;
const mongoose_1 = require("mongoose");
const cacheStatsSchema = new mongoose_1.Schema({
    timestamp: { type: Date, required: true },
    cacheType: { type: String, required: true },
    stats: { type: mongoose_1.Schema.Types.Mixed, required: true }
});
const CacheStatsSnapshot = (0, mongoose_1.model)('CacheStatsSnapshot', cacheStatsSchema);
class CacheStatsService {
    static getOrCreateStats(cacheType, category) {
        if (!this.stats.has(cacheType)) {
            this.stats.set(cacheType, {
                overall: this.createEmptyStats(),
            });
        }
        const typeStats = this.stats.get(cacheType);
        if (!typeStats[category]) {
            typeStats[category] = this.createEmptyStats();
        }
        return typeStats[category];
    }
    static createEmptyStats() {
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
    static updateLatency(stats, latency) {
        const totalOps = stats.hits + stats.misses + stats.sets + stats.invalidations;
        stats.avgLatency = ((stats.avgLatency * (totalOps - 1)) + latency) / totalOps;
    }
    static trackHit(cacheType, category, latency) {
        const categoryStats = this.getOrCreateStats(cacheType, category);
        const overallStats = this.getOrCreateStats(cacheType, 'overall');
        categoryStats.hits++;
        overallStats.hits++;
        this.updateLatency(categoryStats, latency);
        this.updateLatency(overallStats, latency);
    }
    static trackMiss(cacheType, category, latency) {
        const categoryStats = this.getOrCreateStats(cacheType, category);
        const overallStats = this.getOrCreateStats(cacheType, 'overall');
        categoryStats.misses++;
        overallStats.misses++;
        this.updateLatency(categoryStats, latency);
        this.updateLatency(overallStats, latency);
    }
    static trackSet(cacheType, category, latency, bytes) {
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
    static trackInvalidation(cacheType, category, latency) {
        const categoryStats = this.getOrCreateStats(cacheType, category);
        const overallStats = this.getOrCreateStats(cacheType, 'overall');
        categoryStats.invalidations++;
        overallStats.invalidations++;
        categoryStats.keyCount = Math.max(0, categoryStats.keyCount - 1);
        overallStats.keyCount = Math.max(0, overallStats.keyCount - 1);
        this.updateLatency(categoryStats, latency);
        this.updateLatency(overallStats, latency);
    }
    static trackError(cacheType, category) {
        const categoryStats = this.getOrCreateStats(cacheType, category);
        const overallStats = this.getOrCreateStats(cacheType, 'overall');
        categoryStats.errors++;
        overallStats.errors++;
    }
    static getStats() {
        return new Map(this.stats);
    }
    static getCategoryStats(cacheType) {
        const typeStats = this.stats.get(cacheType);
        if (!typeStats)
            return [];
        return Object.entries(typeStats)
            .filter(([category]) => category !== 'overall')
            .map(([category, stats]) => (Object.assign({ category }, stats)));
    }
    static getHitRate(cacheType, category) {
        const stats = category
            ? this.getOrCreateStats(cacheType, category)
            : this.getOrCreateStats(cacheType, 'overall');
        const total = stats.hits + stats.misses;
        return total === 0 ? 0 : stats.hits / total;
    }
    static persistStats() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [cacheType, stats] of this.stats.entries()) {
                const snapshot = new CacheStatsSnapshot({
                    timestamp: new Date(),
                    cacheType,
                    stats
                });
                yield snapshot.save();
            }
        });
    }
    static startStatsPersistence(intervalMs = 300000) {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
        }
        this.persistenceInterval = setInterval(() => this.persistStats(), intervalMs);
    }
    static stopStatsPersistence() {
        if (this.persistenceInterval) {
            clearInterval(this.persistenceInterval);
            this.persistenceInterval = null;
        }
    }
    static reset() {
        this.stats.clear();
    }
    static getHistoricalStats(cacheType, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return CacheStatsSnapshot.find({
                cacheType,
                timestamp: { $gte: startDate, $lte: endDate }
            }).sort({ timestamp: 1 });
        });
    }
}
exports.CacheStatsService = CacheStatsService;
CacheStatsService.stats = new Map();
CacheStatsService.persistenceInterval = null;
