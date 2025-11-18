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
exports.waitForDb = exports.getTestObjectId = exports.clearTestCollection = exports.closeTestDb = exports.connectTestDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const test_env_1 = require("./test-env");
const connectTestDb = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dbName = (0, test_env_1.getTestDbName)();
    const uri = ((_a = process.env.MONGODB_URI) === null || _a === void 0 ? void 0 : _a.replace(/\/[^/]+$/, `/${dbName}`)) ||
        `mongodb://localhost:27017/${dbName}`;
    yield mongoose_1.default.connect(uri);
});
exports.connectTestDb = connectTestDb;
const closeTestDb = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState !== 0) {
        const db = mongoose_1.default.connection.db;
        if (db) {
            const dbName = db.databaseName;
            yield db.dropDatabase();
        }
        yield mongoose_1.default.connection.close();
    }
});
exports.closeTestDb = closeTestDb;
const clearTestCollection = (collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState !== 0) {
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                yield db.collection(collectionName).deleteMany({});
            }
        }
        catch (error) {
            // Collection might not exist, ignore error
        }
    }
});
exports.clearTestCollection = clearTestCollection;
const getTestObjectId = () => new mongoose_1.default.Types.ObjectId();
exports.getTestObjectId = getTestObjectId;
/**
 * Helper to wait for database operations to complete
 * Useful for testing async operations
 */
const waitForDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise(resolve => setTimeout(resolve, 100));
});
exports.waitForDb = waitForDb;
