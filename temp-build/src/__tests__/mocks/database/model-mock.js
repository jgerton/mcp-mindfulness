"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMock = exports.QueryBuilderMock = void 0;
const base_mock_1 = require("../base-mock");
/**
 * Query Builder Mock
 *
 * A mock implementation of Mongoose query builder
 */
class QueryBuilderMock {
    constructor(results, isSingle = false) {
        this.isSingle = false;
        this.queryOptions = {};
        this.results = results;
        this.isSingle = isSingle;
    }
    // Query builder methods
    sort(criteria) {
        if (typeof criteria === 'string') {
            const fields = criteria.split(/\s+/);
            const sortObj = {};
            fields.forEach(field => {
                if (field.startsWith('-')) {
                    sortObj[field.substring(1)] = -1;
                }
                else {
                    sortObj[field] = 1;
                }
            });
            this.queryOptions.sort = sortObj;
        }
        else {
            this.queryOptions.sort = criteria;
        }
        return this;
    }
    limit(n) {
        this.queryOptions.limit = n;
        return this;
    }
    skip(n) {
        this.queryOptions.skip = n;
        return this;
    }
    select(fields) {
        this.queryOptions.select = fields;
        return this;
    }
    lean() {
        this.queryOptions.lean = true;
        return this;
    }
    populate(path, select) {
        if (!this.queryOptions.populate) {
            this.queryOptions.populate = [];
        }
        if (typeof path === 'string') {
            this.queryOptions.populate.push({ path, select });
        }
        else {
            this.queryOptions.populate.push(path);
        }
        return this;
    }
    // Execution methods
    exec() {
        let result = this.results;
        // Apply sort if specified
        if (this.queryOptions.sort && Array.isArray(result)) {
            result = [...result].sort((a, b) => {
                for (const [field, order] of Object.entries(this.queryOptions.sort)) {
                    if (a[field] < b[field])
                        return -1 * order;
                    if (a[field] > b[field])
                        return 1 * order;
                }
                return 0;
            });
        }
        // Apply skip if specified
        if (this.queryOptions.skip !== undefined && Array.isArray(result)) {
            result = result.slice(this.queryOptions.skip);
        }
        // Apply limit if specified
        if (this.queryOptions.limit !== undefined && Array.isArray(result)) {
            result = result.slice(0, this.queryOptions.limit);
        }
        // Apply select if specified
        if (this.queryOptions.select) {
            if (Array.isArray(result)) {
                result = result.map(item => this.applySelect(item, this.queryOptions.select));
            }
            else if (result) {
                result = this.applySelect(result, this.queryOptions.select);
            }
        }
        // Return the result
        return Promise.resolve(result);
    }
    then(resolve, reject) {
        return this.exec().then(resolve, reject);
    }
    // Helper methods
    applySelect(item, select) {
        if (typeof select === 'string') {
            const fields = select.split(/\s+/);
            const inclusion = !fields[0].startsWith('-');
            const result = {};
            if (inclusion) {
                // Include only specified fields
                fields.forEach(field => {
                    if (field in item) {
                        result[field] = item[field];
                    }
                });
                // Always include _id unless explicitly excluded
                if (!fields.includes('-_id') && '_id' in item) {
                    result._id = item._id;
                }
            }
            else {
                // Include all fields except those specified
                Object.keys(item).forEach(key => {
                    if (!fields.includes(`-${key}`)) {
                        result[key] = item[key];
                    }
                });
            }
            return result;
        }
        else {
            // Handle object notation { field: 1, otherField: 0 }
            const result = {};
            const inclusion = Object.values(select).some(v => v === 1);
            if (inclusion) {
                // Include only fields with value 1
                Object.keys(select).forEach(key => {
                    if (select[key] === 1 && key in item) {
                        result[key] = item[key];
                    }
                });
                // Always include _id unless explicitly excluded
                if (select._id !== 0 && '_id' in item) {
                    result._id = item._id;
                }
            }
            else {
                // Include all fields except those with value 0
                Object.keys(item).forEach(key => {
                    if (select[key] !== 0) {
                        result[key] = item[key];
                    }
                });
            }
            return result;
        }
    }
}
exports.QueryBuilderMock = QueryBuilderMock;
/**
 * MongoDB Model Mock
 *
 * A mock implementation of a Mongoose model with common methods like
 * find, findById, findOne, create, updateOne, etc.
 */
