"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const http_error_1 = require("../errors/http-error");
class BaseController {
    constructor(model) {
        this.model = model;
    }
    async handleRequest(req, res, action) {
        try {
            const result = await action();
            if (result === null || result === undefined) {
                return res.status(404).json({ message: 'Resource not found' });
            }
            return res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            console.error('Controller error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAll(req, res) {
        await this.handleRequest(req, res, async () => {
            const filter = this.buildFilterQuery(req);
            const query = this.model.find(filter);
            if (req.query.sort) {
                query.sort(req.query.sort);
            }
            if (req.query.limit) {
                query.limit(Number(req.query.limit));
            }
            if (req.query.populate) {
                query.populate(req.query.populate);
            }
            const results = await query.exec();
            return results;
        });
    }
    async getById(req, res) {
        await this.handleRequest(req, res, async () => {
            const { id } = req.params;
            const query = this.model.findById(id);
            if (req.query.populate) {
                query.populate(req.query.populate);
            }
            const result = await query.exec();
            if (!result) {
                throw new http_error_1.HttpError(404, 'Resource not found');
            }
            return result;
        });
    }
    async create(req, res) {
        await this.handleRequest(req, res, async () => {
            await this.validateCreate(req);
            const result = await this.model.create(req.body);
            res.status(201);
            return result;
        });
    }
    async update(req, res) {
        await this.handleRequest(req, res, async () => {
            const { id } = req.params;
            await this.validateUpdate(req);
            const result = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
            if (!result) {
                throw new http_error_1.HttpError(404, 'Resource not found');
            }
            return result;
        });
    }
    async delete(req, res) {
        await this.handleRequest(req, res, async () => {
            const { id } = req.params;
            const result = await this.model.findByIdAndDelete(id);
            if (!result) {
                throw new http_error_1.HttpError(404, 'Resource not found');
            }
            return { message: 'Resource deleted successfully' };
        });
    }
    // Protected methods that can be overridden by child classes
    buildFilterQuery(req) {
        // Default implementation returns empty filter
        // Child classes can override to add specific filters
        return {};
    }
    async validateCreate(req) {
        // Default implementation does nothing
        // Child classes should override to add validation
    }
    async validateUpdate(req) {
        // Default implementation does nothing
        // Child classes should override to add validation
    }
}
exports.BaseController = BaseController;
