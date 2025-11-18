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
const pmr_model_1 = require("../../models/pmr.model");
const db_handler_1 = require("../test-utils/db-handler");
const createTestMuscleGroup = (overrides = {}) => (Object.assign({ name: 'Shoulders', description: 'Focus on tensing and relaxing your shoulder muscles', order: 1, durationSeconds: 60 }, overrides));
const createTestPMRSession = (overrides = {}) => (Object.assign({ userId: new mongoose_1.default.Types.ObjectId().toString(), startTime: new Date(), completedGroups: [], duration: 300 }, overrides));
describe('PMR Models', () => {
    let testMuscleGroup;
    let testPMRSession;
    let userId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        userId = new mongoose_1.default.Types.ObjectId().toString();
        testMuscleGroup = {
            name: 'Shoulders',
            description: 'Focus on tensing and relaxing your shoulder muscles',
            order: 1,
            durationSeconds: 60
        };
        testPMRSession = {
            userId,
            startTime: new Date(),
            completedGroups: [],
            duration: 300
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
        it('should create muscle group successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const muscleGroup = yield pmr_model_1.MuscleGroup.create(testMuscleGroup);
            expect(muscleGroup.name).toBe('Shoulders');
            expect(muscleGroup.description).toBe('Focus on tensing and relaxing your shoulder muscles');
            expect(muscleGroup.order).toBe(1);
            expect(muscleGroup.durationSeconds).toBe(60);
        }));
        it('should create PMR session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield pmr_model_1.PMRSession.create(testPMRSession);
            expect(session.userId).toBe(userId);
            expect(session.duration).toBe(300);
            expect(session.completedGroups).toEqual([]);
        }));
        it('should track completed muscle groups correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const muscleGroup = yield pmr_model_1.MuscleGroup.create(testMuscleGroup);
            const session = yield pmr_model_1.PMRSession.create(testPMRSession);
            session.completedGroups.push(muscleGroup.name);
            yield session.save();
            expect(session.completedGroups).toContain(muscleGroup.name);
        }));
    });
    describe('Error Cases', () => {
        it('should reject muscle group with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const muscleGroup = new pmr_model_1.MuscleGroup({});
            const validationError = yield muscleGroup.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.name).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.description).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.order).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.durationSeconds).toBeDefined();
        }));
        it('should reject PMR session with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new pmr_model_1.PMRSession({});
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.userId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.startTime).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.duration).toBeDefined();
        }));
        it('should reject invalid stress level values', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = new pmr_model_1.PMRSession(Object.assign(Object.assign({}, testPMRSession), { stressLevelBefore: 11, stressLevelAfter: -1 }));
            const validationError = yield session.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.stressLevelBefore).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.stressLevelAfter).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle boundary values for numeric fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const muscleGroup = yield pmr_model_1.MuscleGroup.create(Object.assign(Object.assign({}, testMuscleGroup), { order: 0, durationSeconds: 1 }));
            expect(muscleGroup.order).toBe(0);
            expect(muscleGroup.durationSeconds).toBe(1);
            const session = yield pmr_model_1.PMRSession.create(Object.assign(Object.assign({}, testPMRSession), { stressLevelBefore: 10, stressLevelAfter: 0 }));
            expect(session.stressLevelBefore).toBe(10);
            expect(session.stressLevelAfter).toBe(0);
        }));
        it('should handle string trimming and empty arrays', () => __awaiter(void 0, void 0, void 0, function* () {
            const muscleGroup = yield pmr_model_1.MuscleGroup.create(Object.assign(Object.assign({}, testMuscleGroup), { name: '  Shoulders  ', description: '  Test description  ' }));
            expect(muscleGroup.name).toBe('Shoulders');
            expect(muscleGroup.description).toBe('Test description');
            const session = yield pmr_model_1.PMRSession.create(Object.assign(Object.assign({}, testPMRSession), { completedGroups: [] }));
            expect(session.completedGroups).toHaveLength(0);
        }));
        it('should handle session completion edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield pmr_model_1.PMRSession.create(Object.assign(Object.assign({}, testPMRSession), { startTime: new Date(), endTime: undefined, stressLevelBefore: 5 }));
            const now = new Date();
            session.endTime = now;
            session.stressLevelAfter = session.stressLevelBefore;
            yield session.save();
            expect(session.endTime).toEqual(now);
            expect(session.stressLevelAfter).toBe(session.stressLevelBefore);
        }));
    });
});
