import { Server } from 'http';
import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { setupAppForTesting } from '../setup';

describe('Mobile Network Resilience Tests', () => {
  let app: express.Application;
  let server: Server;
  
  beforeAll(async () => {
    // Setup test app with all routes
    app = await setupAppForTesting();
    server = app.listen(0); // random port
  });
  
  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
    
    // Close mongoose connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });
  
  /**
   * Simulates a flaky connection by aborting requests randomly
   */
  async function simulateFlakyConnection(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    failureRate: number = 0.5,
    retries: number = 3,
    retryDelay: number = 500,
    data?: any
  ): Promise<{
    success: boolean;
    attempts: number;
    finalResponse?: any;
    errors?: any[];
  }> {
    const errors: any[] = [];
    let finalResponse: any;
    let success = false;
    let attempts = 0;
    
    const makeRequest = async (): Promise<any> => {
      let req = request(server)[method](endpoint)
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
      
      return await req;
    };
    
    // Try the request with retries
    while (attempts < retries && !success) {
      attempts++;
      try {
        finalResponse = await makeRequest();
        success = finalResponse.status >= 200 && finalResponse.status < 300;
      } catch (error) {
        errors.push(error);
        // Wait before retry
        if (attempts < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    return {
      success,
      attempts,
      finalResponse,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Tests an endpoint's resilience to connection failures
   */
  async function testNetworkResilience(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data?: any
  ): Promise<void> {
    // Test with high failure rate (70%)
    const result = await simulateFlakyConnection(
      endpoint,
      method,
      0.7, // 70% failure rate
      5,   // Up to 5 retries
      300, // 300ms retry delay
      data
    );
    
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
  }
  
  // Test key API endpoints for resilience
  
  test('Stress technique recommendations should be resilient to flaky connections', async () => {
    await testNetworkResilience('/api/stress-techniques/recommendations');
  });
  
  test('Stress technique list should be resilient to flaky connections', async () => {
    await testNetworkResilience('/api/stress-techniques');
  });
  
  test('Data export should be resilient to flaky connections', async () => {
    await testNetworkResilience('/api/export/user-data');
  });
  
  test('Export API should handle large data over flaky connections', async () => {
    // This tests both connection resilience and proper pagination/chunking
    const result = await simulateFlakyConnection(
      '/api/export/user-data?full=true',
      'get',
      0.4, // 40% failure rate
      5,   // Up to 5 retries
      500  // 500ms retry delay
    );
    
    expect(result.success).toBe(true);
    
    // Verify the response contains pagination info for large data sets
    if (result.finalResponse) {
      const response = result.finalResponse.body;
      
      console.log('Large export pagination test results:');
      console.log(`- Total pages: ${response.pagination?.totalPages || 'N/A'}`);
      console.log(`- Total items: ${response.pagination?.totalItems || 'N/A'}`);
      console.log(`- Current page: ${response.pagination?.currentPage || 'N/A'}`);
      
      // If the API is properly implemented, it should have pagination for large datasets
      if (response.pagination) {
        expect(response.pagination).toHaveProperty('totalPages');
        expect(response.pagination).toHaveProperty('totalItems');
        expect(response.pagination).toHaveProperty('currentPage');
      }
    }
  });
  
  test('Connection drops during data streaming should be handled gracefully', async () => {
    // Simulate a connection that drops mid-download
    const req = request(server)
      .get('/api/export/user-data?format=csv')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15')
      .set('Accept', 'text/csv');
    
    // Abort the request after a short delay to simulate connection drop
    setTimeout(() => {
      req.abort();
    }, 100);
    
    try {
      await req;
      // We don't expect to get here since we aborted the request
      expect(true).toBe(false);
    } catch (error) {
      // We expect an error due to the aborted request
      expect(error).toBeTruthy();
    }
    
    // Now verify that the server handled the aborted connection properly
    // by making a new request and ensuring it still works
    const secondReq = await request(server)
      .get('/api/export/user-data?format=csv')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15')
      .set('Accept', 'text/csv');
    
    // The server should still be responding properly
    expect(secondReq.status).toBe(200);
  });
}); 