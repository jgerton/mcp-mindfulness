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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
describe('Minimal Express Server Test', () => {
    let app;
    let server;
    beforeAll(() => {
        // Create a minimal Express app
        app = (0, express_1.default)();
        // Add a simple route
        app.get('/test', (req, res) => {
            res.status(200).json({ message: 'Test successful' });
        });
        // Start the server
        server = app.listen(0); // Random port
    });
    afterAll((done) => {
        // Close the server
        server.close(done);
    });
    it('should respond to a simple request', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/test')
            .timeout(5000);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Test successful');
    }));
});
