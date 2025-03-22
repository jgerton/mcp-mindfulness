import { Server } from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { verifyEndpointPerformance, NETWORK_CONDITIONS } from './network-simulation';
import { verifyResourceUsage, trackResourceUsage, generateResourceReport } from './resource-monitor';
import path from 'path';
import fs from 'fs';

// Import app setup (adjust import path as needed)
import { setupAppForTesting } from '../setup';

describe('Mobile API Performance Tests', () => {
  let app: express.Application;
  let server: Server;
  let closeServer: () => Promise<void>;
  const reportsDir = path.join(__dirname, '..', '..', '..', 'mobile-performance-reports');
  
  beforeAll(async () => {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Setup test app with all routes
    const setup = await setupAppForTesting();
    app = setup.app;
    server = setup.server;
    closeServer = setup.closeServer;
  });
  
  afterAll(async () => {
    if (closeServer) {
      await closeServer();
    }
    
    // Close mongoose connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });
  
  afterEach(() => {
    // Write performance reports after each test
    writeReports();
  });
  
  // Store test results for report generation
  const testResults: Array<{
    endpoint: string;
    method: string;
    performanceResults?: any;
    resourceResults?: any;
  }> = [];
  
  /**
   * Writes performance reports to files
   */
  function writeReports() {
    if (testResults.length === 0) return;
    
    // Create a summary file
    const summaryPath = path.join(reportsDir, 'performance-summary.md');
    let summaryContent = `# Mobile API Performance Summary\n\n`;
    summaryContent += `Generated: ${new Date().toISOString()}\n\n`;
    summaryContent += `| Endpoint | Method | Passed 4G | Passed 3G | Est. Battery Impact | Notes |\n`;
    summaryContent += `| -------- | ------ | --------- | --------- | ------------------- | ----- |\n`;
    
    // Process each test result
    testResults.forEach(result => {
      const { endpoint, method, performanceResults, resourceResults } = result;
      
      // Check if 4G and 3G tests passed
      const passed4G = performanceResults?.results?.FAST_4G?.success && 
                      performanceResults?.results?.SLOW_4G?.success;
      const passed3G = performanceResults?.results?.GOOD_3G?.success && 
                      performanceResults?.results?.SLOW_3G?.success;
      
      const batteryImpact = resourceResults?.batteryImpact || 'N/A';
      const notes = [];
      
      if (performanceResults?.failedConditions?.length > 0) {
        notes.push(`Failed under: ${performanceResults.failedConditions.join(', ')}`);
      }
      
      if (resourceResults?.failedThresholds?.length > 0) {
        notes.push(`Resource issues: ${resourceResults.failedThresholds.length}`);
      }
      
      // Add to summary table
      summaryContent += `| ${endpoint} | ${method} | ${passed4G ? '✅' : '❌'} | ${passed3G ? '✅' : '❌'} | ${batteryImpact}% | ${notes.join('; ')} |\n`;
      
      // Create detailed report for this endpoint
      const detailedPath = path.join(
        reportsDir, 
        `${method}-${endpoint.replace(/\//g, '-')}.md`
      );
      
      let detailedContent = `# Performance Report: ${method.toUpperCase()} ${endpoint}\n\n`;
      detailedContent += `## Network Performance\n\n`;
      
      // Network performance details
      if (performanceResults) {
        detailedContent += `| Network Condition | Response Time | Response Size | Status | Success |\n`;
        detailedContent += `| ---------------- | ------------- | ------------- | ------ | ------- |\n`;
        
        Object.entries(performanceResults.results).forEach(([condition, metrics]: [string, any]) => {
          detailedContent += `| ${metrics.networkCondition.name} | ${metrics.responseTime.toFixed(2)}ms | ${(metrics.responseSizeBytes / 1024).toFixed(2)}KB | ${metrics.status} | ${metrics.success ? '✅' : '❌'} |\n`;
        });
        
        detailedContent += `\n### Failed Conditions\n\n`;
        if (performanceResults.failedConditions.length > 0) {
          performanceResults.failedConditions.forEach((condition: string) => {
            detailedContent += `- ${condition}\n`;
          });
        } else {
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
          resourceResults.failedThresholds.forEach((threshold: string) => {
            detailedContent += `- ${threshold}\n`;
          });
        }
      }
      
      // Write detailed report
      fs.writeFileSync(detailedPath, detailedContent);
    });
    
    // Write summary report
    fs.writeFileSync(summaryPath, summaryContent);
    
    // Clear results for next batch
    testResults.length = 0;
  }
  
  // Tests for API endpoints

  // Stress Management Techniques API
  test('GET /api/stress-techniques should perform well under mobile conditions', async () => {
    // Performance test
    const endpoint = '/api/stress-techniques';
    const performanceResults = await verifyEndpointPerformance(
      server,
      'get',
      endpoint,
      2000 // 2 second max response time
    );
    
    // Resource usage test
    const resourceResults = await verifyResourceUsage(
      async () => {
        return await verifyEndpointPerformance(
          server,
          'get',
          endpoint,
          2000
        );
      },
      'GET /api/stress-techniques',
      {
        maxDuration: 3000,
        maxBatteryImpact: 15
      }
    );
    
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
    console.log(generateResourceReport(`GET ${endpoint}`, resourceResults.usage));
    
    // Verify resource usage
    expect(resourceResults.passed).toBe(true);
  });
  
  test('GET /api/stress-techniques/recommendations should perform well under mobile conditions', async () => {
    const endpoint = '/api/stress-techniques/recommendations';
    const performanceResults = await verifyEndpointPerformance(
      server,
      'get',
      endpoint,
      2000 // 2 second max response time
    );
    
    const resourceResults = await verifyResourceUsage(
      async () => {
        return await verifyEndpointPerformance(
          server,
          'get',
          endpoint,
          2000
        );
      },
      'GET /api/stress-techniques/recommendations',
      {
        maxDuration: 3000,
        maxBatteryImpact: 15
      }
    );
    
    testResults.push({
      endpoint,
      method: 'GET',
      performanceResults,
      resourceResults
    });
    
    expect(performanceResults.passed).toBe(true);
    console.log(generateResourceReport(`GET ${endpoint}`, resourceResults.usage));
    expect(resourceResults.passed).toBe(true);
  });
  
  // Data Export API
  test('GET /api/export/user-data should perform well under mobile conditions', async () => {
    const endpoint = '/api/export/user-data';
    const performanceResults = await verifyEndpointPerformance(
      server,
      'get',
      endpoint,
      3000 // 3 second max response time (larger data)
    );
    
    const resourceResults = await verifyResourceUsage(
      async () => {
        return await verifyEndpointPerformance(
          server,
          'get',
          endpoint,
          3000
        );
      },
      'GET /api/export/user-data',
      {
        maxDuration: 4000,
        maxBatteryImpact: 20
      }
    );
    
    testResults.push({
      endpoint,
      method: 'GET',
      performanceResults,
      resourceResults
    });
    
    expect(performanceResults.passed).toBe(true);
    console.log(generateResourceReport(`GET ${endpoint}`, resourceResults.usage));
    expect(resourceResults.passed).toBe(true);
  });
  
  // Swagger Documentation API
  test('GET /api-docs should be accessible on mobile browsers', async () => {
    const endpoint = '/api-docs';
    const performanceResults = await verifyEndpointPerformance(
      server,
      'get',
      endpoint,
      5000, // 5 second max response time (it's documentation, can be slower)
      undefined,
      {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html'
      }
    );
    
    const resourceResults = await verifyResourceUsage(
      async () => {
        return await verifyEndpointPerformance(
          server,
          'get',
          endpoint,
          5000,
          undefined,
          {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html'
          }
        );
      },
      'GET /api-docs',
      {
        maxDuration: 6000,
        maxBatteryImpact: 25
      }
    );
    
    testResults.push({
      endpoint,
      method: 'GET',
      performanceResults,
      resourceResults
    });
    
    expect(performanceResults.results.FAST_4G.success).toBe(true);
    expect(performanceResults.results.SLOW_4G.success).toBe(true);
    console.log(generateResourceReport(`GET ${endpoint}`, resourceResults.usage));
  });
}); 