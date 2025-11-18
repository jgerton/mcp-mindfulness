# Performance Optimization Strategies

## Overview

This document outlines strategies and best practices for optimizing the performance of the MCP Mindfulness application. These strategies focus on improving API response times, reducing resource usage, and enhancing the overall user experience.

## Purpose

The purpose of these optimization strategies is to:
- Improve API response times
- Reduce server resource usage
- Enhance application scalability
- Provide a smoother user experience
- Support larger user bases without performance degradation

## Database Optimization

### Query Optimization

1. **Use Proper Indexes**
   - Create indexes for frequently queried fields
   - Use compound indexes for multi-field queries
   - Avoid over-indexing (which can slow down writes)

```typescript
// Creating an index in Mongoose
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Single field index
userSchema.index({ username: 1 });

// Compound index
userSchema.index({ createdAt: -1, username: 1 });
```

2. **Limit Returned Fields with Projection**
   - Only request the fields you need
   - Avoid returning large arrays or nested objects when unnecessary

```typescript
// INCORRECT: Returning all fields
const user = await User.findById(userId);

// CORRECT: Using projection to limit fields
const user = await User.findById(userId).select('username email profile.name');
```

3. **Use Pagination for Large Result Sets**
   - Implement skip and limit for pagination
   - Consider using cursor-based pagination for better performance

```typescript
// Page-based pagination
const pageSize = 20;
const page = req.query.page || 1;
const skip = (page - 1) * pageSize;

const results = await Resource
  .find(query)
  .skip(skip)
  .limit(pageSize)
  .sort({ createdAt: -1 });

// Cursor-based pagination (more efficient for large datasets)
const lastId = req.query.lastId;
const query = lastId ? { _id: { $lt: lastId } } : {};

const results = await Resource
  .find(query)
  .limit(pageSize)
  .sort({ _id: -1 });
```

4. **Optimize Aggregation Pipelines**
   - Filter documents as early as possible in the pipeline
   - Use projections to limit fields early in the pipeline
   - Break complex pipelines into smaller, more manageable stages

```typescript
// INCORRECT: Late filtering
const results = await Resource.aggregate([
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $match: { 'user.active': true } }
]);

// CORRECT: Early filtering
const results = await Resource.aggregate([
  { $match: { type: 'meditation' } }, // Filter early
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $match: { 'user.active': true } }
]);
```

### Connection Management

1. **Use Connection Pooling**
   - Configure appropriate pool size based on workload
   - Monitor connection usage and adjust as needed

```typescript
// Configure connection pool in Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Connection pool settings
  poolSize: 10, // Default is 5
  socketTimeoutMS: 45000, // How long a socket can be idle before closing
  serverSelectionTimeoutMS: 5000 // How long to try to find a server
});
```

2. **Implement Proper Connection Error Handling**
   - Handle connection errors gracefully
   - Implement reconnection strategies

```typescript
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  // Implement reconnection logic if needed
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  // Reconnection logic
});
```

## Caching Strategies

### In-Memory Caching

1. **Implement Node.js In-Memory Cache**
   - Use a library like `node-cache` for simple in-memory caching
   - Cache frequently accessed, rarely changing data

```typescript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// Caching middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.send(cachedResponse);
    }
    
    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function
    res.send = function(body) {
      cache.set(key, body, duration);
      originalSend.call(this, body);
    };
    
    next();
  };
};

// Usage in routes
app.get('/api/resources', cacheMiddleware(300), resourceController.getAll);
```

### Redis Caching

1. **Implement Redis for Distributed Caching**
   - Use Redis for caching in multi-server environments
   - Cache complex query results, session data, and rate limiting information

