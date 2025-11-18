import mongoose from 'mongoose';
import { connectToTestDB, disconnectFromTestDB } from '../test-utils/db-handler';
import { mockRequest, mockResponse } from '../test-utils/express-mock';
import { StressTechniqueController } from '../../controllers/stress-technique.controller';
import StressTechnique from '../../models/stress-technique.model';
import User from '../../models/user.model';
import { Request, Response } from 'express';
import { TestFactory } from '../utils/test-factory';
import { ErrorCode, ErrorCategory } from '../../errors';
import { setupModelMocks } from '../utils/setup-model-mocks';
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../utils/server';
import { ErrorCodes } from '../../utils/error-codes';

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

jest.mock('../../controllers/stress-technique.controller');

describe('Stress Technique Routes', () => {
  let app: Express;
  let authToken: string;

  const mockTechnique = {
    id: 'tech123',
    name: 'Deep Breathing',
    description: 'A calming breathing exercise',
    category: 'breathing',
    difficulty: 'beginner',
    duration: 300,
    steps: ['Inhale slowly', 'Hold breath', 'Exhale slowly'],
    benefits: ['Reduces anxiety', 'Improves focus']
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all techniques with pagination', async () => {
      const mockTechniques = [mockTechnique];
      (StressTechniqueController.getAllTechniques as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          techniques: mockTechniques,
          page: 1,
          totalPages: 1,
          totalItems: 1
        });
      });

      const response = await request(app)
        .get('/api/stress-techniques')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.techniques).toEqual(mockTechniques);
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should handle server error', async () => {
      (StressTechniqueController.getAllTechniques as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/stress-techniques');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /:id', () => {
    it('should get technique by id', async () => {
      (StressTechniqueController.getTechniqueById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockTechnique);
      });

      const response = await request(app)
        .get(`/api/stress-techniques/${mockTechnique.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTechnique);
    });

    it('should handle non-existent technique', async () => {
      (StressTechniqueController.getTechniqueById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Technique not found' });
      });

      const response = await request(app)
        .get('/api/stress-techniques/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /category/:category', () => {
    it('should get techniques by category', async () => {
      const mockTechniques = [mockTechnique];
      (StressTechniqueController.getTechniquesByCategory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ techniques: mockTechniques });
      });

      const response = await request(app)
        .get('/api/stress-techniques/category/breathing');

      expect(response.status).toBe(200);
      expect(response.body.techniques).toEqual(mockTechniques);
    });

    it('should handle empty category results', async () => {
      (StressTechniqueController.getTechniquesByCategory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ techniques: [] });
      });

      const response = await request(app)
        .get('/api/stress-techniques/category/nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.techniques).toHaveLength(0);
    });
  });

  describe('GET /difficulty/:level', () => {
    it('should get techniques by difficulty', async () => {
      const mockTechniques = [mockTechnique];
      (StressTechniqueController.getTechniquesByDifficulty as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ techniques: mockTechniques });
      });

      const response = await request(app)
        .get('/api/stress-techniques/difficulty/beginner');

      expect(response.status).toBe(200);
      expect(response.body.techniques).toEqual(mockTechniques);
    });

    it('should handle invalid difficulty level', async () => {
      const response = await request(app)
        .get('/api/stress-techniques/difficulty/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /search', () => {
    it('should search techniques', async () => {
      const mockTechniques = [mockTechnique];
      (StressTechniqueController.searchTechniques as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ techniques: mockTechniques });
      });

      const response = await request(app)
        .get('/api/stress-techniques/search')
        .query({ q: 'breathing' });

      expect(response.status).toBe(200);
      expect(response.body.techniques).toEqual(mockTechniques);
    });

    it('should handle missing search query', async () => {
      const response = await request(app)
        .get('/api/stress-techniques/search');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('GET /recommendations', () => {
    it('should get recommended techniques', async () => {
      const mockTechniques = [mockTechnique];
      (StressTechniqueController.getRecommendedTechniques as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ techniques: mockTechniques });
      });

      const response = await request(app)
        .get('/api/stress-techniques/recommendations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.techniques).toEqual(mockTechniques);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/stress-techniques/recommendations');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('POST /', () => {
    it('should create new technique', async () => {
      const newTechnique = { ...mockTechnique };
      delete newTechnique.id;

      (StressTechniqueController.createTechnique as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockTechnique);
      });

      const response = await request(app)
        .post('/api/stress-techniques')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTechnique);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTechnique);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/stress-techniques')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Technique'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete technique', async () => {
      (StressTechniqueController.deleteTechnique as jest.Mock).mockImplementation((req, res) => {
        res.sendStatus(204);
      });

      const response = await request(app)
        .delete(`/api/stress-techniques/${mockTechnique.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should handle non-existent technique', async () => {
      (StressTechniqueController.deleteTechnique as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Technique not found' });
      });

      const response = await request(app)
        .delete('/api/stress-techniques/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle unauthorized deletion', async () => {
      const response = await request(app)
        .delete(`/api/stress-techniques/${mockTechnique.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });
});