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
const meditation_session_model_1 = require("../../models/meditation-session.model");
const test_db_1 = require("../utils/test-db");
describe('Index Check', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.connect)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.closeDatabase)();
    }));
    it('should check for duplicate indexes', () => __awaiter(void 0, void 0, void 0, function* () {
        // Get all indexes from the MeditationSession collection
        const indexes = yield meditation_session_model_1.MeditationSession.collection.indexes();
        // Log all indexes for debugging
        console.log('Indexes:', JSON.stringify(indexes, null, 2));
        // Check for duplicate indexes
        const indexKeys = indexes.map(index => JSON.stringify(index.key));
        const uniqueIndexKeys = new Set(indexKeys);
        // If there are duplicate indexes, the size of the Set will be less than the array
        expect(uniqueIndexKeys.size).toBe(indexKeys.length);
    }));
});
