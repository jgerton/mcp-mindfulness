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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheManager {
    static get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cache.get(key);
        });
    }
    static set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, ttl = 300) {
            return this.cache.set(key, value, ttl);
        });
    }
    static del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cache.del(key);
        });
    }
    static flush() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.flushAll();
        });
    }
}
exports.CacheManager = CacheManager;
CacheManager.cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
