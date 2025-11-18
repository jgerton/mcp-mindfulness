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
const network_simulation_1 = require("./network-simulation");
const resource_monitor_1 = require("./resource-monitor");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import app setup (adjust import path as needed)
const setup_1 = require("../setup");
describe('Mobile API Performance Tests', () => {
    let app;
    let server;
    let closeServer;
    const reportsDir = path_1.default.join(__dirname, '..', '..', '..', 'mobile-performance-reports');
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create reports directory if it doesn't exist
        if (!fs_1.default.existsSync(reportsDir)) {
            fs_1.default.mkdirSync(reportsDir, { recursive: true });
        }
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
    afterEach(() => {
        // Write performance reports after each test
        writeReports();
    });
    // Store test results for report generation
    const testResults = [];
    /**
     * Writes performance reports to files
     */
    function writeReports() {
        if (testResults.length === 0)
            return;
        // Create a summary file
        const summaryPath = path_1.default.join(reportsDir, 'performance-summary.md');
        let summaryContent = `# Mobile API Performance Summary\n\n`;
        summaryContent += `Generated: ${new Date().toISOString()}\n\n`;
        summaryContent += `| Endpoint | Method | Passed 4G | Passed 3G | Est. Battery Impact | Notes |\n`;
        summaryContent += `| -------- | ------ | --------- | --------- | ------------------- | ----- |\n`;
        // Process each test result
        testResults.forEach(result => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const { endpoint, method, performanceResults, resourceResults } = result;
            // Check if 4G and 3G tests passed
            const passed4G = ((_b = (_a = performanceResults === null || performanceResults === void 0 ? void 0 : performanceResults.results) === null || _a === void 0 ? void 0 : _a.FAST_4G) === null || _b === void 0 ? void 0 : _b.success) &&
                ((_d = (_c = performanceResults === null || performanceResults === void 0 ? void 0 : performanceResults.results) === null || _c === void 0 ? void 0 : _c.SLOW_4G) === null || _d === void 0 ? void 0 : _d.success);
            const passed3G = ((_f = (_e = performanceResults === null || performanceResults === void 0 ? void 0 : performanceResults.results) === null || _e === void 0 ? void 0 : _e.GOOD_3G) === null || _f === void 0 ? void 0 : _f.success) &&
                ((_h = (_g = performanceResults === null || performanceResults === void 0 ? void 0 : performanceResults.results) === null || _g === void 0 ? void 0 : _g.SLOW_3G) === null || _h === void 0 ? void 0 : _h.success);
            const batteryImpact = (resourceResults === null || resourceResults === void 0 ? void 0 : resourceResults.batteryImpact) || 'N/A';
            const notes = [];
            if (((_j = performanceResults === null || performanceResults === void 0 ? void 0 : performanceResults.failedConditions) === null || _j === void 0 ? void 0 : _j.length) > 0) {
                notes.push(`Failed under: ${performanceResults.failedConditions.join(', ')}`);
            }
            if (((_k = resourceResults === null || resourceResults === void 0 ? void 0 : resourceResults.failedThresholds) === null || _k === void 0 ? void 0 : _k.length) > 0) {
                notes.push(`Resource issues: ${resourceResults.failedThresholds.length}`);
            }
            // Add to summary table
            summaryContent += `| ${endpoint} | ${method} | ${passed4G ? '✅' : '❌'} | ${passed3G ? '✅' : '❌'} | ${batteryImpact}% | ${notes.join('; ')} |\n`;
            // Create detailed report for this endpoint
            const detailedPath = path_1.default.join(reportsDir, `${method}-${endpoint.replace(/\//g, '-')}.md`);
            let detailedContent = `# Performance Report: ${method.toUpperCase()} ${endpoint}\n\n`;
            detailedContent += `## Network Performance\n\n`;
            // Network performance details
            if (performanceResults) {
                detailedContent += `| Network Condition | Response Time | Response Size | Status | Success |\n`;
                detailedContent += `| ---------------- | ------------- | ------------- | ------ | ------- |\n`;
                Object.entries(performanceResults.results).forEach(([condition, metrics]) => {
                    detailedContent += `| ${metrics.networkCondition.name} | ${metrics.responseTime.toFixed(2)}ms | ${(metrics.responseSizeBytes / 1024).toFixed(2)}KB | ${metrics.status} | ${metrics.success ? '✅' : '❌'} |\n`;
                });
                detailedContent += `\n### Failed Conditions\n\n`;
                if (performanceResults.failedConditions.length > 0) {
                    performanceResults.failedConditions.forEach((condition) => {
                        detailedContent += `- ${condition}\n`;
                    });
                }
                else {
                    detailedContent += `No failed conditions! 🎉\n`;
                }
            }
            // Resource usage details
            if (resourceResults) {
                detailedContent += `\n## Resource Usage\n\n`;
                detailedContent += `- **Duration**: ${resourceResults.usage.duration.toFixed(2)}ms\n`;
                detailedContent += `- **CPU Usage (User)**: ${(resourceResults.usage.cpuUsageUser / 1000).toFixed(2)}ms\n`;
                detailedContent += `- **CPU Usage (System)**: ${(resourceResults.usage.cpuUsageSystem / 1000).toFixed(2)}ms\n`;
                detailedContent += `- **Memory (RSS)**: ${(resourceResults.usage.memoryUsageRss / (1024 * 1024)).toFixed(2)}MB\n`;
                detailedContent += `- **Memory (Heap)**: ${(resourceResults.usage.memoryUsageHeap / (1024 * 1024)).toFixed(2)}MB\n`;
                detailedContent += `- **Estimated Battery Impact**: ${resourceResults.batteryImpact}%\n`;
                if (resourceResults.failedThresholds.length > 0) {
                    detailedContent += `\n### Failed Thresholds\n\n`;
                    resourceResults.failedThresholds.forEach((threshold) => {
                        detailedContent += `- ${threshold}\n`;
                    });
                }
            }
            // Write detailed report
            fs_1.default.writeFileSync(detailedPath, detailedContent);
        });
        // Write summary report
        fs_1.default.writeFileSync(summaryPath, summaryContent);
        // Clear results for next batch
        testResults.length = 0;
    }
    // Tests for API endpoints
    // Stress Management Techniques API
    test('GET /api/stress-techniques should perform well under mobile conditions', () => __awaiter(void 0, void 0, void 0, function* () {
        // Performance test
        const endpoint = '/api/stress-techniques';
        const performanceResults = yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 2000 // 2 second max response time
        );
        // Resource usage test
        const resourceResults = yield (0, resource_monitor_1.verifyResourceUsage)(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 2000);
        }), 'GET /api/stress-techniques', {
            maxDuration: 3000,
            maxBatteryImpact: 15
        });
        // Store results for reporting
        testResults.push({
            endpoint,
            method: 'GET',
            performanceResults,
            resourceResults
        });
        // Verify performance
        expect(performanceResults.passed).toBe(true);
        // Generate console report for immediate feedback
        console.log((0, resource_monitor_1.generateResourceReport)(`GET ${endpoint}`, resourceResults.usage));
        // Verify resource usage
        expect(resourceResults.passed).toBe(true);
    }));
    test('GET /api/stress-techniques/recommendations should perform well under mobile conditions', () => __awaiter(void 0, void 0, void 0, function* () {
        const endpoint = '/api/stress-techniques/recommendations';
        const performanceResults = yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 2000 // 2 second max response time
        );
        const resourceResults = yield (0, resource_monitor_1.verifyResourceUsage)(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 2000);
        }), 'GET /api/stress-techniques/recommendations', {
            maxDuration: 3000,
            maxBatteryImpact: 15
        });
        testResults.push({
            endpoint,
            method: 'GET',
            performanceResults,
            resourceResults
        });
        expect(performanceResults.passed).toBe(true);
        console.log((0, resource_monitor_1.generateResourceReport)(`GET ${endpoint}`, resourceResults.usage));
        expect(resourceResults.passed).toBe(true);
    }));
    // Data Export API
    test('GET /api/export/user-data should perform well under mobile conditions', () => __awaiter(void 0, void 0, void 0, function* () {
        const endpoint = '/api/export/user-data';
        const performanceResults = yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 3000 // 3 second max response time (larger data)
        );
        const resourceResults = yield (0, resource_monitor_1.verifyResourceUsage)(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 3000);
        }), 'GET /api/export/user-data', {
            maxDuration: 4000,
            maxBatteryImpact: 20
        });
        testResults.push({
            endpoint,
            method: 'GET',
            performanceResults,
            resourceResults
        });
        expect(performanceResults.passed).toBe(true);
        console.log((0, resource_monitor_1.generateResourceReport)(`GET ${endpoint}`, resourceResults.usage));
        expect(resourceResults.passed).toBe(true);
    }));
    // Swagger Documentation API
    test('GET /api-docs should be accessible on mobile browsers', () => __awaiter(void 0, void 0, void 0, function* () {
        const endpoint = '/api-docs';
        const performanceResults = yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 5000, // 5 second max response time (it's documentation, can be slower)
        undefined, {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html'
        });
        const resourceResults = yield (0, resource_monitor_1.verifyResourceUsage)(() => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, network_simulation_1.verifyEndpointPerformance)(server, 'get', endpoint, 5000, undefined, {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html'
            });
        }), 'GET /api-docs', {
            maxDuration: 6000,
            maxBatteryImpact: 25
        });
        testResults.push({
            endpoint,
            method: 'GET',
            performanceResults,
            resourceResults
        });
        expect(performanceResults.results.FAST_4G.success).toBe(true);
        expect(performanceResults.results.SLOW_4G.success).toBe(true);
        console.log((0, resource_monitor_1.generateResourceReport)(`GET ${endpoint}`, resourceResults.usage));
    }));
});
