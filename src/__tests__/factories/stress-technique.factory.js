"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTechniqueTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class StressTechniqueTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, name: faker_1.faker.lorem.words(3), description: faker_1.faker.lorem.paragraph(), category: faker_1.faker.helpers.arrayElement(['breathing', 'meditation', 'physical', 'cognitive', 'behavioral']), difficultyLevel: faker_1.faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']), durationMinutes: faker_1.faker.number.int({ min: 1, max: 120 }), effectivenessRating: faker_1.faker.number.int({ min: 1, max: 5 }), recommendedFrequency: faker_1.faker.helpers.arrayElement(['daily', 'weekly', 'as-needed']), steps: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.lorem.sentence()), benefits: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.lorem.sentence()), tags: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.word.sample()), createdAt: faker_1.faker.date.past(), updatedAt: faker_1.faker.date.recent() }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'StressTechnique', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'StressTechnique', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    withCategory(category) {
        return this.create({ category });
    }
    withDifficulty(level) {
        return this.create({ difficultyLevel: level });
    }
    withDuration(minutes) {
        return this.create({ durationMinutes: minutes });
    }
    withEffectiveness(rating) {
        return this.create({ effectivenessRating: rating });
    }
    withFrequency(frequency) {
        return this.create({ recommendedFrequency: frequency });
    }
    withoutOptionalFields() {
        return this.create({
            steps: [],
            benefits: [],
            tags: [],
            effectivenessRating: undefined,
            recommendedFrequency: undefined
        });
    }
    withMaxArrays() {
        return this.create({
            steps: Array.from({ length: 10 }, () => faker_1.faker.lorem.sentence()),
            benefits: Array.from({ length: 10 }, () => faker_1.faker.lorem.sentence()),
            tags: Array.from({ length: 10 }, () => faker_1.faker.word.sample())
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.StressTechniqueTestFactory = StressTechniqueTestFactory;
