import { Model, Document } from 'mongoose';

export interface MockModelData {
  _id?: string;
  [key: string]: any;
}

export class MockModel<T extends Document> {
  private data: MockModelData[] = [];
  private lastId = 1;

  async find(query = {}): Promise<T[]> {
    return this.data as T[];
  }

  async findById(id: string): Promise<T | null> {
    const item = this.data.find(item => item._id === id);
    return item as T || null;
  }

  async create(data: MockModelData): Promise<T> {
    const newItem = {
      _id: data._id || String(this.lastId++),
      ...data
    };
    this.data.push(newItem);
    return newItem as T;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    this.data[index] = { ...this.data[index], ...update };
    return this.data[index] as T;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const deleted = this.data[index];
    this.data.splice(index, 1);
    return deleted as T;
  }

  // Helper method to reset data for tests
  _reset() {
    this.data = [];
    this.lastId = 1;
  }
}

export function createMockModel<T extends Document>(): Model<T> {
  return new MockModel<T>() as unknown as Model<T>;
} 