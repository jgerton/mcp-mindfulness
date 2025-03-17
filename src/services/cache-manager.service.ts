import NodeCache from 'node-cache';

export class CacheManager {
  private static cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  
  static async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }
  
  static async set<T>(key: string, value: T, ttl: number = 300): Promise<boolean> {
    return this.cache.set(key, value, ttl);
  }
  
  static async del(key: string): Promise<number> {
    return this.cache.del(key);
  }
  
  static async flush(): Promise<void> {
    this.cache.flushAll();
  }
} 