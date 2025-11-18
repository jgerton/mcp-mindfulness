import { BaseMock, MockOptions } from '../base-mock';
import { Document, Model } from 'mongoose';

export interface ModelMockOptions extends MockOptions {
  collectionName?: string;
  mockData?: any[];
  mockId?: string | number;
  autoIncrement?: boolean;
}

/**
 * Query Builder Mock
 * 
 * A mock implementation of Mongoose query builder
 */
export class QueryBuilderMock {
  private results: any[] | any;
  private isSingle: boolean = false;
  private queryOptions: {
    sort?: Record<string, number>;
    limit?: number;
    skip?: number;
    select?: string | Record<string, number>;
    lean?: boolean;
    populate?: any[];
  } = {};
  
  constructor(results: any[] | any, isSingle: boolean = false) {
    this.results = results;
    this.isSingle = isSingle;
  }
  
  // Query builder methods
  
  sort(criteria: string | Record<string, number>): QueryBuilderMock {
    if (typeof criteria === 'string') {
      const fields = criteria.split(/\s+/);
      const sortObj: Record<string, number> = {};
      
      fields.forEach(field => {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
      
      this.queryOptions.sort = sortObj;
    } else {
      this.queryOptions.sort = criteria;
    }
    
    return this;
  }
  
  limit(n: number): QueryBuilderMock {
    this.queryOptions.limit = n;
    return this;
  }
  
  skip(n: number): QueryBuilderMock {
    this.queryOptions.skip = n;
    return this;
  }
  
  select(fields: string | Record<string, number>): QueryBuilderMock {
    this.queryOptions.select = fields;
    return this;
  }
  
  lean(): QueryBuilderMock {
    this.queryOptions.lean = true;
    return this;
  }
  
  populate(path: string | any, select?: string): QueryBuilderMock {
    if (!this.queryOptions.populate) {
      this.queryOptions.populate = [];
    }
    
    if (typeof path === 'string') {
      this.queryOptions.populate.push({ path, select });
    } else {
      this.queryOptions.populate.push(path);
    }
    
    return this;
  }
  
  // Execution methods
  
  exec(): Promise<any> {
    let result = this.results;
    
    // Apply sort if specified
    if (this.queryOptions.sort && Array.isArray(result)) {
      result = [...result].sort((a, b) => {
        for (const [field, order] of Object.entries(this.queryOptions.sort!)) {
          if (a[field] < b[field]) return -1 * order;
          if (a[field] > b[field]) return 1 * order;
        }
        return 0;
      });
    }
    
    // Apply skip if specified
    if (this.queryOptions.skip !== undefined && Array.isArray(result)) {
      result = result.slice(this.queryOptions.skip);
    }
    
    // Apply limit if specified
    if (this.queryOptions.limit !== undefined && Array.isArray(result)) {
      result = result.slice(0, this.queryOptions.limit);
    }
    
    // Apply select if specified
    if (this.queryOptions.select) {
      if (Array.isArray(result)) {
        result = result.map(item => this.applySelect(item, this.queryOptions.select!));
      } else if (result) {
        result = this.applySelect(result, this.queryOptions.select);
      }
    }
    
    // Return the result
    return Promise.resolve(result);
  }
  
  then(resolve: (value: any) => any, reject?: (reason: any) => any): Promise<any> {
    return this.exec().then(resolve, reject);
  }
  
  // Helper methods
  
  private applySelect(item: any, select: string | Record<string, number>): any {
    if (typeof select === 'string') {
      const fields = select.split(/\s+/);
      const inclusion = !fields[0].startsWith('-');
      const result: Record<string, any> = {};
      
      if (inclusion) {
        // Include only specified fields
        fields.forEach(field => {
          if (field in item) {
            result[field] = item[field];
          }
        });
        
        // Always include _id unless explicitly excluded
        if (!fields.includes('-_id') && '_id' in item) {
          result._id = item._id;
        }
      } else {
        // Include all fields except those specified
        Object.keys(item).forEach(key => {
          if (!fields.includes(`-${key}`)) {
            result[key] = item[key];
          }
        });
      }
      
      return result;
    } else {
      // Handle object notation { field: 1, otherField: 0 }
      const result: Record<string, any> = {};
      const inclusion = Object.values(select).some(v => v === 1);
      
      if (inclusion) {
        // Include only fields with value 1
        Object.keys(select).forEach(key => {
          if (select[key] === 1 && key in item) {
            result[key] = item[key];
          }
        });
        
        // Always include _id unless explicitly excluded
        if (select._id !== 0 && '_id' in item) {
          result._id = item._id;
        }
      } else {
        // Include all fields except those with value 0
        Object.keys(item).forEach(key => {
          if (select[key] !== 0) {
            result[key] = item[key];
          }
        });
      }
      
      return result;
    }
  }
}

/**
 * MongoDB Model Mock
 * 
 * A mock implementation of a Mongoose model with common methods like
 * find, findById, findOne, create, updateOne, etc.
 */
export class ModelMock extends BaseMock {
  protected mockData: any[] = [];
  protected idCounter: number = 1;
  protected collectionName: string;
  
  constructor(options: ModelMockOptions = {}) {
    super(options);
    
    this.mockData = options.mockData || [];
    this.collectionName = options.collectionName || 'mockCollection';
    
    if (options.autoIncrement && this.mockData.length > 0) {
      // Find the highest ID in the mock data to start auto-incrementing from there
      const highestId = Math.max(...this.mockData.map(item => 
        typeof item._id === 'number' ? item._id : 0
      ));
      this.idCounter = highestId + 1;
    }
  }
  
  protected initializeDefaultBehaviors(): void {
    // Common Mongoose model methods
    this.defaultBehaviors.set('find', this.defaultFind.bind(this));
    this.defaultBehaviors.set('findById', this.defaultFindById.bind(this));
    this.defaultBehaviors.set('findOne', this.defaultFindOne.bind(this));
    this.defaultBehaviors.set('create', this.defaultCreate.bind(this));
    this.defaultBehaviors.set('updateOne', this.defaultUpdateOne.bind(this));
    this.defaultBehaviors.set('deleteOne', this.defaultDeleteOne.bind(this));
    this.defaultBehaviors.set('countDocuments', this.defaultCountDocuments.bind(this));
    
    // Static methods that return query builders
    this.defaultBehaviors.set('findByIdAndUpdate', this.defaultFindByIdAndUpdate.bind(this));
    this.defaultBehaviors.set('findByIdAndDelete', this.defaultFindByIdAndDelete.bind(this));
  }
  
  // Method implementations that mimic Mongoose behavior
  
  find(...args: any[]): any {
    return this.execute('find', ...args);
  }
  
  findById(...args: any[]): any {
    return this.execute('findById', ...args);
  }
  
  findOne(...args: any[]): any {
    return this.execute('findOne', ...args);
  }
  
  create(...args: any[]): any {
    return this.execute('create', ...args);
  }
  
  updateOne(...args: any[]): any {
    return this.execute('updateOne', ...args);
  }
  
  deleteOne(...args: any[]): any {
    return this.execute('deleteOne', ...args);
  }
  
  countDocuments(...args: any[]): any {
    return this.execute('countDocuments', ...args);
  }
  
  findByIdAndUpdate(...args: any[]): any {
    return this.execute('findByIdAndUpdate', ...args);
  }
  
  findByIdAndDelete(...args: any[]): any {
    return this.execute('findByIdAndDelete', ...args);
  }
  
  // Default implementations
  
  protected defaultFind(query: any = {}): QueryBuilderMock {
    // Simple implementation that filters mockData based on query
    const results = this.mockData.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return item._id.toString() === query._id.toString();
        }
        return item[key] === query[key];
      });
    });
    
    return new QueryBuilderMock(results);
  }
  
  protected defaultFindById(id: string | number): QueryBuilderMock {
    const item = this.mockData.find(item => 
      item._id.toString() === id.toString()
    );
    
    return new QueryBuilderMock(item, true);
  }
  
  protected defaultFindOne(query: any = {}): QueryBuilderMock {
    const items = this.mockData.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return item._id.toString() === query._id.toString();
        }
        return item[key] === query[key];
      });
    });
    
    return new QueryBuilderMock(items.length > 0 ? items[0] : null, true);
  }
  
  protected defaultCreate(data: any | any[]): Promise<any> {
    if (Array.isArray(data)) {
      const createdItems = data.map(item => this.createSingleItem(item));
      this.mockData.push(...createdItems);
      return Promise.resolve(createdItems);
    } else {
      const createdItem = this.createSingleItem(data);
      this.mockData.push(createdItem);
      return Promise.resolve(createdItem);
    }
  }
  
  protected createSingleItem(data: any): any {
    // Create a new item with an ID if not provided
    const newItem = { ...data };
    if (!newItem._id) {
      newItem._id = this.generateId();
    }
    return newItem;
  }
  
  protected generateId(): string | number {
    return this.idCounter++;
  }
  
  protected defaultUpdateOne(filter: any, update: any): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number }> {
    const index = this.mockData.findIndex(item => {
      return Object.keys(filter).every(key => {
        if (key === '_id') {
          return item._id.toString() === filter._id.toString();
        }
        return item[key] === filter[key];
      });
    });
    
    if (index === -1) {
      return Promise.resolve({
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0
      });
    }
    
    // Apply updates
    if (update.$set) {
      Object.assign(this.mockData[index], update.$set);
    }
    
    return Promise.resolve({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1
    });
  }
  
  protected defaultDeleteOne(filter: any): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const initialLength = this.mockData.length;
    
    this.mockData = this.mockData.filter(item => {
      return !Object.keys(filter).every(key => {
        if (key === '_id') {
          return item._id.toString() === filter._id.toString();
        }
        return item[key] === filter[key];
      });
    });
    
    const deletedCount = initialLength - this.mockData.length;
    
    return Promise.resolve({
      acknowledged: true,
      deletedCount
    });
  }
  
  protected defaultCountDocuments(query: any = {}): Promise<number> {
    const count = this.mockData.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return item._id.toString() === query._id.toString();
        }
        return item[key] === query[key];
      });
    }).length;
    
    return Promise.resolve(count);
  }
  
  protected defaultFindByIdAndUpdate(id: string | number, update: any, options: any = {}): QueryBuilderMock {
    const index = this.mockData.findIndex(item => 
      item._id.toString() === id.toString()
    );
    
    if (index === -1) {
      return new QueryBuilderMock(null, true);
    }
    
    // Apply updates
    if (update.$set) {
      Object.assign(this.mockData[index], update.$set);
    } else {
      // Direct update without $set
      const { _id } = this.mockData[index];
      this.mockData[index] = { ...update, _id };
    }
    
    return new QueryBuilderMock(this.mockData[index], true);
  }
  
  protected defaultFindByIdAndDelete(id: string | number): QueryBuilderMock {
    const index = this.mockData.findIndex(item => 
      item._id.toString() === id.toString()
    );
    
    if (index === -1) {
      return new QueryBuilderMock(null, true);
    }
    
    const deletedItem = this.mockData[index];
    this.mockData.splice(index, 1);
    
    return new QueryBuilderMock(deletedItem, true);
  }
  
  // Helper methods for test setup
  
  /**
   * Add mock data to the collection
   */
  addMockData(data: any | any[]): this {
    if (Array.isArray(data)) {
      this.mockData.push(...data.map(item => {
        if (!item._id) {
          return { ...item, _id: this.generateId() };
        }
        return item;
      }));
    } else {
      if (!data._id) {
        this.mockData.push({ ...data, _id: this.generateId() });
      } else {
        this.mockData.push(data);
      }
    }
    return this;
  }
  
  /**
   * Clear all mock data
   */
  clearMockData(): this {
    this.mockData = [];
    return this;
  }
  
  /**
   * Get all mock data
   */
  getMockData(): any[] {
    return [...this.mockData];
  }
  
  /**
   * Create a static mock that can be used as a Mongoose model
   */
  static createModelMock(options: ModelMockOptions = {}): any {
    const mock = new ModelMock(options);
    
    // Create a constructor function that mimics a Mongoose model
    const ModelConstructor: any = function(this: any, data: any) {
      Object.assign(this, data);
    };
    
    // Add static methods to the constructor
    ModelConstructor.find = mock.find.bind(mock);
    ModelConstructor.findById = mock.findById.bind(mock);
    ModelConstructor.findOne = mock.findOne.bind(mock);
    ModelConstructor.create = mock.create.bind(mock);
    ModelConstructor.updateOne = mock.updateOne.bind(mock);
    ModelConstructor.deleteOne = mock.deleteOne.bind(mock);
    ModelConstructor.countDocuments = mock.countDocuments.bind(mock);
    ModelConstructor.findByIdAndUpdate = mock.findByIdAndUpdate.bind(mock);
    ModelConstructor.findByIdAndDelete = mock.findByIdAndDelete.bind(mock);
    
    // Add the mock instance as a property for test access
    ModelConstructor._mock = mock;
    
    return ModelConstructor;
  }
} 