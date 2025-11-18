import { Request, Response } from 'express';
import { Model, Document, FilterQuery } from 'mongoose';
import { HttpError } from '../errors/http-error';

export abstract class BaseController<T extends Document> {
  protected model: Model<T>;
  
  constructor(model: Model<T>) {
    this.model = model;
  }

  protected async handleRequest(req: Request, res: Response, action: () => Promise<any>) {
    try {
      const result = await action();
      if (result === null || result === undefined) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error('Controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const filter = this.buildFilterQuery(req);
      const query = this.model.find(filter);
      
      if (req.query.sort) {
        query.sort(req.query.sort as string);
      }
      
      if (req.query.limit) {
        query.limit(Number(req.query.limit));
      }

      if (req.query.populate) {
        query.populate(req.query.populate as string);
      }

      const results = await query.exec();
      return results;
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const query = this.model.findById(id);

      if (req.query.populate) {
        query.populate(req.query.populate as string);
      }

      const result = await query.exec();
      if (!result) {
        throw new HttpError(404, 'Resource not found');
      }
      return result;
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      await this.validateCreate(req);
      const result = await this.model.create(req.body);
      res.status(201);
      return result;
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      await this.validateUpdate(req);
      
      const result = await this.model.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!result) {
        throw new HttpError(404, 'Resource not found');
      }
      return result;
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const result = await this.model.findByIdAndDelete(id);
      
      if (!result) {
        throw new HttpError(404, 'Resource not found');
      }
      return { message: 'Resource deleted successfully' };
    });
  }

  // Protected methods that can be overridden by child classes
  protected buildFilterQuery(req: Request): FilterQuery<T> {
    // Default implementation returns empty filter
    // Child classes can override to add specific filters
    return {};
  }

  protected async validateCreate(req: Request): Promise<void> {
    // Default implementation does nothing
    // Child classes should override to add validation
  }

  protected async validateUpdate(req: Request): Promise<void> {
    // Default implementation does nothing
    // Child classes should override to add validation
  }
} 