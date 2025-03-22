import { performance } from 'perf_hooks';
import { cpuUsage, memoryUsage } from 'process';

export interface ResourceUsage {
  cpuUsageUser: number;
  cpuUsageSystem: number;
  memoryUsageRss: number;
  memoryUsageHeap: number;
  memoryUsageExternal: number;
  duration: number;
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Estimates battery impact based on CPU usage
 * Note: This is a simulation since actual battery metrics aren't directly available
 * Returns a number from 0-100 representing estimated battery impact percentage
 */
export function estimateBatteryImpact(usage: ResourceUsage): number {
  // Calculate total CPU usage as percentage of available CPU
  const totalCpuPercentage = (usage.cpuUsageUser + usage.cpuUsageSystem) / (usage.duration * 10000);
  
  // Calculate memory impact factor (higher memory = more battery)
  const memoryImpactFactor = usage.memoryUsageRss / (128 * 1024 * 1024); // 128MB baseline
  
  // Calculate duration impact (longer operations = more battery)
  const durationFactor = Math.min(usage.duration / 5000, 1); // Cap at 5 seconds
  
  // Combined impact - heavily weighted toward CPU usage which is most battery-intensive
  const impact = (totalCpuPercentage * 0.6) + (memoryImpactFactor * 0.3) + (durationFactor * 0.1);
  
  // Convert to 0-100 scale
  return Math.min(Math.round(impact * 100), 100);
}

/**
 * Tracks resource usage during execution of a function
 */
export async function trackResourceUsage<T>(
  fn: () => Promise<T>,
  description: string = 'Operation'
): Promise<{ result: T; usage: ResourceUsage }> {
  const startTimestamp = performance.now();
  const startCpu = cpuUsage();
  const startMemory = memoryUsage();
  
  let result;
  try {
    result = await fn();
  } finally {
    const endTimestamp = performance.now();
    const endCpu = cpuUsage(startCpu);
    const endMemory = memoryUsage();
    
    const usage: ResourceUsage = {
      cpuUsageUser: endCpu.user,
      cpuUsageSystem: endCpu.system,
      memoryUsageRss: endMemory.rss - startMemory.rss,
      memoryUsageHeap: endMemory.heapTotal - startMemory.heapTotal,
      memoryUsageExternal: endMemory.external - startMemory.external,
      duration: endTimestamp - startTimestamp,
      startTimestamp,
      endTimestamp
    };
    
    return { result, usage };
  }
}

/**
 * Generates a human-readable report from resource usage data
 */
export function generateResourceReport(
  description: string,
  usage: ResourceUsage
): string {
  const batteryImpact = estimateBatteryImpact(usage);
  const mbRss = usage.memoryUsageRss / (1024 * 1024);
  const mbHeap = usage.memoryUsageHeap / (1024 * 1024);
  
  return `
Resource Usage Report: ${description}
---------------------------------------
Duration: ${usage.duration.toFixed(2)}ms
CPU Usage: 
  - User: ${(usage.cpuUsageUser / 1000).toFixed(2)}ms
  - System: ${(usage.cpuUsageSystem / 1000).toFixed(2)}ms
Memory Impact:
  - RSS: ${mbRss.toFixed(2)}MB
  - Heap: ${mbHeap.toFixed(2)}MB
Estimated Battery Impact: ${batteryImpact}%
${batteryImpact > 20 ? '⚠️ HIGH BATTERY IMPACT' : batteryImpact > 10 ? '⚠️ MODERATE BATTERY IMPACT' : '✅ LOW BATTERY IMPACT'}
---------------------------------------
`;
}

/**
 * Tests a function against specified resource usage thresholds
 */
export async function verifyResourceUsage<T>(
  fn: () => Promise<T>,
  description: string,
  thresholds: {
    maxDuration?: number,
    maxCpuUser?: number,
    maxCpuSystem?: number,
    maxRssMemory?: number,
    maxBatteryImpact?: number
  }
): Promise<{
  passed: boolean;
  result: T;
  usage: ResourceUsage;
  batteryImpact: number;
  failedThresholds: string[];
}> {
  const { result, usage } = await trackResourceUsage(fn, description);
  const batteryImpact = estimateBatteryImpact(usage);
  const failedThresholds: string[] = [];
  
  if (thresholds.maxDuration && usage.duration > thresholds.maxDuration) {
    failedThresholds.push(`Duration: ${usage.duration.toFixed(2)}ms exceeds max ${thresholds.maxDuration}ms`);
  }
  
  if (thresholds.maxCpuUser && usage.cpuUsageUser > thresholds.maxCpuUser) {
    failedThresholds.push(`CPU User: ${(usage.cpuUsageUser / 1000).toFixed(2)}ms exceeds max ${(thresholds.maxCpuUser / 1000).toFixed(2)}ms`);
  }
  
  if (thresholds.maxCpuSystem && usage.cpuUsageSystem > thresholds.maxCpuSystem) {
    failedThresholds.push(`CPU System: ${(usage.cpuUsageSystem / 1000).toFixed(2)}ms exceeds max ${(thresholds.maxCpuSystem / 1000).toFixed(2)}ms`);
  }
  
  if (thresholds.maxRssMemory && usage.memoryUsageRss > thresholds.maxRssMemory) {
    failedThresholds.push(`RSS Memory: ${(usage.memoryUsageRss / (1024 * 1024)).toFixed(2)}MB exceeds max ${(thresholds.maxRssMemory / (1024 * 1024)).toFixed(2)}MB`);
  }
  
  if (thresholds.maxBatteryImpact && batteryImpact > thresholds.maxBatteryImpact) {
    failedThresholds.push(`Battery Impact: ${batteryImpact}% exceeds max ${thresholds.maxBatteryImpact}%`);
  }
  
  return {
    passed: failedThresholds.length === 0,
    result,
    usage,
    batteryImpact,
    failedThresholds
  };
} 