"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestDbName = exports.setupTestEnv = void 0;
/**
 * Test environment configuration helper
 */
const setupTestEnv = () => {
    const originalEnv = process.env;
    beforeEach(() => {
        process.env = Object.assign(Object.assign({}, originalEnv), { NODE_ENV: 'test', MONGODB_URI: 'mongodb://localhost:27017/mcp-mindfulness-test' });
    });
    afterEach(() => {
        process.env = originalEnv;
    });
};
exports.setupTestEnv = setupTestEnv;
/**
 * Get test database name from current test file
 * Useful for isolation between test suites
 */
const getTestDbName = () => {
    var _a;
    const testFilePath = expect.getState().testPath;
    const testFileName = ((_a = testFilePath === null || testFilePath === void 0 ? void 0 : testFilePath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.test.ts', '')) || 'test';
    return `mcp-mindfulness-test-${testFileName}`;
};
exports.getTestDbName = getTestDbName;
