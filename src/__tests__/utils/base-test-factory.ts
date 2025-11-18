import { Model, Document } from 'mongoose';
import { Request, Response } from 'express';
import { MockExpressResponse } from './mock-types';

export abstract class BaseTestFactory<T extends Document> {
  protected abstract model: Model<T>;
  
  createMockRequest(data: Partial<Request> = {}): Partial<Request> {
    return {
      body: {},
      params: {},
      query: {},
      ...data
    };
  }

  createMockResponse(): MockExpressResponse {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res as MockExpressResponse;
  }

  createMockDocument(data: Partial<T>): T {
    return {
      ...data,
      _id: data._id || 'mock-id',
      save: jest.fn().mockResolvedValue(data)
    } as T;
  }

  createMockModel(): jest.Mocked<Model<T>> {
    return {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    } as jest.Mocked<Model<T>>;
  }

  mockModelMethod<K extends keyof Model<T>>(
    method: K,
    implementation: jest.Mock
  ): void {
    if (this.model[method] && typeof this.model[method] === 'function') {
      jest.spyOn(this.model, method).mockImplementation(implementation);
    }
  }
} 