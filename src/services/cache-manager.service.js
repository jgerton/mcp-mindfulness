"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheManager {
    static async get(key) {
        return this.cache.get(key);
    }
    static async set(key, value, ttl = 300) {
        return this.cache.set(key, value, ttl);
    }
    static async del(key) {
        return this.cache.del(key);
    }
    static async flush() {
        this.cache.flushAll();
    }
}
exports.CacheManager = CacheManager;
CacheManager.cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
