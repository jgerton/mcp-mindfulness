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
exports.setupTestDB = exports.clearDatabase = exports.createTestSessions = exports.createTestSession = exports.createTestUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const session_analytics_model_1 = require("../../models/session-analytics.model");
const createTestUser = () => {
    const userId = new mongoose_1.default.Types.ObjectId().toString();
    const authToken = jsonwebtoken_1.default.sign({ id: userId }, config_1.default.jwtSecret);
    return { userId, authToken };
};
exports.createTestUser = createTestUser;
const createTestSession = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, options = {}) {
    const { completed = true, focusScore = 90, moodBefore = 'neutral', moodAfter = 'peaceful', duration = 15, startTime = new Date() } = options;
    const session = new session_analytics_model_1.SessionAnalytics({
        userId: new mongoose_1.default.Types.ObjectId(userId),
        sessionId: new mongoose_1.default.Types.ObjectId(),
        meditationId: new mongoose_1.default.Types.ObjectId(),
        startTime,
        endTime: new Date(startTime.getTime() + duration * 60000),
        duration,
        completed,
        focusScore,
        moodBefore,
        moodAfter,
        interruptions: 0,
        maintainedStreak: completed
    });
    yield session.save();
    return session;
});
exports.createTestSession = createTestSession;
const createTestSessions = (userId_1, count_1, ...args_1) => __awaiter(void 0, [userId_1, count_1, ...args_1], void 0, function* (userId, count, baseOptions = {}) {
    const sessions = [];
    for (let i = 0; i < count; i++) {
        const startTime = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const session = yield (0, exports.createTestSession)(userId, Object.assign(Object.assign({}, baseOptions), { startTime }));
        sessions.push(session);
    }
    return sessions;
});
exports.createTestSessions = createTestSessions;
const clearDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    yield session_analytics_model_1.SessionAnalytics.deleteMany({});
});
exports.clearDatabase = clearDatabase;
const setupTestDB = () => {
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, exports.clearDatabase)();
    }));
};
exports.setupTestDB = setupTestDB;
