"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTestFactory = exports.createMockModel = exports.createMockResponse = exports.createMockRequest = void 0;
const mongoose_1 = require("mongoose");
const createMockRequest = (overrides = {}) => {
    const mockRequest = Object.assign({ params: {}, query: {}, body: {}, headers: {}, user: undefined, get: jest.fn() }, overrides);
    return mockRequest;
};
exports.createMockRequest = createMockRequest;
const createMockResponse = () => {
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        sendStatus: jest.fn().mockReturnThis()
    };
    return mockResponse;
};
exports.createMockResponse = createMockResponse;
const createMockModel = () => {
    const queryMethods = {
        exec: jest.fn(),
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
    };
    const model = {
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
exports.createMockModel = createMockModel;
class BaseTestFactory {
    generateId() {
        return new mongoose_1.Types.ObjectId();
    }
    createMany(count, overrides) {
        return Array.from({ length: count }, () => this.create(overrides));
    }
}
exports.BaseTestFactory = BaseTestFactory;
