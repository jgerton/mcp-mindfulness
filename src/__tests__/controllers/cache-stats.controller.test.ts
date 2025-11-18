import { Request, Response } from 'express';
import { CacheStatsController } from '../../controllers/cache-stats.controller';
import { CacheStatsService } from '../../services/cache-stats.service';

jest.mock('../../services/cache-stats.service');

describe('CacheStatsController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

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

    it('should return formatted current stats successfully', async () => {
      (CacheStatsService.getStats as jest.Mock).mockReturnValue(mockStats);

      await CacheStatsController.getCurrentStats(mockReq as Request, mockRes as Response);

      expect(CacheStatsService.getStats).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith([
        { cacheType: 'userCache', hits: 100, misses: 20 },
        { cacheType: 'sessionCache', hits: 50, misses: 10 },
      ]);
    });

    it('should handle errors when fetching stats', async () => {
      (CacheStatsService.getStats as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      await CacheStatsController.getCurrentStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch current cache statistics' });
    });
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

    it('should return historical stats successfully', async () => {
      (CacheStatsService.getHistoricalStats as jest.Mock).mockResolvedValue(mockHistoricalStats);

      await CacheStatsController.getHistoricalStats(mockReq as Request, mockRes as Response);

      expect(CacheStatsService.getHistoricalStats).toHaveBeenCalledWith(
        'userCache',
        expect.any(Date),
        expect.any(Date)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockHistoricalStats);
    });

    it('should return 400 if required parameters are missing', async () => {
      mockReq.query = {};

      await CacheStatsController.getHistoricalStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
    });

    it('should handle service errors', async () => {
      (CacheStatsService.getHistoricalStats as jest.Mock).mockRejectedValue(new Error('Service error'));

      await CacheStatsController.getHistoricalStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch historical cache statistics' });
    });
  });

  describe('getCategoryStats', () => {
    beforeEach(() => {
      mockReq.params = { cacheType: 'userCache' };
    });

    it('should return category stats successfully', async () => {
      const mockCategoryStats = [
        { category: 'users', hits: 100, misses: 20 },
        { category: 'sessions', hits: 50, misses: 10 },
      ];
      (CacheStatsService.getCategoryStats as jest.Mock).mockReturnValue(mockCategoryStats);

      await CacheStatsController.getCategoryStats(mockReq as Request, mockRes as Response);

      expect(CacheStatsService.getCategoryStats).toHaveBeenCalledWith('userCache');
      expect(mockRes.json).toHaveBeenCalledWith(mockCategoryStats);
    });

    it('should return 400 if cache type is missing', async () => {
      mockReq.params = {};

      await CacheStatsController.getCategoryStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Cache type is required' });
    });

    it('should handle service errors', async () => {
      (CacheStatsService.getCategoryStats as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      await CacheStatsController.getCategoryStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch category statistics' });
    });
  });

  describe('getHitRates', () => {
    const mockStats = new Map([
      ['userCache', { hits: 100, misses: 20 }],
      ['sessionCache', { hits: 50, misses: 10 }],
    ]);

    it('should return hit rates successfully', async () => {
      (CacheStatsService.getStats as jest.Mock).mockReturnValue(mockStats);
      (CacheStatsService.getHitRate as jest.Mock).mockReturnValue(0.8);
      (CacheStatsService.getCategoryStats as jest.Mock).mockReturnValue([
        { category: 'users', hits: 80, misses: 20 },
      ]);

      await CacheStatsController.getHitRates(mockReq as Request, mockRes as Response);

      expect(CacheStatsService.getStats).toHaveBeenCalled();
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
    });

    it('should handle service errors', async () => {
      (CacheStatsService.getStats as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      await CacheStatsController.getHitRates(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch hit rates' });
    });
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

    it('should return category details successfully', async () => {
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

      (CacheStatsService.getHistoricalStats as jest.Mock).mockResolvedValue(mockHistoricalStats);
      (CacheStatsService.getStats as jest.Mock).mockReturnValue(new Map([
        ['userCache', { users: { hits: 100, misses: 20, sets: 30, errors: 1 } }],
      ]));

      await CacheStatsController.getCategoryDetails(mockReq as Request, mockRes as Response);

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
    });

    it('should return 400 if required parameters are missing', async () => {
      mockReq.params = {};

      await CacheStatsController.getCategoryDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Cache type and category are required' });
    });

    it('should handle service errors', async () => {
      (CacheStatsService.getHistoricalStats as jest.Mock).mockRejectedValue(new Error('Service error'));

      await CacheStatsController.getCategoryDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch category details' });
    });
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

    it('should export stats as JSON successfully', async () => {
      const mockHistoricalStats = [
        {
          timestamp: new Date(),
          cacheType: 'userCache',
          stats: { users: { hits: 100, misses: 20 } },
        },
      ];

      (CacheStatsService.getHistoricalStats as jest.Mock).mockResolvedValue(mockHistoricalStats);
      (CacheStatsService.getStats as jest.Mock).mockReturnValue(new Map([
        ['userCache', { users: { hits: 100, misses: 20 } }],
      ]));
      (CacheStatsService.getCategoryStats as jest.Mock).mockReturnValue([
        { category: 'users', hits: 100, misses: 20 },
      ]);
      (CacheStatsService.getHitRate as jest.Mock).mockReturnValue(0.8);

      await CacheStatsController.exportStats(mockReq as Request, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('cache-stats-userCache')
      );
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        summary: expect.any(Object),
        historicalData: expect.any(Array),
      }));
    });

    it('should export stats as CSV successfully', async () => {
      mockReq.query.format = 'csv';
      const mockHistoricalStats = [
        {
          timestamp: new Date(),
          cacheType: 'userCache',
          stats: { users: { hits: 100, misses: 20 } },
        },
      ];

      (CacheStatsService.getHistoricalStats as jest.Mock).mockResolvedValue(mockHistoricalStats);
      (CacheStatsService.getStats as jest.Mock).mockReturnValue(new Map([
        ['userCache', { users: { hits: 100, misses: 20 } }],
      ]));

      await CacheStatsController.exportStats(mockReq as Request, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('cache-stats-userCache')
      );
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 400 if required parameters are missing', async () => {
      mockReq.query = {};

      await CacheStatsController.exportStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
    });

    it('should handle service errors', async () => {
      (CacheStatsService.getHistoricalStats as jest.Mock).mockRejectedValue(new Error('Service error'));

      await CacheStatsController.exportStats(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to export statistics' });
    });
  });
}); 