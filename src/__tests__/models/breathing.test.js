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
const breathing_model_1 = require("../../models/breathing.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('Breathing Models', () => {
    let testPattern;
    let testSession;
    let userId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        userId = new mongoose_1.default.Types.ObjectId();
        testPattern = {
            name: '4-7-8',
            inhale: 4,
            hold: 7,
            exhale: 8,
            cycles: 4
        };
        testSession = {
            userId: userId.toString(),
            patternName: '4-7-8',
            startTime: new Date(),
            targetCycles: 4,
            completedCycles: 0
        };
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
        it('should create breathing pattern successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const pattern = yield breathing_model_1.BreathingPattern.create(testPattern);
            expect(pattern.name).toBe(testPattern.name);
            expect(pattern.inhale).toBe(testPattern.inhale);
            expect(pattern.hold).toBe(testPattern.hold);
            expect(pattern.exhale).toBe(testPattern.exhale);
            expect(pattern.cycles).toBe(testPattern.cycles);
        }));
        it('should create breathing session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield breathing_model_1.BreathingSession.create(testSession);
            expect(session.userId).toBe(testSession.userId);
            expect(session.patternName).toBe(testSession.patternName);
            expect(session.targetCycles).toBe(testSession.targetCycles);
            expect(session.completedCycles).toBe(0);
        }));
        it('should complete breathing session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield breathing_model_1.BreathingSession.create(testSession);
            session.completedCycles = session.targetCycles;
            session.endTime = new Date();
            session.stressLevelAfter = 3;
            yield session.save();
            expect(session.completedCycles).toBe(session.targetCycles);
            expect(session.endTime).toBeDefined();
            expect(session.stressLevelAfter).toBe(3);
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required pattern fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const pattern = new breathing_model_1.BreathingPattern({});
            const validationError = yield pattern.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.name).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.inhale).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.exhale).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.cycles).toBeDefined();
        }));
        it('should reject missing required session fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new breathing_model_1.BreathingSession({});
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.patternName).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.targetCycles).toBeDefined();
        }));
        it('should reject invalid stress level values', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new breathing_model_1.BreathingSession(Object.assign(Object.assign({}, testSession), { stressLevelBefore: -1, stressLevelAfter: 11 }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.stressLevelBefore).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.stressLevelAfter).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle duplicate pattern names', () => __awaiter(void 0, void 0, void 0, function* () {
            yield breathing_model_1.BreathingPattern.create(testPattern);
            yield expect(breathing_model_1.BreathingPattern.create(testPattern))
                .rejects
                .toThrow(/duplicate key error/);
        }));
        it('should handle optional breathing pattern fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const pattern = yield breathing_model_1.BreathingPattern.create(Object.assign(Object.assign({}, testPattern), { hold: undefined, postExhaleHold: undefined }));
            expect(pattern.hold).toBeUndefined();
            expect(pattern.postExhaleHold).toBeUndefined();
            expect(pattern.inhale).toBeDefined();
            expect(pattern.exhale).toBeDefined();
        }));
        it('should handle session completion edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield breathing_model_1.BreathingSession.create(Object.assign(Object.assign({}, testSession), { targetCycles: 10 }));
            // Test partial completion
            session.completedCycles = 5;
            yield session.save();
            expect(session.completedCycles).toBe(5);
            // Test over-completion
            session.completedCycles = 11;
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.completedCycles).toBeDefined();
        }));
    });
});
