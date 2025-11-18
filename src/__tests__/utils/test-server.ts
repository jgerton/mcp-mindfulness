import request, { SuperTest, Test, agent as createAgent } from 'supertest';
import { app, httpServer, closeServer } from '../../app';
import mongoose from 'mongoose';
import { connectDB } from './test-db';
import express, { Express } from 'express';
import exportRoutes from '../../routes/export.routes';

/**
 * Test server class for managing server lifecycle in tests.
 * This class handles starting and stopping the server for tests,
 * and provides utilities for making requests and managing connections.
 */
export class TestServer {
  private isRunning: boolean = false;

  /**
   * Start the test server if it's not already running
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Test server is already running');
      return;
    }

    try {
      // Connect to the test database
      await connectDB();
      this.isRunning = true;
      console.log('Test server started');
    } catch (error) {
      console.error('Failed to start test server:', error);
      throw error;
    }
  }

  /**
   * Close the test server and clean up resources
   */
  async close(): Promise<void> {
    if (!this.isRunning) {
      console.log('Test server is not running');
      return;
    }

    try {
      // Close the server
      await closeServer();
      
      this.isRunning = false;

      // Small delay to allow resources to be released
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Test server closed');
    } catch (error) {
      console.error('Error closing test server:', error);
      // We'll swallow the error here to prevent test failures due to cleanup issues
    }
  }

  /**
   * Get the supertest agent for making requests
   */
  getAgent() {
    if (!this.isRunning) {
      console.warn('Warning: Getting agent before server is started');
    }
    
    // Return a supertest agent with the correct type
    return request(app);
  }

  /**
   * Check for connection leaks
   */
  checkConnectionLeaks(): boolean {
    return mongoose.connections.length > 1;
  }

  /**
   * Log the current connection state for debugging
   */
  logConnectionState(): void {
    console.log({
      isRunning: this.isRunning,
      connectionCount: mongoose.connections.length,
      connectionState: mongoose.connection.readyState,
      hasLeaks: this.checkConnectionLeaks()
    });
  }
}

/**
 * Create a new test server instance
 */
export function createTestServer(): TestServer {
  return new TestServer();
}

export const createServer = async (): Promise<Express> => {
  const app = express();
  app.use(express.json());
  app.use('/api/export', exportRoutes);
  return app;
}; 