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
const cache_manager_service_1 = require("../../services/cache-manager.service");
describe('CacheManager', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield cache_manager_service_1.CacheManager.flush();
    }));
    describe('set', () => {
        it('should store value in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'test-key';
            const value = { data: 'test-value' };
            const result = yield cache_manager_service_1.CacheManager.set(key, value);
            expect(result).toBe(true);
            const cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toEqual(value);
        }));
        it('should respect TTL', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'ttl-test';
            const value = 'test-value';
            yield cache_manager_service_1.CacheManager.set(key, value, 1); // 1 second TTL
            // Value should exist initially
            let cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toBe(value);
            // Wait for TTL to expire
            yield new Promise(resolve => setTimeout(resolve, 1100));
            // Value should be gone
            cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toBeUndefined();
        }));
        it('should override existing value', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'override-test';
            yield cache_manager_service_1.CacheManager.set(key, 'initial-value');
            yield cache_manager_service_1.CacheManager.set(key, 'new-value');
            const cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toBe('new-value');
        }));
    });
    describe('get', () => {
        it('should return undefined for non-existent key', () => __awaiter(void 0, void 0, void 0, function* () {
            const value = yield cache_manager_service_1.CacheManager.get('non-existent');
            expect(value).toBeUndefined();
        }));
        it('should return correct value for existing key', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'existing-key';
            const value = { test: 'data' };
            yield cache_manager_service_1.CacheManager.set(key, value);
            const cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toEqual(value);
        }));
        it('should handle different value types', () => __awaiter(void 0, void 0, void 0, function* () {
            const testCases = [
                { key: 'string', value: 'test-string' },
                { key: 'number', value: 123 },
                { key: 'boolean', value: true },
                { key: 'array', value: [1, 2, 3] },
                { key: 'object', value: { a: 1, b: 2 } },
                { key: 'null', value: null }
            ];
            for (const { key, value } of testCases) {
                yield cache_manager_service_1.CacheManager.set(key, value);
                const cached = yield cache_manager_service_1.CacheManager.get(key);
                expect(cached).toEqual(value);
            }
        }));
    });
    describe('del', () => {
        it('should delete existing key', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'delete-test';
            yield cache_manager_service_1.CacheManager.set(key, 'test-value');
            const deleteResult = yield cache_manager_service_1.CacheManager.del(key);
            expect(deleteResult).toBe(1);
            const cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toBeUndefined();
        }));
        it('should return 0 for non-existent key', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield cache_manager_service_1.CacheManager.del('non-existent');
            expect(result).toBe(0);
        }));
        it('should only delete specified key', () => __awaiter(void 0, void 0, void 0, function* () {
            yield cache_manager_service_1.CacheManager.set('key1', 'value1');
            yield cache_manager_service_1.CacheManager.set('key2', 'value2');
            yield cache_manager_service_1.CacheManager.del('key1');
            expect(yield cache_manager_service_1.CacheManager.get('key1')).toBeUndefined();
            expect(yield cache_manager_service_1.CacheManager.get('key2')).toBe('value2');
        }));
    });
    describe('flush', () => {
        it('should clear all cached values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Set multiple values
            yield cache_manager_service_1.CacheManager.set('key1', 'value1');
            yield cache_manager_service_1.CacheManager.set('key2', 'value2');
            yield cache_manager_service_1.CacheManager.set('key3', 'value3');
            // Flush cache
            yield cache_manager_service_1.CacheManager.flush();
            // Verify all values are cleared
            expect(yield cache_manager_service_1.CacheManager.get('key1')).toBeUndefined();
            expect(yield cache_manager_service_1.CacheManager.get('key2')).toBeUndefined();
            expect(yield cache_manager_service_1.CacheManager.get('key3')).toBeUndefined();
        }));
        it('should allow setting new values after flush', () => __awaiter(void 0, void 0, void 0, function* () {
            yield cache_manager_service_1.CacheManager.set('pre-flush', 'value');
            yield cache_manager_service_1.CacheManager.flush();
            const setResult = yield cache_manager_service_1.CacheManager.set('post-flush', 'new-value');
            expect(setResult).toBe(true);
            const cached = yield cache_manager_service_1.CacheManager.get('post-flush');
            expect(cached).toBe('new-value');
        }));
    });
    describe('edge cases', () => {
        it('should handle large values', () => __awaiter(void 0, void 0, void 0, function* () {
            const largeArray = Array(10000).fill('test-data');
            yield cache_manager_service_1.CacheManager.set('large-value', largeArray);
            const cached = yield cache_manager_service_1.CacheManager.get('large-value');
            expect(cached).toEqual(largeArray);
        }));
        it('should handle special characters in keys', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const value = 'special-value';
            yield cache_manager_service_1.CacheManager.set(key, value);
            const cached = yield cache_manager_service_1.CacheManager.get(key);
            expect(cached).toBe(value);
        }));
        it('should handle concurrent operations', () => __awaiter(void 0, void 0, void 0, function* () {
            const key = 'concurrent-test';
            const operations = Array(100).fill(null).map((_, i) => cache_manager_service_1.CacheManager.set(key, `value-${i}`));
            yield Promise.all(operations);
            const finalValue = yield cache_manager_service_1.CacheManager.get(key);
            expect(finalValue).toMatch(/^value-\d+$/);
        }));
    });
});
