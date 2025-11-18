"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schemas) => {
    return async (req, res, next) => {
        try {
            console.log('Request body:', req.body);
            console.log('Content-Type:', req.headers['content-type']);
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.body) {
                console.log('Validating body with schema:', schemas.body);
                req.body = await schemas.body.parseAsync(req.body);
            }
            next();
        }
        catch (error) {
            console.error('Validation error:', error);
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
