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
const mongoose_1 = __importDefault(require("mongoose"));
const stress_model_1 = require("../../models/stress.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestPreferences = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId().toString(), preferredTechniques: ['4-7-8', 'GUIDED', 'MINDFULNESS'], preferredDuration: 15, triggers: ['work', 'social'], avoidedTechniques: [], timePreferences: {
        preferredTime: ['morning', 'evening'],
        reminderFrequency: 'DAILY'
    } }, overrides));
describe('UserPreferences Model', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
        jest.spyOn(mongoose_1.default.Model.prototype, 'save').mockImplementation(function () {
            return Promise.resolve(this);
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
        jest.restoreAllMocks();
    }));
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = new stress_model_1.UserPreferences({});
            const validationError = yield preferences.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
        }));
        it('should enforce unique userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId().toString();
            yield stress_model_1.UserPreferences.create(Object.assign(Object.assign({}, createTestPreferences()), { userId }));
            yield expect(stress_model_1.UserPreferences.create(Object.assign(Object.assign({}, createTestPreferences()), { userId })))
                .rejects.toThrow();
        }));
        it('should validate preferredTechniques enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidTechnique = 'INVALID_TECHNIQUE';
            const preferences = new stress_model_1.UserPreferences(Object.assign(Object.assign({}, createTestPreferences()), { preferredTechniques: [invalidTechnique] }));
            const validationError = yield preferences.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['preferredTechniques.0']).toBeDefined();
        }));
        it('should accept valid technique values', () => __awaiter(void 0, void 0, void 0, function* () {
            const validTechniques = [
                '4-7-8', 'BOX_BREATHING', 'ALTERNATE_NOSTRIL',
                'GUIDED', 'MINDFULNESS', 'BODY_SCAN',
                'PROGRESSIVE_RELAXATION', 'STRETCHING', 'WALKING',
                'GROUNDING', 'VISUALIZATION', 'QUICK_BREATH'
            ];
            for (const technique of validTechniques) {
                const preferences = new stress_model_1.UserPreferences(Object.assign(Object.assign({}, createTestPreferences()), { preferredTechniques: [technique] }));
                const validationError = yield preferences.validateSync();
                expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['preferredTechniques.0']).toBeUndefined();
            }
        }));
        it('should validate reminderFrequency enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidFrequency = 'INVALID_FREQUENCY';
            const preferences = new stress_model_1.UserPreferences(Object.assign(Object.assign({}, createTestPreferences()), { timePreferences: {
                    preferredTime: ['morning'],
                    reminderFrequency: invalidFrequency
                } }));
            const validationError = yield preferences.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors['timePreferences.reminderFrequency']).toBeDefined();
        }));
    });
    describe('Default Values', () => {
        it('should allow empty arrays for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create({
                userId: new mongoose_1.default.Types.ObjectId().toString()
            });
            expect(preferences.preferredTechniques).toEqual([]);
            expect(preferences.triggers).toEqual([]);
            expect(preferences.avoidedTechniques).toEqual([]);
        }));
        it('should allow undefined for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create({
                userId: new mongoose_1.default.Types.ObjectId().toString()
            });
            expect(preferences.preferredDuration).toBeUndefined();
            expect(preferences.timePreferences).toBeUndefined();
        }));
    });
    describe('Success Cases', () => {
        it('should create and save preferences successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create(createTestPreferences());
            expect(preferences._id).toBeDefined();
            expect(preferences.userId).toBeDefined();
        }));
        it('should update all fields correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create(createTestPreferences());
            const updates = {
                preferredTechniques: ['BODY_SCAN', 'WALKING'],
                preferredDuration: 30,
                triggers: ['deadlines', 'meetings'],
                avoidedTechniques: ['GUIDED'],
                timePreferences: {
                    preferredTime: ['afternoon'],
                    reminderFrequency: 'WEEKLY'
                }
            };
            Object.assign(preferences, updates);
            yield preferences.save();
            expect(preferences.preferredTechniques).toEqual(updates.preferredTechniques);
            expect(preferences.preferredDuration).toBe(updates.preferredDuration);
            expect(preferences.triggers).toEqual(updates.triggers);
            expect(preferences.avoidedTechniques).toEqual(updates.avoidedTechniques);
            expect(preferences.timePreferences).toEqual(updates.timePreferences);
        }));
    });
    describe('Error Cases', () => {
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = new stress_model_1.UserPreferences({});
            yield expect(preferences.validate()).rejects.toThrow();
        }));
        it('should enforce unique userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId().toString();
            yield stress_model_1.UserPreferences.create(Object.assign(Object.assign({}, createTestPreferences()), { userId }));
            yield expect(stress_model_1.UserPreferences.create(Object.assign(Object.assign({}, createTestPreferences()), { userId })))
                .rejects.toThrow();
        }));
        it('should fail with invalid technique values', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidTechnique = 'INVALID_TECHNIQUE';
            const preferences = new stress_model_1.UserPreferences(Object.assign(Object.assign({}, createTestPreferences()), { preferredTechniques: [invalidTechnique] }));
            yield expect(preferences.validate()).rejects.toThrow();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle empty arrays for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create({
                userId: new mongoose_1.default.Types.ObjectId().toString()
            });
            expect(preferences.preferredTechniques).toEqual([]);
            expect(preferences.triggers).toEqual([]);
            expect(preferences.avoidedTechniques).toEqual([]);
        }));
        it('should handle undefined for optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield stress_model_1.UserPreferences.create({
                userId: new mongoose_1.default.Types.ObjectId().toString()
            });
            expect(preferences.preferredDuration).toBeUndefined();
            expect(preferences.timePreferences).toBeUndefined();
        }));
        it('should handle array updates', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const preferences = yield stress_model_1.UserPreferences.create(createTestPreferences());
            // Add new items
            (_a = preferences.triggers) === null || _a === void 0 ? void 0 : _a.push('meetings');
            yield preferences.save();
            expect(preferences.triggers).toContain('meetings');
            // Remove items
            preferences.triggers = (_b = preferences.triggers) === null || _b === void 0 ? void 0 : _b.filter(t => t !== 'work');
            yield preferences.save();
            expect(preferences.triggers).not.toContain('work');
        }));
    });
    describe('Indexes', () => {
        it('should have an index on userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const indexes = yield stress_model_1.UserPreferences.collection.getIndexes();
            const hasUserIdIndex = Object.values(indexes).some(index => index.key.userId !== undefined);
            expect(hasUserIdIndex).toBe(true);
        }));
    });
});
