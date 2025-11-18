"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTestFactory = void 0;
class BaseTestFactory {
    createMockRequest(data = {}) {
        return Object.assign({ body: {}, params: {}, query: {} }, data);
    }
    createMockResponse() {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        return res;
    }
    createMockDocument(data) {
        return Object.assign(Object.assign({}, data), { _id: data._id || 'mock-id', save: jest.fn().mockResolvedValue(data) });
    }
    createMockModel() {
        return {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn()
        };
    }
    mockModelMethod(method, implementation) {
        if (this.model[method] && typeof this.model[method] === 'function') {
            jest.spyOn(this.model, method).mockImplementation(implementation);
        }
    }
}
exports.BaseTestFactory = BaseTestFactory;
