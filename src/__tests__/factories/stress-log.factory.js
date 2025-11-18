"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressLogTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class StressLogTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId(), level: faker_1.faker.number.int({ min: 1, max: 10 }), triggers: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.word.sample()), symptoms: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, () => faker_1.faker.word.sample()), notes: faker_1.faker.lorem.paragraph(), date: faker_1.faker.date.recent(), createdAt: faker_1.faker.date.past(), updatedAt: faker_1.faker.date.recent() }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'StressLog', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'StressLog', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    withLevel(level) {
        return this.create({ level });
    }
    withMaxTriggers() {
        return this.create({
            triggers: Array.from({ length: 5 }, () => faker_1.faker.word.sample())
        });
    }
    withMaxSymptoms() {
        return this.create({
            symptoms: Array.from({ length: 10 }, () => faker_1.faker.word.sample())
        });
    }
    withLongNotes() {
        return this.create({
            notes: faker_1.faker.lorem.paragraphs(10)
        });
    }
    withoutOptionalFields() {
        return this.create({
            triggers: [],
            symptoms: [],
            notes: undefined
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.StressLogTestFactory = StressLogTestFactory;
