"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const http_error_1 = require("../errors/http-error");
const errors_1 = require("../utils/errors");
class BaseController {
    constructor(model) {
        this.model = model;
    }
    async getById(req, res) {
        const { id } = req.params;
        const item = await this.model.findById(id);
        if (!item) {
            throw new http_error_1.HttpError(404, 'Resource not found', {
                code: errors_1.ErrorCodes.NOT_FOUND,
                category: errors_1.ErrorCategory.NOT_FOUND,
                details: { resourceId: id }
            });
        }
        res.status(200).json(item);
    }
    async getAll(req, res) {
        const filter = this.buildFilterQuery(req.query);
        const items = await this.model.find(filter);
        res.status(200).json(items);
    }
    async create(req, res) {
        await this.validateCreate(req.body);
        const item = await this.model.create(req.body);
        res.status(201).json(item);
    }
    async update(req, res) {
        const { id } = req.params;
        await this.validateUpdate(req.body);
        const item = await this.model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!item) {
            throw new http_error_1.HttpError(404, 'Resource not found', {
                code: errors_1.ErrorCodes.NOT_FOUND,
                category: errors_1.ErrorCategory.NOT_FOUND,
                details: { resourceId: id }
            });
        }
        res.status(200).json(item);
    }
    async delete(req, res) {
        const { id } = req.params;
        const item = await this.model.findByIdAndDelete(id);
        if (!item) {
            throw new http_error_1.HttpError(404, 'Resource not found', {
                code: errors_1.ErrorCodes.NOT_FOUND,
                category: errors_1.ErrorCategory.NOT_FOUND,
                details: { resourceId: id }
            });
        }
        res.status(204).send();
    }
}
exports.BaseController = BaseController;
