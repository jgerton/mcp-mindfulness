#!/usr/bin/env node

/**
 * Battery Impact Test Script
 * 
 * This script tests the battery impact of various API operations
 * and generates a report with recommendations for optimization.
 */

const { performance } = require('perf_hooks');
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const TEST_DURATION = 30000; // 30 seconds
const REPORT_PATH = path.join(__dirname, '..', 'mobile-performance-reports', 'battery-impact-report.md');
const ENDPOINTS = [
  { name: 'Stress Techniques List', path: '/api/stress-techniques', method: 'GET' },
  { name: 'Stress Technique Recommendations', path: '/api/stress-techniques/recommendations', method: 'GET' },
  { name: 'User Data Export', path: '/api/export/user-data', method: 'GET' },
  { name: 'User Data Export (CSV)', path: '/api/export/user-data?format=csv', method: 'GET' },
  { name: 'Swagger Documentation', path: '/api-docs', method: 'GET' }
];

// Ensure directory exists
const reportDir = path.dirname(REPORT_PATH);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

/**
 * Measures CPU and memory usage during API operations
 */
async function measureResourceUsage(endpointConfig, port) {
  const { name, path, method } = endpointConfig;
  console.log(`Testing battery impact for ${name} (${method} ${path})...`);
  
  // Take baseline measurements
  const startUsage = process.cpuUsage();
  const startMemory = process.memoryUsage();
  
  // Start time tracking
  const startTime = performance.now();
  let requestCount = 0;
  let totalResponseTime = 0;
  
  // Run test for specified duration
  while (performance.now() - startTime < TEST_DURATION) {
    const requestStartTime = performance.now();
    
    // Make the request
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
          'Accept': method === 'GET' && path.includes('format=csv') ? 'text/csv' : 'application/json',
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const requestEndTime = performance.now();
          totalResponseTime += (requestEndTime - requestStartTime);
          requestCount++;
          resolve({ status: res.statusCode, data });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    }).catch(error => {
      console.error(`Error testing ${name}: ${error.message}`);
    });
    
    // Small pause between requests to allow for resource measurement
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Calculate resource usage
  const endTime = performance.now();
  const cpuUsage = process.cpuUsage(startUsage);
  const memoryUsage = process.memoryUsage();
  const testDuration = endTime - startTime;
  
  // Calculate metrics
  const avgResponseTime = totalResponseTime / requestCount;
  const requestsPerSecond = (requestCount / testDuration) * 1000;
  const cpuUserPerRequest = (cpuUsage.user / 1000) / requestCount;
  const cpuSystemPerRequest = (cpuUsage.system / 1000) / requestCount;
  const memoryRssIncrease = (memoryUsage.rss - startMemory.rss) / (1024 * 1024);
  const memoryHeapIncrease = (memoryUsage.heapTotal - startMemory.heapTotal) / (1024 * 1024);
  
  // Estimate battery impact (higher value = more battery usage)
  // This is a simplified model
  const batteryImpactScore = 
    (cpuUserPerRequest * 0.4) + 
    (cpuSystemPerRequest * 0.3) + 
    (Math.max(0, memoryRssIncrease) * 0.15) + 
    (Math.max(0, memoryHeapIncrease) * 0.15);
  
  // Normalized to 0-100 scale
  const normalizedBatteryImpact = Math.min(100, Math.max(0, batteryImpactScore * 50));
  
  return {
    name,
    path,
    method,
    requestCount,
    avgResponseTime,
    requestsPerSecond,
    cpuUserPerRequest,
    cpuSystemPerRequest,
    memoryRssIncrease,
    memoryHeapIncrease,
    batteryImpact: normalizedBatteryImpact,
    testDuration
  };
}

/**
 * Starts the test server and runs the tests
 */
async function runTests() {
  console.log('Starting battery impact tests...');
  
  // Dynamic port selection
  const port = 4000 + Math.floor(Math.random() * 1000);
  
  // Start server in a separate process
  console.log(`Starting test server on port ${port}...`);
  const server = require('child_process').spawn(
    'node',
    ['./server.js'], // Path to your server entry file
    {
      env: {
        ...process.env,
        PORT: port.toString(),
        NODE_ENV: 'test'
      },
      stdio: 'pipe'
    }
  );
  
  // Give the server time to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    const results = [];
    
    // Run tests for each endpoint
    for (const endpoint of ENDPOINTS) {
      try {
        const result = await measureResourceUsage(endpoint, port);
        results.push(result);
      } catch (error) {
        console.error(`Error testing ${endpoint.name}:`, error);
      }
    }
    
    // Generate report
    generateReport(results);
    
    console.log(`Battery impact report generated at ${REPORT_PATH}`);
  } finally {
    // Shutdown server
    server.kill();
  }
}

