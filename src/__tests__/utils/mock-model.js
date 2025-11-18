"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockModel = void 0;
exports.createMockModel = createMockModel;
class MockModel {
    constructor() {
        this.data = [];
        this.lastId = 1;
    }
    find() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            return this.data;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.data.find(item => item._id === id);
            return item || null;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newItem = Object.assign({ _id: data._id || String(this.lastId++) }, data);
            this.data.push(newItem);
            return newItem;
        });
    }
    findByIdAndUpdate(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.data.findIndex(item => item._id === id);
            if (index === -1)
                return null;
            this.data[index] = Object.assign(Object.assign({}, this.data[index]), update);
            return this.data[index];
        });
    }
    findByIdAndDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.data.findIndex(item => item._id === id);
            if (index === -1)
                return null;
            const deleted = this.data[index];
            this.data.splice(index, 1);
            return deleted;
        });
    }
    // Helper method to reset data for tests
    _reset() {
        this.data = [];
        this.lastId = 1;
    }
}
exports.MockModel = MockModel;
function createMockModel() {
    return new MockModel();
}
