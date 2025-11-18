"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToObjectId = convertToObjectId;
exports.buildIdQuery = buildIdQuery;
exports.createDateRangeQuery = createDateRangeQuery;
exports.parseDateParam = parseDateParam;
exports.parsePaginationParams = parsePaginationParams;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Converts a string ID to a MongoDB ObjectId
 * @param id String ID or existing ObjectId
 * @returns MongoDB ObjectId
 */
function convertToObjectId(id) {
    if (id instanceof mongoose_1.default.Types.ObjectId) {
        return id;
    }
    try {
        return new mongoose_1.default.Types.ObjectId(id);
    }
    catch (error) {
        throw new Error(`Invalid ID format: ${id}`);
    }
}
/**
 * Safely handles query with ObjectId conversion
 * @param id String ID to convert to ObjectId
 * @param field Field name for the ID (defaults to '_id')
 * @returns Query object with properly converted ObjectId
 */
function buildIdQuery(id, field = '_id') {
    try {
        const objectId = convertToObjectId(id);
        return { [field]: objectId };
    }
    catch (error) {
        throw new Error(`Invalid ID format for ${field}: ${id}`);
    }
}
/**
 * Creates a date range query for MongoDB
 * @param fieldName Name of the date field to query
 * @param startDate Optional start date
 * @param endDate Optional end date
 * @returns MongoDB query object for date range
 */
function createDateRangeQuery(fieldName, startDate, endDate) {
    if (!startDate && !endDate) {
        return {};
    }
    const query = {};
    const dateCondition = {};
    if (startDate) {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        dateCondition.$gte = start;
    }
    if (endDate) {
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        dateCondition.$lte = end;
    }
    if (Object.keys(dateCondition).length) {
        query[fieldName] = dateCondition;
    }
    return query;
}
/**
 * Safely converts query params to date objects
 * @param dateStr Date string to convert
 * @returns Date object or undefined if invalid
 */
function parseDateParam(dateStr) {
    if (!dateStr)
        return undefined;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return undefined;
        }
        return date;
    }
    catch (error) {
        return undefined;
    }
}
/**
 * Safely parses pagination parameters from query params
 * @param page Page number from query
 * @param limit Items per page from query
 * @returns Object with validated page and limit values
 */
function parsePaginationParams(page, limit) {
    let pageNum = typeof page === 'string' ? parseInt(page, 10) : (page || 1);
    let limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit || 20);
    // Validate and set defaults/max values
    pageNum = pageNum < 1 ? 1 : pageNum;
    limitNum = limitNum < 1 ? 20 : limitNum > 100 ? 100 : limitNum;
    return { page: pageNum, limit: limitNum };
}
