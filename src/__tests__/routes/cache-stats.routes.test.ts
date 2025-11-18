import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { CacheStatsController } from '../../controllers/cache-stats.controller';

jest.mock('../../controllers/cache-stats.controller');

describe('Cache Stats Routes', () => {
  let app: Express;
  let mockToken: string;

  beforeAll(async () => {
    app = await createServer();
    mockToken = 'mock.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cache/stats', () => {
    it('should get cache statistics successfully', async () => {
      const mockStats = {
        hits: 15000,
        misses: 500,
        hitRate: 96.77,
        size: 2048576, // bytes
        itemCount: 1000,
        avgTtl: 3600, // seconds
        evictions: 50,
        lastEvictionTime: new Date().toISOString()
      };

      (CacheStatsController.prototype.getCacheStats as jest.Mock)
        .mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/cache/stats')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('should handle detailed stats request', async () => {
      const response = await request(app)
        .get('/api/cache/stats')
        .query({ detailed: 'true' })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(CacheStatsController.prototype.getCacheStats)
        .toHaveBeenCalledWith(expect.any(Object), { detailed: true });
    });
  });

  describe('GET /api/cache/keys', () => {
    it('should get cache keys successfully', async () => {
      const mockKeys = {
        total: 1000,
        keys: [
          {
            key: 'user:123:preferences',
            ttl: 3600,
            size: 1024,
            lastAccessed: new Date().toISOString()
          },
          {
            key: 'session:456:data',
            ttl: 7200,
            size: 2048,
            lastAccessed: new Date().toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 100
        }
      };

      (CacheStatsController.prototype.getCacheKeys as jest.Mock)
        .mockResolvedValue(mockKeys);

      const response = await request(app)
        .get('/api/cache/keys')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockKeys);
    });

    it('should handle pagination and pattern filtering', async () => {
      const response = await request(app)
        .get('/api/cache/keys')
        .query({ 
          page: 2, 
          limit: 20,
          pattern: 'user:*'
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(CacheStatsController.prototype.getCacheKeys)
        .toHaveBeenCalledWith(expect.any(Object), {
          page: 2,
          limit: 20,
          pattern: 'user:*'
        });
    });
  });

  describe('GET /api/cache/metrics', () => {
    it('should get cache metrics successfully', async () => {
      const mockMetrics = {
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        metrics: {
          hitRateHistory: [
            { timestamp: new Date().toISOString(), value: 95.5 }
          ],
          sizeHistory: [
            { timestamp: new Date().toISOString(), value: 2048576 }
          ],
          evictionRateHistory: [
            { timestamp: new Date().toISOString(), value: 0.5 }
          ]
        },
        summary: {
          avgHitRate: 95.5,
          peakSize: 2097152,
          totalEvictions: 100
        }
      };

      (CacheStatsController.prototype.getCacheMetrics as jest.Mock)
        .mockResolvedValue(mockMetrics);

      const response = await request(app)
        .get('/api/cache/metrics')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMetrics);
    });

    it('should handle time range parameters', async () => {
      const timeRange = {
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-02T00:00:00Z',
        interval: '1h'
      };

      const response = await request(app)
        .get('/api/cache/metrics')
        .query(timeRange)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(CacheStatsController.prototype.getCacheMetrics)
        .toHaveBeenCalledWith(expect.any(Object), timeRange);
    });
  });

  describe('DELETE /api/cache/keys/:key', () => {
    it('should delete cache key successfully', async () => {
      const key = 'user:123:preferences';
      
      (CacheStatsController.prototype.deleteCacheKey as jest.Mock)
        .mockResolvedValue({ success: true });

      const response = await request(app)
        .delete(`/api/cache/keys/${key}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(CacheStatsController.prototype.deleteCacheKey)
        .toHaveBeenCalledWith(expect.any(Object), key);
    });

    it('should handle non-existent key', async () => {
      const key = 'non:existent:key';
      
      (CacheStatsController.prototype.deleteCacheKey as jest.Mock)
        .mockRejectedValue(new Error('Key not found'));

      const response = await request(app)
        .delete(`/api/cache/keys/${key}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Key not found');
    });
  });

  describe('POST /api/cache/flush', () => {
    it('should flush cache successfully', async () => {
      (CacheStatsController.prototype.flushCache as jest.Mock)
        .mockResolvedValue({ 
          success: true,
          clearedKeys: 1000,
          timeElapsed: 150 // ms
        });

      const response = await request(app)
        .post('/api/cache/flush')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        clearedKeys: 1000,
        timeElapsed: 150
      });
    });

    it('should handle pattern-based flush', async () => {
      const pattern = 'user:*';

      const response = await request(app)
        .post('/api/cache/flush')
        .send({ pattern })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(CacheStatsController.prototype.flushCache)
        .toHaveBeenCalledWith(expect.any(Object), { pattern });
    });
  });
}); 