import { Server } from 'http';
import request from 'supertest';
import { performance } from 'perf_hooks';

interface NetworkCondition {
  name: string;
  latency: number; // ms
  bandwidthKbps: number;
  packetLoss: number; // percentage
}

export const NETWORK_CONDITIONS: Record<string, NetworkCondition> = {
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

export interface RequestMetrics {
  responseTime: number;
  responseSizeBytes: number;
  status: number;
  success: boolean;
  throttled: boolean;
  networkCondition: NetworkCondition;
}

function calculateThrottledTime(originalTime: number, condition: NetworkCondition): number {
  // Simple simulation - in reality, this would be more complex
  const latencyFactor = 1 + (condition.latency / 1000);
  const bandwidthFactor = condition.bandwidthKbps > 0 ? 
    Math.max(1, 5000 / condition.bandwidthKbps) : 10; // Baseline of 5000 Kbps
  const packetLossFactor = 1 + (condition.packetLoss / 10);
  
  return originalTime * latencyFactor * bandwidthFactor * packetLossFactor;
}

// Sometimes randomly fail requests based on packet loss percentage
function simulatePacketLoss(condition: NetworkCondition): boolean {
  return Math.random() * 100 < condition.packetLoss;
}

/**
 * Simulates a request under specific mobile network conditions
 */
export async function simulateNetworkCondition(
  app: Server, 
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  condition: NetworkCondition,
  data?: any,
  headers?: Record<string, string>
): Promise<RequestMetrics> {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    'Accept': 'application/json',
    ...headers
  };

  const startTime = performance.now();
  
  // Simulate packet loss
  if (simulatePacketLoss(condition)) {
    await new Promise(resolve => setTimeout(resolve, condition.latency * 2));
    return {
      responseTime: performance.now() - startTime,
      responseSizeBytes: 0,
      status: 0,
      success: false,
      throttled: true,
      networkCondition: condition
    };
  }
  
  // Add network latency
  await new Promise(resolve => setTimeout(resolve, condition.latency));
  
  // Make the actual request
  try {
    let req = request(app)[method](endpoint).set(defaultHeaders);
    
    if (data && (method === 'post' || method === 'put')) {
      req = req.send(data);
    }
    
    const response = await req;
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Calculate response size
    const responseText = JSON.stringify(response.body);
    const responseSizeBytes = Buffer.byteLength(responseText, 'utf8');
    
    // Simulate bandwidth throttling for large responses
    const theoreticalTransferTime = (responseSizeBytes * 8) / (condition.bandwidthKbps * 1024);
    const throttledTime = calculateThrottledTime(responseTime, condition);
    
    if (throttledTime > responseTime) {
      await new Promise(resolve => setTimeout(resolve, throttledTime - responseTime));
    }
    
    return {
      responseTime: throttledTime,
      responseSizeBytes,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      throttled: throttledTime > responseTime,
      networkCondition: condition
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      responseTime: endTime - startTime,
      responseSizeBytes: 0,
      status: error.status || 500,
      success: false,
      throttled: false,
      networkCondition: condition
    };
  }
}

/**
 * Test an endpoint under all predefined network conditions
 */
export async function testUnderAllNetworkConditions(
  app: Server,
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: any,
  headers?: Record<string, string>
): Promise<Record<string, RequestMetrics>> {
  const results: Record<string, RequestMetrics> = {};
  
  for (const [key, condition] of Object.entries(NETWORK_CONDITIONS)) {
    if (condition.name === 'Offline') continue; // Skip offline condition for normal tests
    
    results[key] = await simulateNetworkCondition(
      app,
      method,
      endpoint,
      condition,
      data,
      headers
    );
  }
  
  return results;
}

/**
 * Test if an endpoint meets performance requirements under various network conditions
 */
export async function verifyEndpointPerformance(
  app: Server,
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  acceptableResponseTime: number = 2000, // 2 seconds max for slow 3G
  data?: any,
  headers?: Record<string, string>
): Promise<{
  passed: boolean;
  results: Record<string, RequestMetrics>;
  failedConditions: string[];
}> {
  const results = await testUnderAllNetworkConditions(app, method, endpoint, data, headers);
  const failedConditions: string[] = [];
  
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
} 