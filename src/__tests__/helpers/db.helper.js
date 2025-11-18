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
exports.clearDB = exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongod = null;
let isConnected = false;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isConnected) {
        return;
    }
    if (mongoose_1.default.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    mongod = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongod.getUri();
    yield mongoose_1.default.connect(uri);
    isConnected = true;
});
exports.connectDB = connectDB;
const disconnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!isConnected) {
        return;
    }
    yield mongoose_1.default.disconnect();
    if (mongod) {
        yield mongod.stop();
        mongod = null;
    }
    isConnected = false;
});
exports.disconnectDB = disconnectDB;
const clearDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!isConnected) {
        yield (0, exports.connectDB)();
    }
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        yield collections[key].deleteMany({});
    }
});
exports.clearDB = clearDB;
