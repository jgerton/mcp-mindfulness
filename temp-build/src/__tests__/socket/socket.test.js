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
const socket_io_client_1 = require("socket.io-client");
const socket_manager_1 = require("../../socket/socket-manager");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const test_db_1 = require("../utils/test-db");
// Mock the JWT verification
jest.mock('../../utils/jwt.utils', () => ({
    verifyToken: jest.fn().mockReturnValue({ _id: '507f1f77bcf86cd799439011', username: 'test-user' })
}));
// Mock the chat service
jest.mock('../../services/chat.service', () => ({
    ChatService: {
        addSystemMessage: jest.fn().mockResolvedValue(true)
    }
}));
describe('Socket.IO Connection Tests', () => {
    let httpServer;
    let socketManager;
    let clientSocket;
    let port;
    let authToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup database connection
        yield (0, test_db_1.connect)();
        // Setup a test server
        const app = (0, express_1.default)();
        httpServer = (0, http_1.createServer)(app);
        socketManager = new socket_manager_1.SocketManager(httpServer);
        // Start the server on a random port
        httpServer.listen(0);
        port = httpServer.address().port;
        // Create auth token for testing
        authToken = jsonwebtoken_1.default.sign({ _id: '507f1f77bcf86cd799439011', username: 'test-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
    }), 10000);
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Close client socket if it exists
        if (clientSocket) {
            clientSocket.disconnect();
        }
        // Close the server
        httpServer.close();
        // Close database connection
        yield (0, test_db_1.closeDatabase)();
    }), 10000);
    it('should connect to socket server with valid token', (done) => {
        // Connect to the socket server
        clientSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            auth: { token: authToken },
            transports: ['websocket']
        });
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            done();
        });
        clientSocket.on('connect_error', (err) => {
            done.fail(err);
        });
    }, 5000);
    it('should reject connection with invalid token', (done) => {
        // Try to connect with invalid token
        const invalidSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            auth: { token: 'invalid-token' },
            transports: ['websocket']
        });
        invalidSocket.on('connect_error', (err) => {
            expect(err.message).toBe('Authentication error');
            invalidSocket.disconnect();
            done();
        });
        invalidSocket.on('connect', () => {
            invalidSocket.disconnect();
            done.fail('Should not connect with invalid token');
        });
    }, 5000);
});
