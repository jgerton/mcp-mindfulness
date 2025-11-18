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
const stress_technique_model_1 = __importDefault(require("../../models/stress-technique.model"));
const db_handler_1 = require("../test-utils/db-handler");
const stress_technique_factory_1 = require("../factories/stress-technique.factory");
describe('StressTechnique Model', () => {
    let stressTechniqueFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        stressTechniqueFactory = new stress_technique_factory_1.StressTechniqueTestFactory();
        jest.spyOn(stress_technique_model_1.default.prototype, 'save').mockImplementation(function () {
            return Promise.resolve(this);
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create and save technique successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = stressTechniqueFactory.create();
            const technique = yield stress_technique_model_1.default.create(testData);
            expect(technique.name).toBe(testData.name);
            expect(technique.description).toBe(testData.description);
            expect(technique.category).toBe(testData.category);
            expect(technique.difficultyLevel).toBe(testData.difficultyLevel);
        }));
        it('should set default values correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = yield stress_technique_model_1.default.create(stressTechniqueFactory.withoutOptionalFields());
            expect(technique.effectivenessRating).toBe(3);
            expect(technique.recommendedFrequency).toBe('as-needed');
            expect(technique.steps).toEqual([]);
        }));
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = yield stress_technique_model_1.default.create(stressTechniqueFactory.create());
            const originalUpdatedAt = technique.updatedAt;
            technique.name = 'Updated Name';
            yield technique.save();
            expect(technique.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
    describe('Error Cases', () => {
        it('should fail when required fields are missing', () => {
            expect(() => new stress_technique_model_1.default({})).toThrow();
        });
        it('should reject invalid category', () => {
            expect(() => new stress_technique_model_1.default(stressTechniqueFactory.create({
                category: 'invalid_category'
            }))).toThrow();
        });
        it('should reject invalid difficulty level', () => {
            expect(() => new stress_technique_model_1.default(stressTechniqueFactory.create({
                difficultyLevel: 'invalid_level'
            }))).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle minimum duration', () => {
            expect(() => new stress_technique_model_1.default(stressTechniqueFactory.withDuration(0))).toThrow();
        });
        it('should handle maximum duration', () => {
            expect(() => new stress_technique_model_1.default(stressTechniqueFactory.withDuration(121))).toThrow();
        });
        it('should handle empty arrays', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = yield stress_technique_model_1.default.create(stressTechniqueFactory.withoutOptionalFields());
            expect(technique.steps).toEqual([]);
            expect(technique.benefits).toEqual([]);
            expect(technique.tags).toEqual([]);
        }));
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = new stress_technique_model_1.default({});
            const validationError = yield technique.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.name).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.difficultyLevel).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.durationMinutes).toBeDefined();
        }));
        it('should validate category enum', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = new stress_technique_model_1.default(stressTechniqueFactory.create({
                category: 'invalid_category'
            }));
            const validationError = yield technique.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
        }));
        it('should validate difficulty level enum', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = new stress_technique_model_1.default(stressTechniqueFactory.create({
                difficultyLevel: 'invalid_level'
            }));
            const validationError = yield technique.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.difficultyLevel).toBeDefined();
        }));
        it('should validate duration range', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooShort = new stress_technique_model_1.default(stressTechniqueFactory.withDuration(0));
            const tooLong = new stress_technique_model_1.default(stressTechniqueFactory.withDuration(121));
            expect(yield ((_a = tooShort.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.durationMinutes)).toBeDefined();
            expect(yield ((_b = tooLong.validateSync()) === null || _b === void 0 ? void 0 : _b.errors.durationMinutes)).toBeDefined();
        }));
        it('should validate effectiveness rating range', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooLow = new stress_technique_model_1.default(stressTechniqueFactory.withEffectiveness(0));
            const tooHigh = new stress_technique_model_1.default(stressTechniqueFactory.withEffectiveness(6));
            expect(yield ((_a = tooLow.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.effectivenessRating)).toBeDefined();
            expect(yield ((_b = tooHigh.validateSync()) === null || _b === void 0 ? void 0 : _b.errors.effectivenessRating)).toBeDefined();
        }));
    });
    describe('Data Integrity', () => {
        it('should trim string fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = yield stress_technique_model_1.default.create(stressTechniqueFactory.create({
                name: '  Trimmed Name  ',
                description: '  Trimmed Description  ',
                category: '  breathing  ',
                difficultyLevel: '  beginner  '
            }));
            expect(technique.name).toBe('Trimmed Name');
            expect(technique.description).toBe('Trimmed Description');
            expect(technique.category).toBe('breathing');
            expect(technique.difficultyLevel).toBe('beginner');
        }));
        it('should handle maximum array lengths', () => __awaiter(void 0, void 0, void 0, function* () {
            const technique = yield stress_technique_model_1.default.create(stressTechniqueFactory.withMaxArrays());
            expect(technique.steps.length).toBeLessThanOrEqual(10);
            expect(technique.benefits.length).toBeLessThanOrEqual(10);
            expect(technique.tags.length).toBeLessThanOrEqual(10);
        }));
    });
});
