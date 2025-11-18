import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import request, { SuperTest, Test } from 'supertest';
import { AchievementCategory, AchievementType, Achievement, IAchievement } from '../../models/achievement.model';
import { TestServer } from '../utils/test-server';
import { IUser } from '../../models/user.model';

/**
 * Standard timeout for API tests
 */
export const API_TEST_TIMEOUT = 10000;

/**
 * Configuration interface for API tests
 */
export interface ApiTestConfig {
  /**
   * Whether to set up mock authentication
   */
  setupAuth?: boolean;
  
  /**
   * User details for authentication
   */
  user?: {
    _id: string;
    username: string;
    role?: string;
  };
  
  /**
   * Whether to automatically clean up test data
   */
  autoCleanup?: boolean;
}

/**
 * Base API test helper class
 */
export class ApiTestHelper {
  protected server: TestServer;
  protected mockAuthMiddleware: jest.SpyInstance | null = null;
  protected testUser: { _id: string; username: string; role?: string };
  protected config: ApiTestConfig;
  
  /**
   * Create a new API test helper
   * @param config Test configuration
   */
  constructor(config: ApiTestConfig = {}) {
    this.server = new TestServer();
    this.config = {
      setupAuth: true,
      autoCleanup: true,
      ...config
    };
    
    this.testUser = this.config.user || {
      _id: new mongoose.Types.ObjectId().toString(),
      username: 'testuser',
      role: 'user'
    };
  }
  
  /**
   * Set up mock authentication middleware
   */
  setupMockAuth(): void {
    // Only set up mock auth if requested
    if (!this.config.setupAuth) {
      console.log('Auth setup skipped based on config');
      return;
    }
    
    console.log('Setting up mock auth middleware');
    
    // Mock the authentication middleware
    const authMiddleware = require('../../middleware/auth.middleware');
    const jwtUtils = require('../../utils/jwt.utils');
    console.log('Auth middleware imported:', Object.keys(authMiddleware));
    
    // Mock the JWT verification
    jest.spyOn(jwtUtils, 'verifyToken').mockImplementation(() => {
      return { _id: '507f1f77bcf86cd799439011', username: 'testuser' };
    });

    // Mock the authentication middleware
    this.mockAuthMiddleware = jest.spyOn(authMiddleware, 'authenticateToken')
      .mockImplementation(function(req, res, next) {
        console.log('Mock auth middleware called');
        req.user = {
          _id: '507f1f77bcf86cd799439011',
          username: 'testuser',
          email: 'test@example.com',
          lastLogin: new Date(),
          isActive: true
        };
        next();
      });
    
    console.log('Mock auth setup complete, spy created:', !!this.mockAuthMiddleware);
  }
  
  /**
   * Clean up resources after tests
   */
  async cleanup(): Promise<void> {
    // Restore mocks
    if (this.mockAuthMiddleware) {
      this.mockAuthMiddleware.mockRestore();
    }
    
    // Close server
    await this.server.close();
  }
  
  /**
   * Get a supertest agent for the server
   */
  getAgent() {
    // Add authorization header directly in tests instead of here
    return this.server.getAgent();
  }
  
  /**
   * Log the current connection state
   */
  logConnectionState(): void {
    this.server.logConnectionState();
  }
}

/**
 * Achievement API test helper class
 */
export class AchievementApiTestHelper extends ApiTestHelper {
  private testAchievements: any[] = [];
  
  /**
   * Set up test data for achievement tests
   */
  async setup(): Promise<void> {
    // Start the server
    await this.server.start();
    
    // Set up mock authentication
    this.setupMockAuth();
    
    // Create test achievements
    await this.createTestAchievements();
  }
  
  /**
   * Clean up test data and resources
   */
  async cleanup(): Promise<void> {
    if (this.config.autoCleanup) {
      await this.clearTestData();
    }
    
    await super.cleanup();
  }
  
  /**
   * Create test achievements for testing
   */
  private async createTestAchievements(): Promise<void> {
    // Define test achievements
    const achievements = [
      {
        name: 'Test Achievement 1',
        description: 'First test achievement',
        category: AchievementCategory.TIME,
        type: AchievementType.BRONZE,
        threshold: 5,
        icon: 'test-icon-1.png',
        points: 10,
        criteria: {
          type: 'time',
          value: 5
        }
      },
      {
        name: 'Test Achievement 2',
        description: 'Second test achievement',
        category: AchievementCategory.STREAK,
        type: AchievementType.SILVER,
        threshold: 10,
        icon: 'test-icon-2.png',
        points: 20,
        criteria: {
          type: 'streak',
          value: 10
        }
      },
      {
        name: 'Test Achievement 3',
        description: 'Third test achievement',
        category: AchievementCategory.MILESTONE,
        type: AchievementType.GOLD,
        threshold: 15,
        icon: 'test-icon-3.png',
        points: 30,
        criteria: {
          type: 'milestone',
          value: 15
        }
      }
    ];
    
    // Insert achievements into the database
    this.testAchievements = await Achievement.insertMany(achievements);
  }
  
  /**
   * Clear test data
   */
  private async clearTestData(): Promise<void> {
    await Achievement.deleteMany({});
  }
  
  /**
   * Get all test achievements
   */
  getAchievements() {
    return this.testAchievements;
  }
  
  /**
   * Get a specific achievement by ID
   */
  async getAchievement(id: string) {
    return await Achievement.findById(id);
  }
  
  /**
   * Generate an invalid Object ID
   */
  getInvalidId(): string {
    return 'invalid-id';
  }
  
  /**
   * Generate a non-existent but valid Object ID
   */
  getNonExistentId(): string {
    return new mongoose.Types.ObjectId().toString();
  }
}

/**
 * Create a new achievement API test helper
 */
export function createAchievementApiTestHelper(config: ApiTestConfig = {}): AchievementApiTestHelper {
  return new AchievementApiTestHelper(config);
} 