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
const test_db_1 = require("../utils/test-db");
const pmr_service_1 = require("../../services/pmr.service");
const pmr_model_1 = require("../../models/pmr.model");
describe('PMRService', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.connect)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.closeDatabase)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.clearDatabase)();
    }));
    describe('getMuscleGroups', () => {
        it('should return muscle groups in correct order', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create test muscle groups
            yield pmr_model_1.MuscleGroup.create([
                { name: 'Hands', order: 1, description: 'Hands and fingers', durationSeconds: 30 },
                { name: 'Arms', order: 2, description: 'Biceps and forearms', durationSeconds: 30 },
                { name: 'Shoulders', order: 3, description: 'Shoulder muscles', durationSeconds: 30 }
            ]);
            const muscleGroups = yield pmr_service_1.PMRService.getMuscleGroups();
            expect(muscleGroups).toHaveLength(3);
            expect(muscleGroups[0].name).toBe('Hands');
            expect(muscleGroups[1].name).toBe('Arms');
            expect(muscleGroups[2].name).toBe('Shoulders');
        }));
    });
    describe('startSession', () => {
        it('should create a new PMR session', () => __awaiter(void 0, void 0, void 0, function* () {
            const userId = new mongoose_1.default.Types.ObjectId().toString();
            const stressLevelBefore = 7;
            const session = yield pmr_service_1.PMRService.startSession(userId, stressLevelBefore);
            expect(session).toBeDefined();
            expect(session.userId).toBe(userId);
            expect(session.stressLevelBefore).toBe(stressLevelBefore);
            expect(session.completedGroups).toEqual([]);
        }));
    });
});
