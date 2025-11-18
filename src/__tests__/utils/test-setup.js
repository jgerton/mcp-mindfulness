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
exports.setupTestDB = setupTestDB;
exports.teardownTestDB = teardownTestDB;
exports.createMockAuthUtils = createMockAuthUtils;
exports.mockModule = mockModule;
exports.clearMocks = clearMocks;
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
function setupTestDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongod = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongod.getUri();
        yield mongoose_1.default.connect(uri);
    });
}
function teardownTestDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoose_1.default.connection.close();
    });
}
function createMockAuthUtils() {
    return {
        comparePasswords: jest.fn().mockResolvedValue(true),
        hashPassword: jest.fn().mockResolvedValue('hashed-password'),
        generateToken: jest.fn().mockReturnValue('mock-token'),
        verifyToken: jest.fn().mockReturnValue({ id: 'mock-user-id' })
    };
}
function mockModule(path, mocks) {
    jest.mock(path, () => mocks);
}
function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
}
