import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../utils/test-server';
import { ExportController } from '../../controllers/export.controller';
import { ErrorCodes } from '../../utils/error-codes';

jest.mock('../../controllers/export.controller');

describe('Export Routes', () => {
  let app: Express;
  let authToken: string;

  const mockAchievements = [
    {
      id: 'ach123',
      name: 'Meditation Master',
      description: 'Complete 10 meditation sessions',
      progress: 8,
      total: 10,
      dateEarned: null
    }
  ];

  const mockMeditations = [
    {
      id: 'med123',
      type: 'guided',
      duration: 600,
      completedAt: '2024-01-01T10:00:00Z',
      rating: 4
    }
  ];

  const mockStressLevels = [
    {
      id: 'stress123',
      level: 7,
      timestamp: '2024-01-01T09:00:00Z',
      notes: 'Pre-meditation'
    }
  ];

  const mockUserData = {
    profile: {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com'
    },
    achievements: mockAchievements,
    meditations: mockMeditations,
    stressAssessments: mockStressLevels
  };

  beforeAll(async () => {
    app = await createServer();
    authToken = 'valid.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /achievements', () => {
    it('should export achievements in JSON format', async () => {
      (ExportController.exportAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockAchievements });
      });

      const response = await request(app)
        .get('/api/export/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockAchievements);
    });

    it('should export achievements in CSV format', async () => {
      const csvContent = 'id,name,description,progress,total,dateEarned\nach123,Meditation Master,Complete 10 meditation sessions,8,10,';
      
      (ExportController.exportAchievements as jest.Mock).mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="achievements.csv"');
        res.status(200).send(csvContent);
      });

      const response = await request(app)
        .get('/api/export/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.text).toBe(csvContent);
    });

    it('should filter achievements by date range', async () => {
      (ExportController.exportAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockAchievements });
      });

      const response = await request(app)
        .get('/api/export/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockAchievements);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/export/achievements');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should handle invalid date format', async () => {
      (ExportController.exportAchievements as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid date format' });
      });

      const response = await request(app)
        .get('/api/export/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/export/achievements');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /meditations', () => {
    it('should export meditations in JSON format', async () => {
      (ExportController.exportMeditations as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockMeditations });
      });

      const response = await request(app)
        .get('/api/export/meditations')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockMeditations);
    });

    it('should export meditations in CSV format', async () => {
      const csvContent = 'id,type,duration,completedAt,rating\nmed123,guided,600,2024-01-01T10:00:00Z,4';
      
      (ExportController.exportMeditations as jest.Mock).mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="meditations.csv"');
        res.status(200).send(csvContent);
      });

      const response = await request(app)
        .get('/api/export/meditations')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.text).toBe(csvContent);
    });

    it('should handle server error', async () => {
      (ExportController.exportMeditations as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Failed to export meditations' });
      });

      const response = await request(app)
        .get('/api/export/meditations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle empty results', async () => {
      (ExportController.exportMeditations as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: [] });
      });

      const response = await request(app)
        .get('/api/export/meditations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /stress-levels', () => {
    it('should export stress levels in JSON format', async () => {
      (ExportController.exportStressLevels as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockStressLevels });
      });

      const response = await request(app)
        .get('/api/export/stress-levels')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockStressLevels);
    });

    it('should export stress levels in CSV format', async () => {
      const csvContent = 'id,level,timestamp,notes\nstress123,7,2024-01-01T09:00:00Z,Pre-meditation';
      
      (ExportController.exportStressLevels as jest.Mock).mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="stress-levels.csv"');
        res.status(200).send(csvContent);
      });

      const response = await request(app)
        .get('/api/export/stress-levels')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.text).toBe(csvContent);
    });

    it('should handle date range filtering', async () => {
      (ExportController.exportStressLevels as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockStressLevels });
      });

      const response = await request(app)
        .get('/api/export/stress-levels')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockStressLevels);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/export/stress-levels');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });
  });

  describe('GET /user-data', () => {
    it('should export all user data in JSON format', async () => {
      (ExportController.exportUserData as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ data: mockUserData });
      });

      const response = await request(app)
        .get('/api/export/user-data')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockUserData);
    });

    it('should export all user data in CSV format', async () => {
      const csvContent = 'category,data\nprofile,{"id":"user123","username":"testuser"}\nachievements,1 achievement(s)\nmeditations,1 session(s)\nstressAssessments,1 assessment(s)';
      
      (ExportController.exportUserData as jest.Mock).mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="user-data.csv"');
        res.status(200).send(csvContent);
      });

      const response = await request(app)
        .get('/api/export/user-data')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.text).toBe(csvContent);
    });

    it('should handle server error', async () => {
      (ExportController.exportUserData as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Failed to export user data' });
      });

      const response = await request(app)
        .get('/api/export/user-data')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/export/user-data');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    });

    it('should handle invalid export format', async () => {
      const response = await request(app)
        .get('/api/export/user-data')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});