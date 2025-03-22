# Mobile Integration Guide

## Overview

This document outlines best practices and implementation patterns for mobile integration with the MCP Mindfulness API. It covers performance considerations, network resilience, data usage optimization, and battery impact mitigation strategies. This guide was created during Sprint Four in preparation for Sprint Five's mobile optimization focus.

## API Performance Requirements

| API Category | Fast 4G Max Response | Slow 3G Max Response | Max Payload Size |
|--------------|----------------------|----------------------|------------------|
| Core Features | 200ms | 1000ms | 50KB |
| Data Export | 500ms | 2000ms | 100KB per page |
| Documentation | 1000ms | 3000ms | No limit |

### Performance Testing

All API endpoints have been tested under simulated mobile conditions with varying network speeds:

- Fast 4G (4000 Kbps, 50ms latency)
- Slow 4G (2000 Kbps, 100ms latency, 0.5% packet loss)
- Good 3G (1000 Kbps, 150ms latency, 1% packet loss)
- Slow 3G (500 Kbps, 300ms latency, 2% packet loss)
- Very Slow (250 Kbps, 500ms latency, 5% packet loss)

Performance reports are available in the `mobile-performance-reports` directory.

## Mobile-Specific Implementation Patterns

### 1. Connection Resilience

All mobile clients should implement the following connection resilience patterns:

```typescript
// Example retry implementation
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          // Send mobile user agent to ensure proper optimizations
          'User-Agent': navigator.userAgent
        }
      });
      
      if (response.ok) return response;
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        retries++;
        continue;
      }
      
      // For other errors, throw and handle below
      throw new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      // Network errors (offline, connection reset, etc.)
      if (retries < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retries) * 500)
        );
        retries++;
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Maximum retries exceeded');
}
```

### 2. Data Usage Optimization

#### Request Optimization

1. **Field Selection**: Use the `fields` query parameter to request only needed fields
   ```
   GET /api/stress-techniques?fields=id,name,category,difficulty
   ```

2. **Pagination**: Always use pagination for list endpoints
   ```
   GET /api/stress-techniques?page=1&limit=10
   ```

3. **Compression**: Enable gzip compression by default
   ```typescript
   // Client-side
   headers: {
     'Accept-Encoding': 'gzip, deflate'
   }
   ```

4. **Conditional Requests**: Use ETag and If-None-Match for cacheable resources
   ```typescript
   // After first request, store ETag
   const etag = response.headers.get('ETag');
   
   // On subsequent requests
   headers: {
     'If-None-Match': etag
   }
   ```

#### Response Size Reduction

1. **JSON Minification**: All API responses use minified JSON
2. **Abbreviated Property Names** for frequent data structures:
   - Instead of `recommendations`, use `recs`
   - Instead of `difficulty`, use `diff`
3. **Omit Optional Fields** when null/empty

### 3. Battery Impact Mitigation

1. **Batched Operations**: Group multiple operations
   ```
   POST /api/batch
   {
     "operations": [
       { "method": "GET", "path": "/stress-techniques" },
       { "method": "GET", "path": "/user/preferences" }
     ]
   }
   ```

2. **Background Sync**: For data exports and uploads
   ```typescript
   // Web app example using background sync
   navigator.serviceWorker.ready.then(registration => {
     registration.sync.register('data-export');
   });
   ```

3. **Polling Alternatives**: Use WebSockets for real-time updates where appropriate

4. **Lazy Loading**: Defer non-critical data loading

## Network Conditions and Strategies

### Handling Poor Network Conditions

API behavior adapts to network conditions:

1. **Good Connectivity (4G+)**:
   - Full data payloads
   - Rich media (images, animations)
   - Prefetching enabled

2. **Limited Connectivity (3G)**:
   - Reduced payload sizes
   - Compressed images
   - Critical data only
   - Pagination with smaller page sizes

3. **Very Poor Connectivity (2G/EDGE)**:
   - Text-only mode
   - Minimal UI
   - Offline-first approach
   - Background sync when connection improves

4. **Offline Mode**:
   - Local data access
   - Queue operations for sync
   - Clear offline indicators

### Network Detection Strategy

```typescript
// Network condition detection
function detectNetworkCondition(): 'fast' | 'medium' | 'slow' | 'offline' {
  if (!navigator.onLine) return 'offline';
  
  // Using Network Information API if available
  const connection = (navigator as any).connection;
  
  if (connection) {
    if (connection.saveData) return 'slow';
    
    if (connection.effectiveType === '4g') return 'fast';
    if (connection.effectiveType === '3g') return 'medium';
    return 'slow';
  }
  
  // Fallback: measure round-trip time
  return new Promise(resolve => {
    const start = Date.now();
    
    fetch('/api/ping', { method: 'HEAD' })
      .then(() => {
        const duration = Date.now() - start;
        if (duration < 100) return resolve('fast');
        if (duration < 300) return resolve('medium');
        return resolve('slow');
      })
      .catch(() => resolve('offline'));
  });
}
```

## API Endpoints With Mobile Optimizations

| Endpoint | Mobile Optimization |
|----------|---------------------|
| `/api/stress-techniques` | Field selection, pagination, compression |
| `/api/stress-techniques/recommendations` | User-agent aware responses, battery-efficient algorithm |
| `/api/export/user-data` | Chunked responses, background processing |
| `/api/meditation/sessions` | Offline storage, incremental sync |

## Testing Mobile Integration

### Network Simulation Tests

1. Run the network simulation test suite:
   ```bash
   npm run test:mobile-network
   ```

2. Verify performance across different network conditions:
   ```bash
   npm run test:mobile-performance
   ```

3. Test battery impact:
   ```bash
   npm run test:mobile-battery
   ```

### Manual Testing

For complete mobile testing, verify:

1. Performance under varying network conditions
2. Behavior when switching between networks
3. Graceful handling of connection loss
4. Data usage efficiency
5. Battery consumption during intensive operations

## Migration Guide for Mobile Clients

If you're updating an existing mobile client to use the new API optimizations:

1. Update all API calls to include the field selection parameter
2. Implement the retry pattern for all critical requests
3. Add support for compressed responses
4. Implement conditional requests for cacheable resources
5. Use the batch API for multiple related operations

## Conclusion

Following these mobile integration guidelines will ensure that applications built on top of the MCP Mindfulness API provide a consistent, reliable, and efficient experience for mobile users, even under challenging network conditions. These optimizations will minimize data usage, reduce battery impact, and ensure responsive performance across a wide range of devices and network conditions. 