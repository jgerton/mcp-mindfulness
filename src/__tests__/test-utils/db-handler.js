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
exports.logConnectionState = exports.clearDatabase = exports.disconnectFromTestDB = exports.connectToTestDB = exports.dbHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
class DbHandler {
    constructor() {
        this.mongod = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongoose_1.default.connection.readyState !== 0) {
                yield mongoose_1.default.disconnect();
            }
            this.mongod = yield mongodb_memory_server_1.MongoMemoryServer.create();
            yield mongoose_1.default.connect(this.mongod.getUri());
        });
    }
    clearDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongoose_1.default.connection.readyState !== 1) {
                return;
            }
            const collections = mongoose_1.default.connection.collections;
            for (const key in collections) {
                yield collections[key].deleteMany({});
            }
        });
    }
    closeDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongoose_1.default.connection.readyState !== 0) {
                yield mongoose_1.default.connection.dropDatabase();
                yield mongoose_1.default.connection.close();
            }
            if (this.mongod) {
                yield this.mongod.stop();
            }
        });
    }
}
exports.dbHandler = new DbHandler();
/**
 * Connect to the in-memory database.
 */
const connectToTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield exports.dbHandler.connect();
        (0, exports.logConnectionState)();
        console.log(`MongoDB successfully connected to ${(_a = exports.dbHandler.mongod) === null || _a === void 0 ? void 0 : _a.getUri()}`);
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
});
exports.connectToTestDB = connectToTestDB;
/**
 * Disconnect from the in-memory database and close the connection.
 */
const disconnectFromTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.dbHandler.closeDatabase();
        console.log('MongoDB disconnected');
    }
    catch (err) {
        console.error('MongoDB disconnect error:', err);
        throw err;
    }
});
exports.disconnectFromTestDB = disconnectFromTestDB;
/**
 * Clear all data in the database
 */
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState === 0) {
        console.warn('Database not connected. Cannot clear database.');
        return;
    }
    yield exports.dbHandler.clearDatabase();
    console.log('Database cleared');
});
exports.clearDatabase = clearDatabase;
/**
 * Log the current connection state of MongoDB
 */
const logConnectionState = () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`MongoDB connection state: ${states[mongoose_1.default.connection.readyState]}`);
};
exports.logConnectionState = logConnectionState;
