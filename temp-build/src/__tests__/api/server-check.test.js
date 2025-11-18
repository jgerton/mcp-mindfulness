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
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const test_db_1 = require("../utils/test-db");
describe('Server Response Test', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, test_db_1.connect)();
    }), 10000);
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, app_1.closeServer)();
        yield (0, test_db_1.closeDatabase)();
        yield new Promise(resolve => setTimeout(resolve, 500));
    }), 10000);
    it('should respond to a basic request', () => __awaiter(void 0, void 0, void 0, function* () {
        // This should return 404 but respond quickly
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/non-existent-route')
            .timeout(5000);
        expect(response.status).toBe(404);
    }), 10000);
});