```typescript
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Redis caching middleware
const redisCacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `api:${req.originalUrl}`;
    
    try {
      const cachedResponse = await getAsync(key);
      
      if (cachedResponse) {
        return res.send(JSON.parse(cachedResponse));
      }
      
      // Store the original send function
      const originalSend = res.send;
      
      // Override the send function
      res.send = function(body) {
        setAsync(key, JSON.stringify(body), 'EX', duration);
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Redis error:', error);
      next(); // Continue without caching
    }
  };
};
```

### Cache Invalidation Strategies

1. **Time-Based Invalidation**
   - Set appropriate TTL (Time To Live) for cached items
   - Use different TTLs based on data volatility

2. **Event-Based Invalidation**
   - Invalidate cache when data is modified
   - Use a pub/sub mechanism for distributed cache invalidation

```typescript
// Invalidate cache on data change
async function updateResource(req, res) {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Invalidate cache
    cache.del(`/api/resources/${id}`);
    cache.del('/api/resources'); // Also invalidate list endpoint
    
    return res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
```

## API Optimization

### Request Processing

1. **Implement Request Compression**
   - Use compression middleware to reduce payload size

```typescript
const compression = require('compression');

// Use compression for all requests
app.use(compression());

// Or selectively apply compression
app.use('/api', compression());
```

2. **Optimize JSON Parsing**
   - Configure body-parser limits appropriately
   - Use streaming parsers for large payloads

```typescript
app.use(express.json({ 
  limit: '1mb', // Limit payload size
  strict: true // Only accept arrays and objects
}));
```

3. **Implement Request Timeout Handling**
   - Set appropriate timeouts for requests
   - Handle timeout errors gracefully

```typescript
const timeout = require('connect-timeout');

// Set timeout for all requests
app.use(timeout('5s'));

// Handle timeout errors
app.use((req, res, next) => {
  if (!req.timedout) return next();
  
  res.status(503).json({ error: 'Request timeout' });
});
```

### Response Optimization

1. **Implement Response Compression**
   - Use gzip or brotli compression for responses
   - Configure appropriate compression levels

2. **Use JSON Streaming for Large Responses**
   - Stream large JSON responses instead of buffering
   - Use pagination to avoid large responses

```typescript
// Stream large result sets
app.get('/api/large-dataset', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  // Start the JSON array
  res.write('[');
  
  let first = true;
  const cursor = Resource.find().cursor();
  
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    if (!first) {
      res.write(',');
    }
    first = false;
    
    res.write(JSON.stringify(doc));
  }
  
  // End the JSON array
  res.write(']');
  res.end();
});
```

## Code Optimization

### Asynchronous Processing

1. **Use Async/Await Properly**
   - Avoid unnecessary async/await
   - Use Promise.all for parallel operations

```typescript
// INCORRECT: Sequential processing
async function getResourcesAndUsers() {
  const resources = await Resource.find();
  const users = await User.find();
  return { resources, users };
}

// CORRECT: Parallel processing
async function getResourcesAndUsers() {
  const [resources, users] = await Promise.all([
    Resource.find(),
    User.find()
  ]);
  return { resources, users };
}
```

2. **Implement Background Processing for Heavy Tasks**
   - Use worker threads or separate processes for CPU-intensive tasks
   - Implement job queues for asynchronous processing

```typescript
const { Worker } = require('worker_threads');

function runHeavyTask(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/heavy-task.js', {
      workerData: data
    });
    
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// Usage in API endpoint
app.post('/api/process-data', async (req, res) => {
  try {
    // Respond immediately
    res.status(202).json({ message: 'Processing started' });
    
    // Process in background
    runHeavyTask(req.body)
      .then(result => {
        // Store result or notify user
      })
      .catch(error => {
        console.error('Background processing error:', error);
      });
  } catch (error) {
    console.error('Error starting background process:', error);
  }
});
```

### Memory Management

1. **Avoid Memory Leaks**
   - Clean up event listeners
   - Close database connections properly
   - Monitor memory usage

