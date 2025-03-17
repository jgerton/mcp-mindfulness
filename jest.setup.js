const { connect, closeDatabase } = require('./src/__tests__/utils/test-db');

// Set a longer timeout for tests
jest.setTimeout(30000);

// Connect to the in-memory database before all tests
beforeAll(async () => {
  await connect();
});

// Close the database connection after all tests
afterAll(async () => {
  await closeDatabase();
});

// Silence console.error during tests to reduce noise
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known MongoDB connection errors
  if (
    args[0] && 
    (
      args[0].includes('ECONNRESET') || 
      args[0].includes('MongoServerSelectionError') ||
      args[0].toString().includes('ECONNRESET') ||
      args[0].toString().includes('MongoServerSelectionError')
    )
  ) {
    return;
  }
  originalConsoleError(...args);
}; 