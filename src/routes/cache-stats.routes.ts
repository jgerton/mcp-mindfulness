import { Router } from 'express';
import { CacheStatsController } from '../controllers/cache-stats.controller';

const router = Router();

router.get('/current', CacheStatsController.getCurrentStats);
router.get('/historical', CacheStatsController.getHistoricalStats);
router.get('/categories/:cacheType', CacheStatsController.getCategoryStats);
router.get('/hit-rates', CacheStatsController.getHitRates);
router.get('/category-details/:cacheType/:category', CacheStatsController.getCategoryDetails);
router.get('/export', CacheStatsController.exportStats);

export default router; 