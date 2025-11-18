"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFactory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class TestFactory {
    static createMockRequest(overrides = {}) {
        return Object.assign({ body: {}, query: {}, params: {}, headers: {} }, overrides);
    }
    static createMockResponse() {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        return res;
    }
    static createBreathingPattern(overrides = {}) {
        return Object.assign({ name: '4-7-8', inhale: 4, hold: 7, exhale: 8, cycles: 4 }, overrides);
    }
    static createBreathingSession(overrides = {}) {
        const defaultSession = Object.assign({ _id: new mongoose_1.default.Types.ObjectId(), userId: new mongoose_1.default.Types.ObjectId().toString(), patternName: '4-7-8', startTime: new Date(), targetCycles: 4, stressLevelBefore: 7 }, overrides);
        return defaultSession;
    }
}
exports.TestFactory = TestFactory;
