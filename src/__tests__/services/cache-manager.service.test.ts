import { CacheManager } from '../../services/cache-manager.service';

describe('CacheManager', () => {
  beforeEach(async () => {
    await CacheManager.flush();
  });

  describe('set', () => {
    it('should store value in cache', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };
      
      const result = await CacheManager.set(key, value);
      expect(result).toBe(true);
      
      const cached = await CacheManager.get(key);
      expect(cached).toEqual(value);
    });

    it('should respect TTL', async () => {
      const key = 'ttl-test';
      const value = 'test-value';
      
      await CacheManager.set(key, value, 1); // 1 second TTL
      
      // Value should exist initially
      let cached = await CacheManager.get(key);
      expect(cached).toBe(value);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Value should be gone
      cached = await CacheManager.get(key);
      expect(cached).toBeUndefined();
    });

    it('should override existing value', async () => {
      const key = 'override-test';
      
      await CacheManager.set(key, 'initial-value');
      await CacheManager.set(key, 'new-value');
      
      const cached = await CacheManager.get(key);
      expect(cached).toBe('new-value');
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent key', async () => {
      const value = await CacheManager.get('non-existent');
      expect(value).toBeUndefined();
    });

    it('should return correct value for existing key', async () => {
      const key = 'existing-key';
      const value = { test: 'data' };
      
      await CacheManager.set(key, value);
      const cached = await CacheManager.get(key);
      expect(cached).toEqual(value);
    });

    it('should handle different value types', async () => {
      const testCases = [
        { key: 'string', value: 'test-string' },
        { key: 'number', value: 123 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { a: 1, b: 2 } },
        { key: 'null', value: null }
      ];

      for (const { key, value } of testCases) {
        await CacheManager.set(key, value);
        const cached = await CacheManager.get(key);
        expect(cached).toEqual(value);
      }
    });
  });

  describe('del', () => {
    it('should delete existing key', async () => {
      const key = 'delete-test';
      
      await CacheManager.set(key, 'test-value');
      const deleteResult = await CacheManager.del(key);
      expect(deleteResult).toBe(1);
      
      const cached = await CacheManager.get(key);
      expect(cached).toBeUndefined();
    });

    it('should return 0 for non-existent key', async () => {
      const result = await CacheManager.del('non-existent');
      expect(result).toBe(0);
    });

    it('should only delete specified key', async () => {
      await CacheManager.set('key1', 'value1');
      await CacheManager.set('key2', 'value2');
      
      await CacheManager.del('key1');
      
      expect(await CacheManager.get('key1')).toBeUndefined();
      expect(await CacheManager.get('key2')).toBe('value2');
    });
  });

  describe('flush', () => {
    it('should clear all cached values', async () => {
      // Set multiple values
      await CacheManager.set('key1', 'value1');
      await CacheManager.set('key2', 'value2');
      await CacheManager.set('key3', 'value3');
      
      // Flush cache
      await CacheManager.flush();
      
      // Verify all values are cleared
      expect(await CacheManager.get('key1')).toBeUndefined();
      expect(await CacheManager.get('key2')).toBeUndefined();
      expect(await CacheManager.get('key3')).toBeUndefined();
    });

    it('should allow setting new values after flush', async () => {
      await CacheManager.set('pre-flush', 'value');
      await CacheManager.flush();
      
      const setResult = await CacheManager.set('post-flush', 'new-value');
      expect(setResult).toBe(true);
      
      const cached = await CacheManager.get('post-flush');
      expect(cached).toBe('new-value');
    });
  });

  describe('edge cases', () => {
    it('should handle large values', async () => {
      const largeArray = Array(10000).fill('test-data');
      await CacheManager.set('large-value', largeArray);
      
      const cached = await CacheManager.get('large-value');
      expect(cached).toEqual(largeArray);
    });

    it('should handle special characters in keys', async () => {
      const key = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const value = 'special-value';
      
      await CacheManager.set(key, value);
      const cached = await CacheManager.get(key);
      expect(cached).toBe(value);
    });

    it('should handle concurrent operations', async () => {
      const key = 'concurrent-test';
      const operations = Array(100).fill(null).map((_, i) => 
        CacheManager.set(key, `value-${i}`)
      );
      
      await Promise.all(operations);
      const finalValue = await CacheManager.get(key);
      expect(finalValue).toMatch(/^value-\d+$/);
    });
  });
}); 