/**
 * Generates a markdown report of the test results
 */
function generateReport(results) {
  // Sort results by battery impact (highest first)
  results.sort((a, b) => b.batteryImpact - a.batteryImpact);
  
  let report = `# Mobile Battery Impact Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## System Information\n\n`;
  report += `- OS: ${os.type()} ${os.release()}\n`;
  report += `- CPU: ${os.cpus()[0].model}\n`;
  report += `- Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB\n`;
  report += `- Test Duration: ${TEST_DURATION / 1000} seconds per endpoint\n\n`;
  
  report += `## Battery Impact Summary\n\n`;
  report += `| Endpoint | Method | Battery Impact | Requests/sec | Avg Response Time |\n`;
  report += `|----------|--------|---------------|--------------|------------------|\n`;
  
  results.forEach(result => {
    report += `| ${result.name} | ${result.method} | ${result.batteryImpact.toFixed(2)}% | ${result.requestsPerSecond.toFixed(2)} | ${result.avgResponseTime.toFixed(2)}ms |\n`;
  });
  
  report += `\n## Detailed Results\n\n`;
  
  results.forEach(result => {
    report += `### ${result.name}\n\n`;
    report += `- **Path**: ${result.path}\n`;
    report += `- **Method**: ${result.method}\n`;
    report += `- **Battery Impact**: ${result.batteryImpact.toFixed(2)}%\n`;
    report += `- **Requests Processed**: ${result.requestCount}\n`;
    report += `- **Requests Per Second**: ${result.requestsPerSecond.toFixed(2)}\n`;
    report += `- **Average Response Time**: ${result.avgResponseTime.toFixed(2)}ms\n`;
    report += `- **CPU Usage Per Request**: ${result.cpuUserPerRequest.toFixed(2)}ms user, ${result.cpuSystemPerRequest.toFixed(2)}ms system\n`;
    report += `- **Memory Impact**: ${result.memoryRssIncrease.toFixed(2)}MB RSS, ${result.memoryHeapIncrease.toFixed(2)}MB heap\n`;
    
    // Add optimization recommendations
    report += `\n**Optimization Recommendations**:\n\n`;
    
    if (result.batteryImpact > 50) {
      report += `- ⚠️ **HIGH BATTERY IMPACT**: This endpoint requires immediate optimization.\n`;
    } else if (result.batteryImpact > 25) {
      report += `- ⚠️ **MODERATE BATTERY IMPACT**: Consider optimizing for better mobile experience.\n`;
    } else {
      report += `- ✅ **LOW BATTERY IMPACT**: This endpoint is already well-optimized for mobile.\n`;
    }
    
    if (result.avgResponseTime > 1000) {
      report += `- Response time is too high. Consider adding caching or optimizing database queries.\n`;
    }
    
    if (result.memoryRssIncrease > 10) {
      report += `- High memory usage detected. Check for memory leaks or large response payloads.\n`;
    }
    
    if (result.cpuUserPerRequest > 50) {
      report += `- CPU usage is high. Look for computationally expensive operations.\n`;
    }
    
    report += `\n`;
  });
  
  // Add overall recommendations
  report += `## Overall Recommendations\n\n`;
  
  const highImpactEndpoints = results.filter(r => r.batteryImpact > 50);
  if (highImpactEndpoints.length > 0) {
    report += `### High Priority Optimizations\n\n`;
    highImpactEndpoints.forEach(result => {
      report += `- Optimize ${result.name} (${result.method} ${result.path})\n`;
    });
    report += `\n`;
  }
  
  const mediumImpactEndpoints = results.filter(r => r.batteryImpact > 25 && r.batteryImpact <= 50);
  if (mediumImpactEndpoints.length > 0) {
    report += `### Medium Priority Optimizations\n\n`;
    mediumImpactEndpoints.forEach(result => {
      report += `- Improve ${result.name} (${result.method} ${result.path})\n`;
    });
    report += `\n`;
  }
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, report);
}

// Run the tests
runTests().catch(error => {
  console.error('Error running battery impact tests:', error);
  process.exit(1);
}); 