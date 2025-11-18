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
const meditation_model_1 = require("../../models/meditation.model");
const db_handler_1 = require("../test-utils/db-handler");
const meditation_factory_1 = require("../factories/meditation.factory");
describe('Meditation Model', () => {
    let meditationFactory;
    let authorId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        authorId = new mongoose_1.default.Types.ObjectId();
        meditationFactory = new meditation_factory_1.MeditationTestFactory();
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create meditation with all required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = meditationFactory.create();
            const meditation = yield meditation_model_1.Meditation.create(testData);
            expect(meditation.title).toBe(testData.title);
            expect(meditation.description).toBe(testData.description);
            expect(meditation.duration).toBe(testData.duration);
            expect(meditation.type).toBe(testData.type);
        }));
        it('should accept valid enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            // Test guided meditation
            const guidedMeditation = yield meditation_model_1.Meditation.create(meditationFactory.guided());
            expect(guidedMeditation.type).toBe('guided');
            expect(guidedMeditation.audioUrl).toBeDefined();
            // Test timer meditation
            const timerMeditation = yield meditation_model_1.Meditation.create(meditationFactory.timer());
            expect(timerMeditation.type).toBe('timer');
            expect(timerMeditation.audioUrl).toBeUndefined();
            // Test ambient meditation
            const ambientMeditation = yield meditation_model_1.Meditation.create(meditationFactory.ambient());
            expect(ambientMeditation.type).toBe('ambient');
            expect(ambientMeditation.audioUrl).toBeDefined();
            // Test different categories
            const categories = ['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other'];
            for (const category of categories) {
                const meditation = yield meditation_model_1.Meditation.create(meditationFactory.withCategory(category));
                expect(meditation.category).toBe(category);
            }
            // Test different difficulties
            const difficulties = ['beginner', 'intermediate', 'advanced'];
            for (const difficulty of difficulties) {
                const meditation = yield meditation_model_1.Meditation.create(meditationFactory.withDifficulty(difficulty));
                expect(meditation.difficulty).toBe(difficulty);
            }
        }));
        it('should handle custom meditation creation', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const meditation = yield meditation_model_1.Meditation.create(meditationFactory.create({ authorId: authorId.toString() }));
            expect((_a = meditation.authorId) === null || _a === void 0 ? void 0 : _a.toString()).toBe(authorId.toString());
            expect(meditation.isActive).toBe(true);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditation = new meditation_model_1.Meditation({});
            const validationError = yield meditation.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.title).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.type).toBeDefined();
        }));
        it('should reject invalid enum values', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = meditationFactory.create();
            const invalidMeditation = new meditation_model_1.Meditation(Object.assign(Object.assign({}, invalidData), { type: 'invalid-type', category: 'invalid-category', difficulty: 'invalid-difficulty' }));
            const validationError = yield invalidMeditation.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.type).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.difficulty).toBeDefined();
        }));
        it('should reject invalid duration values', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditation = new meditation_model_1.Meditation(meditationFactory.create({ duration: 0 }));
            const validationError = yield meditation.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle minimum valid duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditation = yield meditation_model_1.Meditation.create(meditationFactory.create({ duration: 1 }));
            expect(meditation.duration).toBe(1);
        }));
        it('should handle empty and whitespace strings', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditation = yield meditation_model_1.Meditation.create(meditationFactory.create({
                title: '  Trimmed Title  ',
                description: '  Trimmed Description  ',
                tags: ['  tag1  ', '  tag2  ']
            }));
            expect(meditation.title).toBe('Trimmed Title');
            expect(meditation.description).toBe('Trimmed Description');
            expect(meditation.tags).toEqual(['tag1', 'tag2']);
        }));
        it('should handle system meditations without author', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const systemMeditation = yield meditation_model_1.Meditation.create(meditationFactory.create({
                authorId: undefined,
                isActive: undefined
            }));
            expect(systemMeditation.authorId).toBeUndefined();
            expect(systemMeditation.isActive).toBe(true);
            const userMeditation = yield meditation_model_1.Meditation.create(meditationFactory.create({
                authorId: authorId.toString(),
                isActive: false
            }));
            expect((_a = userMeditation.authorId) === null || _a === void 0 ? void 0 : _a.toString()).toBe(authorId.toString());
            expect(userMeditation.isActive).toBe(false);
        }));
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const meditation = new meditation_model_1.Meditation({});
            const validationError = yield meditation.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.title).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.type).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.category).toBeDefined();
        }));
    });
});
