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
describe('App with Custom Route Test', () => {
    beforeAll(() => {
        // Add a custom route to the existing app
        app_1.app.get('/custom-test-route', (req, res) => {
            res.status(200).json({ message: 'Custom test route successful' });
        });
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, app_1.closeServer)();
    }));
    it('should respond to a custom route', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/custom-test-route')
            .timeout(5000);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Custom test route successful');
    }));
});
