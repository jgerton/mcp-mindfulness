import { Request, Response } from 'express';
import { Model, Document, Types, Aggregate, PipelineStage, AggregateOptions } from 'mongoose';
import { IUser } from '../../models/user.model';

// Express Mocks
export interface MockExpressResponse extends Partial<Response> {
  status?: jest.Mock;
  json?: jest.Mock;
  send?: jest.Mock;
}

export interface MockExpressRequest extends Partial<Request> {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
  user?: Partial<IUser>;
}

export const createMockRequest = (overrides: Partial<MockExpressRequest> = {}): Request => {
  const mockRequest = {
    params: {},
    query: {},
    body: {},
    headers: {},
    user: undefined,
    get: jest.fn(),
    ...overrides
  };
  return mockRequest as unknown as Request;
};

export const createMockResponse = (): Response => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis()
  };
  return mockResponse as unknown as Response;
};

// Mongoose Mocks
type MongooseQueryMock<T> = {
  exec: jest.Mock;
  lean: jest.Mock;
  populate: jest.Mock;
};

export interface MockModel<T extends Document> extends Partial<Model<T>> {
  find: jest.Mock<MongooseQueryMock<T[]>>;
  findOne: jest.Mock<MongooseQueryMock<T | null>>;
  findById: jest.Mock<MongooseQueryMock<T | null>>;
  create: jest.Mock<Promise<T>>;
  updateOne: jest.Mock<Promise<{ modifiedCount: number }>>;
  deleteOne: jest.Mock<Promise<{ deletedCount: number }>>;
  findByIdAndUpdate: jest.Mock<Promise<T | null>>;
  findByIdAndDelete: jest.Mock<Promise<T | null>>;
  aggregate: jest.Mock<Aggregate<any[]>>;
  base: any;
  baseModelName: string;
  castObject: jest.Mock;
  collection: any;
  create: jest.Mock<Promise<T>>;
  createCollection: jest.Mock;
  createIndexes: jest.Mock;
  db: any;
  deleteMany: jest.Mock;
  deleteOne: jest.Mock;
  discriminator: jest.Mock;
  discriminators: any;
  distinct: jest.Mock;
  emit: jest.Mock;
  ensureIndexes: jest.Mock;
  estimatedDocumentCount: jest.Mock;
  events: any;
  exists: jest.Mock;
  find: jest.Mock<MongooseQueryMock<T[]>>;
  findById: jest.Mock<MongooseQueryMock<T | null>>;
  findByIdAndDelete: jest.Mock<Promise<T | null>>;
  findByIdAndRemove: jest.Mock<Promise<T | null>>;
  findByIdAndUpdate: jest.Mock<Promise<T | null>>;
  findOne: jest.Mock<MongooseQueryMock<T | null>>;
  findOneAndDelete: jest.Mock<Promise<T | null>>;
  findOneAndRemove: jest.Mock<Promise<T | null>>;
  findOneAndReplace: jest.Mock<Promise<T | null>>;
  findOneAndUpdate: jest.Mock<Promise<T | null>>;
  geoSearch: jest.Mock;
  hydrate: jest.Mock;
  init: jest.Mock;
  insertMany: jest.Mock;
  inspect: jest.Mock;
  listIndexes: jest.Mock;
  mapReduce: jest.Mock;
  modelName: string;
  populate: jest.Mock;
  remove: jest.Mock;
  replaceOne: jest.Mock;
  schema: any;
  startSession: jest.Mock;
  syncIndexes: jest.Mock;
  translateAliases: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  updateOne: jest.Mock;
  watch: jest.Mock;
  where: jest.Mock;
}

export const createMockModel = <T extends Document>(): MockModel<T> => {
  const queryMethods = {
    exec: jest.fn(),
    lean: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
  };

  const model: MockModel<T> = {
    find: jest.fn().mockReturnValue(queryMethods),
    findOne: jest.fn().mockReturnValue(queryMethods),
    findById: jest.fn().mockReturnValue(queryMethods),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn().mockReturnValue({
      exec: jest.fn(),
      match: jest.fn().mockReturnThis(),
      group: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      unwind: jest.fn().mockReturnThis(),
      lookup: jest.fn().mockReturnThis(),
    }),
    base: {},
    baseModelName: 'MockModel',
    castObject: jest.fn(),
    collection: {},
    createCollection: jest.fn(),
    createIndexes: jest.fn(),
    db: {},
    deleteMany: jest.fn(),
    deleteOne: jest.fn(),
    discriminator: jest.fn(),
    discriminators: {},
    distinct: jest.fn(),
    emit: jest.fn(),
    ensureIndexes: jest.fn(),
    estimatedDocumentCount: jest.fn(),
    events: {},
    exists: jest.fn(),
    geoSearch: jest.fn(),
    hydrate: jest.fn(),
    init: jest.fn(),
    insertMany: jest.fn(),
    inspect: jest.fn(),
    listIndexes: jest.fn(),
    mapReduce: jest.fn(),
    modelName: 'MockModel',
    populate: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    replaceOne: jest.fn(),
    schema: {},
    startSession: jest.fn(),
    syncIndexes: jest.fn(),
    translateAliases: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    watch: jest.fn(),
    where: jest.fn(),
  };

  return model;
};

// Test Data Factory Base
export interface TestDataFactoryOptions<T> {
  overrides?: Partial<T>;
  count?: number;
}

export abstract class BaseTestFactory<T> {
  protected generateId(): Types.ObjectId {
    return new Types.ObjectId();
  }

  abstract create(overrides?: Partial<T>): T;

  createMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
} 