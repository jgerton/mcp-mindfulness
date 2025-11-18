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
exports.isConnected = exports.clearDatabase = exports.closeDatabase = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
/**
 * Connect to the in-memory database.
 */
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    // Create MongoDB Memory Server
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Only connect if not already connected
    if (mongoose_1.default.connection.readyState === 0) {
        yield mongoose_1.default.connect(mongoUri);
        console.log('Connected to in-memory MongoDB server');
    }
});
exports.connect = connect;
/**
 * Close the connection to the database and stop the server.
 */
const closeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState !== 0) {
        yield mongoose_1.default.connection.close();
    }
    if (mongoServer) {
        yield mongoServer.stop();
    }
    console.log('Closed connection to in-memory MongoDB server');
});
exports.closeDatabase = closeDatabase;
/**
 * Clear all collections in the database.
 */
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState !== 0) {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            yield collection.deleteMany({});
        }
    }
});
exports.clearDatabase = clearDatabase;
/**
 * Check if MongoDB connection is active
 */
const isConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isConnected = isConnected;
