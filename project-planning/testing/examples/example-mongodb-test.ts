import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../src/models/user.model';
import { MeditationSession } from '../../src/models/meditation-session.model';

/**
 * Example MongoDB test demonstrating best practices for database testing
 * 
 * This test file follows the standards established in our testing standards:
 * 1. Proper connection management with MongoMemoryServer
 * 2. Proper test setup and cleanup
 * 3. Proper ObjectId validation and comparison
 * 4. Proper error handling for database operations
 * 5. Isolation between tests
 */
describe('MongoDB Testing Example', () => {
  let mongoServer: MongoMemoryServer;
  
  // Set up the MongoDB Memory Server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB server');
  });
  
  // Close the connection and stop the server after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('Closed in-memory MongoDB server');
  });
  
  // Clear all collections before each test
  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });
  
  describe('User Model', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = await User.create(userData);
      
      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      
      // Password should be hashed, not stored as plaintext
      expect(user.password).not.toBe(userData.password);
    });
    
    it('should validate required fields', async () => {
      const invalidUser = new User({
        // Missing required fields
      });
      
      // Use try/catch to validate errors
      try {
        await invalidUser.validate();
        // If validation passes, fail the test
        fail('Validation should have failed');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.errors.username).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
      }
    });
    
    it('should enforce unique email constraint', async () => {
      // Create first user
      await User.create({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      });
      
      // Try to create second user with same email
      try {
        await User.create({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        });
        // If creation succeeds, fail the test
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.code).toBe(11000); // MongoDB duplicate key error code
      }
    });
  });
  
  describe('MeditationSession Model', () => {
    let userId: mongoose.Types.ObjectId;
    
    beforeEach(async () => {
      // Create a test user for sessions
      const user = await User.create({
        username: 'sessionuser',
        email: 'session@example.com',
        password: 'password123'
      });
      
      userId = user._id;
    });
    
    it('should create a new meditation session', async () => {
      const sessionData = {
        userId,
        duration: 15,
        startTime: new Date(),
        endTime: new Date(Date.now() + 15 * 60 * 1000),
        completed: true,
        moodBefore: 'neutral',
        moodAfter: 'peaceful'
      };
      
      const session = await MeditationSession.create(sessionData);
      
      expect(session).toBeDefined();
      expect(session.userId.toString()).toBe(userId.toString());
      expect(session.duration).toBe(sessionData.duration);
      expect(session.completed).toBe(sessionData.completed);
    });
    
    it('should validate ObjectId references', async () => {
      // Create session with invalid ObjectId
      const invalidSession = new MeditationSession({
        userId: 'invalid-id', // Not a valid ObjectId
        duration: 15,
        startTime: new Date()
      });
      
      try {
        await invalidSession.validate();
        fail('Validation should have failed');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.errors.userId).toBeDefined();
      }
    });
    
    it('should find sessions by user ID', async () => {
      // Create multiple sessions for the same user
      await MeditationSession.create({
        userId,
        duration: 10,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
        completed: true,
        moodBefore: 'stressed',
        moodAfter: 'calm'
      });
      
      await MeditationSession.create({
        userId,
        duration: 15,
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 60 * 1000),
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'relaxed'
      });
      
      // Create a session for a different user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123'
      });
      
      await MeditationSession.create({
        userId: otherUser._id,
        duration: 20,
        startTime: new Date(),
        completed: false
      });
      
      // Find sessions for our test user
      const sessions = await MeditationSession.find({ userId });
      
      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(2);
      
      // Verify all sessions belong to our user
      sessions.forEach(session => {
        expect(session.userId.toString()).toBe(userId.toString());
      });
    });
    
    it('should handle complex queries with proper ObjectId comparison', async () => {
      // Create sessions with different properties
      await MeditationSession.create({
        userId,
        duration: 5,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
        completed: true,
        moodBefore: 'neutral',
        moodAfter: 'neutral'
      });
      
      await MeditationSession.create({
        userId,
        duration: 10,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        completed: true,
        moodBefore: 'stressed',
        moodAfter: 'calm'
      });
      
      await MeditationSession.create({
        userId,
        duration: 15,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        completed: true,
        moodBefore: 'anxious',
        moodAfter: 'peaceful'
      });
      
      // Complex query: Find sessions with mood improvement, longer than 5 minutes, in the last 7 days
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const sessions = await MeditationSession.find({
        userId: userId.toString(), // Test string comparison with ObjectId
        startTime: { $gte: oneWeekAgo },
        duration: { $gt: 5 },
        moodBefore: { $ne: 'peaceful' },
        moodAfter: 'peaceful'
      });
      
      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].duration).toBe(15);
      expect(sessions[0].moodBefore).toBe('anxious');
      expect(sessions[0].moodAfter).toBe('peaceful');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidSession = new MeditationSession({
        // Missing required fields
      });
      
      try {
        await invalidSession.save();
        fail('Save should have failed');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof mongoose.Error.ValidationError).toBe(true);
        
        // Check specific validation errors
        if (error instanceof mongoose.Error.ValidationError) {
          expect(error.errors.userId).toBeDefined();
          expect(error.errors.duration).toBeDefined();
          expect(error.errors.startTime).toBeDefined();
        }
      }
    });
    
    it('should handle database connection errors', async () => {
      // Simulate a connection error by closing the connection temporarily
      await mongoose.connection.close();
      
      try {
        await User.findOne({ username: 'nonexistent' });
        fail('Query should have failed due to closed connection');
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        // Reconnect for subsequent tests
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
      }
    });
  });
}); 