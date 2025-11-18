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
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("../setup");
describe('Mobile Network Resilience Tests', () => {
    let app;
    let server;
    let closeServer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup test app with all routes
        const setup = yield (0, setup_1.setupAppForTesting)();
        app = setup.app;
        server = setup.server;
        closeServer = setup.closeServer;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (closeServer) {
            yield closeServer();
        }
        // Close mongoose connection
        if (mongoose_1.default.connection.readyState) {
            yield mongoose_1.default.connection.close();
        }
    }));
    /**
     * Simulates a flaky connection by aborting requests randomly
     */
    function simulateFlakyConnection(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = 'get', failureRate = 0.5, retries = 3, retryDelay = 500, data) {
            const errors = [];
            let finalResponse;
            let success = false;
            let attempts = 0;
            const makeRequest = () => __awaiter(this, void 0, void 0, function* () {
                let req = (0, supertest_1.default)(server)[method](endpoint)
                    .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15')
                    .set('Accept', 'application/json');
                if (data && (method === 'post' || method === 'put')) {
                    req = req.send(data);
                }
                // Should we simulate a failure?
                if (Math.random() < failureRate && attempts < retries) {
                    // Simulate aborted connection
                    const error = new Error('Connection reset by peer');
                    error.name = 'AbortError';
                    throw error;
                }
                return yield req;
            });
            // Try the request with retries
            while (attempts < retries && !success) {
                attempts++;
                try {
                    finalResponse = yield makeRequest();
                    success = finalResponse.status >= 200 && finalResponse.status < 300;
                }
                catch (error) {
                    errors.push(error);
                    // Wait before retry
                    if (attempts < retries) {
                        yield new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
            }
            return {
                success,
                attempts,
                finalResponse,
                errors: errors.length > 0 ? errors : undefined
            };
        });
    }
    /**
     * Tests an endpoint's resilience to connection failures
     */
    function testNetworkResilience(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = 'get', data) {
            // Test with high failure rate (70%)
            const result = yield simulateFlakyConnection(endpoint, method, 0.7, // 70% failure rate
            5, // Up to 5 retries
            300, // 300ms retry delay
            data);
            // Output diagnostics
            console.log(`Resilience test for ${method.toUpperCase()} ${endpoint}:`);
            console.log(`- Success: ${result.success}`);
            console.log(`- Attempts: ${result.attempts}`);
            if (result.errors && result.errors.length > 0) {
                console.log(`- Errors encountered: ${result.errors.length}`);
            }
            // The test should eventually succeed despite the flaky connection
            expect(result.success).toBe(true);
            // We expect it to take more than one attempt with our high failure rate
            expect(result.attempts).toBeGreaterThan(1);
        });
    }
    // Test key API endpoints for resilience
    test('Stress technique recommendations should be resilient to flaky connections', () => __awaiter(void 0, void 0, void 0, function* () {
        yield testNetworkResilience('/api/stress-techniques/recommendations');
    }));
    test('Stress technique list should be resilient to flaky connections', () => __awaiter(void 0, void 0, void 0, function* () {
        yield testNetworkResilience('/api/stress-techniques');
    }));
    test('Data export should be resilient to flaky connections', () => __awaiter(void 0, void 0, void 0, function* () {
        yield testNetworkResilience('/api/export/user-data');
    }));
    test('Export API should handle large data over flaky connections', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        // This tests both connection resilience and proper pagination/chunking
        const result = yield simulateFlakyConnection('/api/export/user-data?full=true', 'get', 0.4, // 40% failure rate
        5, // Up to 5 retries
        500 // 500ms retry delay
        );
        expect(result.success).toBe(true);
        // Verify the response contains pagination info for large data sets
        if (result.finalResponse) {
            const response = result.finalResponse.body;
            console.log('Large export pagination test results:');
            console.log(`- Total pages: ${((_a = response.pagination) === null || _a === void 0 ? void 0 : _a.totalPages) || 'N/A'}`);
            console.log(`- Total items: ${((_b = response.pagination) === null || _b === void 0 ? void 0 : _b.totalItems) || 'N/A'}`);
            console.log(`- Current page: ${((_c = response.pagination) === null || _c === void 0 ? void 0 : _c.currentPage) || 'N/A'}`);
            // If the API is properly implemented, it should have pagination for large datasets
            if (response.pagination) {
                expect(response.pagination).toHaveProperty('totalPages');
                expect(response.pagination).toHaveProperty('totalItems');
                expect(response.pagination).toHaveProperty('currentPage');
            }
        }
    }));
    test('Connection drops during data streaming should be handled gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        // Simulate a connection that drops mid-download
        const req = (0, supertest_1.default)(server)
            .get('/api/export/user-data?format=csv')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15')
            .set('Accept', 'text/csv');
        // Abort the request after a short delay to simulate connection drop
        setTimeout(() => {
            req.abort();
        }, 100);
        try {
            yield req;
            // We don't expect to get here since we aborted the request
            expect(true).toBe(false);
        }
        catch (error) {
            // We expect an error due to the aborted request
            expect(error).toBeTruthy();
        }
        // Now verify that the server handled the aborted connection properly
        // by making a new request and ensuring it still works
        const secondReq = yield (0, supertest_1.default)(server)
            .get('/api/export/user-data?format=csv')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15')
            .set('Accept', 'text/csv');
        // The server should still be responding properly
        expect(secondReq.status).toBe(200);
    }));
});
