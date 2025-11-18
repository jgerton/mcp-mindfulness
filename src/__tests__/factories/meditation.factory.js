"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class MeditationTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, title: faker_1.faker.lorem.words(3), description: faker_1.faker.lorem.paragraph(), duration: faker_1.faker.number.int({ min: 5, max: 60 }), type: faker_1.faker.helpers.arrayElement(['guided', 'timer', 'ambient']), audioUrl: faker_1.faker.helpers.maybe(() => faker_1.faker.internet.url()), category: faker_1.faker.helpers.arrayElement(['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']), difficulty: faker_1.faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']), tags: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.word.sample()), createdAt: faker_1.faker.date.past(), updatedAt: faker_1.faker.date.recent(), isActive: true, authorId: faker_1.faker.helpers.maybe(() => new mongoose_1.Types.ObjectId().toString()) }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'Meditation', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'Meditation', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    guided() {
        return this.create({
            type: 'guided',
            audioUrl: faker_1.faker.internet.url()
        });
    }
    timer() {
        return this.create({
            type: 'timer',
            audioUrl: undefined
        });
    }
    ambient() {
        return this.create({
            type: 'ambient',
            audioUrl: faker_1.faker.internet.url()
        });
    }
    withDifficulty(difficulty) {
        return this.create({ difficulty });
    }
    withCategory(category) {
        return this.create({ category });
    }
    inactive() {
        return this.create({ isActive: false });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.MeditationTestFactory = MeditationTestFactory;
