import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import Joi from 'joi';
import {
  validateRequest,
  validateAssessment,
  validatePreferences,
  validateStressTracking
} from '../../middleware/validation.middleware';
import { ValidationError } from '../../utils/errors';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateRequest', () => {
    describe('Zod Schema Validation', () => {
      const zodSchema = {
        body: z.object({
          name: z.string(),
          age: z.number().min(18)
        })
      };

      it('should validate valid body with Zod schema', async () => {
        mockReq.body = { name: 'John', age: 25 };
        await validateRequest(zodSchema)(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should handle invalid body with Zod schema', async () => {
        mockReq.body = { name: 'John', age: 15 };
        await validateRequest(zodSchema)(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('Joi Schema Validation', () => {
      const joiSchema = {
        body: Joi.object({
          name: Joi.string().required(),
          age: Joi.number().min(18).required()
        })
      };

      it('should validate valid body with Joi schema', async () => {
        mockReq.body = { name: 'John', age: 25 };
        await validateRequest(joiSchema)(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should handle invalid body with Joi schema', async () => {
        mockReq.body = { name: 'John', age: 15 };
        await validateRequest(joiSchema)(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });
  });

  describe('validateAssessment', () => {
    it('should validate valid assessment data', () => {
      mockReq.body = {
        physicalSymptoms: 5,
        emotionalSymptoms: 7,
        behavioralSymptoms: 3,
        cognitiveSymptoms: 4
      };
      validateAssessment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing fields', () => {
      mockReq.body = {
        physicalSymptoms: 5,
        emotionalSymptoms: 7
      };
      validateAssessment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'All symptom fields are required'
      });
    });

    it('should reject invalid score ranges', () => {
      mockReq.body = {
        physicalSymptoms: 11,
        emotionalSymptoms: 7,
        behavioralSymptoms: 3,
        cognitiveSymptoms: 4
      };
      validateAssessment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Symptom scores must be between 0 and 10'
      });
    });
  });

  describe('validatePreferences', () => {
    it('should validate valid preferences', () => {
      mockReq.body = {
        preferredTechniques: ['GUIDED', 'MINDFULNESS'],
        preferredDuration: 30,
        timePreferences: {
          reminderFrequency: 'DAILY'
        }
      };
      validatePreferences(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid techniques', () => {
      mockReq.body = {
        preferredTechniques: ['INVALID_TECHNIQUE'],
        preferredDuration: 30
      };
      validatePreferences(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid preferred techniques'
      });
    });

    it('should reject invalid duration', () => {
      mockReq.body = {
        preferredTechniques: ['GUIDED'],
        preferredDuration: 61
      };
      validatePreferences(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Preferred duration must be between 1 and 60 minutes'
      });
    });

    it('should reject invalid reminder frequency', () => {
      mockReq.body = {
        timePreferences: {
          reminderFrequency: 'INVALID'
        }
      };
      validatePreferences(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid reminder frequency'
      });
    });
  });

  describe('validateStressTracking', () => {
    it('should validate valid stress tracking data', () => {
      mockReq.body = {
        level: 5,
        notes: 'Feeling stressed due to work',
        triggers: ['work', 'deadlines'],
        symptoms: ['headache', 'anxiety']
      };
      validateStressTracking(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid stress level', () => {
      mockReq.body = {
        level: 11
      };
      validateStressTracking(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Stress level must be a number between 0 and 10'
      });
    });

    it('should reject invalid notes length', () => {
      mockReq.body = {
        level: 5,
        notes: 'a'.repeat(501)
      };
      validateStressTracking(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Notes must be a string with maximum 500 characters'
      });
    });

    it('should reject invalid triggers format', () => {
      mockReq.body = {
        level: 5,
        triggers: [123, 456]
      };
      validateStressTracking(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Triggers must be an array of strings'
      });
    });

    it('should reject invalid symptoms format', () => {
      mockReq.body = {
        level: 5,
        symptoms: [123, 456]
      };
      validateStressTracking(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Symptoms must be an array of strings'
      });
    });
  });
});