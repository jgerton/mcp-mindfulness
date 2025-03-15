/**
 * Test environment configuration helper
 */
export const setupTestEnv = () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/mcp-mindfulness-test',
      // Add other test environment variables here
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
};

/**
 * Get test database name from current test file
 * Useful for isolation between test suites
 */
export const getTestDbName = () => {
  const testFilePath = expect.getState().testPath;
  const testFileName = testFilePath?.split('/').pop()?.replace('.test.ts', '') || 'test';
  return `mcp-mindfulness-test-${testFileName}`;
}; 