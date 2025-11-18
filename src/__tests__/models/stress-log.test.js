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
Object.defineProperty(exports, "__esModule", { value: true });
const stress_log_model_1 = require("../../models/stress-log.model");
const db_handler_1 = require("../test-utils/db-handler");
const stress_log_factory_1 = require("../factories/stress-log.factory");
describe('StressLog Model', () => {
    let stressLogFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        stressLogFactory = new stress_log_factory_1.StressLogTestFactory();
        jest.spyOn(stress_log_model_1.StressLog.prototype, 'save').mockImplementation(function () {
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
        it('should create and save log successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = stressLogFactory.create();
            const log = yield stress_log_model_1.StressLog.create(testData);
            expect(log.userId).toBeDefined();
            expect(log.level).toBe(testData.level);
            expect(log.triggers).toEqual(testData.triggers);
            expect(log.symptoms).toEqual(testData.symptoms);
        }));
        it('should set default date to current time', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = yield stress_log_model_1.StressLog.create(stressLogFactory.create());
            const now = new Date();
            expect(log.date.getTime()).toBeCloseTo(now.getTime(), -2);
        }));
        it('should trim string fields correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = yield stress_log_model_1.StressLog.create(stressLogFactory.create({
                triggers: ['  work  ', ' traffic '],
                symptoms: ['  headache  ', ' fatigue '],
                notes: '  Test notes  '
            }));
            expect(log.triggers[0]).toBe('work');
            expect(log.symptoms[0]).toBe('headache');
            expect(log.notes).toBe('Test notes');
        }));
    });
    describe('Error Cases', () => {
        it('should fail when required fields are missing', () => {
            expect(() => new stress_log_model_1.StressLog({})).toThrow();
        });
        it('should reject invalid stress level', () => {
            expect(() => new stress_log_model_1.StressLog(stressLogFactory.create({ level: 11 }))).toThrow();
        });
        it('should reject too many triggers', () => {
            expect(() => new stress_log_model_1.StressLog(stressLogFactory.create({
                triggers: Array(6).fill('trigger')
            }))).toThrow();
        });
    });
    describe('Edge Cases', () => {
        it('should handle minimum stress level', () => {
            expect(() => new stress_log_model_1.StressLog(stressLogFactory.withLevel(1))).not.toThrow();
        });
        it('should handle maximum stress level', () => {
            expect(() => new stress_log_model_1.StressLog(stressLogFactory.withLevel(10))).not.toThrow();
        });
        it('should handle empty arrays', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = yield stress_log_model_1.StressLog.create(stressLogFactory.withoutOptionalFields());
            expect(log.triggers).toEqual([]);
            expect(log.symptoms).toEqual([]);
        }));
    });
    describe('Schema Validation', () => {
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = new stress_log_model_1.StressLog({});
            const validationError = yield log.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.level).toBeDefined();
        }));
        it('should validate stress level range', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooLow = new stress_log_model_1.StressLog(stressLogFactory.withLevel(0));
            const tooHigh = new stress_log_model_1.StressLog(stressLogFactory.withLevel(11));
            expect(yield ((_a = tooLow.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.level)).toBeDefined();
            expect(yield ((_b = tooHigh.validateSync()) === null || _b === void 0 ? void 0 : _b.errors.level)).toBeDefined();
        }));
        it('should validate trigger array length and content', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooManyTriggers = new stress_log_model_1.StressLog(stressLogFactory.create({
                triggers: Array(6).fill('trigger')
            }));
            const longTrigger = new stress_log_model_1.StressLog(stressLogFactory.create({
                triggers: ['a'.repeat(101)]
            }));
            expect(yield ((_a = tooManyTriggers.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.triggers)).toBeDefined();
            expect(yield ((_b = longTrigger.validateSync()) === null || _b === void 0 ? void 0 : _b.errors['triggers.0'])).toBeDefined();
        }));
        it('should validate symptom array length and content', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const tooManySymptoms = new stress_log_model_1.StressLog(stressLogFactory.create({
                symptoms: Array(11).fill('symptom')
            }));
            const longSymptom = new stress_log_model_1.StressLog(stressLogFactory.create({
                symptoms: ['a'.repeat(101)]
            }));
            expect(yield ((_a = tooManySymptoms.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.symptoms)).toBeDefined();
            expect(yield ((_b = longSymptom.validateSync()) === null || _b === void 0 ? void 0 : _b.errors['symptoms.0'])).toBeDefined();
        }));
        it('should validate notes length', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const log = new stress_log_model_1.StressLog(stressLogFactory.withLongNotes());
            expect(yield ((_a = log.validateSync()) === null || _a === void 0 ? void 0 : _a.errors.notes)).toBeDefined();
        }));
    });
    describe('Default Values', () => {
        it('should set timestamps', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = yield stress_log_model_1.StressLog.create(stressLogFactory.create());
            expect(log.createdAt).toBeDefined();
            expect(log.updatedAt).toBeDefined();
            expect(log.createdAt).toBeInstanceOf(Date);
            expect(log.updatedAt).toBeInstanceOf(Date);
        }));
    });
    describe('Data Integrity', () => {
        it('should trim string fields in arrays', () => __awaiter(void 0, void 0, void 0, function* () {
            const log = yield stress_log_model_1.StressLog.create(stressLogFactory.create({
                triggers: ['  work  ', ' traffic '],
                symptoms: ['  headache  ', ' fatigue ']
            }));
            expect(log.triggers).toEqual(['work', 'traffic']);
            expect(log.symptoms).toEqual(['headache', 'fatigue']);
        }));
    });
});
