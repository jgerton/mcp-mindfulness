"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cache_stats_controller_1 = require("../controllers/cache-stats.controller");
const router = (0, express_1.Router)();
router.get('/current', cache_stats_controller_1.CacheStatsController.getCurrentStats);
router.get('/historical', cache_stats_controller_1.CacheStatsController.getHistoricalStats);
router.get('/categories/:cacheType', cache_stats_controller_1.CacheStatsController.getCategoryStats);
router.get('/hit-rates', cache_stats_controller_1.CacheStatsController.getHitRates);
router.get('/category-details/:cacheType/:category', cache_stats_controller_1.CacheStatsController.getCategoryDetails);
router.get('/export', cache_stats_controller_1.CacheStatsController.exportStats);
exports.default = router;
