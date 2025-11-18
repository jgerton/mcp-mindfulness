"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const joi_1 = __importDefault(require("joi"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const errors_1 = require("../../utils/errors");
describe('Validation Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
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
                body: zod_1.z.object({
                    name: zod_1.z.string(),
                    age: zod_1.z.number().min(18)
                })
            };
            it('should validate valid body with Zod schema', () => __awaiter(void 0, void 0, void 0, function* () {
                mockReq.body = { name: 'John', age: 25 };
                yield (0, validation_middleware_1.validateRequest)(zodSchema)(mockReq, mockRes, mockNext);
                expect(mockNext).toHaveBeenCalledWith();
            }));
            it('should handle invalid body with Zod schema', () => __awaiter(void 0, void 0, void 0, function* () {
                mockReq.body = { name: 'John', age: 15 };
                yield (0, validation_middleware_1.validateRequest)(zodSchema)(mockReq, mockRes, mockNext);
                expect(mockNext).toHaveBeenCalledWith(expect.any(errors_1.ValidationError));
            }));
        });
        describe('Joi Schema Validation', () => {
            const joiSchema = {
                body: joi_1.default.object({
                    name: joi_1.default.string().required(),
                    age: joi_1.default.number().min(18).required()
                })
            };
            it('should validate valid body with Joi schema', () => __awaiter(void 0, void 0, void 0, function* () {
                mockReq.body = { name: 'John', age: 25 };
                yield (0, validation_middleware_1.validateRequest)(joiSchema)(mockReq, mockRes, mockNext);
                expect(mockNext).toHaveBeenCalledWith();
            }));
            it('should handle invalid body with Joi schema', () => __awaiter(void 0, void 0, void 0, function* () {
                mockReq.body = { name: 'John', age: 15 };
                yield (0, validation_middleware_1.validateRequest)(joiSchema)(mockReq, mockRes, mockNext);
                expect(mockNext).toHaveBeenCalledWith(expect.any(errors_1.ValidationError));
            }));
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
            (0, validation_middleware_1.validateAssessment)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should reject missing fields', () => {
            mockReq.body = {
                physicalSymptoms: 5,
                emotionalSymptoms: 7
            };
            (0, validation_middleware_1.validateAssessment)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validateAssessment)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validatePreferences)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should reject invalid techniques', () => {
            mockReq.body = {
                preferredTechniques: ['INVALID_TECHNIQUE'],
                preferredDuration: 30
            };
            (0, validation_middleware_1.validatePreferences)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validatePreferences)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validatePreferences)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validateStressTracking)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should reject invalid stress level', () => {
            mockReq.body = {
                level: 11
            };
            (0, validation_middleware_1.validateStressTracking)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validateStressTracking)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validateStressTracking)(mockReq, mockRes, mockNext);
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
            (0, validation_middleware_1.validateStressTracking)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Symptoms must be an array of strings'
            });
        });
    });
});