```typescript
// INCORRECT: Potential memory leak
function setupEventHandlers(emitter) {
  emitter.on('event', handleEvent); // Never removed
}

// CORRECT: Proper cleanup
function setupEventHandlers(emitter) {
  emitter.on('event', handleEvent);
  
  return function cleanup() {
    emitter.off('event', handleEvent);
  };
}

// Usage
const cleanup = setupEventHandlers(emitter);
// Later when done
cleanup();
```

2. **Implement Proper Error Handling**
   - Catch and handle all errors
   - Avoid unhandled promise rejections

```typescript
// INCORRECT: Unhandled promise rejection
function processData() {
  return fetchData()
    .then(data => transformData(data));
}

// CORRECT: Proper error handling
function processData() {
  return fetchData()
    .then(data => transformData(data))
    .catch(error => {
      console.error('Error processing data:', error);
      throw new Error('Failed to process data');
    });
}
```

## Monitoring and Profiling

### Performance Monitoring

1. **Implement API Response Time Monitoring**
   - Track response times for all endpoints
   - Set up alerts for slow responses

```typescript
// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    
    // Log to monitoring system if available
    if (duration > 1000) { // Alert on slow responses
      console.warn(`Slow response: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  
  next();
});
```

2. **Monitor Database Performance**
   - Track query execution times
   - Identify slow queries

```typescript
// MongoDB query logging middleware
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
```

### Load Testing

1. **Implement Regular Load Testing**
   - Use tools like Artillery or JMeter
   - Test with realistic user scenarios

```javascript
// Example Artillery load test configuration (artillery.yml)
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
      name: "Warm up phase"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load phase"
  defaults:
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer {{token}}"

scenarios:
  - name: "API load test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "testuser"
            password: "password123"
          capture:
            json: "$.token"
            as: "token"
      - get:
          url: "/api/resources"
          headers:
            Authorization: "Bearer {{token}}"
      - get:
          url: "/api/resources/{{resourceId}}"
          headers:
            Authorization: "Bearer {{token}}"
```

## Implementation Plan

### Phase 1: Analysis and Benchmarking

1. **Identify Performance Bottlenecks**
   - Profile API endpoints
   - Monitor database query performance
   - Identify slow operations

2. **Establish Performance Baselines**
   - Measure current response times
   - Document resource usage
   - Set performance targets

### Phase 2: Database Optimization

1. **Implement Database Indexes**
   - Analyze query patterns
   - Create appropriate indexes
   - Measure performance improvements

2. **Optimize Query Patterns**
   - Refactor inefficient queries
   - Implement projections
   - Add pagination

### Phase 3: Caching Implementation

1. **Implement In-Memory Caching**
   - Identify cacheable resources
   - Implement caching middleware
   - Set appropriate TTLs

2. **Add Cache Invalidation**
   - Implement cache clearing on updates
   - Add cache headers for client-side caching

### Phase 4: API and Code Optimization

1. **Optimize Request/Response Handling**
   - Implement compression
   - Optimize JSON parsing
   - Add request timeouts

2. **Refactor Inefficient Code**
   - Identify CPU-intensive operations
   - Implement parallel processing
   - Add background processing for heavy tasks

### Phase 5: Monitoring and Continuous Improvement

1. **Implement Performance Monitoring**
   - Add response time tracking
   - Monitor resource usage
   - Set up alerting

2. **Establish Regular Performance Reviews**
   - Review performance metrics weekly
   - Identify new optimization opportunities
   - Update optimization strategies

## Success Metrics

- API response times under 200ms for 95% of requests
- Database query times under 100ms for 95% of queries
- Server CPU usage below 70% during peak load
- Memory usage stable without leaks
- Successful handling of 100+ concurrent users

## Related Documentation
- [Coding Standards](../../coding-standards.md)
- [Testing Standards](../../standards/testing-standards.md)
- [Sprint Four Plan](../sprint-four.md)
- [API Error Handling Guidelines](./api-error-handling-guidelines.md)

---

Last Updated: March 16, 2025 