"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModelMocks = void 0;
const setupModelMocks = () => {
    const mockBreathingPattern = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        find: jest.fn()
    };
    const mockBreathingSession = {
        findById: jest.fn(),
        find: jest.fn(),
        save: jest.fn()
    };
    return {
        mockBreathingPattern,
        mockBreathingSession
    };
};
exports.setupModelMocks = setupModelMocks;