class ModelMock extends base_mock_1.BaseMock {
    constructor(options = {}) {
        super(options);
        this.mockData = [];
        this.idCounter = 1;
        this.mockData = options.mockData || [];
        this.collectionName = options.collectionName || 'mockCollection';
        if (options.autoIncrement && this.mockData.length > 0) {
            // Find the highest ID in the mock data to start auto-incrementing from there
            const highestId = Math.max(...this.mockData.map(item => typeof item._id === 'number' ? item._id : 0));
            this.idCounter = highestId + 1;
        }
    }
    initializeDefaultBehaviors() {
        // Common Mongoose model methods
        this.defaultBehaviors.set('find', this.defaultFind.bind(this));
        this.defaultBehaviors.set('findById', this.defaultFindById.bind(this));
        this.defaultBehaviors.set('findOne', this.defaultFindOne.bind(this));
        this.defaultBehaviors.set('create', this.defaultCreate.bind(this));
        this.defaultBehaviors.set('updateOne', this.defaultUpdateOne.bind(this));
        this.defaultBehaviors.set('deleteOne', this.defaultDeleteOne.bind(this));
        this.defaultBehaviors.set('countDocuments', this.defaultCountDocuments.bind(this));
        // Static methods that return query builders
        this.defaultBehaviors.set('findByIdAndUpdate', this.defaultFindByIdAndUpdate.bind(this));
        this.defaultBehaviors.set('findByIdAndDelete', this.defaultFindByIdAndDelete.bind(this));
    }
    // Method implementations that mimic Mongoose behavior
    find(...args) {
        return this.execute('find', ...args);
    }
    findById(...args) {
        return this.execute('findById', ...args);
    }
    findOne(...args) {
        return this.execute('findOne', ...args);
    }
    create(...args) {
        return this.execute('create', ...args);
    }
    updateOne(...args) {
        return this.execute('updateOne', ...args);
    }
    deleteOne(...args) {
        return this.execute('deleteOne', ...args);
    }
    countDocuments(...args) {
        return this.execute('countDocuments', ...args);
    }
    findByIdAndUpdate(...args) {
        return this.execute('findByIdAndUpdate', ...args);
    }
    findByIdAndDelete(...args) {
        return this.execute('findByIdAndDelete', ...args);
    }
    // Default implementations
    defaultFind(query = {}) {
        // Simple implementation that filters mockData based on query
        const results = this.mockData.filter(item => {
            return Object.keys(query).every(key => {
                if (key === '_id') {
                    return item._id.toString() === query._id.toString();
                }
                return item[key] === query[key];
            });
        });
        return new QueryBuilderMock(results);
    }
    defaultFindById(id) {
        const item = this.mockData.find(item => item._id.toString() === id.toString());
        return new QueryBuilderMock(item, true);
    }
    defaultFindOne(query = {}) {
        const items = this.mockData.filter(item => {
            return Object.keys(query).every(key => {
                if (key === '_id') {
                    return item._id.toString() === query._id.toString();
                }
                return item[key] === query[key];
            });
        });
        return new QueryBuilderMock(items.length > 0 ? items[0] : null, true);
    }
    defaultCreate(data) {
        if (Array.isArray(data)) {
            const createdItems = data.map(item => this.createSingleItem(item));
            this.mockData.push(...createdItems);
            return Promise.resolve(createdItems);
        }
        else {
            const createdItem = this.createSingleItem(data);
            this.mockData.push(createdItem);
            return Promise.resolve(createdItem);
        }
    }
    createSingleItem(data) {
        // Create a new item with an ID if not provided
        const newItem = Object.assign({}, data);
        if (!newItem._id) {
            newItem._id = this.generateId();
        }
        return newItem;
    }
    generateId() {
        return this.idCounter++;
    }
    defaultUpdateOne(filter, update) {
        const index = this.mockData.findIndex(item => {
            return Object.keys(filter).every(key => {
                if (key === '_id') {
                    return item._id.toString() === filter._id.toString();
                }
                return item[key] === filter[key];
            });
        });
        if (index === -1) {
            return Promise.resolve({
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0
            });
        }
        // Apply updates
        if (update.$set) {
            Object.assign(this.mockData[index], update.$set);
        }
        return Promise.resolve({
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1
        });
    }
    defaultDeleteOne(filter) {
        const initialLength = this.mockData.length;
        this.mockData = this.mockData.filter(item => {
            return !Object.keys(filter).every(key => {
                if (key === '_id') {
                    return item._id.toString() === filter._id.toString();
                }
                return item[key] === filter[key];
            });
        });
        const deletedCount = initialLength - this.mockData.length;
        return Promise.resolve({
            acknowledged: true,
            deletedCount
        });
    }
    defaultCountDocuments(query = {}) {
        const count = this.mockData.filter(item => {
            return Object.keys(query).every(key => {
                if (key === '_id') {
                    return item._id.toString() === query._id.toString();
                }
                return item[key] === query[key];
            });
        }).length;
        return Promise.resolve(count);
    }
    defaultFindByIdAndUpdate(id, update, options = {}) {
        const index = this.mockData.findIndex(item => item._id.toString() === id.toString());
        if (index === -1) {
            return new QueryBuilderMock(null, true);
        }
        // Apply updates
        if (update.$set) {
            Object.assign(this.mockData[index], update.$set);
        }
        else {
            // Direct update without $set
            const { _id } = this.mockData[index];
            this.mockData[index] = Object.assign(Object.assign({}, update), { _id });
        }
        return new QueryBuilderMock(this.mockData[index], true);
    }
    defaultFindByIdAndDelete(id) {
        const index = this.mockData.findIndex(item => item._id.toString() === id.toString());
        if (index === -1) {
            return new QueryBuilderMock(null, true);
        }
        const deletedItem = this.mockData[index];
        this.mockData.splice(index, 1);
        return new QueryBuilderMock(deletedItem, true);
    }
    // Helper methods for test setup
    /**
     * Add mock data to the collection
     */
    addMockData(data) {
        if (Array.isArray(data)) {
            this.mockData.push(...data.map(item => {
                if (!item._id) {
                    return Object.assign(Object.assign({}, item), { _id: this.generateId() });
                }
                return item;
            }));
        }
        else {
            if (!data._id) {
                this.mockData.push(Object.assign(Object.assign({}, data), { _id: this.generateId() }));
            }
            else {
                this.mockData.push(data);
            }
        }
        return this;
    }
    /**
     * Clear all mock data
     */
    clearMockData() {
        this.mockData = [];
        return this;
    }
    /**
     * Get all mock data
     */
    getMockData() {
        return [...this.mockData];
    }
    /**
     * Create a static mock that can be used as a Mongoose model
     */
    static createModelMock(options = {}) {
        const mock = new ModelMock(options);
        // Create a constructor function that mimics a Mongoose model
        const ModelConstructor = function (data) {
            Object.assign(this, data);
        };
        // Add static methods to the constructor
        ModelConstructor.find = mock.find.bind(mock);
        ModelConstructor.findById = mock.findById.bind(mock);
        ModelConstructor.findOne = mock.findOne.bind(mock);
        ModelConstructor.create = mock.create.bind(mock);
        ModelConstructor.updateOne = mock.updateOne.bind(mock);
        ModelConstructor.deleteOne = mock.deleteOne.bind(mock);
        ModelConstructor.countDocuments = mock.countDocuments.bind(mock);
        ModelConstructor.findByIdAndUpdate = mock.findByIdAndUpdate.bind(mock);
        ModelConstructor.findByIdAndDelete = mock.findByIdAndDelete.bind(mock);
        // Add the mock instance as a property for test access
        ModelConstructor._mock = mock;
        return ModelConstructor;
    }
}
exports.ModelMock = ModelMock;
