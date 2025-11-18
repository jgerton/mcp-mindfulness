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
exports.NETWORK_CONDITIONS = void 0;
exports.simulateNetworkCondition = simulateNetworkCondition;
exports.testUnderAllNetworkConditions = testUnderAllNetworkConditions;
exports.verifyEndpointPerformance = verifyEndpointPerformance;
const supertest_1 = __importDefault(require("supertest"));
const perf_hooks_1 = require("perf_hooks");
exports.NETWORK_CONDITIONS = {
    FAST_4G: {
        name: 'Fast 4G',
        latency: 50,
        bandwidthKbps: 4000,
        packetLoss: 0
    },
    SLOW_4G: {
        name: 'Slow 4G',
        latency: 100,
        bandwidthKbps: 2000,
        packetLoss: 0.5
    },
    GOOD_3G: {
        name: 'Good 3G',
        latency: 150,
        bandwidthKbps: 1000,
        packetLoss: 1
    },
    SLOW_3G: {
        name: 'Slow 3G',
        latency: 300,
        bandwidthKbps: 500,
        packetLoss: 2
    },
    VERY_SLOW: {
        name: 'Very Slow Connection',
        latency: 500,
        bandwidthKbps: 250,
        packetLoss: 5
    },
    OFFLINE: {
        name: 'Offline',
        latency: 0,
        bandwidthKbps: 0,
        packetLoss: 100
    }
};
function calculateThrottledTime(originalTime, condition) {
    // Simple simulation - in reality, this would be more complex
    const latencyFactor = 1 + (condition.latency / 1000);
    const bandwidthFactor = condition.bandwidthKbps > 0 ?
        Math.max(1, 5000 / condition.bandwidthKbps) : 10; // Baseline of 5000 Kbps
    const packetLossFactor = 1 + (condition.packetLoss / 10);
    return originalTime * latencyFactor * bandwidthFactor * packetLossFactor;
}
// Sometimes randomly fail requests based on packet loss percentage
function simulatePacketLoss(condition) {
    return Math.random() * 100 < condition.packetLoss;
}
/**
 * Simulates a request under specific mobile network conditions
 */
function simulateNetworkCondition(app, method, endpoint, condition, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultHeaders = Object.assign({ 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', 'Accept': 'application/json' }, headers);
        const startTime = perf_hooks_1.performance.now();
        // Simulate packet loss
        if (simulatePacketLoss(condition)) {
            yield new Promise(resolve => setTimeout(resolve, condition.latency * 2));
            return {
                responseTime: perf_hooks_1.performance.now() - startTime,
                responseSizeBytes: 0,
                status: 0,
                success: false,
                throttled: true,
                networkCondition: condition
            };
        }
        // Add network latency
        yield new Promise(resolve => setTimeout(resolve, condition.latency));
        // Make the actual request
        try {
            let req = (0, supertest_1.default)(app)[method](endpoint).set(defaultHeaders);
            if (data && (method === 'post' || method === 'put')) {
                req = req.send(data);
            }
            const response = yield req;
            const endTime = perf_hooks_1.performance.now();
            const responseTime = endTime - startTime;
            // Calculate response size
            const responseText = JSON.stringify(response.body);
            const responseSizeBytes = Buffer.byteLength(responseText, 'utf8');
            // Simulate bandwidth throttling for large responses
            const theoreticalTransferTime = (responseSizeBytes * 8) / (condition.bandwidthKbps * 1024);
            const throttledTime = calculateThrottledTime(responseTime, condition);
            if (throttledTime > responseTime) {
                yield new Promise(resolve => setTimeout(resolve, throttledTime - responseTime));
            }
            return {
                responseTime: throttledTime,
                responseSizeBytes,
                status: response.status,
                success: response.status >= 200 && response.status < 300,
                throttled: throttledTime > responseTime,
                networkCondition: condition
            };
        }
        catch (error) {
            const endTime = perf_hooks_1.performance.now();
            return {
                responseTime: endTime - startTime,
                responseSizeBytes: 0,
                status: error.status || 500,
                success: false,
                throttled: false,
                networkCondition: condition
            };
        }
    });
}
/**
 * Test an endpoint under all predefined network conditions
 */
function testUnderAllNetworkConditions(app, method, endpoint, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = {};
        for (const [key, condition] of Object.entries(exports.NETWORK_CONDITIONS)) {
            if (condition.name === 'Offline')
                continue; // Skip offline condition for normal tests
            results[key] = yield simulateNetworkCondition(app, method, endpoint, condition, data, headers);
        }
        return results;
    });
}
/**
 * Test if an endpoint meets performance requirements under various network conditions
 */
function verifyEndpointPerformance(app_1, method_1, endpoint_1) {
    return __awaiter(this, arguments, void 0, function* (app, method, endpoint, acceptableResponseTime = 2000, // 2 seconds max for slow 3G
    data, headers) {
        const results = yield testUnderAllNetworkConditions(app, method, endpoint, data, headers);
        const failedConditions = [];
        // Check which conditions failed performance requirements
        for (const [key, metrics] of Object.entries(results)) {
            if (!metrics.success || metrics.responseTime > acceptableResponseTime) {
                failedConditions.push(key);
            }
        }
        return {
            passed: failedConditions.length === 0,
            results,
            failedConditions
        };
    });
}
