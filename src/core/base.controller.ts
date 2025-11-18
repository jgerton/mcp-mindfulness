import { Request, Response } from 'express';
import { Model, FilterQuery } from 'mongoose';
import { HttpError } from '../errors/http-error';
import { ErrorCodes, ErrorCategory } from '../utils/errors';

export abstract class BaseController<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected abstract validateCreate(data: Partial<T>): Promise<void>;
  protected abstract validateUpdate(data: Partial<T>): Promise<void>;
  protected abstract buildFilterQuery(query: any): FilterQuery<T>;

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const item = await this.model.findById(id);

    if (!item) {
      throw new HttpError(404, 'Resource not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.NOT_FOUND,
        details: { resourceId: id }
      });
    }

    res.status(200).json(item);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const filter = this.buildFilterQuery(req.query);
    const items = await this.model.find(filter);
    res.status(200).json(items);
  }

  async create(req: Request, res: Response): Promise<void> {
    await this.validateCreate(req.body);
    const item = await this.model.create(req.body);
    res.status(201).json(item);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.validateUpdate(req.body);

    const item = await this.model.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new HttpError(404, 'Resource not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.NOT_FOUND,
        details: { resourceId: id }
      });
    }

    res.status(200).json(item);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const item = await this.model.findByIdAndDelete(id);

    if (!item) {
      throw new HttpError(404, 'Resource not found', {
        code: ErrorCodes.NOT_FOUND,
        category: ErrorCategory.NOT_FOUND,
        details: { resourceId: id }
      });
    }

    res.status(204).send();
  }
} 